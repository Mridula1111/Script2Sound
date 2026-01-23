import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TaskCard({
  task,
  compact = false,
  onEdit,
  onDelete,
  onSchedule,
  onUnschedule,
  onRefresh,
}) {
  const navigate = useNavigate();
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    startTime: "",
    endTime: "",
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-600";
      case "in-progress":
        return "bg-blue-600";
      case "cancelled":
        return "bg-gray-600";
      default:
        return "bg-slate-600";
    }
  };

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (onSchedule && scheduleData.startTime && scheduleData.endTime) {
      onSchedule(task._id, scheduleData.startTime, scheduleData.endTime);
      setShowScheduleForm(false);
      setScheduleData({ startTime: "", endTime: "" });
    }
  };

  if (compact) {
    return (
      <div
        className="bg-slate-900 p-2 rounded-lg text-xs cursor-pointer hover:bg-slate-700 transition"
        style={{
          borderLeft: `4px solid ${task.course?.color || "#6366f1"}`,
        }}
        onClick={() => navigate(`/tasks`)}
      >
        <p className="text-white font-medium truncate">{task.title}</p>
        {task.scheduledStart && (
          <p className="text-slate-400 text-xs">
            {new Date(task.scheduledStart).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className="bg-slate-900 p-4 rounded-xl space-y-3"
      style={{
        borderLeft: `4px solid ${task.course?.color || "#6366f1"}`,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-white">{task.title}</h3>
          {task.course && (
            <p className="text-slate-400 text-sm">{task.course.name}</p>
          )}
        </div>
        <div className="flex gap-2">
          <span
            className={`px-2 py-1 rounded text-xs text-white ${getPriorityColor(
              task.priority
            )}`}
          >
            {task.priority}
          </span>
          <span
            className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(
              task.status
            )}`}
          >
            {task.status}
          </span>
        </div>
      </div>

      <div className="text-sm text-slate-400 space-y-1">
        <p>Type: {task.type}</p>
        {task.deadline && (
          <p>
            Deadline: {new Date(task.deadline).toLocaleDateString()}
          </p>
        )}
        {task.estimatedHours && <p>Est: {task.estimatedHours}h</p>}
        {task.scheduledStart && (
          <p>
            Scheduled:{" "}
            {new Date(task.scheduledStart).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>

      {task.linkedNotes?.length > 0 && (
        <div className="text-xs text-slate-400">
          📝 {task.linkedNotes.length} note(s) linked
        </div>
      )}

      {task.linkedAudio?.length > 0 && (
        <div className="text-xs text-slate-400">
          🎧 {task.linkedAudio.length} audio(s) linked
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {onEdit && (
          <button
            onClick={() => onEdit(task)}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(task._id)}
            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-sm transition"
          >
            Delete
          </button>
        )}
        {task.scheduledStart ? (
          onUnschedule && (
            <button
              onClick={() => onUnschedule(task._id)}
              className="px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded text-sm transition"
            >
              Unschedule
            </button>
          )
        ) : (
          onSchedule && (
            <button
              onClick={() => setShowScheduleForm(!showScheduleForm)}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm transition"
            >
              Schedule
            </button>
          )
        )}
      </div>

      {showScheduleForm && (
        <form onSubmit={handleScheduleSubmit} className="space-y-2 pt-2 border-t border-slate-700">
          <div>
            <label className="block text-slate-300 text-xs mb-1">
              Start Time
            </label>
            <input
              type="datetime-local"
              required
              value={scheduleData.startTime}
              onChange={(e) =>
                setScheduleData({ ...scheduleData, startTime: e.target.value })
              }
              className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-slate-300 text-xs mb-1">
              End Time
            </label>
            <input
              type="datetime-local"
              required
              value={scheduleData.endTime}
              onChange={(e) =>
                setScheduleData({ ...scheduleData, endTime: e.target.value })
              }
              className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-white text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm transition"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setShowScheduleForm(false);
                setScheduleData({ startTime: "", endTime: "" });
              }}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
