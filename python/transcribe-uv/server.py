# model_server.py
from faster_whisper import WhisperModel
from flask import Flask, request, jsonify
import soundfile as sf
import tempfile
import io
import os
import numpy as np

app = Flask(__name__)

print("🔄 Loading Whisper model...")
model = WhisperModel("distil-small.en", device="cuda", compute_type="int8")
#model = WhisperModel("distil-small.en", device="cpu", compute_type="int8")
# model = WhisperModel("distil-large-v3", compute_type="int8")
print("✅ Model loaded and ready.")

silent_audio = np.zeros(int(16000 * 0.1), dtype=np.float32)
model.transcribe(silent_audio, language="en")

@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    file = request.files["audio"]
    audio_data = file.read()

    buffer = io.BytesIO(audio_data)
    segments, _ = model.transcribe(buffer, language="en", beam_size=10, temperature=0.0)

    text = " ".join([seg.text.strip() for seg in segments])
    return jsonify({"text": text})

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5050)
