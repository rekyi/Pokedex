const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const PLACEHOLDER_SPRITE_IMG = "assets/images/placeholder_sprite_img.webp";
const TYPE_TO_TCG_ELEMENT = {
  normal: "colorless",
  fire: "fire",
  water: "water",
  electric: "electric",
  grass: "grass",
  ice: "water",
  fighting: "fighting",
  poison: "psychic",
  ground: "fighting",
  flying: "colorless",
  psychic: "psychic",
  bug: "grass",
  rock: "fighting",
  ghost: "psychic",
  dragon: "dragon",
  dark: "darkness",
  steel: "metal",
  fairy: "fairy",
};
let currentOffset = 0;
let isLoading = false;
let allPokemonNames = [];
let isLoadingNames = false;
let currentDialogIndex = 0;
let isLoadingDialog = false;

function init() {
  infiniteScroll();
  setupSearch();
  setupPokemonClicks();
  backdropListener();
}
init();

async function getSinglePokemonDetails(listEntry) {
  const details = await fetchErrorHandling(listEntry.url);
  const speciesData = await fetchErrorHandling(details.species.url);
  const spriteSrc = getSpriteSrc(details.sprites);
  return {
    spriteSrc,
    isPlaceholder: spriteSrc === PLACEHOLDER_SPRITE_IMG,
    ...getNameParts(details),
    ...getCardBasics(details),
    species: speciesData.genera.find((translation) => translation.language.name === "en").genus,
    ...getCardExtras(details),
  };
}

function getSpriteSrc(sprites) {
  return sprites.other?.["official-artwork"]?.front_default || sprites.other?.home?.front_default || sprites.front_default || PLACEHOLDER_SPRITE_IMG;
}

function getNameParts(details) {
  const species = details.species.name;
  return {
    name: details.name,
    displayName: species.replaceAll("-", " "),
    formName: details.name.replace(species, "").replaceAll("-", " ").trim(),
  };
}

function getCardBasics(details) {
  const type = details.types[0].type.name;
  return {
    id: details.id,
    type,
    cardElement: TYPE_TO_TCG_ELEMENT[type],
    hp: details.stats[0].base_stat,
  };
}

function getCardExtras(details) {
  return {
    size: `${details.height / 10} m · ${details.weight / 10} kg`,
    stats: [
      { label: "ATK", value: details.stats[1].base_stat },
      { label: "DEF", value: details.stats[2].base_stat },
      { label: "SP. ATK", value: details.stats[3].base_stat },
      { label: "SP. DEF", value: details.stats[4].base_stat },
      { label: "SPD", value: details.stats[5].base_stat },
    ],
  };
}

async function getPokemonData() {
  if (isLoading) return;
  isLoading = true;

  const loadingDiv = document.getElementById("loading");
  if (currentOffset === 0) {
    toggleLoadingSpinner(true);
    loadingDiv.style.visibility = "hidden";
  } else {
    loadingDiv.style.visibility = "visible";
  }
  try {
    await delay(2000);
    await loadNextBatch();
  } catch (error) {
    console.error(error);
    alert("Failed to load Pokémon. Please try again later.");
  } finally {
    toggleLoadingSpinner(false);
    isLoading = false;
  }
}

async function loadNextBatch() {
  const url = `${BASE_URL}?limit=40&offset=${currentOffset}`;
  const pokemonList = await fetchPokemonList(url);
  renderPokemonGrid(pokemonList);
  currentOffset += 40;
}

async function fetchPokemonList(url) {
  const pokemonData = await fetchErrorHandling(url);
  const mapped = pokemonData.results.map(getSinglePokemonDetails);
  const pokemonList = await Promise.all(mapped);
  return pokemonList;
}

async function fetchErrorHandling(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Response status: ${response.status} (${url})`);
  }
  return await response.json();
}

function handleImgError(img) {
  img.onerror = null;
  img.src = PLACEHOLDER_SPRITE_IMG;
  img.classList.add("is-placeholder");
}

function toggleLoadingSpinner(isLoading) {
  const spinner = document.querySelector(".loader-card");
  isLoading ? spinner.classList.remove("hidden") : spinner.classList.add("hidden");
}

function renderPokemonGrid(pokemonList) {
  const contentRef = document.getElementById("card-content");
  let htmlContent = "";
  for (let i = 0; i < pokemonList.length; i++) {
    htmlContent += pokemonGridTemplate(pokemonList[i]);
  }
  contentRef.insertAdjacentHTML("beforeend", htmlContent);
}

function infiniteScroll() {
  const loadingDiv = document.getElementById("loading");
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        getPokemonData();
      }
    },
    { threshold: 0.5 },
  );
  observer.observe(loadingDiv);
}

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
  }
}

function setupSearch() {
  const inputRef = document.querySelector('[data-id="search-input"]');
  inputRef.addEventListener("focus", handleSearchFocus);
  inputRef.addEventListener("input", handleSearchInput);
  setupSuggestionClosing();
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

function handlePokemonClick(event) {
  const target = event.target.closest("button");

  if (target && target.hasAttribute("data-name")) {
    const selectedName = target.dataset.name;
    openPokemonDialog(selectedName);
    hideSuggestions();
  }
}

function setupPokemonClicks() {
  const suggestionListRef = document.getElementById("suggestion-list");
  const cardRef = document.getElementById("card-content");
  suggestionListRef.addEventListener("click", handlePokemonClick);
  cardRef.addEventListener("click", handlePokemonClick);
}

function handleSearchFocus(event) {
  loadAllNames();
  handleSearchInput(event);
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

async function fetchDialogData(pokemonName) {
  const details = await fetchErrorHandling(`${BASE_URL}/${pokemonName}`);
  const speciesData = await fetchErrorHandling(details.species.url);
  const moves = await fetchMoves(details);
  return { details, speciesData, moves };
}

async function openPokemonDialog(pokemonName) {
  if (isLoadingDialog) return;
  isLoadingDialog = true;
  try {
    const dialogData = await fetchDialogData(pokemonName);
    const pokemon = prepareDialogData(dialogData);
    renderDialogContent(pokemon);
    document.querySelector('[data-id="dialog"]').showModal();
  } catch (error) {
    console.error(error);
    alert("Failed to load Pokémon details. Please try again later.");
  } finally {
    isLoadingDialog = false;
  }
}

function getDialogSpriteSrc(sprites) {
  return sprites.other?.home?.front_default || sprites.other?.["official-artwork"]?.front_default || sprites.front_default || PLACEHOLDER_SPRITE_IMG;
}

function getDialogBasics(details) {
  return {
    ...getNameParts(details),
    spriteSrc: getDialogSpriteSrc(details.sprites),
    id: details.id,
  };
}

function getDialogTypes(details) {
  return {
    types: details.types.map((typeEntry) => ({
      name: typeEntry.type.name,
      element: TYPE_TO_TCG_ELEMENT[typeEntry.type.name],
    })),
  };
}

function prepareDialogData(dialogData) {
  return {
    ...getDialogBasics(dialogData.details),
    ...getDialogTypes(dialogData.details),
    ...getDialogStage(dialogData.speciesData),
    ...getDialogMoves(dialogData.moves),
  };
}

function renderDialogContent(pokemon) {
  const dialogRef = document.querySelector('[data-id="dialog-content"]');
  dialogRef.innerHTML = pokemonDialogTemplate(pokemon);
}

function getStageText(speciesData) {
  if (speciesData.is_mythical) return "Mythical Pokémon";
  if (speciesData.is_legendary) return "Legendary Pokémon";
  if (speciesData.is_baby) return "Baby Pokémon";
  if (speciesData.evolves_from_species !== null) {
    const speciesName = speciesData.evolves_from_species.name.charAt(0).toUpperCase() + speciesData.evolves_from_species.name.slice(1);
    return `Evolves from ${speciesName.replaceAll("-", " ")}`;
  }
  return "Basic Pokémon";
}
function getDialogStage(speciesData) {
  return {
    stage: getStageText(speciesData),
  };
}

async function fetchMoves(details) {
  const firstMoves = details.moves.slice(0, 10);
  const mapped = firstMoves.map((moveEntry) => fetchErrorHandling(moveEntry.move.url));
  const moveList = await Promise.all(mapped);
  const moveListFiltered = moveList.filter((move) => move.power !== null);

  if (moveListFiltered.length === 0) {
    return moveList.slice(0, 2);
  }

  return moveListFiltered.slice(0, 2);
}

function getDialogMoves(moves) {
  return {
    attacks: moves.map((moveEntry) => ({
      name: moveEntry.name.replaceAll("-", " "),
      element: TYPE_TO_TCG_ELEMENT[moveEntry.type.name],
      power: moveEntry.power,
    })),
  };
}

function backdropListener() {
  const dialogRef = document.querySelector('[data-id="dialog"]');
  dialogRef.addEventListener("click", (event) => {
    if (event.target === event.currentTarget) {
      event.currentTarget.close();
    }
  });
}

// SCHRITT 2 (openPokemonDialog): Doppeltes Laden verhindern
// - Am Anfang abbrechen, wenn isLoadingDialog wahr ist, danach auf true setzen (wie in getPokemonData).
// - Im finally wieder auf false setzen.
// Commit: "Guard openPokemonDialog against double loading"

// SCHRITT 3 (openPokemonDialog): Namen sicherstellen und Position merken
// - Am Anfang await loadAllNames() aufrufen. Wer den Dialog über eine Karte öffnet, hat die Suche
//   vielleicht noch nie benutzt, dann ist allPokemonNames noch leer.
// - Nach dem erfolgreichen Rendern currentDialogIndex mit indexOf auf den geöffneten Namen setzen.
//   Das Merken passiert erst nach dem Erfolg, damit ein fehlgeschlagener Request die Position nicht verschiebt.
// Commit: "Remember current position in allPokemonNames"

// SCHRITT 4 (neue Funktion getNeighborName(step)): Nachbarn berechnen
// - Neuen Index aus currentDialogIndex und step berechnen.
// - Wie im Fotogram: Ist er gleich der Länge der Liste, geht es auf 0, ist er kleiner als 0,
//   geht es auf length - 1. Eine Alternative mit Modulo (Suchbegriff: javascript modulo wrap around index)
//   ist kürzer, die Variante aus Fotogram ist aber gut lesbar.
// - Den Namen an dieser Stelle in allPokemonNames zurückgeben, den Index selbst hier nicht speichern.
// Commit: "Add getNeighborName with wrap-around"

// SCHRITT 5 (neue Funktion changeDialog(step)): Wechseln
// - Mit getNeighborName den Namen holen und openPokemonDialog damit aufrufen.
// - Ist allPokemonNames leer, nichts tun, denn dann gibt es keinen Nachbarn.
// Commit: "Add changeDialog for previous and next"

// SCHRITT 6 (neue Funktion setupDialogNav): Listener anhängen
// - Beide Buttons per data-id holen und je einen click-Listener anhängen.
// - Der Zurück-Button ruft changeDialog(-1) auf, der Weiter-Button changeDialog(1),
//   als Pfeilfunktion wie im Fotogram, damit das Argument mitgegeben wird.
// - setupDialogNav in init aufrufen.
// Commit: "Attach click listeners to dialog navigation"

// SCHRITT 7 (optional): Tastatur
// - Im bestehenden keydown-Listener oder in einem eigenen Pfeil links/rechts abfangen
//   und changeDialog(-1) bzw. changeDialog(1) aufrufen, solange der Dialog offen ist.
// Commit: "Add arrow key navigation to dialog"

// SCHRITT 8: Testen
// - Erstes Pokémon (bulbasaur) zurück: Landet es beim letzten Eintrag der Liste?
// - Letztes Pokémon weiter: Landet es bei bulbasaur?
// - Dialog über einen Vorschlag öffnen, der keine Karte hat: Funktionieren die Pfeile?
// - Schnell mehrfach klicken: Wird nur einmal geladen?
// - Dialog öffnen, bevor die Suche je benutzt wurde: Sind die Namen geladen?
// Commit: "Test dialog navigation"

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
