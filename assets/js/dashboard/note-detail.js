async function fetchNoteDetail(noteId) {
  const token = requireToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_BASE}/notes/${noteId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error();

    const note = await res.json();

    selectedNote = note;
    renderNoteDetail(note);

  } catch (err) {
    console.error("Failed to fetch note detail:", err);
  }
}


// -----------------------------
// PARSER (CLEAN + STABLE)
// -----------------------------
function parseNote(content) {
  const lines = content.split("\n");
  let html = "";
  let inList = false;

  for (let raw of lines) {
    let line = raw.trim();

    if (!line) continue;

    // -----------------------------
    // Skip useless lines (1, 2, 3)
    // -----------------------------
    if (/^\d+\s*$/.test(line)) continue;

    // -----------------------------
    // ALL CAPS HEADINGS
    // -----------------------------
    if (/^[A-Z\s]{5,}$/.test(line) && line === line.toUpperCase()) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }

      html += `<h2 class="text-xl font-semibold mt-4">${line}</h2>`;
      continue;
    }

    // -----------------------------
    // H1
    // -----------------------------
    if (line.startsWith("# ")) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }

      html += `<h1 class="text-2xl font-bold mt-4">${line.slice(2)}</h1>`;
      continue;
    }

    // -----------------------------
    // H2
    // -----------------------------
    if (line.startsWith("## ")) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }

      html += `<h2 class="text-xl font-semibold mt-3">${line.slice(3)}</h2>`;
      continue;
    }

    // -----------------------------
    // BULLETS (fixed properly)
    // -----------------------------
    if (/^-\s*/.test(line) || line.startsWith("• ")) {
      if (!inList) {
        html += `<ul style="list-style-type: disc; padding-left: 20px; margin-top: 8px;">`;
        inList = true;
      }

      const clean = line.replace(/^[-•]\s*/, "");
      html += `<li>${clean}</li>`;
      continue;
    }

    // -----------------------------
    // CODE DETECTION (simple but useful)
    // -----------------------------
    if (
      line.includes("def ") ||
      line.includes("class ") ||
      line.includes("import ") ||
      line.includes("@") ||
      line.includes("=")
    ) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }

      html += `<pre class="bg-black text-green-400 p-3 rounded mt-2 overflow-x-auto">${line}</pre>`;
      continue;
    }

    // -----------------------------
    // NORMAL TEXT
    // -----------------------------
    if (inList) {
      html += "</ul>";
      inList = false;
    }

    html += `<p class="mt-2 leading-relaxed">${line}</p>`;
  }

  // Close list if open
  if (inList) html += "</ul>";

  return html;
}


// -----------------------------
// RENDER
// -----------------------------
function renderNoteDetail(note) {

  // 🔥 IMPORTANT: set global state (this fixes your improve bug)
  selectedNote = note;

  document.getElementById("noteTitle").textContent = note.title;

  const tagsContainer = document.getElementById("noteTags");
  tagsContainer.innerHTML = "";

  (note.tags || []).forEach(tag => {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = tag;
    tagsContainer.appendChild(span);
  });

  // CONTENT
  const contentDiv = document.getElementById("noteContent");
  contentDiv.innerHTML = formatNote(note.content);

  // SUMMARY
  const summaryDiv = document.getElementById("noteSummary");
  summaryDiv.innerHTML = formatNote(note.summary || "");

  // SUMMARY TIME (🔥 improved visibility)
  const dateDiv = document.getElementById("summaryUpdated");

  if (note.updated_at) {
    const date = new Date(note.updated_at);

    dateDiv.textContent =
      "Last summary update: " +
      date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit" // 🔥 added so you SEE updates
      });
  } else {
    dateDiv.textContent = "";
  }

  // EDIT BUTTON
  document.getElementById("editNoteBtn").onclick = () => {
    enableEditMode(note);
  };
}

// -----------------------------
// FORMATTER (🔥 IMPROVED)
// -----------------------------
function formatNote(text) {
  if (!text) return "";

  let formatted = text;

  // CODE BLOCK
  formatted = formatted.replace(
    /```([\s\S]*?)```/g,
    `<pre class="bg-black text-green-400 p-3 rounded mt-2 overflow-x-auto">$1</pre>`
  );

  // HEADINGS (=== and --- style)
  formatted = formatted.replace(
    /\*\*(.*?)\*\*\n=+/g,
    `<h1 class="text-xl font-bold mt-4">$1</h1>`
  );

  formatted = formatted.replace(
    /\*\*(.*?)\*\*\n-+/g,
    `<h2 class="text-lg font-semibold mt-3">$1</h2>`
  );

  // BOLD
  formatted = formatted.replace(
    /\*\*(.*?)\*\*/g,
    `<strong>$1</strong>`
  );

  // BULLETS (group properly)
  const lines = formatted.split("\n");
  let inList = false;
  let result = "";

  for (let line of lines) {
    if (line.trim().startsWith("* ")) {
      if (!inList) {
        result += '<ul class="mt-2 ml-5 list-disc">';
        inList = true;
      }
      result += `<li>${line.trim().substring(2)}</li>`;
    } else {
      if (inList) {
        result += "</ul>";
        inList = false;
      }
      result += line + "<br>";
    }
  }

  if (inList) result += "</ul>";

  return result;
}