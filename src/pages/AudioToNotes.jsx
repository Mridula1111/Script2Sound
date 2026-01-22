import { useState } from "react";
import UploadAudio from "../components/UploadAudio";
import { convertAudioToNotes } from "../services/api";

export default function AudioToNotes() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [noteUrl, setNoteUrl] = useState(null);
  const [noteName, setNoteName] = useState("");
  const [error, setError] = useState(null);

  const handleConvertAudio = async () => {
    if (!file) {
      alert("Please upload an audio file first");
      return;
    }

    setNoteUrl(null);
    setError(null);

    try {
      setLoading(true);

      const title = noteName?.trim() || `Lecture Notes ${new Date().toLocaleDateString()}`;

      const result = await convertAudioToNotes(file, title);

      if (result.success) {
        const url = `http://localhost:5000/notes/${result.filename}`;
        setNoteUrl(url);
      } else {
        throw new Error(result.error || "Conversion failed");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Audio-to-notes conversion failed");
      alert(err.message || "Audio-to-notes conversion failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grow max-w-3xl mx-auto px-6 py-10 space-y-8">
          <h1 className="text-3xl font-bold text-center text-white">
            Audio to Notes
          </h1>

          <p className="text-center text-gray-400">
            Upload your lecture recording and get structured notes with definitions, explanations, and practice questions
          </p>

          <div className="bg-gray-800 p-6 rounded-xl shadow space-y-6">
            <UploadAudio onUpload={setFile} />

            <input
              type="text"
              placeholder="Notes title (optional)"
              value={noteName}
              onChange={(e) => setNoteName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg
                        bg-gray-900 border border-gray-700
                        text-white placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              onClick={handleConvertAudio}
              disabled={loading || !file}
              className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Converting audio to notes..." : "Convert to Notes"}
            </button>

            {loading && (
              <div className="text-center text-gray-400">
                <p>⏳ Processing your audio...</p>
                <p className="text-sm mt-2">This may take a few minutes depending on the audio length.</p>
              </div>
            )}

            {error && (
              <div className="bg-red-900/30 border border-red-500 text-red-200 p-4 rounded-lg">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
              </div>
            )}
          </div>

          {noteUrl && (
            <div className="bg-gray-800 p-6 rounded-xl shadow text-center space-y-4">
              <h2 className="font-semibold text-white text-xl">
                ✅ Your Notes are Ready!
              </h2>

              <p className="text-gray-400">
                Your structured notes with definitions, explanations, and practice questions have been generated.
              </p>

              <a
                href={noteUrl}
                download={`${noteName?.trim() || `Lecture Notes ${new Date().toLocaleDateString()}`}.pdf`}
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
              >
                ⬇️ Download PDF
              </a>
            </div>
          )}
    </main>
  );
}
