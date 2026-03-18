// assets/js/dashboard-notes.js

const API_BASE = "http://127.0.0.1:8000/api/v1";

let selectedNoteId = null;

/* -------------------- TOKEN UTILS -------------------- */
function getToken() {
  return localStorage.getItem("access_token");
}

function requireToken() {
  const token = getToken();
  if (!token) {
    console.warn("❌ No access token found. Redirecting to login.");
    window.location.replace("index.html");
    return null;
  }
  return token;
}

/* -------------------- FETCH NOTES LIST -------------------- */
async function fetchNotes() {
  const token = requireToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/notes`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const notes = await res.json();
    renderNotesList(notes);
  } catch (err) {
    console.error("❌ Failed to fetch notes:", err);
  }
}

/* -------------------- RENDER NOTES LIST -------------------- */
function renderNotesList(notes) {
  const container = document.getElementById("notesList");
  if (!container) return;

  container.innerHTML = "";

  if (!notes || notes.length === 0) {
    container.innerHTML = `<div class="text-sm opacity-60">No notes yet</div>`;
    return;
  }

  notes.forEach((note) => {
    const item = document.createElement("div");

    const isSelected = note.id === selectedNoteId;

    item.className = `
      p-2 rounded cursor-pointer
      ${isSelected ? "bg-white/30" : "bg-white/10 hover:bg-white/20"}
    `;

    item.innerHTML = `
      <div class="font-medium text-sm">${note.title}</div>
      <div class="text-xs opacity-60">
        ${new Date(note.created_at).toLocaleDateString()}
      </div>
    `;

    item.addEventListener("click", () => {
      selectedNoteId = note.id;
      fetchNoteDetail(note.id);
      renderNotesList(notes);
    });

    container.appendChild(item);
  });
}


/* -------------------- FETCH NOTE DETAIL -------------------- */
async function fetchNoteDetail(noteId) {
  const token = requireToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/notes/${noteId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const note = await res.json();
    renderNoteDetail(note);
  } catch (err) {
    console.error("❌ Failed to fetch note detail:", err);
  }
}
/* -------------------- RENDER NOTE DETAIL -------------------- */
function renderNoteDetail(note) {
  const titleEl = document.getElementById("noteTitle");
  const contentEl = document.getElementById("noteContent");

  if (!titleEl || !contentEl) return;

  titleEl.textContent = note.title;

  const updatedAtText = note.updated_at
    ? new Date(note.updated_at).toLocaleString()
    : "Never";

  // ✅ FIXED: tags now have data-tag
  const tagsHTML =
    note.tags && note.tags.length
      ? `
      <div class="mb-4">
        <div class="text-xs opacity-60 mb-1">Tags</div>
        <div class="flex flex-wrap gap-2">
          ${note.tags
            .map(
              (tag) =>
                `<span 
                  class="text-xs px-2 py-1 bg-white/10 rounded cursor-pointer hover:bg-white/20"
                  data-tag="${tag}"
                >${tag}</span>`
            )
            .join("")}
        </div>
      </div>
    `
      : "";

  contentEl.innerHTML = `
    ${tagsHTML}

    <div class="mb-4">
      <div class="text-xs opacity-60 mb-1">Summary</div>

      <div class="text-sm bg-white/5 p-2 rounded">
        ${note.summary ?? "No summary yet"}
      </div>

      <div class="text-[10px] opacity-50 mt-1">
        Last summary update: ${updatedAtText}
      </div>
    </div>

    <div>
      <div class="text-xs opacity-60 mb-1">Content</div>
      <div class="text-sm leading-relaxed">
        ${note.content}
      </div>
    </div>
  `;

  // ✅ IMPORTANT: attach AFTER render
  document.querySelectorAll("[data-tag]").forEach((el) => {
    el.addEventListener("click", async () => {
      const tag = el.getAttribute("data-tag");

      const token = requireToken();
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/notes?tag=${tag}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error();

        const notes = await res.json();
        renderNotesList(notes);
      } catch (err) {
        console.error("Tag filter failed", err);
      }
    });
  });
}
/* -------------------- EDIT NOTE -------------------- */
function setupEditNote() {
  const editBtn = document.getElementById("editNoteBtn");
  const editor = document.getElementById("noteEditor");
  const contentView = document.getElementById("noteContent");
  const actions = document.getElementById("noteEditorActions");

  const saveBtn = document.getElementById("saveEditBtn");
  const cancelBtn = document.getElementById("cancelEditBtn");

  if (!editBtn) return;

  editBtn.onclick = () => {
    editor.value = contentView.textContent;
    editor.classList.remove("hidden");
    actions.classList.remove("hidden");
    contentView.classList.add("hidden");
  };

  cancelBtn.onclick = () => {
    editor.classList.add("hidden");
    actions.classList.add("hidden");
    contentView.classList.remove("hidden");
  };

  saveBtn.onclick = async () => {
    if (!selectedNoteId) return;

    const token = requireToken();
    if (!token) return;

    const title = document.getElementById("noteTitle").textContent;
    const content = editor.value.trim();

    const res = await fetch(`${API_BASE}/notes/${selectedNoteId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content }),
    });

    if (!res.ok) {
      alert("Update failed");
      return;
    }

    editor.classList.add("hidden");
    actions.classList.add("hidden");
    contentView.classList.remove("hidden");

    fetchNoteDetail(selectedNoteId);
    fetchNotes();
  };
}

/* -------------------- DELETE NOTE -------------------- */
function setupDeleteNote() {
  const deleteBtn = document.getElementById("deleteNoteBtn");

  deleteBtn.onclick = async () => {
    if (!selectedNoteId) return;

    if (!confirm("Delete this note permanently?")) return;

    const token = requireToken();
    if (!token) return;

    const res = await fetch(`${API_BASE}/notes/${selectedNoteId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
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

/* -------------------- REGENERATE SUMMARY -------------------- */
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

    try {
      const res = await fetch(
        `${API_BASE}/notes/${selectedNoteId}/regenerate-summary`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error();

      const note = await res.json();
      renderNoteDetail(note);
    } catch (err) {
      console.error("Summary regeneration failed", err);
    }
  };
}


/*---------------------Search notes---------------------*/
function setupSearch() {
  const input = document.querySelector(".search-input");

  if (!input) return;

  input.addEventListener("input", async () => {
    const query = input.value.trim();

    const token = requireToken();
    if (!token) return;

    try {
      let url = `${API_BASE}/notes`;

      if (query) {
        url += `?search=${encodeURIComponent(query)}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error();

      const notes = await res.json();
      renderNotesList(notes);
    } catch (err) {
      console.error("Search failed", err);
    }
  });
}
/* -------------------- CREATE NOTE -------------------- */
function setupCreateNote() {
  const openBtn = document.querySelector(".btn-primary");
  const modal = document.getElementById("createNoteModal");

  const saveBtn = document.getElementById("saveCreateNote");
  const cancelBtn = document.getElementById("cancelCreateNote");

  const titleInput = document.getElementById("newNoteTitle");
  const contentInput = document.getElementById("newNoteContent");
  const tagsInput = document.getElementById("newNoteTags");   // FIXED

  if (!openBtn || !modal) return;

  openBtn.addEventListener("click", () => {
    titleInput.value = "";
    contentInput.value = "";
    tagsInput.value = "";

    modal.classList.remove("hidden");
    modal.classList.add("flex");
  });

  cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  });

  saveBtn.addEventListener("click", async () => {
    const token = requireToken();
    if (!token) return;

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const tagsRaw = tagsInput.value.trim();

    const tags = tagsRaw
      ? tagsRaw.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
      : [];

    if (!title || !content) {
      alert("Title and content required");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/notes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content, tags }),
      });

      if (!res.ok) throw new Error("Create failed");

      const note = await res.json();

      modal.classList.add("hidden");
      modal.classList.remove("flex");

      selectedNoteId = note.id;

      await fetchNotes();
      fetchNoteDetail(note.id);
    } catch (err) {
      console.error("❌ Create note failed", err);
    }
  });
}

/* -------------------- INIT -------------------- */
document.addEventListener("DOMContentLoaded", () => {
  requireToken();
  fetchNotes();
  setupCreateNote();
  setupEditNote();
  setupSearch();
  setupDeleteNote();
  setupRegenerateSummary();
});