async function fetchNoteDetail(noteId) {
  const token = requireToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/notes/${noteId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error();

    const note = await res.json();

    selectedNote = note;   // VERY IMPORTANT
    renderNoteDetail(note);

  } catch (err) {
    console.error("Failed to fetch note detail:", err);
  }
}
function renderNoteDetail(note) {
  document.getElementById("noteTitle").textContent = note.title;

  const tagsContainer = document.getElementById("noteTags");
  tagsContainer.innerHTML = "";

  (note.tags || []).forEach(tag => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = tag;
    tagsContainer.appendChild(span);
  });

  // CONTENT VIEW MODE
  const contentDiv = document.getElementById("noteContent");
  contentDiv.innerHTML = "";
  contentDiv.textContent = note.content;

  // SUMMARY
  document.getElementById("noteSummary").textContent = note.summary || "";

  document.getElementById("summaryUpdated").textContent =
    note.updated_at
      ? "Last summary update: " + new Date(note.updated_at).toLocaleString()
      : "";

  // EDIT BUTTON
  document.getElementById("editNoteBtn").onclick = () => {
    enableEditMode(note);
  };
}