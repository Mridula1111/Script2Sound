import { useState } from "react";
import UploadNotes from "../components/UploadNotes";
import { uploadNotes, generateScript, generateAudio } from "../services/api";
import Navbar from "../components/Navbar";

export default function GenerateScript() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);

  const handleGenerateAudio = async () => {
    if (!file) {
      alert("Please upload notes first");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Extract text from notes
      const extractRes = await uploadNotes(file);
      const notesText = extractRes.text;

      // 2️⃣ Generate script
      const scriptRes = await generateScript(notesText);

      if (!Array.isArray(scriptRes.script)) {
        console.error("Invalid script response:", scriptRes);
        alert("Script generation failed");
        return;
      }

      // 3️⃣ Send full script to backend
      const blob = await generateAudio(scriptRes.script, "host");

      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

    } catch (err) {
      console.error(err);
      alert("Audio generation failed");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col">

      <main className="grow max-w-3xl mx-auto px-6 py-10 space-y-8">
        <h1 className="text-3xl font-bold text-center text-white">
          Notes to Audio
        </h1>

        <p className="text-center text-gray-400">
          Upload your notes and turn them into downloadable podcast audio
        </p>

        <div className="bg-gray-800 p-6 rounded-xl shadow space-y-4">
          <UploadNotes onUpload={setFile} />

          <button
            onClick={handleGenerateAudio}
            disabled={loading}
            className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            {loading ? "Generating audio..." : "Generate Audio"}
          </button>
        </div>

        {audioUrl && (
          <div className="bg-gray-800 p-6 rounded-xl shadow text-center space-y-4">
            <h2 className="font-semibold">Your Audio is Ready</h2>

              <audio controls src={audioUrl} className="w-full" />

            <a
              href={audioUrl}
              download="script2sound.mp3"
              className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg"
            >
              ⬇️ Download Audio
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
