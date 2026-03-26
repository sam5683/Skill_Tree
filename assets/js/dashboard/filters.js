function updateFilterUI() {
  const bar = document.getElementById("activeFilterBar");
  const text = document.getElementById("activeFilterText");

  if (!bar || !text) return;

  if (filterState.tag) {
    bar.classList.remove("hidden");
    text.textContent = `Tag: ${filterState.tag}`;
  } else if (filterState.search) {
    bar.classList.remove("hidden");
    text.textContent = `Search: ${filterState.search}`;
  } else {
    bar.classList.add("hidden");
    text.textContent = "";
  }
}

function setupSearch() {
  const input = document.querySelector(".search-input");
  if (!input) return;

  let debounceTimer;

  input.addEventListener("input", () => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      const value = input.value.trim().toLowerCase();

      filterState.search = "";
      filterState.tag = "";

      if (value.length === 0) {
      } else if (!value.includes(" ")) {
        filterState.tag = value;
      } else {
        filterState.search = value;
      }

      fetchNotes();
    }, 300);
  });
}