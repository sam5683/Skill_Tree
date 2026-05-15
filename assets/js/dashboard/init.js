document.addEventListener("DOMContentLoaded", async () => {

  // =============================
  // AUTH CHECK
  // =============================
  async function loadCurrentUser() {

    try {

      const res = await fetch(
        `${API_BASE}/users/me`,
        {
          credentials: "include"
        }
      );

      if (!res.ok) {

        console.error("AUTH FAILED:", res.status);

        window.location.href = "index.html";
        return false;
      }

      const user = await res.json();

      console.log("CURRENT USER:", user);

      // TEMP DEBUG UI
      const userInfo = document.getElementById("userInfo");

      if (userInfo) {
        userInfo.textContent = user.email;
      }

      return true;

    } catch (err) {

      console.error("AUTH ERROR:", err);

      window.location.href = "index.html";

      return false;
    }
  }

  // =============================
  // VALIDATE USER FIRST
  // =============================
  const isAuthenticated = await loadCurrentUser();

  if (!isAuthenticated) return;

  // =============================
  // DATA LOAD
  // =============================
  fetchNotes();

  // =============================
  // CORE FEATURES
  // =============================
  setupCreateNote();
  setupEditNote();
  setupDeleteNote();
  setupRegenerateSummary();
  setupFlashcards();
  setupSearch();
  setupOCR();
  setupReadMode();
  setupImproveNote();

  // =============================
  // NAVIGATION FIX (LOGO CLICK)
  // =============================
  const logo = document.getElementById("logoBtn");

  if (logo) {
    logo.addEventListener("click", () => {
      document.querySelector('.notes-panel')?.classList.remove('hidden-mobile');
      document.querySelector('.content-panel')?.classList.remove('active');
    });
  }

  // =============================
  // OPTIONAL CLEAN UI
  // =============================
  if (typeof setupCleanDashboard === "function") {
    setupCleanDashboard();
  }

});