const MAX_PDF_PAGES = 30;

const pdfUpload = document.getElementById("pdf-upload");

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

async function extractPdfText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = Math.min(pdf.numPages, MAX_PDF_PAGES);

  let fullText = "";

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(" ");
    fullText += `\n[Página ${i}]\n${pageText}\n`;
  }

  if (pdf.numPages > MAX_PDF_PAGES) {
    fullText += `\n...[PDF truncado: exibindo ${MAX_PDF_PAGES} de ${pdf.numPages} páginas]`;
  }

  return fullText.trim();
}

pdfUpload.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const overlay = document.getElementById("processing-overlay");
  const processingText = document.getElementById("processing-text");

  overlay.classList.add("active");
  processingText.textContent = "Extraindo texto do PDF...";

  try {
    const text = await extractPdfText(file);
    if (!text.trim()) {
      throw new Error("Nenhum texto encontrado no PDF.");
    }
    setContext(text, file.name, "pdf");
  } catch (err) {
    addSystemMessage(`Erro ao processar PDF: ${err.message}`);
  } finally {
    overlay.classList.remove("active");
    pdfUpload.value = "";
  }
});
