import { extractText } from "../services/ocr.service.js";

export const extractController = async (req, res) => {
  try {
    const text = await extractText(req.file);
    res.json({ text, length: text.length });
  } catch (err) {
    console.error("OCR ERROR:", err);
    res.status(500).json({ error: "OCR extraction failed" });
  }
};
