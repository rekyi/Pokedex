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
const allPokemonNames = [];
let isLoadingNames = false;

function init() {
  infiniteScroll();
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
    // ability: details.abilities[0].ability.name.replaceAll("-", " "),
    size: `${details.height / 10} m · ${details.weight / 10} kg`,
    stats: [
      { label: "ATK", value: details.stats[1].base_stat },
      { label: "DEF", value: details.stats[2].base_stat },
      { label: "SPD", value: details.stats[5].base_stat },
    ],
  };
}

async function getPokemonData() {
  if (isLoading) return;
  isLoading = true;
  toggleLoadingSpinner(true);
  try {
    await loadNextBatch();
  } catch (error) {
    console.error(error.message);
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
    console.error(error.message);
  } finally {
    isLoadingNames = false;
  }
}

function setupSearch() {
  const inputRef = document.querySelector('[data-id="search-input"]');
  inputRef.addEventListener("focus", loadAllNames);
  inputRef.addEventListener("input", handleSearchInput);
}

function handleSearchInput(event) {
  const searchText = event.target.value.trim().toLowerCase();
  updateSuggestions(searchText);
}

function updateSuggestions(searchText) {
  if (searchText.length < 3) {
    document.getElementById("suggestion-list").classList.add("hidden");
    return;
  }
}

// function filterNames() {
//   allPokemonNames.filter(() => );
// }

// SCHRITT 7 (neue Funktion): Namen filtern
// - Aus allPokemonNames die Namen herausfiltern, die zum Text passen (Tipp: filter).
// - Entscheide: Soll der Text am Anfang des Namens stehen (startsWith)
//   oder irgendwo darin vorkommen (includes)? Auf deinen Bildern passt startsWith.
// - Das Ergebnis ist ein Array mit den passenden Namen.
// Commit: "Filter Pokémon names by search text"

// SCHRITT 8 (Template + Render): Vorschläge anzeigen
// - Eine Template-Funktion für einen einzelnen Vorschlag schreiben: ein <li> mit einem <button>,
//   damit man auch mit der Tastatur auswählen kann.
// - Eine Render-Funktion, die die Vorschläge zu einem String zusammensetzt
//   und mit innerHTML in die Liste aus Schritt 1 schreibt (hier ersetzen, nicht anhängen).
// Commit: "Render matching Pokémon names as suggestions"

// SCHRITT 9 (in der Render-Funktion): Meldung bei keinem Treffer
// - Ist das gefilterte Array leer, stattdessen einen Hinweis in die Liste schreiben
//   (z. B. "No Pokémon found"). Dieser Eintrag darf kein Button sein.
// Commit: "Show message when no Pokémon matches the search"

// SCHRITT 10 (Klick auf einen Vorschlag): Auswahl vorbereiten
// - Beim Klick auf einen Namen den gewählten Namen ermitteln.
// - Später öffnet hier der Dialog. Für jetzt reicht console.log(name) zum Testen.
// - Danach die Liste leeren/verstecken.
// Commit: "Handle click on a suggestion"

// SCHRITT 11: Liste wieder schließen
// - Wenn das Feld geleert wird, ist Schritt 6 schon zuständig.
// - Zusätzlich überlegen: Soll die Liste auch bei Klick außerhalb des Feldes oder bei Escape schließen?
// Commit: "Close suggestion list on outside click"

// SCHRITT 12 (CSS): Aussehen
// - Liste direkt unter dem Suchfeld positionieren (position absolute, passende Breite).
// - Eine maximale Höhe setzen und overflow-y auf auto, damit sie scrollbar ist.
// - Hover- und Fokus-Zustand für die Einträge.
// Commit: "Style scrollable suggestion list"

// SCHRITT 13: Testen
// - Network-Tab: Wird die Namensliste nur einmal geladen, auch bei mehrfachem Klicken?
// - Unter 3 Zeichen: Keine Liste. Ab 3 Zeichen: Passende Namen.
// - Unsinniger Text: Meldung erscheint.
// - Groß- und Kleinschreibung sowie Leerzeichen am Anfang testen.
// Commit: "Test and polish search behavior"
