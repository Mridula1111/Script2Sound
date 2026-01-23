import { useState } from "react";
import TaskCard from "./TaskCard";
import { scheduleTask, unscheduleTask } from "../../services/planner-api";

export default function DailyView({ data, onRefresh }) {
  const [schedulingTask, setSchedulingTask] = useState(null);

  if (!data) {
    return <p className="text-slate-400">No data available</p>;
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

  const tasksByTime = {};
  data.tasks?.forEach((task) => {
    const time = task.scheduledStart
      ? new Date(task.scheduledStart).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Unscheduled";
    if (!tasksByTime[time]) tasksByTime[time] = [];
    tasksByTime[time].push(task);
  });

  return (
    <div className="space-y-4">
      <div className="bg-slate-800 p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-white mb-4">
          {new Date(data.date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </h2>

        {data.tasks?.length === 0 ? (
          <p className="text-slate-400">No tasks scheduled for this day</p>
        ) : (
          <div className="space-y-4">
            {Object.keys(tasksByTime)
              .sort()
              .map((time) => (
                <div key={time} className="space-y-2">
                  <h3 className="text-slate-300 font-medium">{time}</h3>
                  <div className="space-y-2 ml-4">
                    {tasksByTime[time].map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onSchedule={handleSchedule}
                        onUnschedule={handleUnschedule}
                        onRefresh={onRefresh}
                      />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
