import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TaskCard from "../components/planner/TaskCard";
import TaskForm from "../components/planner/TaskForm";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/planner-api";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState({
    status: "",
    type: "",
  });

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const tasksData = await getTasks(filter);
      setTasks(tasksData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData);
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error("Failed to create task:", error);
      throw error;
    }
  };

  const handleUpdateTask = async (id, taskData) => {
    try {
      await updateTask(id, taskData);
      setEditingTask(null);
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error("Failed to update task:", error);
      throw error;
    }
  };

  const handleDeleteTask = async (id) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await deleteTask(id);
      loadData();
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert("Failed to delete task");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">Tasks</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingTask(null);
          }}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg font-medium"
        >
          + New Task
        </button>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 bg-gradient-accent p-4 rounded-xl flex gap-4 flex-wrap border border-slate-700">
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={filter.type}
          onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        >
          <option value="">All Types</option>
          <option value="exam">Exam</option>
          <option value="assignment">Assignment</option>
          <option value="revision">Revision</option>
        </select>
      </div>

      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      )}

      {loading ? (
        <p className="text-slate-400">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <div className="bg-slate-800 bg-gradient-accent p-12 rounded-xl text-center border border-slate-700">
          <p className="text-slate-400">No tasks yet. Create your first task!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={() => {
                setEditingTask(task);
                setShowForm(true);
              }}
              onDelete={handleDeleteTask}
              onRefresh={loadData}
            />
          ))}
        </div>
      )}
    </div>
  );
}
