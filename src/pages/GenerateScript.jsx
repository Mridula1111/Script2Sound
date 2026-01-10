import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import UploadNotes from "../components/UploadNotes";
import { uploadNotes, generateScript } from "../services/api";

export default function GenerateScript() {
  const [file, setFile] = useState(null);
  const [script, setScript] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!file) return alert("Please upload a file");

    setLoading(true);
    const { text } = await uploadNotes(file);
    const { script } = await generateScript(text);
    console.log("SCRIPT FROM BACKEND:", script);
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

      {Array.isArray(script) && script.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="font-semibold">Generated Script</h2>

          {script.map((segment, index) => {
          if (!segment || !segment.type) {
            return (
              <pre key={index} className="text-red-600 text-sm">
                Invalid segment: {JSON.stringify(segment, null, 2)}
              </pre>
            );
          }

          if (segment.type === "speech") {
            return (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">
                  {segment.speaker.toUpperCase()}
                </p>
                <p className="text-gray-800 leading-relaxed">
                  {segment.text}
                </p>
              </div>
            );
          }

          if (segment.type === "music") {
            return (
              <div key={index} className="text-xs uppercase tracking-wide text-indigo-600">
                🎵 {segment.id ?? "unknown"} music
              </div>
            );
          }

          if (segment.type === "sfx") {
            return (
              <div key={index} className="text-xs uppercase tracking-wide text-green-600">
                🔊 {segment.id ?? "unknown"} sound
              </div>
            );
          }

          return null;
        })}

        </div>
      )}

    </main>

    {/* Footer */}
    <Footer />
  </div>
);

}

