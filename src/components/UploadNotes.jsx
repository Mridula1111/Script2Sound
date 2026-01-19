import { useRef, useState } from "react";

export default function UploadNotes({ onUpload }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState("No file chosen");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    onUpload(file);
  };

  return (
    <div
      onClick={() => inputRef.current.click()}
      className="cursor-pointer rounded-xl border-2 border-dashed border-slate-600
                 bg-slate-800/60 p-8 text-center space-y-3
                 hover:border-indigo-400 transition"
    >
      <p className="text-slate-400 text-sm">
        Upload your notes (.txt, .pdf, .jpg, .png, .docx)
      </p>

      <p className="text-white font-medium">
        📁 {fileName}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".txt,.pdf,.docx,image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
