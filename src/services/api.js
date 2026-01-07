export async function uploadNotes(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:5000/extract", {
    method: "POST",
    body: formData,
  });

  return response.json(); // { text }
}

export async function generateScript(text) {
  const response = await fetch("http://localhost:5000/script", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  return response.json(); // { script }
}
