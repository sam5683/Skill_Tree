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
    body: JSON.stringify({ content }),
  });
}

function setupOCR() {
  const ocrBtn = document.getElementById("ocrBtn");
  const fileInput = document.getElementById("ocrInput");
  const textarea = document.getElementById("newNoteContent");

  if (!ocrBtn || !fileInput || !textarea) return;

  ocrBtn.onclick = () => fileInput.click();

  fileInput.addEventListener("change", async () => {
    if (!fileInput.files.length) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Not authenticated");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    ocrBtn.textContent = "Processing...";
    ocrBtn.disabled = true;

    try {
      const res = await fetch(`${API_BASE}/notes/ocr`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      //parse first
      const data = await res.json();

      //error handling
      if (!res.ok) {
        alert(data.detail || "OCR failed");
        return;
      }

      const text = data.extracted_text?.trim();

      if (!text) {
        alert("No readable text found");
        return;
      }

      
      const labeledText = `--- Extracted from Image ---\n${text}`;

      textarea.value =
        textarea.value.trim() === ""
          ? labeledText
          : textarea.value + "\n\n" + labeledText;

    } catch (err) {
      alert("OCR failed. Please try again.");
    } finally {
      ocrBtn.textContent = "Upload Image";
      ocrBtn.disabled = false;
      fileInput.value = "";
    }
  });
}
// -----------------------------
// Enable Edit Mode
// -----------------------------
function enableEditMode(note) {
  toggleActionButtons(false);
  const contentDiv = document.getElementById("noteContent");

  const textarea = document.createElement("textarea");
  textarea.value = note.content;

  textarea.className =
    "w-full p-3 bg-[#0f172a] text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500";

  textarea.style.minHeight = "300px";

  textarea.placeholder = `# Topic
- Key point
- Explanation`;

  contentDiv.innerHTML = "";
  contentDiv.appendChild(textarea);

  // Auto resize
  function autoResize() {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }

  autoResize();
  textarea.addEventListener("input", autoResize);

  // -----------------------------
  // Helper Buttons
  // -----------------------------
  const helperBar = document.createElement("div");
  helperBar.className = "flex gap-2 mt-2";

  const hBtn = document.createElement("button");
  hBtn.textContent = "#";
  hBtn.className = "text-xs opacity-70";

  const bulletBtn = document.createElement("button");
  bulletBtn.textContent = "-";
  bulletBtn.className = "text-xs opacity-70";

  helperBar.appendChild(hBtn);
  helperBar.appendChild(bulletBtn);
  contentDiv.appendChild(helperBar);

  function insertText(text) {
    const start = textarea.selectionStart;
    textarea.value =
      textarea.value.slice(0, start) + text + textarea.value.slice(start);

    textarea.focus();
    autoResize();
  }

  hBtn.onclick = () => insertText("\n# ");
  bulletBtn.onclick = () => insertText("\n- ");

  // -----------------------------
  // Buttons row
  // -----------------------------
  const buttonRow = document.createElement("div");
  buttonRow.className = "flex gap-3 mt-3";

  const saveBtn = document.createElement("button");
  saveBtn.className = "btn-primary";
  saveBtn.textContent = "Save";

  const cancelBtn = document.createElement("button");
  cancelBtn.className = "opacity-60 text-xs";
  cancelBtn.textContent = "Cancel";

  // OCR Button
  const ocrBtn = document.createElement("button");
  ocrBtn.textContent = "Image → Text";
  ocrBtn.className = "btn-primary text-xs";

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.hidden = true;

  ocrBtn.onclick = () => fileInput.click();

  fileInput.addEventListener("change", async () => {
    if (!fileInput.files.length) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    ocrBtn.textContent = "Processing...";
    ocrBtn.disabled = true;

    try {
      const res = await fetch(`${API_BASE}/notes/ocr`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok){alert(data.detail || "OCR failed"); return;}

      const data = await res.json();
      const text = data.extracted_text?.trim();

      if (!text) {
        alert("No readable text found");
        return;
      }

      textarea.value += "\n\n" + text;
      autoResize();

    } catch (err) {
      alert("OCR failed");
    } finally {
      ocrBtn.textContent = "Image → OCR";
      ocrBtn.disabled = false;
      fileInput.value = "";
    }
  });

  buttonRow.appendChild(ocrBtn);
  buttonRow.appendChild(saveBtn);
  buttonRow.appendChild(cancelBtn);

  contentDiv.appendChild(buttonRow);
  contentDiv.appendChild(fileInput);

  // Save
  saveBtn.onclick = async () => {
    await updateNoteContent(note.id, textarea.value);
    fetchNoteDetail(note.id);
    fetchNotes();
    toggleActionButtons(true);
  };

  // Cancel
  cancelBtn.onclick = () => {
    fetchNoteDetail(note.id);
    toggleActionButtons(true);
  };
}