const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODEL_NAME = "phi3";
const MAX_CONTEXT_CHARS = 12000;

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
const btnRemoveContext = document.getElementById("btn-remove-context");

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
  const trimmed = text.length > MAX_CONTEXT_CHARS
    ? text.substring(0, MAX_CONTEXT_CHARS) + "\n...[texto truncado]"
    : text;

  currentContext = trimmed;
  currentContextName = name;
  currentContextType = type;

  const icons = { pdf: "\u{1F4C4}", audio: "\u{1F3A7}", video: "\u{1F3AC}" };
  const icon = icons[type] || "\u{1F4CE}";

  contextBanner.classList.add("active");
  contextInfo.innerHTML = `<strong>${icon} ${name}</strong> \u2014 ${trimmed.length.toLocaleString()} caracteres carregados como contexto`;

  addSystemMessage(`${icon} Arquivo "${name}" carregado como contexto.`);
}

function removeContext() {
  currentContext = null;
  currentContextName = null;
  currentContextType = null;
  contextBanner.classList.remove("active");
  addSystemMessage("Contexto removido.");
}

function clearChat() {
  conversationHistory = [];
  chatMessages.querySelectorAll(".message").forEach(m => m.remove());
  addSystemMessage("Conversa iniciada. Digite sua pergunta abaixo.");
}

function buildMessages(userText) {
  const messages = [];

  if (currentContext) {
    messages.push({
      role: "system",
      content: `Use o seguinte conteúdo como contexto para responder às perguntas do usuário. Responda sempre em português.\n\n--- INÍCIO DO CONTEXTO ---\n${currentContext}\n--- FIM DO CONTEXTO ---`
    });
  }

  for (const msg of conversationHistory) {
    messages.push({ role: msg.role, content: msg.content });
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
  conversationHistory.push({ role: "user", content: text });

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
        stream: true
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
btnRemoveContext.addEventListener("click", removeContext);

addSystemMessage("Conversa iniciada. Digite sua pergunta abaixo.");
