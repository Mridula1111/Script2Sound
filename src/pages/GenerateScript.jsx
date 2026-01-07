import { useState } from "react";
import UploadNotes from "../components/UploadNotes";
import { uploadNotes, generateScript } from "../services/api";

export default function GenerateScript() {
  const [file, setFile] = useState(null);
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!file) return alert("Please upload notes");

    setLoading(true);

    try {
      // 1. Extract text
      const { text } = await uploadNotes(file);

      // 2. Generate script
      const { script } = await generateScript(text);
      setScript(script);
    } catch (err) {
      alert("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto" }}>
      <h1>Notes → Script</h1>

      <UploadNotes onUpload={setFile} />

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Script"}
      </button>

      {script && (
        <div style={{ marginTop: "20px" }}>
          <h3>Generated Script</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>{script}</pre>
        </div>
      )}
    </div>
  );
}
