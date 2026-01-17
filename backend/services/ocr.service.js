import fs from "fs";
import path from "path";
import { exec } from "child_process";
import Tesseract from "tesseract.js";
import mammoth from "mammoth";

export async function extractText(file) {
  const { path: filePath, mimetype } = file;
  let extractedText = "";

  if (mimetype === "text/plain") {
    extractedText = fs.readFileSync(filePath, "utf-8");
  }

  else if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ path: filePath });
    extractedText = result.value;
  }

  else if (mimetype.startsWith("image/")) {
    const result = await Tesseract.recognize(filePath, "eng");
    extractedText = result.data.text;
  }

  else if (mimetype === "application/pdf") {
    const outputDir = "uploads/pdf_images";
    fs.mkdirSync(outputDir, { recursive: true });

    await new Promise((resolve, reject) => {
      exec(
        `pdftoppm -png "${filePath}" "${outputDir}/page"`,
        (err) => (err ? reject(err) : resolve())
      );
    });

    const images = fs.readdirSync(outputDir).filter(f => f.endsWith(".png"));

    for (const img of images) {
      const result = await Tesseract.recognize(
        path.join(outputDir, img),
        "eng"
      );
      extractedText += result.data.text + "\n";
    }
  }

  else {
    throw new Error("Unsupported file type");
  }

  return extractedText;
}
