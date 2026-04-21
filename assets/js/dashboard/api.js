const API_BASE = window.API_BASE || "http://127.0.0.1:8000/api/v1";

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