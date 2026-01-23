import { useState, useEffect } from "react";
import { linkNoteToTask, linkAudioToTask } from "../../services/planner-api";
import { getTasks } from "../../services/planner-api";

export default function TaskLinker({ noteId, audioId, onClose, onSuccess }) {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async () => {
    if (!selectedTask) {
      alert("Please select a task");
      return;
    }

    try {
      if (noteId) {
        await linkNoteToTask(selectedTask, noteId);
      } else if (audioId) {
        await linkAudioToTask(selectedTask, audioId);
      }
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      console.error("Failed to link:", error);
      alert("Failed to link to task");
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl space-y-4">
      <h2 className="text-xl font-semibold text-white">
        Link to Task
      </h2>
      {loading ? (
        <p className="text-slate-400">Loading tasks...</p>
      ) : (
        <>
          <div>
            <label className="block text-slate-300 text-sm mb-2">
              Select Task
            </label>
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
            >
              <option value="">Choose a task...</option>
              {tasks.map((task) => (
                <option key={task._id} value={task._id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleLink}
              disabled={!selectedTask}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Link
            </button>
            <button
              onClick={onClose}
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}
