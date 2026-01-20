import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLibrary, fetchAudio } from "../services/api";
import Navbar from "../components/Navbar";
import { deleteAudio } from "../services/api";

export default function Library() {
  const [audios, setAudios] = useState([]);
  const [audioUrls, setAudioUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch library once
  useEffect(() => {
    getLibrary()
      .then((data) => {
        setAudios(data);
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

  const handleDelete = async (id) => {
    if (!confirm("Delete this audio?")) return;

    await deleteAudio(id);
    setAudios((prev) => prev.filter((a) => a._id !== id));
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 to-slate-900 text-white flex flex-col">
      <Navbar />
      
    <main className=" mx-auto px-6 py-10 space-y-8 w-full">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold text-center">
          🎧 My Library
        </h1>

        <p className="text-center text-slate-400">
          All your generated audios in one place
        </p>
      </div>
        
        {loading ? (
          <p className="text-center text-slate-400">
            Loading your library...
          </p>
        ) : audios.length === 0 ? (
          <p className="text-center text-slate-400">
            No audio generated yet.
          </p>
        ) : (
          <div className="max-w-5xl mx-auto space-y-3">
            {audios.map((audio) => (
              <div
                key={audio._id}
                className="bg-slate-800 p-6 rounded-xl shadow space-y-4 w-full"
              >
                <h3 className="font-semibold text-white">
                  {audio.title || audio.filename}
                </h3>

                <button 
                  onClick={() => handleDelete(audio._id)}
                  className="text-sm text-red-400 hover:text-red-600">
                      Delete
                </button>

                <audio
                  controls
                  className="w-full h-12"
                  src={audioUrls[audio.filename]}
                />

                {!audioUrls[audio.filename] && (
                  <p className="text-sm text-slate-400 text-center">
                    ▶ Click play to load audio
                  </p>
                )}

                <button
                  onClick={() => navigate(`/questions/${audio._id}`)}
                  className="text-indigo-400 hover:underline text-sm"
                >
                  📘 Practice Questions
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
