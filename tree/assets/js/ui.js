/* ui.js — Global UI behaviours */

// PROFILE MENU TOGGLE
const profileBtn = document.getElementById("profileBtn");
const profileMenu = document.getElementById("profileMenu");

profileBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  profileMenu.classList.toggle("hidden");
});

document.addEventListener("click", () => {
  if (!profileMenu.classList.contains("hidden")) {
    profileMenu.classList.add("hidden");
  }
});

// MODAL HELPERS
function openModal(modal) {
  modal.classList.remove("hidden");
}

function closeModal(modal) {
  modal.classList.add("hidden");
}

// CHARACTER PANEL
const openCharBtn = document.getElementById("openCharBtn");
const charModal = document.getElementById("charModal");

openCharBtn.addEventListener("click", () => openModal(charModal));
charModal.addEventListener("click", (e) => {
  if (e.target === charModal) closeModal(charModal);
});

// SKILL EDITOR (placeholder hooks)
const skillEditor = document.getElementById("skillEditor");

export function openSkillEditor(skillName = "", description = "") {
  skillEditor.innerHTML = `
    <div class="modal-content">
      <h2 class="text-xl font-semibold mb-2">Skill Editor</h2>
      <label class="opacity-70 text-sm">Skill Name</label>
      <input id="skillName" class="input w-full mt-1" value="${skillName}">
      
      <label class="opacity-70 text-sm mt-3">Description</label>
      <textarea id="skillDesc" class="notes-box">${description}</textarea>

      <div class="flex gap-3 mt-4">
        <button id="saveSkill" class="btn-primary">Save</button>
        <button id="deleteSkill" class="btn-secondary">Delete</button>
      </div>
    </div>
  `;

  openModal(skillEditor);

  document.getElementById("saveSkill").onclick = () => {
    console.log("Skill saved.");
    closeModal(skillEditor);
  };

  document.getElementById("deleteSkill").onclick = () => {
    console.log("Skill deleted.");
    closeModal(skillEditor);
  };
}

skillEditor.addEventListener("click", (e) => {
  if (e.target === skillEditor) closeModal(skillEditor);
});

// AI CHAT TOGGLE
const aiChat = document.getElementById("aiChat");
const minimizeAi = document.getElementById("minimizeAi");

export function openAI() {
  aiChat.classList.remove("hidden");
}

minimizeAi.addEventListener("click", () => {
  aiChat.classList.add("hidden");
});

// EVENT: Open AI when tree is clicked (optional hook)
const treeCanvasContainer = document.getElementById("treeCanvasContainer");
treeCanvasContainer.addEventListener("click", () => openAI());

/* -------------------------------------------
   LOGIN LOGIC
-------------------------------------------- */
// Open login modal when clicking profile icon
document.getElementById("profileBtn").addEventListener("click", () => {
  document.getElementById("loginModal").classList.remove("hidden");
});
// Close login modal
document.getElementById("closeLogin").addEventListener("click", () => {
  document.getElementById("loginModal").classList.add("hidden");
});
// Handle login
document.getElementById("loginSubmit").addEventListener("click", async () => {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  if (!email || !password) {
    alert("Both email and password are required.");
    return;
  }
  try {
    const res = await fetch("http://localhost:8080/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      alert("Login successful!");
      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(data.data));
      // Update UI
      document.querySelector(".profile-button").innerText =
        data.data.fullName.charAt(0).toUpperCase();
      document.querySelector(".char-name").innerText =
        data.data.fullName;
      // Close modal
      document.getElementById("loginModal").classList.add("hidden");
    } else {
      alert(data.message || "Login failed.");
    }
  } catch (e) {
    console.error("Login error:", e);
    alert("Something went wrong. Check backend.");
  }
});