async function fetchNotes() {
  const token = requireToken();
  if (!token) return;

  try {
    let url = `${API_BASE}/notes`;

    const params = new URLSearchParams();

    if (filterState.search) params.append("search", filterState.search);
    if (filterState.tag) params.append("tag", filterState.tag);

    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error();

    const notes = await res.json();

    renderNotesList(notes);
    updateFilterUI();

    const stillExists = notes.find(n => n.id === selectedNoteId);

    if (!stillExists) {
      selectedNoteId = null;

      const titleEl = document.getElementById("noteTitle");
      const contentEl = document.getElementById("noteContent");

      if (titleEl && contentEl) {
        titleEl.textContent = "Select a note";
        contentEl.textContent =
          "Click a note from the list to view its content.";
      }
    }

  } catch (err) {
    alert("Something went wrong. Please try again.");
  }
}

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

    const preview =
      note.content?.substring(0, 60) || "No content preview";

    const tagsHTML = (note.tags || [])
      .map(tag => `<span class="tag">${tag}</span>`)
      .join(" ");

    item.className = `note-item ${isSelected ? "active" : ""}`;

    item.innerHTML = `
      <div class="flex justify-between items-center">
        <div class="font-medium text-sm">${note.title}</div>
        <div class="text-xs opacity-50">
          ${new Date(note.created_at).toLocaleDateString()}
        </div>
      </div>

      <div class="text-xs opacity-70 mt-1">
        ${preview}
      </div>

      <div class="mt-1 flex gap-1 flex-wrap">
        ${tagsHTML}
      </div>
    `;

    item.addEventListener("click", () => {
      selectedNoteId = note.id;
      fetchNoteDetail(note.id);
      fetchNotes();

    if (window.innerWidth < 768) {
    document.querySelector('.notes-panel').style.display = 'none';
    document.querySelector('.content-panel').classList.add('active');
    }
    });

    container.appendChild(item);
  });
}