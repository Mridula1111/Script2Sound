const API_URL = "http://localhost:5000";

// Helper: attach token if it exists
function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function uploadNotes(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/extract`, {
    method: "POST",
    headers: {
      ...authHeader(), // ✅ JWT added safely
    },
    body: formData,
  });

  return response.json();
}

export async function generateScript(text) {
  const response = await fetch(`${API_URL}/script`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(), // ✅ JWT added safely
    },
    body: JSON.stringify({ text }),
  });

  return response.json();
}

export const generateAudio = async (script, title) => {
  const res = await fetch("http://localhost:5000/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ script, title }),
  });

  if (!res.ok) {
    throw new Error("Audio generation failed");
  }

  return res.json(); // ✅ THIS WAS MISSING
};


export const getLibrary = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch("http://localhost:5000/audio", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch library");
  }

  return res.json();
};


export async function fetchAudio(filename) {
  const token = localStorage.getItem("token");

  const res = await fetch(`http://localhost:5000/audio/${filename}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Audio fetch failed");

  return await res.blob();
}


export const deleteAudio = async (id) => {
  const res = await fetch(`http://localhost:5000/audio/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!res.ok) {
    throw new Error("Delete failed");
  }

  return res.json();
};
