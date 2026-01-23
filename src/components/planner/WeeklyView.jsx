import { useState } from "react";
import TaskCard from "./TaskCard";
import { scheduleTask, unscheduleTask } from "../../services/planner-api";

export default function WeeklyView({ data, onRefresh }) {
  if (!data || !data.tasksByDay) {
    return <p className="text-slate-400">No data available</p>;
  }

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const weekStart = new Date(data.weekStart);
  const weekDays = [];

  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    weekDays.push(day);
  }

  const handleSchedule = async (taskId, startTime, endTime) => {
    try {
      await scheduleTask(taskId, startTime, endTime);
      onRefresh();
    } catch (error) {
      console.error("Failed to schedule task:", error);
      alert(error.message || "Failed to schedule task");
    }
  };

  const handleUnschedule = async (taskId) => {
    try {
      await unscheduleTask(taskId);
      onRefresh();
    } catch (error) {
      console.error("Failed to unschedule task:", error);
      alert("Failed to unschedule task");
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl">
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const dayKey = day.toISOString().split("T")[0];
          const dayTasks = data.tasksByDay[dayKey] || [];

          return (
            <div key={index} className="space-y-2">
              <div className="text-center">
                <p className="text-slate-400 text-sm">
                  {days[day.getDay()]}
                </p>
                <p className="text-white font-semibold">{day.getDate()}</p>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {dayTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    compact
                    onSchedule={handleSchedule}
                    onUnschedule={handleUnschedule}
                    onRefresh={onRefresh}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
