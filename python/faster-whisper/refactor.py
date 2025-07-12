from faster_whisper import WhisperModel
import sounddevice as sd
import soundfile as sf
import numpy as np
import pyautogui
import keyboard
import time
import io

class AudioTranscriber:
    def __init__(self,
                 hotkey_normal='win+space',
                 hotkey_trimmed='ctrl+space',
                 sample_rate=16000,
                 channels=1,
                 model_size='distil-large-v3', # large-v3, distil-large-v3, distil-medium.en
                 beam_size=10):
        self.hotkey_normal = hotkey_normal
        self.hotkey_trimmed = hotkey_trimmed
        self.sample_rate = sample_rate
        self.channels = channels
        self.model_size = model_size
        self.beam_size = beam_size

        self.is_recording = False
        self.record_start_time = 0
        self.audio_chunks = []
        self.trim_output = False

        print("Loading Whisper model...")
        self.model = WhisperModel(self.model_size, compute_type="int8_float16") # float32, float16, int8_float16
        print("Model loaded.")

    def start(self):
        print(f"Press '{self.hotkey_normal}' to transcribe normally.")
        print(f"Press '{self.hotkey_trimmed}' to transcribe with leading whitespace removed.")
        keyboard.add_hotkey(self.hotkey_normal, lambda: self.toggle_recording(trim_output=False))
        keyboard.add_hotkey(self.hotkey_trimmed, lambda: self.toggle_recording(trim_output=True))
        keyboard.wait()

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

        # Convert stereo to mono if needed
        if recorded.ndim == 2 and recorded.shape[1] == 2:
            recorded = recorded.mean(axis=1)

        # Ensure float32 1D array
        recorded = recorded.astype(np.float32).flatten()

        # Write to an in-memory WAV buffer
        buffer = io.BytesIO()
        sf.write(buffer, recorded, self.sample_rate, format='WAV')
        buffer.seek(0)

        print("📝 Transcribing from in-memory buffer...")
        segments, _ = self.model.transcribe(buffer, language="en", beam_size=self.beam_size)

        raw = [segment.text.strip() for segment in segments]
        full_text = " ".join(raw)

        if not self.trim_output:
            full_text = " " + full_text.lstrip()
            print("🔧 Trimmed leading whitespace.")

        print("⌨️ Typing into active window...")
        pyautogui.write(full_text, interval=0.006)
        print("✅ Done.")

# --- Usage ---
if __name__ == "__main__":
    transcriber = AudioTranscriber()
    transcriber.start()
