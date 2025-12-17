(() => {
  const logoutBtn = document.querySelector('[data-action="logout"]');
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    // 1. Remove token
    localStorage.removeItem("access_token");

    // 2. Redirect to login page
    window.location.replace("index.html");
  });
})();
