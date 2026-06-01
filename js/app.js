const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODEL_NAME = "phi3";
const MAX_CONTEXT_CHARS = 12000;

const OLLAMA_OPTIONS = {
  temperature: 0,
  num_predict: 512
};

let conversationHistory = [];
let currentContext = null;
let currentContextName = null;
let currentContextType = null;
let isGenerating = false;

const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const btnSend = document.getElementById("btn-send");
const typingIndicator = document.getElementById("typing-indicator");
const contextBanner = document.getElementById("context-banner");
const contextInfo = document.getElementById("context-info");
const btnViewContext = document.getElementById("btn-view-context");
const btnRemoveContext = document.getElementById("btn-remove-context");
const contextModal = document.getElementById("context-modal");
const contextModalTitle = document.getElementById("context-modal-title");
const contextModalMeta = document.getElementById("context-modal-meta");
const contextModalText = document.getElementById("context-modal-text");
const btnCloseContextModal = document.getElementById("btn-close-context-modal");
const contextModalBackdrop = document.getElementById("context-modal-backdrop");

const CONTEXT_TYPE_LABELS = {
  pdf: "Texto extraído do PDF",
  audio: "Transcrição do áudio",
  video: "Transcrição do vídeo"
};

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addMessage(role, text) {
  const div = document.createElement("div");
  div.className = `message ${role}`;
  div.textContent = text;
  chatMessages.insertBefore(div, typingIndicator);
  scrollToBottom();
  return div;
}

function addSystemMessage(text) {
  const div = document.createElement("div");
  div.className = "message system-msg";
  div.textContent = text;
  chatMessages.insertBefore(div, typingIndicator);
  scrollToBottom();
}

function showTyping() {
  typingIndicator.classList.add("active");
  scrollToBottom();
}

function hideTyping() {
  typingIndicator.classList.remove("active");
}

function setContext(text, name, type) {
  const wasTruncated = text.length > MAX_CONTEXT_CHARS;
  const trimmed = wasTruncated
    ? text.substring(0, MAX_CONTEXT_CHARS) + "\n...[texto truncado]"
    : text;

  currentContext = trimmed;
  currentContextName = name;
  currentContextType = type;
  conversationHistory = [];
  closeContextModal();

  const icons = { pdf: "\u{1F4C4}", audio: "\u{1F3A7}", video: "\u{1F3AC}" };
  const icon = icons[type] || "\u{1F4CE}";

  contextBanner.classList.add("active");
  contextInfo.innerHTML = `<strong>${icon} ${name}</strong> \u2014 ${trimmed.length.toLocaleString()} caracteres carregados como contexto`;

  addSystemMessage(`${icon} Arquivo "${name}" carregado como contexto. Clique em "Ver texto" para conferir a transcrição.`);
}

function openContextModal() {
  if (!currentContext) return;

  const typeLabel = CONTEXT_TYPE_LABELS[currentContextType] || "Conteúdo do arquivo";
  const icon = { pdf: "\u{1F4C4}", audio: "\u{1F3A7}", video: "\u{1F3AC}" }[currentContextType] || "\u{1F4CE}";

  contextModalTitle.textContent = `${icon} ${currentContextName || "Arquivo"}`;
  contextModalMeta.textContent =
    `${typeLabel} \u2022 ${currentContext.length.toLocaleString()} caracteres` +
    (currentContext.endsWith("\n...[texto truncado]")
      ? " \u2022 exibindo apenas o início (limite do assistente)"
      : "");
  contextModalText.textContent = currentContext;

  contextModal.classList.add("active");
  contextModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  btnCloseContextModal.focus();
}

function closeContextModal() {
  contextModal.classList.remove("active");
  contextModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function removeContext() {
  currentContext = null;
  currentContextName = null;
  currentContextType = null;
  contextBanner.classList.remove("active");
  closeContextModal();
  addSystemMessage("Contexto removido.");
}

function clearChat() {
  conversationHistory = [];
  chatMessages.querySelectorAll(".message").forEach(m => m.remove());
  addSystemMessage("Conversa iniciada. Digite sua pergunta abaixo.");
}

function buildContextSystemPrompt() {
  const source = currentContextName || "arquivo carregado";
  return (
    "Você responde perguntas usando EXCLUSIVAMENTE o texto abaixo (transcrição ou documento).\n\n" +
    "Regras obrigatórias:\n" +
    "- Use somente informações explícitas no texto; não invente dados.\n" +
    '- Se a informação não estiver no texto, responda apenas: "Não consta no contexto fornecido."\n' +
    "- Responda em português, de forma direta e curta.\n" +
    "- Não escreva diálogos, narrativas, personagens ou texto criativo.\n" +
    "- Não repita o texto inteiro nem adicione novos trechos de contexto.\n\n" +
    `TEXTO DE REFERÊNCIA (${source}):\n${currentContext}`
  );
}

function buildMessages(userText) {
  const messages = [];

  if (currentContext) {
    messages.push({ role: "system", content: buildContextSystemPrompt() });
    for (const msg of conversationHistory) {
      if (msg.role === "user") {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
  } else {
    for (const msg of conversationHistory) {
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  messages.push({ role: "user", content: userText });

  return messages;
}

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || isGenerating) return;

  isGenerating = true;
  btnSend.disabled = true;
  userInput.value = "";
  userInput.style.height = "auto";

  addMessage("user", text);

  showTyping();

  const assistantDiv = addMessage("assistant", "");
  let fullResponse = "";

  try {
    const response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: buildMessages(text),
        stream: true,
        options: OLLAMA_OPTIONS
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama retornou status ${response.status}`);
    }

    hideTyping();

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter(l => l.trim());

      for (const line of lines) {
        try {
          const json = JSON.parse(line);
          if (json.message && json.message.content) {
            fullResponse += json.message.content;
            assistantDiv.textContent = fullResponse;
            scrollToBottom();
          }
        } catch (_) {
          // partial JSON line, ignore
        }
      }
    }

    conversationHistory.push({ role: "user", content: text });
    conversationHistory.push({ role: "assistant", content: fullResponse });

  } catch (err) {
    hideTyping();
    assistantDiv.textContent = `Erro: ${err.message}. Verifique se o Ollama está rodando (ollama serve).`;
    assistantDiv.style.borderColor = "var(--danger)";
  } finally {
    isGenerating = false;
    btnSend.disabled = false;
    userInput.focus();
  }
}

userInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

userInput.addEventListener("input", () => {
  userInput.style.height = "auto";
  userInput.style.height = Math.min(userInput.scrollHeight, 120) + "px";
});

btnSend.addEventListener("click", sendMessage);
btnViewContext.addEventListener("click", openContextModal);
btnRemoveContext.addEventListener("click", removeContext);
btnCloseContextModal.addEventListener("click", closeContextModal);
contextModalBackdrop.addEventListener("click", closeContextModal);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && contextModal.classList.contains("active")) {
    closeContextModal();
  }
});

addSystemMessage("Conversa iniciada. Digite sua pergunta abaixo.");
