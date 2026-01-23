import { useState, useEffect } from "react";
import FloatingLabel from "../FloatingLabel";

export default function StudyTimer({
  session,
  notes,
  audios,
  onEnd,
  onLinkNote,
  onLinkAudio,
}) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [sessionNotes, setSessionNotes] = useState(session.notes || "");

  useEffect(() => {
    if (!session) return;

    const startTime = new Date(session.startTime).getTime();
    let interval;

    if (isRunning) {
      interval = setInterval(() => {
        const now = Date.now();
        setElapsed(Math.floor((now - startTime) / 1000));
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [session, isRunning]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleLinkNote = async (noteId) => {
    try {
      const updatedSession = await onLinkNote(session._id, noteId);
      // Update session with linked notes
      if (updatedSession && updatedSession.linkedNotes) {
        session.linkedNotes = updatedSession.linkedNotes;
      }
    } catch (error) {
      console.error("Failed to link note:", error);
      alert("Failed to link note");
    }
  };

  const handleLinkAudio = async (audioId) => {
    try {
      const updatedSession = await onLinkAudio(session._id, audioId);
      // Update session with linked audio
      if (updatedSession && updatedSession.linkedAudio) {
        session.linkedAudio = updatedSession.linkedAudio;
      }
    } catch (error) {
      console.error("Failed to link audio:", error);
      alert("Failed to link audio");
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          {session.task?.title || "Study Session"}
        </h2>
        <div className="text-6xl font-mono text-indigo-400 my-4">
          {formatTime(elapsed)}
        </div>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            {isRunning ? "Pause" : "Resume"}
          </button>
          <button
            onClick={onEnd}
            className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition"
          >
            End Session
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <FloatingLabel label="Session Notes">
          <textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            className="w-full px-4 pt-6 pb-2 rounded-lg bg-slate-900 border border-slate-700 text-white min-h-[100px]"
          />
        </FloatingLabel>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-white font-semibold mb-2">Link Notes</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {notes?.length === 0 ? (
                <p className="text-slate-400 text-sm">No notes available</p>
              ) : (
                notes?.map((note) => (
                  <div
                    key={note._id}
                    className="flex items-center justify-between bg-slate-900 p-2 rounded"
                  >
                    <span className="text-white text-sm truncate">
                      {note.title}
                    </span>
                    <button
                      onClick={() => handleLinkNote(note._id)}
                      className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs transition"
                    >
                      Link
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-2">Link Audio</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {audios?.length === 0 ? (
                <p className="text-slate-400 text-sm">No audio available</p>
              ) : (
                audios?.map((audio) => (
                  <div
                    key={audio._id}
                    className="flex items-center justify-between bg-slate-900 p-2 rounded"
                  >
                    <span className="text-white text-sm truncate">
                      {audio.title}
                    </span>
                    <button
                      onClick={() => handleLinkAudio(audio._id)}
                      className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs transition"
                    >
                      Link
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {session.linkedNotes?.length > 0 && (
          <div>
            <h3 className="text-white font-semibold mb-2">Linked Notes</h3>
            <div className="space-y-1">
              {session.linkedNotes.map((note) => (
                <div
                  key={note._id}
                  className="bg-slate-900 p-2 rounded text-white text-sm"
                >
                  📝 {note.title}
                </div>
              ))}
            </div>
          </div>
        )}

        {session.linkedAudio?.length > 0 && (
          <div>
            <h3 className="text-white font-semibold mb-2">Linked Audio</h3>
            <div className="space-y-1">
              {session.linkedAudio.map((audio) => (
                <div
                  key={audio._id}
                  className="bg-slate-900 p-2 rounded text-white text-sm"
                >
                  🎧 {audio.title}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
