"""
Lumis — Local Whisper Transcription Server
─────────────────────────────────────────────
Setup:
  pip install openai-whisper flask flask-cors

Run:
  python whisper_server.py

Then set in frontend/.env.local:
  NEXT_PUBLIC_WHISPER_ENDPOINT=http://localhost:5001/transcribe

Model sizes (accuracy vs speed trade-off):
  tiny   — fastest, ~1GB RAM, good enough for short notes
  base   — good balance, ~1GB RAM           ← recommended
  small  — better accuracy, ~2GB RAM
  medium — best for long-form, ~5GB RAM
  large  — highest accuracy, ~10GB RAM
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import tempfile
import os

app = Flask(__name__)
CORS(app)

# Load model once at startup — change "base" to your preferred size
print("Loading Whisper model...")
model = whisper.load_model("base")
print("Whisper ready on http://localhost:5001")


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": "base"})


@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio = request.files["audio"]

    # Save to temp file and transcribe
    suffix = os.path.splitext(audio.filename or "recording.webm")[1] or ".webm"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as f:
        audio.save(f.name)
        tmp_path = f.name

    try:
        result = model.transcribe(tmp_path)
        return jsonify({
            "text": result["text"].strip(),
            "language": result.get("language", "en"),
            "segments": [
                {"word": seg.get("text", ""), "time": seg.get("start", 0)}
                for seg in result.get("segments", [])
            ],
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        os.unlink(tmp_path)


if __name__ == "__main__":
    app.run(port=5001, debug=False)
