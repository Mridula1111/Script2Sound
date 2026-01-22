import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate PDF from structured notes
 * @param {Object} notes - Structured notes object
 * @param {string} title - Title of the document
 * @param {string} transcript - Original transcript (optional)
 * @returns {Promise<string>} - Path to generated PDF file
 */
export async function generatePDF(notes, title, transcript = "") {
  return new Promise((resolve, reject) => {
    try {
      // Ensure uploads directory exists
      const uploadsDir = path.join(__dirname, "../uploads");
      fs.mkdirSync(uploadsDir, { recursive: true });
      
      const outputPath = path.join(uploadsDir, `notes_${Date.now()}.pdf`);
      const doc = new PDFDocument({
        margin: 50,
        size: "A4",
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Title
      doc.fontSize(24)
         .font("Helvetica-Bold")
         .text(title, { align: "center" })
         .moveDown(2);

      // Definitions Section
      if (notes.definitions && notes.definitions.length > 0) {
        doc.fontSize(18)
           .font("Helvetica-Bold")
           .text("Key Definitions", { underline: true })
           .moveDown(0.5);

        doc.fontSize(12)
           .font("Helvetica");

        notes.definitions.forEach((definition, index) => {
          doc.font("Helvetica-Bold")
             .text(`${index + 1}.`, { continued: true })
             .font("Helvetica")
             .text(` ${definition}`, { align: "left" })
             .moveDown(0.5);
        });

        doc.moveDown(1);
      }

      // Explanations Section
      if (notes.explanations && notes.explanations.length > 0) {
        doc.fontSize(18)
           .font("Helvetica-Bold")
           .text("Explanations", { underline: true })
           .moveDown(0.5);

        doc.fontSize(12)
           .font("Helvetica");

        notes.explanations.forEach((explanation, index) => {
          doc.font("Helvetica-Bold")
             .text(`${index + 1}.`, { continued: true })
             .font("Helvetica")
             .text(` ${explanation}`, { align: "left" })
             .moveDown(0.5);
        });

        doc.moveDown(1);
      }

      // Practice Questions Section
      if (notes.practiceQuestions && notes.practiceQuestions.length > 0) {
        doc.fontSize(18)
           .font("Helvetica-Bold")
           .text("Practice Questions", { underline: true })
           .moveDown(0.5);

        doc.fontSize(12)
           .font("Helvetica");

        notes.practiceQuestions.forEach((item, index) => {
          doc.font("Helvetica-Bold")
             .text(`Q${index + 1}: ${item.question}`, { align: "left" })
             .moveDown(0.3);

          doc.font("Helvetica")
             .fontSize(11)
             .fillColor("#0066cc")
             .text(`Answer: ${item.answer}`, { align: "left" })
             .fillColor("black")
             .fontSize(12)
             .moveDown(0.8);
        });
      }

      // Footer
      doc.fontSize(10)
         .font("Helvetica")
         .fillColor("gray")
         .text(
           `Generated on ${new Date().toLocaleDateString()}`,
           50,
           doc.page.height - 50,
           { align: "center" }
         );

      doc.end();

      stream.on("finish", () => {
        console.log("✅ PDF generated:", outputPath);
        resolve(outputPath);
      });

      stream.on("error", (err) => {
        console.error("❌ PDF stream error:", err);
        reject(err);
      });
    } catch (error) {
      console.error("❌ PDF generation error:", error);
      reject(error);
    }
  });
}
