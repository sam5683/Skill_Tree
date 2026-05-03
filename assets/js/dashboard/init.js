document.addEventListener("DOMContentLoaded", () => {
  requireToken();

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