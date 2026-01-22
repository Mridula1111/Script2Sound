import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLibrary, fetchAudio, getNotesLibrary, fetchNotePDF, deleteNote } from "../services/api";
import { deleteAudio } from "../services/api";

export default function Library() {
  const [audios, setAudios] = useState([]);
  const [notes, setNotes] = useState([]);
  const [audioUrls, setAudioUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch library once
  useEffect(() => {
    Promise.all([getLibrary(), getNotesLibrary()])
      .then(([audioData, notesData]) => {
        setAudios(audioData);
        setNotes(notesData);
      })
      .finally(() => setLoading(false));
  }, []);

  // Load audio blob when needed
  const loadAudio = async (filename) => {
    if (audioUrls[filename]) return;

    const blob = await fetchAudio(filename);
    const url = URL.createObjectURL(blob);

    setAudioUrls((prev) => ({
      ...prev,
      [filename]: url,
    }));
  };

  useEffect(() => {
    audios.forEach((audio) => {
      loadAudio(audio.filename);
    });
  }, [audios]);

  const handleDeleteAudio = async (id) => {
    if (!confirm("Delete this audio?")) return;

    await deleteAudio(id);
    setAudios((prev) => prev.filter((a) => a._id !== id));
  };

  const handleDeleteNote = async (id) => {
    if (!confirm("Delete this note?")) return;

    await deleteNote(id);
    setNotes((prev) => prev.filter((n) => n._id !== id));
  };

  const handleDownloadNote = (filename, title) => {
    const url = `http://localhost:5000/notes/${filename}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title || "notes"}.pdf`;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">
            📚 My Library
          </h1>
          <p className="text-slate-400">
            All your generated content in one place
          </p>
        </div>
        
        {loading ? (
          <p className="text-center text-slate-400 py-10">
            Loading your library...
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Notes → Audio */}
            <div className="space-y-4">
              <div className="bg-slate-800 rounded-lg p-4 border-b-2 border-indigo-500">
                <h2 className="text-xl font-bold text-white">
                  🎧 Notes → Audio
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Audio files generated from your notes
                </p>
              </div>
              
              <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
                {audios.length === 0 ? (
                  <div className="bg-slate-800 p-8 rounded-xl text-center">
                    <p className="text-slate-400">No audio generated yet.</p>
                  </div>
                ) : (
                  audios.map((audio) => (
                    <div
                      key={audio._id}
                      className="bg-slate-800 p-5 rounded-xl shadow space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white text-sm">
                          {audio.title || audio.filename}
                        </h3>
                        <button 
                          onClick={() => handleDeleteAudio(audio._id)}
                          className="text-xs text-red-400 hover:text-red-600 transition">
                          Delete
                        </button>
                      </div>

                      <audio
                        controls
                        className="w-full h-10"
                        src={audioUrls[audio.filename]}
                      />

                      {!audioUrls[audio.filename] && (
                        <p className="text-xs text-slate-400 text-center">
                          ▶ Click play to load audio
                        </p>
                      )}

                      <button
                        onClick={() => navigate(`/questions/${audio._id}`)}
                        className="text-xs text-indigo-400 hover:underline"
                      >
                        📘 Practice Questions
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Audio → Notes */}
            <div className="space-y-4">
              <div className="bg-slate-800 rounded-lg p-4 border-b-2 border-pink-500">
                <h2 className="text-xl font-bold text-white">
                  📝 Audio → Notes
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Study notes generated from audio recordings
                </p>
              </div>
              
              <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
                {notes.length === 0 ? (
                  <div className="bg-slate-800 p-8 rounded-xl text-center">
                    <p className="text-slate-400">No notes generated yet.</p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note._id}
                      className="bg-slate-800 p-5 rounded-xl shadow space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white text-sm">
                          {note.title || note.filename}
                        </h3>
                        <button 
                          onClick={() => handleDeleteNote(note._id)}
                          className="text-xs text-red-400 hover:text-red-600 transition">
                          Delete
                        </button>
                      </div>

                      <div className="text-xs text-slate-400 space-y-1">
                        <p>📄 Format: {note.format?.toUpperCase() || "PDF"}</p>
                        <p>🎙️ Original: {note.originalAudioFilename}</p>
                        {note.content?.definitions && (
                          <p>📚 {note.content.definitions.length} definitions</p>
                        )}
                        {note.content?.practiceQuestions && (
                          <p>❓ {note.content.practiceQuestions.length} practice questions</p>
                        )}
                      </div>

                      <button
                        onClick={() => handleDownloadNote(note.filename, note.title)}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition text-sm"
                      >
                        ⬇️ Download PDF
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
