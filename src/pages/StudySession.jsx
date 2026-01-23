import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudyTimer from "../components/planner/StudyTimer";
import FloatingLabel from "../components/FloatingLabel";
import {
  createSession,
  endSession,
  getSessions,
  linkNoteToSession,
  linkAudioToSession,
} from "../services/planner-api";
import { getTasks } from "../services/planner-api";
import { getNotesLibrary, getLibrary } from "../services/api";

export default function StudySession() {
  const [activeSession, setActiveSession] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [audios, setAudios] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, notesData, audiosData, sessionsData] = await Promise.all([
        getTasks({ status: "pending,in-progress" }),
        getNotesLibrary(),
        getLibrary(),
        getSessions({ limit: 10 }),
      ]);
      setTasks(tasksData);
      setNotes(notesData);
      setAudios(audiosData);
      setSessions(sessionsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async () => {
    if (!selectedTask) {
      alert("Please select a task");
      return;
    }

    try {
      const session = await createSession(selectedTask);
      setActiveSession(session);
    } catch (error) {
      console.error("Failed to start session:", error);
      alert("Failed to start session");
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;

    try {
      await endSession(activeSession._id);
      setActiveSession(null);
      setSelectedTask("");
      loadData();
    } catch (error) {
      console.error("Failed to end session:", error);
      alert("Failed to end session");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white">Study Session</h1>

      {!activeSession ? (
        <div className="bg-slate-800 p-6 rounded-xl space-y-4">
          <h2 className="text-xl font-semibold text-white">Start a Study Session</h2>
          <FloatingLabel label="Select Task" required>
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="w-full px-4 pt-6 pb-2 rounded-lg bg-slate-900 border border-slate-700 text-white appearance-none"
            >
              <option value=""></option>
              {tasks.map((task) => (
                <option key={task._id} value={task._id}>
                  {task.title}
                </option>
              ))}
            </select>
          </FloatingLabel>
          <button
            onClick={handleStartSession}
            disabled={!selectedTask}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Session
          </button>
        </div>
      ) : (
        <StudyTimer
          session={activeSession}
          notes={notes}
          audios={audios}
          onEnd={handleEndSession}
          onLinkNote={linkNoteToSession}
          onLinkAudio={linkAudioToSession}
        />
      )}

      {/* Recent Sessions */}
      <div className="bg-slate-800 p-6 rounded-xl space-y-4">
        <h2 className="text-xl font-semibold text-white">Recent Sessions</h2>
        {loading ? (
          <p className="text-slate-400">Loading...</p>
        ) : sessions.length === 0 ? (
          <p className="text-slate-400">No sessions yet</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session._id}
                className="bg-slate-900 p-4 rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="text-white font-medium">
                    {session.task?.title || "Unknown Task"}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {new Date(session.startTime).toLocaleString()}
                    {session.endTime &&
                      ` - ${session.actualDuration} minutes`}
                  </p>
                </div>
                {!session.endTime && (
                  <span className="text-green-400 text-sm">Active</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
