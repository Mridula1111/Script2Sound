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
      ...authHeader(),
    },
    body: formData,
  });

  return response.json();
}

export async function generateScript(text, languageOptions = {}) {
  const response = await fetch(`${API_URL}/script`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
    },
    body: JSON.stringify({ 
      text,
      language: languageOptions.language || "english",
      nativeLanguage: languageOptions.nativeLanguage || null,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Script generation failed");
  }

  return response.json();
}

export const generateAudio = async (script, title, languageOptions = {}) => {
  const res = await fetch(`${API_URL}/tts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ 
      script, 
      title,
      language: languageOptions.language || "english",
      nativeLanguage: languageOptions.nativeLanguage || null,
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Audio generation failed");
  }

  return res.json();
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

export const generateQuestions = async (audioId) => {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `http://localhost:5000/questions/${audioId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) throw new Error("Failed to generate questions");

  return res.json();
};

export const convertAudioToNotes = async (audioFile, title) => {
  const formData = new FormData();
  formData.append("audio", audioFile);
  formData.append("title", title || "");
  formData.append("format", "pdf");

  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/audio-to-notes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Audio-to-notes conversion failed");
  }

  return res.json();
};

export const getNotesLibrary = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/notes`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch notes library");
  }

  return res.json();
};

export const fetchNotePDF = async (filename) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/notes/${filename}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Note PDF fetch failed");

  return await res.blob();
};

export const deleteNote = async (id) => {
  const res = await fetch(`${API_URL}/notes/${id}`, {
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

export const getUserEmail = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user information");
  }

  return res.json();
};