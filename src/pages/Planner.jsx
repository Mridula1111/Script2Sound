import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DailyView from "../components/planner/DailyView";
import WeeklyView from "../components/planner/WeeklyView";
import TaskForm from "../components/planner/TaskForm";
import TaskCard from "../components/planner/TaskCard";
import { getDailyView, getWeeklyView, getTasks, updateTask, deleteTask } from "../services/planner-api";
import { createTask } from "../services/planner-api";

export default function Planner() {
  const [view, setView] = useState("daily");
  const [dailyData, setDailyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [allTasksData, setAllTasksData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    loadData();
  }, [view, selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (view === "daily") {
        const data = await getDailyView(selectedDate);
        setDailyData(data);
      } else if (view === "weekly") {
        const data = await getWeeklyView();
        setWeeklyView(data);
      } else if (view === "all-tasks") {
        const data = await getTasks({});
        setAllTasksData(data);
      }
    } catch (error) {
      console.error("Failed to load planner data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData);
      setShowForm(false);
      loadData(); // Refresh the planner view
    } catch (error) {
      console.error("Failed to create task:", error);
      throw error;
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      await updateTask(taskId, taskData);
      setEditingTask(null);
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error("Failed to update task:", error);
      throw error;
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteTask(taskId);
      loadData();
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert("Failed to delete task");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">Study Planner</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowForm(true);
              setEditingTask(null);
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-lg"
          >
            + New Task
          </button>
          <button
            onClick={() => setView("daily")}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              view === "daily"
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setView("weekly")}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              view === "weekly"
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setView("all-tasks")}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              view === "all-tasks"
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            All Tasks
          </button>
        </div>
      </div>

      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? (id, data) => handleUpdateTask(id, data) : handleCreateTask}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      )}

      {view === "daily" && (
        <div className="space-y-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : (
            <DailyView data={dailyData} onRefresh={loadData} />
          )}
        </div>
      )}

      {view === "weekly" && (
        <div>
          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : (
            <WeeklyView data={weeklyData} onRefresh={loadData} />
          )}
        </div>
      )}

      {view === "all-tasks" && (
        <div className="space-y-4">
          {loading ? (
            <p className="text-slate-400">Loading...</p>
          ) : allTasksData.length === 0 ? (
            <p className="text-slate-400">No tasks found</p>
          ) : (
            <div className="space-y-3">
              {allTasksData.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  onRefresh={loadData}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
