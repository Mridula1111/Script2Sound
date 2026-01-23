const API_URL = "http://localhost:5000";

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Courses API
export const getCourses = async () => {
  const res = await fetch(`${API_URL}/courses`, {
    method: "GET",
    headers: {
      ...authHeader(),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch courses");
  }

  return res.json();
};

export const createCourse = async (courseData) => {
  const res = await fetch(`${API_URL}/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(courseData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create course");
  }

  return res.json();
};

export const updateCourse = async (id, courseData) => {
  const res = await fetch(`${API_URL}/courses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(courseData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update course");
  }

  return res.json();
};

export const deleteCourse = async (id) => {
  const res = await fetch(`${API_URL}/courses/${id}`, {
    method: "DELETE",
    headers: {
      ...authHeader(),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete course");
  }

  return res.json();
};

// Tasks API
export const getTasks = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.append("status", filters.status);
  if (filters.type) queryParams.append("type", filters.type);
  if (filters.course) queryParams.append("course", filters.course);

  const res = await fetch(`${API_URL}/tasks?${queryParams.toString()}`, {
    method: "GET",
    headers: {
      ...authHeader(),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch tasks");
  }

  return res.json();
};

export const createTask = async (taskData) => {
  const res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(taskData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create task");
  }

  return res.json();
};

export const updateTask = async (id, taskData) => {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(taskData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update task");
  }

  return res.json();
};

export const deleteTask = async (id) => {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: {
      ...authHeader(),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete task");
  }

  return res.json();
};

export const linkNoteToTask = async (taskId, noteId) => {
  const res = await fetch(`${API_URL}/tasks/${taskId}/link-note`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify({ noteId }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to link note to task");
  }

  return res.json();
};

export const linkAudioToTask = async (taskId, audioId) => {
  const res = await fetch(`${API_URL}/tasks/${taskId}/link-audio`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify({ audioId }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to link audio to task");
  }

  return res.json();
};

export const createTaskFromNote = async (noteId, taskData = {}) => {
  const res = await fetch(`${API_URL}/tasks/from-note/${noteId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(taskData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create task from note");
  }

  return res.json();
};

export const createTaskFromAudio = async (audioId, taskData = {}) => {
  const res = await fetch(`${API_URL}/tasks/from-audio/${audioId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify(taskData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create task from audio");
  }

  return res.json();
};

// Planner API
export const getDailyView = async (date) => {
  const queryParams = date ? `?date=${date}` : "";
  const res = await fetch(`${API_URL}/planner/daily${queryParams}`, {
    method: "GET",
    headers: {
      ...authHeader(),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch daily view");
  }

  return res.json();
};

export const getWeeklyView = async (startDate) => {
  const queryParams = startDate ? `?startDate=${startDate}` : "";
  const res = await fetch(`${API_URL}/planner/weekly${queryParams}`, {
    method: "GET",
    headers: {
      ...authHeader(),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch weekly view");
  }

  return res.json();
};

export const scheduleTask = async (taskId, scheduledStart, scheduledEnd) => {
  const res = await fetch(`${API_URL}/planner/schedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify({
      taskId,
      scheduledStart,
      scheduledEnd,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to schedule task");
  }

  return res.json();
};

export const unscheduleTask = async (taskId) => {
  const res = await fetch(`${API_URL}/planner/unschedule/${taskId}`, {
    method: "DELETE",
    headers: {
      ...authHeader(),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to unschedule task");
  }

  return res.json();
};

// Study Sessions API
export const createSession = async (taskId, notes = "") => {
  const res = await fetch(`${API_URL}/study-sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify({ taskId, notes }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create session");
  }

  return res.json();
};

export const getSessions = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  if (filters.taskId) queryParams.append("taskId", filters.taskId);
  if (filters.limit) queryParams.append("limit", filters.limit);

  const res = await fetch(
    `${API_URL}/study-sessions?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        ...authHeader(),
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch sessions");
  }

  return res.json();
};

export const endSession = async (sessionId) => {
  const res = await fetch(`${API_URL}/study-sessions/${sessionId}/end`, {
    method: "POST",
    headers: {
      ...authHeader(),
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to end session");
  }

  return res.json();
};

export const linkNoteToSession = async (sessionId, noteId) => {
  const res = await fetch(
    `${API_URL}/study-sessions/${sessionId}/link-note`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
      body: JSON.stringify({ noteId }),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to link note to session");
  }

  return res.json();
};

export const linkAudioToSession = async (sessionId, audioId) => {
  const res = await fetch(
    `${API_URL}/study-sessions/${sessionId}/link-audio`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
      body: JSON.stringify({ audioId }),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to link audio to session");
  }

  return res.json();
};
