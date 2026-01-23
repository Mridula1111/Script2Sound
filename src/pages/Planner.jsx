import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DailyView from "../components/planner/DailyView";
import WeeklyView from "../components/planner/WeeklyView";
import TaskForm from "../components/planner/TaskForm";
import { getDailyView, getWeeklyView } from "../services/planner-api";
import { createTask } from "../services/planner-api";

export default function Planner() {
  const [view, setView] = useState("daily");
  const [dailyData, setDailyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [view, selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (view === "daily") {
        const data = await getDailyView(selectedDate);
        setDailyData(data);
      } else {
        const data = await getWeeklyView();
        setWeeklyData(data);
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Study Planner</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setShowForm(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition"
          >
            + New Task
          </button>
          <button
            onClick={() => setView("daily")}
            className={`px-4 py-2 rounded-lg transition ${
              view === "daily"
                ? "bg-indigo-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setView("weekly")}
            className={`px-4 py-2 rounded-lg transition ${
              view === "weekly"
                ? "bg-indigo-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      {showForm && (
        <TaskForm
          task={null}
          onSubmit={handleCreateTask}
          onCancel={() => {
            setShowForm(false);
          }}
        />
      )}

      {view === "daily" && (
        <div className="space-y-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
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
    </div>
  );
}
