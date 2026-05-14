(() => {

  const logoutBtn = document.getElementById("logoutBtn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async () => {

    try {

      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

    } catch (err) {
      console.error("Logout failed", err);
    }

    window.location.href = "index.html";

  });

})();