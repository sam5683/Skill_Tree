const API_BASE = window.API_BASE;

let selectedNoteId = null;

let filterState = {
  search: "",
  tag: ""
};

function getToken() {
  return localStorage.getItem("access_token");
}

function requireToken() {
  const token = getToken();
  if (!token) {
    window.location.replace("index.html");
    return null;
  }
  return token;
}