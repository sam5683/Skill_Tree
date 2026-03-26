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

  // Optional
  if (typeof setupCleanDashboard === "function") {
    setupCleanDashboard();
  }
});