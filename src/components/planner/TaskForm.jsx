import { useState, useEffect } from "react";
import FloatingLabel from "../FloatingLabel";

export default function TaskForm({ task, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    type: "assignment",
    deadline: "",
    estimatedHours: 1,
    priority: "medium",
    subtasks: [],
  });

  const [newSubtask, setNewSubtask] = useState("");

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        type: task.type || "assignment",
        deadline: task.deadline
          ? new Date(task.deadline).toISOString().split("T")[0]
          : "",
        estimatedHours: task.estimatedHours || 1,
        priority: task.priority || "medium",
        subtasks: task.subtasks || [],
      });
    } else {
      // Reset form when not editing
      setFormData({
        title: "",
        type: "assignment",
        deadline: "",
        estimatedHours: 1,
        priority: "medium",
        subtasks: [],
      });
      setNewSubtask("");
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        deadline: formData.deadline ? new Date(formData.deadline + "T00:00:00").toISOString() : null,
      };
      
      if (task) {
        await onSubmit(task._id, submitData);
      } else {
        await onSubmit(submitData);
      }
    } catch (error) {
      console.error("Form submission error:", error);
      throw error;
    }
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setFormData({
        ...formData,
        subtasks: [
          ...formData.subtasks,
          { title: newSubtask.trim(), completed: false },
        ],
      });
      setNewSubtask("");
    }
  };

  const removeSubtask = (index) => {
    setFormData({
      ...formData,
      subtasks: formData.subtasks.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl space-y-3">
      <h2 className="text-xl font-semibold text-white">
        {task ? "Edit Task" : "New Task"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <FloatingLabel label="Title" required>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-4 pt-6 pb-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </FloatingLabel>

        <div className="grid grid-cols-3 gap-3">
          <FloatingLabel label="Type">
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full px-3 pt-6 pb-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm appearance-none"
            >
              <option value="assignment">Assignment</option>
              <option value="exam">Exam</option>
              <option value="revision">Revision</option>
            </select>
          </FloatingLabel>

          <FloatingLabel label="Priority">
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className="w-full px-3 pt-6 pb-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm appearance-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </FloatingLabel>

          <FloatingLabel label="Estimated Hours">
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={formData.estimatedHours}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  estimatedHours: parseFloat(e.target.value) || 1,
                })
              }
              className="w-full px-3 pt-6 pb-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm"
            />
          </FloatingLabel>
        </div>

        <FloatingLabel label="Deadline (optional)">
          <input
            type="date"
            value={formData.deadline}
            onChange={(e) =>
              setFormData({ ...formData, deadline: e.target.value })
            }
            className="w-full px-4 pt-6 pb-2 rounded-lg bg-slate-900 border border-slate-700 text-white"
          />
        </FloatingLabel>

        <div>
          <label className="block text-slate-300 text-sm mb-1">
            Subtasks
          </label>
          <div className="space-y-2">
            {formData.subtasks.map((subtask, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-slate-900 p-2 rounded"
              >
                <input
                  type="checkbox"
                  checked={subtask.completed}
                  onChange={(e) => {
                    const updated = [...formData.subtasks];
                    updated[index].completed = e.target.checked;
                    setFormData({ ...formData, subtasks: updated });
                  }}
                  className="rounded"
                />
                <span
                  className={`flex-1 text-white ${
                    subtask.completed ? "line-through text-slate-400" : ""
                  }`}
                >
                  {subtask.title}
                </span>
                <button
                  type="button"
                  onClick={() => removeSubtask(index)}
                  className="text-red-400 hover:text-red-600"
                >
                  ×
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSubtask();
                  }
                }}
                placeholder="Add subtask..."
                className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm"
              />
              <button
                type="button"
                onClick={addSubtask}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg transition"
          >
            {task ? "Update" : "Create"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
