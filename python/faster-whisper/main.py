import threading
import tempfile
import wave
import os
import time
import numpy as np
import sounddevice as sd
import keyboard
import pyautogui
from faster_whisper import WhisperModel

class AudioTranscriber:
    def __init__(self, model_size="distil-large-v3", sample_rate=16000, channels=1, compute_type="float16"):
        self.sample_rate = sample_rate
        self.channels = channels
        self.blocksize = 512
        self.model_size = model_size
        self.compute_type = compute_type

        self.recording_event = threading.Event()
        self.audio_data = []
        self.audio_lock = threading.Lock()

        self.model = self._load_model()

    def _load_model(self):
        print("⏳ Loading Whisper model...")
        return WhisperModel(self.model_size, device="cuda", compute_type=self.compute_type)

    def _callback(self, indata, frames, time_info, status):
        if self.recording_event.is_set():
            with self.audio_lock:
                self.audio_data.append(indata.copy())

    def start_recording(self):
        print("🎙️ Recording started... Press the hotkey again to stop.")
        with self.audio_lock:
            self.audio_data.clear()

        try:
            with sd.InputStream(callback=self._callback,
                                channels=self.channels,
                                samplerate=self.sample_rate,
                                blocksize=self.blocksize,
                                latency='low'):
                self.recording_event.set()
                while self.recording_event.is_set():
                    time.sleep(0.05)
        except Exception as e:
            print(f"⚠️ Error during recording: {e}")
            self.recording_event.clear()
            self.audio_data.clear()

    def stop_and_transcribe(self, remove_leading_space=False):
        print(f"🛑 Recording stopped. [MODE: {'NO SPACE' if remove_leading_space else 'NORMAL'}] Transcribing...")
        self.recording_event.clear()

        with self.audio_lock:
            if not self.audio_data:
                print("⚠️ No audio recorded.")
                return
            audio_np = np.concatenate(self.audio_data, axis=0)
            self.audio_data.clear()

        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmpfile:
            wav_file = tmpfile.name
            with wave.open(wav_file, 'wb') as wf:
                wf.setnchannels(self.channels)
                wf.setsampwidth(2)  # 16-bit audio
                wf.setframerate(self.sample_rate)
                wf.writeframes((audio_np * 32767).astype(np.int16).tobytes())

        try:
            segments, _ = self.model.transcribe(wav_file, beam_size=10)
            raw = [segment.text.strip() for segment in segments]
            text = " ".join(raw)
            if not remove_leading_space:
                text = " " + text.lstrip()
            pyautogui.write(text, interval=0.006)
        finally:
            os.remove(wav_file)

    def record_session(self, remove_leading_space=False):
        self.start_recording()
        self.stop_and_transcribe(remove_leading_space)

    def toggle_recording(self, remove_leading_space=False):
        if not self.recording_event.is_set():
            threading.Thread(target=self.record_session, args=(remove_leading_space,), daemon=True).start()
        else:
            self.recording_event.clear()

def main():
    HOTKEY = 'win+space'
    SECOND_HOTKEY = 'ctrl+space'

    transcriber = AudioTranscriber()

    print(f"🟢 Press {HOTKEY} to start/stop recording with leading space.")
    print(f"🟢 Press {SECOND_HOTKEY} to start/stop recording without leading space.")

    keyboard.add_hotkey(HOTKEY, lambda: transcriber.toggle_recording(remove_leading_space=False))
    keyboard.add_hotkey(SECOND_HOTKEY, lambda: transcriber.toggle_recording(remove_leading_space=True))

    try:
        time.sleep(0.1)
        keyboard.wait()
    except KeyboardInterrupt:
        print("\n👋 Exiting gracefully...")

if __name__ == "__main__":
    main()
