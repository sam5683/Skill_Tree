// assets/js/logout.js
(() => {
  const logoutBtn = document.querySelector('[data-action="logout"]');
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    // Clear auth
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");

    // Hard redirect (prevents back navigation)
    window.location.replace("index.html");
  });
})();
