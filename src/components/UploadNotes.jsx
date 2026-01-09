export default function UploadNotes({ onUpload }) {
  return (
    <div className="border-2 border-dashed rounded-lg p-6 text-center space-y-3">
      <p className="text-gray-600">
        Upload your notes (.txt, .pdf, .jpg, .png, .docx)
      </p>

      <input
        type="file"
        accept=".txt, .pdf, .docx, image/*"
        className="mx-auto block"
        onChange={(e) => onUpload(e.target.files[0])}
      />
    </div>
  );
}

