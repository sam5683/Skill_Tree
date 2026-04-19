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
  setupImproveNote();

  // Optional
  if (typeof setupCleanDashboard === "function") {
    setupCleanDashboard();
  }
});