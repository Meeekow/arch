# listener.py
import os
import queue
import threading
import time
from datetime import datetime
from pathlib import Path

import requests
import pyperclip
import keyboard as kb   # pip install keyboard
import numpy as np
import sounddevice as sd
import soundfile as sf

"""
Hotkey Mic Recorder + Remote Transcriber
- Toggle recording: Ctrl+Space
- Quit:             Ctrl+Alt+Q
- After you stop, the saved file is POSTed to the Flask server for transcription.
- Transcript is copied to the clipboard and pasted (Ctrl+V) into the active window.
"""

# ===== Configuration =====
SAMPLE_RATE_REC = 48000   # local recording rate
CHANNELS = 1
DTYPE = 'float32'
OUTPUT_DIR = Path.cwd()
DELETE_AFTER_TRANSCRIBE = True
SERVER_URL = os.environ.get("ASR_SERVER_URL", "http://127.0.0.1:5000")  # Flask server base
TRANSCRIBE_ENDPOINT = f"{SERVER_URL.rstrip('/')}/transcribe"
HEALTH_ENDPOINT = f"{SERVER_URL.rstrip('/')}/health"
HTTP_TIMEOUT = 600  # seconds for long clips
# =========================


class RemoteTranscriber:
    def __init__(self, transcribe_url: str = TRANSCRIBE_ENDPOINT):
        self.transcribe_url = transcribe_url
        self._lock = threading.Lock()

    def transcribe(self, wav_path: Path) -> str:
        """
        POST the WAV to the server and return the transcript text.
        """
        with self._lock:
            with open(wav_path, "rb") as f:
                files = {"audio": ("audio.wav", f, "audio/wav")}
                resp = requests.post(self.transcribe_url, files=files, timeout=HTTP_TIMEOUT)
                resp.raise_for_status()
                data = resp.json()

        text = data.get("text", "") or ""
        print("\n=== TRANSCRIPT ===")
        print(text)

        # Copy transcript to clipboard and try to paste
        pyperclip.copy(text)
        try:
            kb.press_and_release('ctrl+v')
        except Exception:
            pass

        return text


class Recorder:
    def __init__(self, samplerate=SAMPLE_RATE_REC, channels=CHANNELS, dtype=DTYPE):
        self.samplerate = samplerate
        self.channels = channels
        self.dtype = dtype

        self._recording = threading.Event()
        self._closing = threading.Event()
        self._queue = None
        self._writer_thread = None
        self._sf = None
        self._lock = threading.Lock()
        self._last_filepath = None

        self._stream = sd.InputStream(
            samplerate=self.samplerate,
            channels=self.channels,
            dtype=self.dtype,
            callback=self._audio_callback
        )

        self._transcriber = RemoteTranscriber()

    def _audio_callback(self, indata, frames, time_info, status):
        if status:
            pass
        if self._recording.is_set() and self._queue is not None:
            self._queue.put(indata.copy())

    def _writer_worker(self, q: queue.Queue, sfh: sf.SoundFile):
        while True:
            chunk = q.get()
            if chunk is None:
                break
            sfh.write(chunk)

    def _start_writer(self, filepath: Path):
        self._queue = queue.Queue()
        self._sf = sf.SoundFile(
            str(filepath),
            mode='w',
            samplerate=self.samplerate,
            channels=self.channels,
            format='WAV',
            subtype='FLOAT'
        )
        self._writer_thread = threading.Thread(
            target=self._writer_worker,
            args=(self._queue, self._sf),
            daemon=True
        )
        self._writer_thread.start()

    def _stop_writer(self):
        if self._queue is not None:
            self._queue.put(None)
        if self._writer_thread is not None:
            self._writer_thread.join()
        if self._sf is not None:
            self._sf.close()
        self._queue = None
        self._writer_thread = None
        self._sf = None

    def toggle(self):
        with self._lock:
            if not self._recording.is_set():
                ts = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
                filepath = OUTPUT_DIR / f"recording_{ts}.wav"
                self._start_writer(filepath)
                self._recording.set()
                self._last_filepath = filepath
                print(f"[REC] Started → {filepath.name}")
            else:
                self._recording.clear()
                self._stop_writer()
                print("[REC] Stopped & saved.")
                if self._last_filepath and self._last_filepath.exists():
                    try:
                        print(f"[ASR] Uploading {self._last_filepath.name} to server …")
                        self._transcriber.transcribe(self._last_filepath)
                        if DELETE_AFTER_TRANSCRIBE:
                            self._last_filepath.unlink(missing_ok=True)
                            print(f"[CLEANUP] Deleted {self._last_filepath.name}")
                    except requests.RequestException as e:
                        print(f"[ASR] Server error: {e}")
                    except Exception as e:
                        print(f"[ASR] Transcription failed: {e}")

    def start_stream(self):
        self._stream.start()
        try:
            dev = sd.query_devices(kind='input')
            dev_name = dev.get('name', 'Unknown Device')
        except Exception:
            dev_name = 'Unknown Device'
        print(f"Input device: {dev_name}")
        print("Hotkeys:")
        print("  • Ctrl + Space   → Start/Stop recording (auto-transcribe on stop)")
        print("  • Ctrl + Alt + Q → Quit")
        print("Ready.")

        # Optional: ping server
        try:
            r = requests.get(HEALTH_ENDPOINT, timeout=5)
            print(f"[SERVER] {r.json()}")
        except Exception:
            print("[SERVER] Unable to reach ASR server. Make sure it's running.")

    def stop_stream(self):
        if self._recording.is_set():
            self._recording.clear()
            self._stop_writer()
            print("[REC] Stopped & saved.")
        self._stream.stop()
        self._stream.close()

    def close(self):
        self._closing.set()
        self.stop_stream()


def main():
    rec = Recorder()
    rec.start_stream()

    def on_activate_toggle():
        rec.toggle()

    def on_activate_quit():
        print("Quitting…")
        rec.close()
        try:
            kb.unhook_all_hotkeys()
        except Exception:
            pass

    kb.add_hotkey('ctrl+space', on_activate_toggle)
    kb.add_hotkey('ctrl+alt+q', on_activate_quit)

    try:
        while not rec._closing.is_set():
            time.sleep(0.2)
    except KeyboardInterrupt:
        pass
    finally:
        rec.close()
        try:
            kb.unhook_all_hotkeys()
        except Exception:
            pass


if __name__ == "__main__":
    main()
