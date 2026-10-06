async function loadAllNames() {
  if (isLoadingNames || allPokemonNames.length > 0) return;
  isLoadingNames = true;
  try {
    const url = `${BASE_URL}?limit=10000`;
    const pokemonData = await fetchErrorHandling(url);
    allPokemonNames = pokemonData.results.map((listEntry) => listEntry.name);
  } catch (error) {
    console.error(error);
    alert("Failed to load search data. Please try again later.");
  } finally {
    isLoadingNames = false;
  }
}

function setupSearch() {
  const inputRef = document.querySelector('[data-id="search-input"]');
  inputRef.addEventListener("focus", handleSearchFocus);
  inputRef.addEventListener("input", handleSearchInput);
  setupSuggestionClosing();
}

function handleSearchFocus(event) {
  loadAllNames();
  handleSearchInput(event);
}

function handleSearchInput(event) {
  const searchText = event.target.value.trim().toLowerCase();
  updateSuggestions(searchText);
}

function updateSuggestions(searchText) {
  if (searchText.length < 3) {
    hideSuggestions();
    return;
  }
  const matchingNames = filterNames(searchText);
  renderSuggestions(matchingNames);
}

function filterNames(searchText) {
  return allPokemonNames.filter((name) => name.startsWith(searchText));
}

function renderSuggestions(matchingNames) {
  const suggestionListRef = document.getElementById("suggestion-list");
  suggestionListRef.classList.remove("hidden");
  if (matchingNames.length === 0) {
    suggestionListRef.innerHTML = `<li class="no-pokemon" data-id="not-found">No Pokémon found</li>`;
    return;
  }
  suggestionListRef.innerHTML = matchingNames.map(suggestionTemplate).join("");
}

function setupSuggestionClosing() {
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-wrapper")) {
      hideSuggestions();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideSuggestions();
    }
  });
}

function hideSuggestions() {
  document.getElementById("suggestion-list").classList.add("hidden");
}
