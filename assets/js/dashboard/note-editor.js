let selectedNote = null;

// -----------------------------
// Setup Edit Button
// -----------------------------
function setupEditNote() {
  const editBtn = document.getElementById("editNoteBtn");
  if (!editBtn) return;

  editBtn.onclick = () => {
    if (!selectedNote) return;
    enableEditMode(selectedNote);
  };
}

// -----------------------------
// Enable Inline Edit Mode
// -----------------------------
function enableEditMode(note) {
  const contentDiv = document.getElementById("noteContent");

  const textarea = document.createElement("textarea");
  textarea.value = note.content;
  textarea.className = "note-editor";

  contentDiv.innerHTML = "";
  contentDiv.appendChild(textarea);

  // Auto resize textarea
  function autoResizeTextarea(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }

  autoResizeTextarea(textarea);
  textarea.addEventListener("input", () => {
    autoResizeTextarea(textarea);
  });

  const buttonRow = document.createElement("div");
  buttonRow.className = "flex gap-3 mt-3";

  const saveBtn = document.createElement("button");
  saveBtn.className = "btn-primary";
  saveBtn.textContent = "Save";

  const cancelBtn = document.createElement("button");
  cancelBtn.className = "opacity-60 text-xs";
  cancelBtn.textContent = "Cancel";

  buttonRow.appendChild(saveBtn);
  buttonRow.appendChild(cancelBtn);

  contentDiv.appendChild(buttonRow);

  // Save
  saveBtn.onclick = async () => {
    await updateNoteContent(note.id, textarea.value);
    fetchNoteDetail(note.id);
    fetchNotes();
  };

  // Cancel
  cancelBtn.onclick = () => {
    fetchNoteDetail(note.id);
  };
}

// -----------------------------
// Update Note Content (API Call)
// -----------------------------
async function updateNoteContent(noteId, content) {
  const token = localStorage.getItem("access_token");
  if (!token) return;

  await fetch(`${API_BASE}/notes/${noteId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: content
    }),
  });
}