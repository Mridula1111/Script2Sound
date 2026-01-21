import { useState } from "react";
import UploadNotes from "../components/UploadNotes";
import { uploadNotes, generateScript, generateAudio } from "../services/api";

const INDIAN_LANGUAGES = [
  { code: "hindi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "tamil", name: "Tamil", nativeName: "தமிழ்" },
  { code: "telugu", name: "Telugu", nativeName: "తెలుగు" },
  { code: "kannada", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "malayalam", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "marathi", name: "Marathi", nativeName: "मराठी" },
  { code: "gujarati", name: "Gujarati", nativeName: "ગુજરાતી" },
];

export default function GenerateScript() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioName, setAudioName] = useState("");
  const [script, setScript] = useState(null);
  
  // Language state
  const [languageMode, setLanguageMode] = useState("english"); // "english" or "native"
  const [selectedLanguage, setSelectedLanguage] = useState("hindi");

  const handleGenerateAudio = async () => {
    if (!file) {
      alert("Please upload notes first");
      return;
    }

    setAudioUrl(null);
    setScript(null);

    try {
      setLoading(true);

      // 1️⃣ Extract text from notes
      const extractRes = await uploadNotes(file);
      const notesText = extractRes.text;

      // 2️⃣ Generate script with language preference
      const scriptRes = await generateScript(notesText, {
        language: languageMode,
        nativeLanguage: languageMode === "native" ? selectedLanguage : null,
      });

      if (!Array.isArray(scriptRes.script)) {
        console.error("Invalid script response:", scriptRes);
        alert("Script generation failed");
        return;
      }

      setScript(scriptRes.script);

      const title =
        audioName?.trim() ||
        `Notes Audio ${new Date().toLocaleDateString()}`;

      // 3️⃣ Send full script to backend with language info
      const audioRes = await generateAudio(scriptRes.script, title, {
        language: languageMode,
        nativeLanguage: languageMode === "native" ? selectedLanguage : null,
      });
      
      console.log("AUDIO RESPONSE:", audioRes);
      const filename = audioRes.filename;

      const url = `http://localhost:5000/audio/${filename}`;
      setAudioUrl(url);

    } catch (err) {
      console.error(err);
      alert(err.message || "Audio generation failed");
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

        <div className="bg-gray-800 p-6 rounded-xl shadow space-y-6">
          <UploadNotes onUpload={setFile} />

          {/* Language Selection Section */}
          <div className="bg-gray-900 p-4 rounded-lg space-y-4">
            <h3 className="text-white font-semibold">Audio Language</h3>
            
            {/* Slider for language mode */}
            <div className="flex items-center justify-between">
              <label className="text-gray-300">
                {languageMode === "english" ? "🇬🇧 English" : "🇮🇳 Native Language"}
              </label>
              <div className="flex items-center gap-3">
                <span className={`text-sm ${languageMode === "english" ? "text-indigo-400" : "text-gray-400"}`}>
                  English
                </span>
                <button
                  onClick={() => setLanguageMode(languageMode === "english" ? "native" : "english")}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    languageMode === "native" ? "bg-indigo-600" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      languageMode === "native" ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className={`text-sm ${languageMode === "native" ? "text-indigo-400" : "text-gray-400"}`}>
                  Native
                </span>
              </div>
            </div>

            {/* Language dropdown - show only when native mode is selected */}
            {languageMode === "native" && (
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Select Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {INDIAN_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName} - {lang.name}
                    </option>
                  ))}
                </select>
                <p className="text-gray-400 text-xs mt-2">
                  ℹ️ Technical terms will be retained in English for clarity
                </p>
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder="Audio name (optional)"
            value={audioName}
            onChange={(e) => setAudioName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg
                      bg-gray-900 border border-gray-700
                      text-white placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            onClick={handleGenerateAudio}
            disabled={loading}
            className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Generating audio..." : "Generate Audio"}
          </button>
        </div>

        {audioUrl && (
          <div className="bg-gray-800 p-6 rounded-xl shadow text-center space-y-4">
            <h2 className="font-semibold text-white">Your Audio is Ready</h2>

            <audio controls src={audioUrl} className="w-full" />

            <a
              href={audioUrl}
              download={`${audioName?.trim() || `Notes Audio ${new Date().toLocaleDateString()}`}.mp3`}
              className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              ⬇️ Download Audio
            </a>
          </div>
        )}

        {script && (
          <div className="bg-gray-800 p-6 rounded-xl shadow space-y-4">
            <h3 className="text-white font-semibold">Generated Script Preview</h3>
            <div className="max-h-64 overflow-y-auto bg-gray-900 p-4 rounded text-gray-300 text-sm space-y-2">
              {script.map((line, idx) => (
                <div key={idx} className="border-b border-gray-700 pb-2">
                  {line.type === "speech" && (
                    <p>
                      <span className="text-indigo-400 font-semibold">{line.speaker.toUpperCase()}:</span> {line.text}
                    </p>
                  )}
                  {line.type === "music" && (
                    <p className="text-purple-400">🎵 MUSIC: {line.id}</p>
                  )}
                  {line.type === "sfx" && (
                    <p className="text-orange-400">🔊 SFX: {line.id}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
