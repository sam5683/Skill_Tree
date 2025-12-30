// assets/js/dashboard-notes.js

const API_BASE = "http://127.0.0.1:8000/api/v1";

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
  if (!container) {
    console.error("❌ notesList container not found");
    return;
  }

  container.innerHTML = "";

  if (!notes || notes.length === 0) {
    container.innerHTML =
      `<div class="text-sm opacity-60">No notes yet</div>`;
    return;
  }

  notes.forEach((note) => {
    const item = document.createElement("div");
    item.className =
      "p-2 rounded bg-white/10 hover:bg-white/20 cursor-pointer";

    item.innerHTML = `
      <div class="font-medium text-sm">${note.title}</div>
      <div class="text-xs opacity-60">
        ${new Date(note.created_at).toLocaleDateString()}
      </div>
    `;

    item.addEventListener("click", () => {
      fetchNoteDetail(note.id);
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

  if (!titleEl || !contentEl) {
    console.error("❌ Note detail DOM missing");
    return;
  }

  titleEl.textContent = note.title;
  contentEl.textContent = note.content;
}

/* -------------------- CREATE NOTE -------------------- */
function setupCreateNote() {
  const openBtn = document.querySelector(".btn-primary");
  const modal = document.getElementById("createNoteModal");
  const saveBtn = document.getElementById("saveCreateNote");
  const cancelBtn = document.getElementById("cancelCreateNote");

  const titleInput = document.getElementById("newNoteTitle");
  const contentInput = document.getElementById("newNoteContent");

  if (!openBtn || !modal) return;

  openBtn.addEventListener("click", () => {
    titleInput.value = "";
    contentInput.value = "";
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
        body: JSON.stringify({ title, content }),
      });

      if (!res.ok) throw new Error("Create failed");

      const note = await res.json();

      modal.classList.add("hidden");
      modal.classList.remove("flex");

      await fetchNotes();
      fetchNoteDetail(note.id);
    } catch (err) {
      console.error("❌ Create note failed", err);
    }
  });
}

/* -------------------- INIT (THIS WAS YOUR BUG) -------------------- */
document.addEventListener("DOMContentLoaded", () => {
  requireToken();        // enforce auth FIRST
  fetchNotes();          // then load data
  setupCreateNote();     // wire UI
});
