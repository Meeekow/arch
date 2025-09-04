# client_script.py
import sounddevice as sd
import soundfile as sf
import numpy as np
import pyautogui
import keyboard
import time
import io
import requests

class TranscriptionSession:
    def __init__(self, sample_rate=16000, channels=1):
        self.sample_rate = sample_rate
        self.channels = channels
        self.audio_chunks = []
        self.is_recording = False
        self.record_start_time = 0
        self.trim_output = False

    def toggle_recording(self, trim_output=False):
        if not self.is_recording:
            self.start_recording(trim_output)
        else:
            self.stop_and_transcribe()

    def start_recording(self, trim_output):
        self.trim_output = trim_output
        self.is_recording = True
        self.audio_chunks = []
        self.record_start_time = time.time()
        print("🔴 Recording started...")

        def callback(indata, frames, time_info, status):
            if self.is_recording:
                self.audio_chunks.append(indata.copy())

        self.stream = sd.InputStream(samplerate=self.sample_rate,
                                     channels=self.channels,
                                     dtype='float32',
                                     callback=callback)
        self.stream.start()

    def stop_and_transcribe(self):
        if not self.is_recording:
            return
        self.is_recording = False
        self.stream.stop()
        self.stream.close()
        elapsed = time.time() - self.record_start_time
        print(f"🛑 Recording stopped after {elapsed:.1f}s.")

        if not self.audio_chunks:
            print("⚠️ No audio captured.")
            return

        recorded = np.concatenate(self.audio_chunks, axis=0)
        if recorded.ndim == 2:
            recorded = recorded.mean(axis=1)
        recorded = recorded.astype(np.float32).flatten()

        buffer = io.BytesIO()
        sf.write(buffer, recorded, self.sample_rate, format='WAV')
        buffer.seek(0)

        print("📡 Sending audio to model server...")
        response = requests.post("http://127.0.0.1:5050/transcribe", files={"audio": buffer})

        if response.status_code != 200:
            print("❌ Error from server:", response.text)
            return

        full_text = response.json().get("text", "")
        if not self.trim_output:
            full_text = " " + full_text.lstrip()

        print("⌨️ Typing into active window...")
        pyautogui.write(full_text, interval=0.006)
        print("✅ Done.")

class App:
    def __init__(self):
        self.session = TranscriptionSession()

    def start(self):
        keyboard.add_hotkey('win+space', lambda: self.session.toggle_recording(trim_output=False))
        keyboard.add_hotkey('ctrl+space', lambda: self.session.toggle_recording(trim_output=True))
        print("🎙️ Ready. Use hotkeys to start/stop recording.")
        keyboard.wait()

# --- Run ---
if __name__ == "__main__":
    app = App()
    app.start()
