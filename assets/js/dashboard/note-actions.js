function setupDeleteNote() {
  const deleteBtn = document.getElementById("deleteNoteBtn");
  if (!deleteBtn) return;

  deleteBtn.onclick = async () => {
    if (!selectedNoteId) {
      alert("Select a note first");
      return;
    }

    if (!confirm("Delete this note permanently?")) return;

    const token = requireToken();
    if (!token) return;

    const res = await fetch(`${API_BASE}/notes/${selectedNoteId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      alert("Delete failed");
      return;
    }

    selectedNoteId = null;

    document.getElementById("noteTitle").textContent = "Select a note";
    document.getElementById("noteContent").textContent =
      "Click a note from the list to view its content.";

    fetchNotes();
  };
}

function setupCreateNote() {
  const openBtn = document.getElementById("addNoteBtn");
  const modal = document.getElementById("createNoteModal");

  const saveBtn = document.getElementById("saveCreateNote");
  const cancelBtn = document.getElementById("cancelCreateNote");

  const titleInput = document.getElementById("newNoteTitle");
  const contentInput = document.getElementById("newNoteContent");
  const tagsInput = document.getElementById("newNoteTags");

  if (!openBtn || !modal) return;

  openBtn.onclick = () => {
    titleInput.value = "";
    contentInput.value = "";
    tagsInput.value = "";

    modal.classList.remove("hidden");
    modal.classList.add("flex");
  };

  cancelBtn.onclick = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  };

  saveBtn.onclick = async () => {
    const token = requireToken();
    if (!token) return;

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const tagsRaw = tagsInput.value.trim();

    const tags = tagsRaw
      ? tagsRaw.split(",").map(t => t.trim()).filter(t => t.length > 0)
      : [];

    if (!title || !content) {
      alert("Title and content required");
      return;
    }

    const res = await fetch(`${API_BASE}/notes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content, tags }),
    });

    const note = await res.json();

    modal.classList.add("hidden");
    modal.classList.remove("flex");

    selectedNoteId = note.id;

    await fetchNotes();
    fetchNoteDetail(note.id);
  };
}

function setupRegenerateSummary() {
  const btn = document.getElementById("regenSummaryBtn");
  if (!btn) return;

  btn.onclick = async () => {
    if (!selectedNoteId) {
      alert("Select a note first");
      return;
    }

    const token = requireToken();
    if (!token) return;

    const res = await fetch(
      `${API_BASE}/notes/${selectedNoteId}/regenerate-summary`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      alert("Summary failed");
      return;
    }

    const note = await res.json();
    renderNoteDetail(note);
  };
}

function setupCleanDashboard() {
  const btn = document.getElementById("cleanBtn");
  if (!btn) return;

  btn.onclick = () => {
    filterState.search = "";
    filterState.tag = "";
    selectedNoteId = null;

    const input = document.getElementById("searchInput");
    if (input) input.value = "";

    document.getElementById("noteTitle").textContent = "Select a note";
    document.getElementById("noteContent").textContent =
      "Click a note from the list to view its content.";

    fetchNotes();
  };
}

function setupFlashcards() {
  const btn = document.getElementById("generateFlashcardsBtn");
  if (!btn) return;

  btn.onclick = async () => {
    if (!selectedNoteId) {
      alert("Select a note first");
      return;
    }

    const token = requireToken();
    if (!token) return;

    const res = await fetch(
      `${API_BASE}/flashcards/from-note/${selectedNoteId}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      alert("Flashcards failed");
      return;
    }

    if (confirm("Flashcards generated. Go to Review now?")) {
      window.location.href = "review.html";
    }
  };
}