from faster_whisper import WhisperModel
import sounddevice as sd
import numpy as np
import keyboard
import threading
import pyautogui
import tempfile
import wave
import os
import time
from functools import partial

# Configuration
HOTKEY = 'win+space'
SECOND_HOTKEY = 'ctrl+space'
SAMPLE_RATE = 16000
CHANNELS = 1

# Models
# model_size = "distil-medium.en"
model_size = "distil-large-v3"
# model_size = "large-v3"

# Load Whisper Model
model = WhisperModel(model_size, device="cuda", compute_type="float16")
# model = WhisperModel(model_size, device="cuda", compute_type="int8")

# Globals
recording_event = threading.Event()
audio_data = []
audio_lock = threading.Lock()

def callback(indata, frames, time_info, status):
    if recording_event.is_set():
        with audio_lock:
            audio_data.append(indata.copy())

def start_recording():
    print("🎙️ Recording started... Press the hotkey again to stop.")
    with audio_lock:
        audio_data.clear()

    try:
        with sd.InputStream(callback=callback,
                            channels=CHANNELS,
                            samplerate=SAMPLE_RATE,
                            blocksize=512,  # If there are glitches/dropouts or get buffer overflow errors, try increasing to 1024
                            latency='low'):
            recording_event.set()
            while recording_event.is_set():
                time.sleep(0.05)
    except Exception as e:
        print(f"⚠️ Error during recording: {e}")
        recording_event.clear()
        audio_data.clear()

def stop_recording_and_transcribe(remove_leading_space=False):
    print(f"🛑 Recording stopped. [MODE: {'NO SPACE' if remove_leading_space else 'NORMAL'}] Transcribing...")
    recording_event.clear()

    with audio_lock:
        if not audio_data:
            print("⚠️ No audio recorded.")
            return
        audio_np = np.concatenate(audio_data, axis=0)
        audio_data.clear()

    with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmpfile:
        wav_file = tmpfile.name
        with wave.open(wav_file, 'wb') as wf:
            wf.setnchannels(CHANNELS)
            wf.setsampwidth(2)
            wf.setframerate(SAMPLE_RATE)
            wf.writeframes((audio_np * 32767).astype(np.int16).tobytes())

    try:
        result, info = model.transcribe(wav_file, beam_size=10)
        raw = [r.text.strip() for r in result]
        cleaned = " ".join(raw)
        if not remove_leading_space:
            cleaned = " " + cleaned.lstrip()
        pyautogui.write(cleaned, interval=0.006)
    finally:
        os.remove(wav_file)

def record_session(remove_leading_space=False):
    start_recording()
    stop_recording_and_transcribe(remove_leading_space=remove_leading_space)

def toggle_recording(remove_leading_space=False):
    if not recording_event.is_set():
        threading.Thread(target=record_session, args=(remove_leading_space,), daemon=True).start()
    else:
        recording_event.clear()

def main():
    print(f"🟢 Press {HOTKEY} to start/stop recording with leading space.")
    print(f"🟢 Press {SECOND_HOTKEY} to start/stop recording without leading space.")
    keyboard.add_hotkey(HOTKEY, partial(toggle_recording, remove_leading_space=False))
    keyboard.add_hotkey(SECOND_HOTKEY, partial(toggle_recording, remove_leading_space=True))

    try:
        time.sleep(0.1)
        keyboard.wait()
    except KeyboardInterrupt:
        print("\n👋 Exiting gracefully...")

if __name__ == "__main__":
    main()