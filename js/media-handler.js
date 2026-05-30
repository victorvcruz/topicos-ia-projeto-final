const TRANSCRIBE_AUDIO_URL = "/api/transcribe";
const TRANSCRIBE_VIDEO_URL = "/api/transcribe-video";

const audioUpload = document.getElementById("audio-upload");
const videoUpload = document.getElementById("video-upload");
const overlay = document.getElementById("processing-overlay");
const processingText = document.getElementById("processing-text");

function showProcessing(text) {
  processingText.textContent = text;
  overlay.classList.add("active");
}

function hideProcessing() {
  overlay.classList.remove("active");
}

async function uploadAndTranscribe(file, url, type, label) {
  showProcessing(`${label}...`);

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Servidor retornou status ${response.status}`);
    }

    const data = await response.json();

    if (!data.text || !data.text.trim()) {
      throw new Error("Nenhum texto foi transcrito.");
    }

    setContext(data.text, file.name, type);
  } catch (err) {
    addSystemMessage(`Erro ao processar ${type}: ${err.message}`);
  } finally {
    hideProcessing();
  }
}

audioUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  uploadAndTranscribe(file, TRANSCRIBE_AUDIO_URL, "audio", "Transcrevendo áudio");
  audioUpload.value = "";
});

videoUpload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  uploadAndTranscribe(file, TRANSCRIBE_VIDEO_URL, "video", "Processando vídeo");
  videoUpload.value = "";
});
