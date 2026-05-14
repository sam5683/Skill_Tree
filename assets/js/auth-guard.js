(async () => {

  try {

    const res = await fetch(`${API_BASE}/users/me`, {
      credentials: "include",
    });

    if (!res.ok) {
      window.location.replace("index.html");
      return;
    }

  } catch (err) {
    window.location.replace("index.html");
  }

})();