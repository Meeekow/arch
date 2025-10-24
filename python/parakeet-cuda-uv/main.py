import queue
import threading
import time
from datetime import datetime
from pathlib import Path

import pyperclip
import keyboard as kb  # <— using the 'keyboard' library

import numpy as np
import sounddevice as sd
import soundfile as sf
from scipy.signal import resample_poly

_nemo_loaded = False
_nemo_asr = None

"""
Hotkey Mic Recorder + Auto Transcriber (NeMo)
- Start/stop recording: Ctrl+Alt+R
- Quit:                 Ctrl+Alt+Q
- After you stop, the saved file is transcribed automatically, then deleted.
- Files saved as recording_YYYY-MM-DD_HH-MM-SS.wav
"""

# ===== Configuration =====
SAMPLE_RATE_REC = 48000   # Recording rate
ASR_SAMPLE_RATE = 16000   # Required by NeMo Parakeet
CHANNELS = 1
DTYPE = 'float32'
OUTPUT_DIR = Path.cwd()
MODEL_NAME = "nvidia/parakeet-tdt-0.6b-v2"
DELETE_AFTER_TRANSCRIBE = True  # <-- Delete file after transcription?
# =========================


def _ensure_nemo_loaded():
    global _nemo_loaded, _nemo_asr
    if not _nemo_loaded:
        import nemo.collections.asr as nemo_asr
        _nemo_asr = nemo_asr.models.ASRModel.from_pretrained(model_name=MODEL_NAME)
        _nemo_loaded = True


def _resample_to_16k_mono(in_wav_path: Path, out_wav_path: Path):
    data, sr = sf.read(str(in_wav_path), dtype='float32', always_2d=True)
    mono = data.mean(axis=1, dtype=np.float32)
    if sr == ASR_SAMPLE_RATE:
        out = mono
    else:
        out = resample_poly(mono, ASR_SAMPLE_RATE, sr).astype(np.float32)
    sf.write(str(out_wav_path), out, ASR_SAMPLE_RATE, subtype='FLOAT', format='WAV')


class Transcriber:
    def __init__(self, model_name: str = MODEL_NAME):
        self.model_name = model_name
        self._lock = threading.Lock()

    def transcribe(self, wav_path: Path):
        prep_path = wav_path.with_name(wav_path.stem + "_16k.wav")
        _resample_to_16k_mono(wav_path, prep_path)

        with self._lock:
            _ensure_nemo_loaded()
            # out = _nemo_asr.transcribe([str(prep_path)], timestamps=True)
            out = _nemo_asr.transcribe([str(prep_path)], timestamps=False)

        text = out[0].text if hasattr(out[0], "text") else out[0].get("text", "")
        print("\n=== TRANSCRIPT ===")
        print(text)

        # Copy transcript to clipboard and paste into the active window
        pyperclip.copy(text)
        try:
            kb.press_and_release('ctrl+v')
        except Exception:
            # If simulating paste fails (e.g., OS permissions), at least keep it on the clipboard
            pass

        # Cleanup 16k temp file
        try:
            prep_path.unlink(missing_ok=True)
        except Exception:
            pass

        return text  # return transcript to allow caller to know if success


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

        self._transcriber = Transcriber(MODEL_NAME)

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
                        print(f"[ASR] Transcribing {self._last_filepath.name} …")
                        self._transcriber.transcribe(self._last_filepath)
                        if DELETE_AFTER_TRANSCRIBE:
                            self._last_filepath.unlink(missing_ok=True)
                            print(f"[CLEANUP] Deleted {self._last_filepath.name}")
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
        print("  • Ctrl + Alt + R  → Start/Stop recording (auto-transcribe on stop)")
        print("  • Ctrl + Alt + Q  → Quit")
        print("Ready.")

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
        # Unhook hotkeys so the program can exit cleanly
        try:
            kb.unhook_all_hotkeys()
        except Exception:
            pass

    # Register global hotkeys with the 'keyboard' library
    kb.add_hotkey('ctrl+space', on_activate_toggle)
    kb.add_hotkey('ctrl+alt+q', on_activate_quit)

    try:
        # Keep the app alive until closed via hotkey or Ctrl+C
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
