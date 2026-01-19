import { useEffect, useState } from "react";
import { getLibrary, fetchAudio } from "../services/api";
import Navbar from "../components/Navbar";

export default function Library() {
  const [audios, setAudios] = useState([]);
  const [audioUrls, setAudioUrls] = useState({});
  const [loading, setLoading] = useState(true);

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


  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 to-slate-900 text-white flex flex-col">
      <Navbar />
      
      <main className="grow max-w-3xl mx-auto px-6 py-10 space-y-8">
        <h1 className="text-3xl font-bold text-center">
          🎧 My Library
        </h1>

        <p className="text-center text-slate-400">
          All your generated audios in one place
        </p>

        {loading ? (
          <p className="text-center text-slate-400">
            Loading your library...
          </p>
        ) : audios.length === 0 ? (
          <p className="text-center text-slate-400">
            No audio generated yet.
          </p>
        ) : (
          <div className="space-y-4">
            {audios.map((audio) => (
              <div
                key={audio._id}
                className="bg-slate-800 p-6 rounded-xl shadow space-y-3"
              >
                <audio
                  controls
                  className="w-full"
                  src={audioUrls[audio.filename]}
                />

                {!audioUrls[audio.filename] && (
                  <p className="text-sm text-slate-400 text-center">
                    ▶ Click play to load audio
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
