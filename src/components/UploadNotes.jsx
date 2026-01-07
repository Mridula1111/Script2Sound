export default function UploadNotes({ onUpload }) {
  return (
    <div className="border p-4 rounded">
      <input
        type="file"
        accept=".txt,.pdf,.docx"
        onChange={(e) => onUpload(e.target.files[0])}
      />
    </div>
  );
}
