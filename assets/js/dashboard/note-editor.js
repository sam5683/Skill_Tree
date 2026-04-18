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

  // 🔥 Improved UX styles
  textarea.className =
    "w-full p-3 bg-[#0f172a] text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500";
  
  textarea.style.minHeight = "300px";
  textarea.style.lineHeight = "1.6";

  // 🔥 Placeholder (guides structure)
  textarea.placeholder = `Write structured notes like:

# Topic Name

## Key Points
- Point 1
- Point 2

## Explanation
Explain in simple terms...

Tip:
Use # for headings
Use - for bullet points`;

  contentDiv.innerHTML = "";
  contentDiv.appendChild(textarea);


  // -----------------------------
  // Auto resize
  // -----------------------------
  function autoResize() {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }

  autoResize();

  textarea.addEventListener("input", autoResize);


  // -----------------------------
  // Helper Buttons (minimal)
  // -----------------------------
  const helperBar = document.createElement("div");
  helperBar.className = "flex gap-2 mt-2";

  const hBtn = document.createElement("button");
  hBtn.textContent = "# Heading";
  hBtn.className = "text-xs opacity-70";

  const bulletBtn = document.createElement("button");
  bulletBtn.textContent = "- Bullet";
  bulletBtn.className = "text-xs opacity-70";

  helperBar.appendChild(hBtn);
  helperBar.appendChild(bulletBtn);

  contentDiv.appendChild(helperBar);

  // Insert text helpers
  function insertText(text) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);

    textarea.value = before + text + after;

    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + text.length;

    autoResize();
  }

  hBtn.onclick = () => insertText("\n# ");
  bulletBtn.onclick = () => insertText("\n- ");


  // -----------------------------
  // Buttons
  // -----------------------------
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


  // -----------------------------
  // Save
  // -----------------------------
  saveBtn.onclick = async () => {
    await updateNoteContent(note.id, textarea.value);
    fetchNoteDetail(note.id);
    fetchNotes();
  };

  // -----------------------------
  // Cancel
  // -----------------------------
  cancelBtn.onclick = () => {
    fetchNoteDetail(note.id);
  };
}


// -----------------------------
// Update Note Content
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