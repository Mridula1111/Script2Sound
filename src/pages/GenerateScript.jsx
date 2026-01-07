import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import UploadNotes from "../components/UploadNotes";
import { uploadNotes, generateScript } from "../services/api";

export default function GenerateScript() {
  const [file, setFile] = useState(null);
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!file) return alert("Please upload a file");

    setLoading(true);
    const { text } = await uploadNotes(file);
    const { script } = await generateScript(text);
    setScript(script);
    setLoading(false);
  };

  return (
  <div className="min-h-screen flex flex-col bg-gray-100">
    
    {/* Header */}
    <Navbar />

    {/* Main Content */}
    <main className="flex-grow max-w-3xl mx-auto px-6 py-10 space-y-8">

      <h1 className="text-3xl font-bold text-center">
    Notes to Script
      </h1>

      <p className="text-center text-gray-600">
    Upload your notes and instantly turn them into an engaging podcast script
      </p>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <UploadNotes onUpload={setFile} />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          {loading ? "Generating..." : "Generate Script"}
        </button>
      </div>

      {script && (
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold mb-3">
            Generated Script
          </h2>
          <div className="max-h-96 overflow-y-auto text-sm whitespace-pre-wrap">
            {script}
          </div>
        </div>
      )}

    </main>

    {/* Footer */}
    <Footer />
  </div>
);

}

