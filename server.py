import os
import tempfile
import subprocess
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

STATIC_DIR = os.path.dirname(os.path.abspath(__file__))
WHISPER_MODEL_NAME = os.environ.get("WHISPER_MODEL", "small")

_whisper_model = None

WHISPER_TRANSCRIBE_KWARGS = {
    "language": "pt",
    "task": "transcribe",
    "fp16": False,
    "condition_on_previous_text": False,
}


def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        import whisper
        print(f"Carregando modelo Whisper '{WHISPER_MODEL_NAME}'...")
        _whisper_model = whisper.load_model(WHISPER_MODEL_NAME)
        print("Modelo Whisper carregado.")
    return _whisper_model


def transcribe_file(path):
    model = get_whisper_model()
    result = model.transcribe(path, **WHISPER_TRANSCRIBE_KWARGS)
    return result["text"].strip()


@app.route("/")
def index():
    return send_from_directory(STATIC_DIR, "index.html")


@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(STATIC_DIR, path)


@app.route("/api/transcribe", methods=["POST"])
def transcribe_audio():
    if "file" not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado."}), 400

    file = request.files["file"]
    ext = os.path.splitext(file.filename)[1] or ".mp3"

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
    try:
        file.save(tmp.name)
        tmp.close()
        text = transcribe_file(tmp.name)
        return jsonify({"text": text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(tmp.name):
            os.unlink(tmp.name)


@app.route("/api/transcribe-video", methods=["POST"])
def transcribe_video():
    if "file" not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado."}), 400

    file = request.files["file"]
    video_ext = os.path.splitext(file.filename)[1] or ".mp4"

    video_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=video_ext)
    audio_tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".mp3")

    try:
        file.save(video_tmp.name)
        video_tmp.close()
        audio_tmp.close()

        result = subprocess.run(
            [
                "ffmpeg", "-i", video_tmp.name,
                "-vn", "-acodec", "libmp3lame", "-q:a", "4",
                audio_tmp.name, "-y"
            ],
            capture_output=True, text=True
        )

        if result.returncode != 0:
            return jsonify({"error": f"FFmpeg falhou: {result.stderr[-500:]}"}), 500

        text = transcribe_file(audio_tmp.name)
        return jsonify({"text": text})

    except FileNotFoundError:
        return jsonify({
            "error": "FFmpeg não encontrado. Instale com: brew install ffmpeg (macOS) ou apt install ffmpeg (Linux)."
        }), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        for path in [video_tmp.name, audio_tmp.name]:
            if os.path.exists(path):
                os.unlink(path)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    print(f"Servidor rodando em http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
