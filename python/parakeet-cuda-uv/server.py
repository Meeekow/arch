# server.py
import os
import threading
from pathlib import Path
from tempfile import NamedTemporaryFile

from flask import Flask, request, jsonify
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

# ===== Configuration =====
MODEL_NAME = os.environ.get("NEMO_MODEL_NAME", "nvidia/parakeet-tdt-0.6b-v2")
ASR_SAMPLE_RATE = 16000   # Required by NeMo Parakeet
# =========================

_nemo_loaded = False
_nemo_asr = None
_model_lock = threading.Lock()   # serialize transcribe() calls inside NeMo if needed


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


def create_app():
    _ensure_nemo_loaded()
    app = Flask(__name__)

    @app.get("/health")
    def health():
        return jsonify({"status": "ok", "model": MODEL_NAME})

    @app.post("/transcribe")
    def transcribe():
        """
        Accepts multipart/form-data with one file field named 'audio'.
        Returns JSON: { "text": "...", "duration_sec": float }
        """
        if 'audio' not in request.files:
            return jsonify({"error": "missing file field 'audio'"}), 400

        f = request.files['audio']

        # Save upload to a temp file
        with NamedTemporaryFile(suffix=".wav", delete=False) as tmp_in:
            f.save(tmp_in.name)
            tmp_in_path = Path(tmp_in.name)

        # Resample to 16k mono (temp file)
        with NamedTemporaryFile(suffix="_16k.wav", delete=False) as tmp_out:
            prep_path = Path(tmp_out.name)

        try:
            _resample_to_16k_mono(tmp_in_path, prep_path)

            # Duration (best-effort, from 16k file)
            try:
                d, sr = sf.read(str(prep_path), dtype='float32')
                duration_sec = float(d.shape[0]) / float(sr)
            except Exception:
                duration_sec = None

            # Call NeMo
            with _model_lock:
                out = _nemo_asr.transcribe([str(prep_path)], timestamps=False)

            text = out[0].text if hasattr(out[0], "text") else out[0].get("text", "")

            return jsonify({
                "text": text,
                "duration_sec": duration_sec,
                "model": MODEL_NAME
            })
        finally:
            # Cleanup temps
            try:
                tmp_in_path.unlink(missing_ok=True)
            except Exception:
                pass
            try:
                prep_path.unlink(missing_ok=True)
            except Exception:
                pass

    return app


if __name__ == "__main__":
    # Example dev run:
    #   python server.py
    # Then hit: http://127.0.0.1:5000/health
    app = create_app()
    # For production consider: gunicorn -w 1 -b 0.0.0.0:5000 server:app
    app.run(host="0.0.0.0", port=5000, threaded=True)
