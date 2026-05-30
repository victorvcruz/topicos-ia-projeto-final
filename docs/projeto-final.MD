Aqui estão todas as informações extraídas da apresentação, organizadas em formato Markdown:
# Tópicos Especiais de IA - Projeto Final do Semestre
Construindo um Assistente de IA Local.
**Curso:** Bacharelado em Sistemas de Informação.
**Professor:** Alexandre Mattiazzo.
## Visão Geral do Projeto
O projeto consiste em 4 fases, indo do chat simples ao assistente multimodal. Cada fase é entregue como incremento - os alunos partem do projeto anterior e evoluem!
 * **Fase 1 (Chat Local):** Phi-3 rodando no notebook com interface HTML/CSS/JS.
 * **Fase 2 (Chat com PDF):** Upload de PDF e conversa sobre o conteúdo.
 * **Fase 3 (Chat com Áudio):** Upload de arquivos .mp3/.mp4 e conversa sobre o que foi falado.
 * **Fase 4 (Chat com Vídeo):** Upload de vídeo e chat sobre o conteúdo falado.
## Fase 1 - Chat Local com Phi-3
 * **Objetivo:** Baixar e rodar o modelo Phi-3 (da Microsoft) localmente usando o Ollama, e criar uma interface de chat simples no browser sem custo e sem API paga.
 * **Entregas:**
   * Núcleo do chatbot com LLM rodando.
   * Ollama instalado e Phi-3 configurado.
   * Interface HTML com campo de pergunta e resposta.
   * CSS básico (responsivo e legível).
   * JavaScript com fetch para API local do Ollama.
   * Histórico de conversa na tela.
 * **Ferramentas (gratuitas):**
   * **Ollama:** Roda LLMs localmente - grátis e open-source.
   * **Phi-3 Mini:** Modelo da Microsoft, leve (~2.3 GB), roda em CPU.
   * **HTML + CSS:** Interface simples, sem framework.
   * **JavaScript puro:** fetch() para chamar a API REST do Ollama.
   * **VS Code:** Editor de código recomendado (grátis).
## Fase 2 - Chat com PDF
 * **Objetivo:** Adicionar ao projeto da Fase 1 a capacidade de ler PDFs. O usuário faz upload de um arquivo, o texto é extraído pelo browser e enviado ao modelo como contexto.
 * **Entregas:**
   * Usuário faz upload do PDF.
   * PDF.js extrai o texto.
   * Texto bruto é gerado.
   * UI mostra que PDF foi carregado.
   * Texto entra no prompt como contexto.
   * Usuário faz perguntas sobre o conteúdo.
 * **Como funciona?**
   1. Usuário seleciona um arquivo .pdf no browser.
   2. PDF.js extrai o texto em JavaScript, sem servidor.
   3. Texto vai no prompt no formato: "Contexto: [texto]\nPergunta: ...".
   4. Phi-3 responde com base no conteúdo do PDF.
   5. Chat continua normalmente no histórico.
 * > **Dica:** Para PDFs muito longos, extrair somente as primeiras N páginas.
   > 
## Fase 3 - Chat com Áudio
 * **Objetivo:** Adicionar suporte a arquivos de áudio (.mp3 ou .mp4). O áudio é transcrito localmente com o Whisper e o texto resultante vira o contexto do chat.
 * **Opções de Transcrição:**
   * **Whisper.cpp (recomendado):** Binário C++, sem Python, roda em CPU, bem rápido para áudios curtos.
   * **openai-whisper (Python):** pip install openai-whisper — modelo small é suficiente e leve.
   * **whisper.js (browser, experim.):** Roda direto no browser via WebAssembly — sem servidor backend.
   * > **Dica:** Usar modelo 'small' do Whisper (~150 MB) para economizar espaço.
     > 
 * **Entregas:**
   * Upload do áudio (.mp3 ou .mp4).
   * Transcrição (Whisper) onde o áudio é convertido em texto.
   * Texto entra no prompt junto com a pergunta.
   * Usuário faz perguntas sobre o conteúdo.
## Fase 4 - Chat com Vídeo
 * **Objetivo:** Estender o projeto para aceitar vídeos (.mp4). O áudio do vídeo é extraído, transcrito com Whisper e usado como contexto — mesma lógica da Fase 3!
 * **Entregas:**
   * Upload de arquivos .mp4 na interface.
   * Extração do áudio com FFmpeg (gratuito).
   * Transcrição com Whisper (reutilizando etapa anterior).
   * Texto entra no prompt junto com a pergunta.
   * Chat sobre o conteúdo do vídeo.
 * **Pipeline Técnico:**
   * **Upload .mp4:** Usuário sobe o vídeo.
   * **FFmpeg extrai áudio:** Comando ffmpeg -i video.mp4 audio.mp3.
   * **Whisper transcreve:** Texto em linguagem natural.
   * **Phi-3 responde:** Contexto + pergunta do usuário.
   * > **Dica:** O FFmpeg é free/open-source e está disponível para Windows, Mac e Linux.
     > 
## Requisitos & Avaliação
### Forma de Entrega
 * Repositório GitHub (público ou privado com acesso).
 * README explicando como rodar o projeto.
 * Vídeo curto (~3 min) demonstrando cada fase.
 * Entrega incremental (uma fase por vez).
 * Individual ou dupla (a combinar).
### Requisitos Mínimos
 * Notebook com 8 GB de RAM ou mais.
 * SO: Windows 10/11, macOS ou Linux.
 * Conexão com a internet para baixar os modelos (1x).
### Pontuação por Fase (Total: 100 pts)
| Fase | Descrição | Pontuação |
|---|---|---|
| **Fase 1** | Chat HTML/JS | 25 pts |
| **Fase 2** | Chat com PDF | 25 pts |
| **Fase 3** | Chat com Áudio | 25 pts |
| **Fase 4** | Chat com Vídeo | 25 pts |
| **TOTAL** |  | **100 pts** |
## Dicas & Recursos Gratuitos
 * **ollama.com:** Download do Ollama — roda Phi-3, LLaMA, Mistral no notebook.
 * **ffmpeg.org:** Extração de áudio de vídeos (.mp4 para .mp3) — linha de comando simples.
 * **mozilla.github.io/pdf.js:** Biblioteca JS para ler PDFs no browser (sem backend).
 * **docs.ollama.com/api:** Documentação da API REST local — fácil de chamar com fetch().
 * **github.com/ggerganov/whisper.cpp:** Whisper em C++ — transcrição local, rápida, sem GPU.
 * **code.visualstudio.com:** VS Code — editor gratuito recomendado para o projeto.
## Conclusão
Bora construir! Este projeto vai sair do computador de vocês e não precisa de GPU nem pagar API. Só precisa de curiosidade e vontade de aprender. Dúvidas podem ser compartilhadas no grupo da turma. Bom projeto a todos!