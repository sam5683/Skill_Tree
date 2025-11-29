/* notes.js — Notes and Book System */

const NOTES_KEY = "skilltree_notes_v1";
let notes = JSON.parse(localStorage.getItem(NOTES_KEY) || "{}");

const nodeSelector = document.getElementById("nodeSelector");
const noteEditor = document.getElementById("noteEditor");
const saveNoteBtn = document.getElementById("saveNote");
const clearNoteBtn = document.getElementById("clearNote");
const openBookViewBtn = document.getElementById("openBookView");
const bookContainer = document.getElementById("bookContainer");

let currentNode = "_global";

// Populate selector (will be updated from tree-2d / tree-3d)
export function addSkillToSelector(name) {
  const opt = document.createElement("option");
  opt.value = name;
  opt.textContent = name;
  nodeSelector.appendChild(opt);
}

// Load notes for a node
function loadNote(nodeId) {
  currentNode = nodeId;
  noteEditor.value = notes[nodeId] || "";
}

nodeSelector.addEventListener("change", () => {
  loadNote(nodeSelector.value);
});

// Save note
saveNoteBtn.addEventListener("click", () => {
  notes[currentNode] = noteEditor.value;
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
});

// Clear
clearNoteBtn.addEventListener("click", () => {
  noteEditor.value = "";
});

// Book View
openBookViewBtn.addEventListener("click", () => {
  const text = notes[currentNode] || "";
  const pages = text.match(/.{1,700}/gs) || [""];
  
  bookContainer.innerHTML = `
    <div class="p-4 text-sm leading-6 overflow-auto" style="height:250px;">
      ${pages.map((p, i) => `<h3 class="font-bold mb-1">Page ${i + 1}</h3><p>${p}</p>`).join("<hr>")}
    </div>
  `;

  bookContainer.classList.remove("hidden");
});

// Load default
loadNote("_global");
