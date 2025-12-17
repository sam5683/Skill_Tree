(() => {
  const token = localStorage.getItem("access_token");

  if (!token || token.trim() === "") {
    // Kill access immediately
    window.location.replace("index.html");
  }
})();
