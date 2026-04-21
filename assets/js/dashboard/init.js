document.addEventListener("DOMContentLoaded", () => {
  requireToken();

  // Load notes
  fetchNotes();

  // Setup UI actions
  setupCreateNote();
  setupEditNote();
  setupDeleteNote();
  setupRegenerateSummary();
  setupFlashcards();
  setupSearch();
  setupOCR();
  setupReadMode()
  setupImproveNote();

  // Optional
  if (typeof setupCleanDashboard === "function") {
    setupCleanDashboard();
  }
});