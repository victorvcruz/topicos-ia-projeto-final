# Assistente de IA Local

Assistente de IA multimodal que roda 100% localmente, sem GPU e sem API paga.  
Projeto final da disciplina **Tópicos Especiais em Inteligência Artificial** — Bacharelado em Sistemas de Informação (IFG).

## Funcionalidades

| Fase | Funcionalidade | Descrição |
|------|---------------|-----------|
| 1 | **Chat Local** | Conversa com o modelo Phi-3 via Ollama, com interface no browser |
| 2 | **Chat com PDF** | Upload de PDF, extração de texto no browser e Q&A sobre o conteúdo |
| 3 | **Chat com Áudio** | Upload de áudio (.mp3/.wav), transcrição com Whisper e Q&A |
| 4 | **Chat com Vídeo** | Upload de vídeo (.mp4), extração de áudio com FFmpeg, transcrição e Q&A |

## Pré-requisitos

- **Sistema Operacional:** Windows 10/11, macOS ou Linux
- **RAM:** 8 GB ou mais
- **Python:** 3.9+
- **Conexão com internet:** apenas para download inicial dos modelos

## Instalação

### 1. Ollama + Phi-3

Instale o Ollama e baixe o modelo Phi-3:

```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows: baixe em https://ollama.com/download

# Baixar o modelo Phi-3 (~2.3 GB, apenas uma vez)
ollama pull phi3
```

### 2. Dependências Python (Fases 3 e 4)

```bash
pip install -r requirements.txt
```

### 3. FFmpeg (Fase 4)

```bash
# macOS
brew install ffmpeg

# Ubuntu / Debian
sudo apt install ffmpeg

# Windows: baixe em https://ffmpeg.org/download.html e adicione ao PATH
```

## Como Executar

1. Inicie o Ollama (se ainda não estiver rodando):
```bash
ollama serve
```

2. Inicie o servidor:
```bash
python3 server.py
```

3. Acesse `http://localhost:8080` no browser.

Todas as 4 fases funcionam a partir desse único servidor. O modelo Whisper (para áudio/vídeo) é carregado sob demanda no primeiro upload, sem atrasar a inicialização.

## Estrutura do Projeto

```
├── index.html              # Interface principal do chat
├── css/
│   └── style.css           # Estilos responsivos
├── js/
│   ├── app.js              # Lógica do chat + API Ollama (streaming)
│   ├── pdf-handler.js      # Extração de texto de PDF (PDF.js)
│   └── media-handler.js    # Upload de áudio/vídeo para transcrição
├── server.py               # Backend Flask (Whisper + FFmpeg)
├── requirements.txt        # Dependências Python
└── docs/
    └── projeto-final.MD    # Especificação do projeto
```

## Tecnologias Utilizadas

- **[Ollama](https://ollama.com)** — Execução local de LLMs
- **[Phi-3 Mini](https://ollama.com/library/phi3)** — Modelo da Microsoft (~2.3 GB), roda em CPU
- **[PDF.js](https://mozilla.github.io/pdf.js/)** — Extração de texto de PDFs no browser
- **[OpenAI Whisper](https://github.com/openai/whisper)** — Transcrição de áudio (modelo `small`, ~150 MB)
- **[FFmpeg](https://ffmpeg.org)** — Extração de áudio de vídeos
- **[Flask](https://flask.palletsprojects.com)** — Servidor web Python
- **HTML + CSS + JavaScript** — Interface sem frameworks

## Licença

MIT
