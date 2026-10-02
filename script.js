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

// SCHRITT 1 (HTML): Container für die Vorschläge anlegen
// - Direkt unter dem Suchfeld eine leere Liste (<ul>) mit eigener id einfügen.
// - Sie ist am Anfang leer bzw. versteckt und wird später per JS gefüllt.
// Commit: "Add empty suggestion list below the search input"

// SCHRITT 2 (JS, oben bei den anderen Variablen): Zwei Variablen anlegen
// - allPokemonNames = [] (hier landen später alle Namen)
// - isLoadingNames = false (verhindert, dass die Anfrage doppelt startet)
// Beide ändern sich später, also kein const für das Flag. Das Array darf const sein.
// Commit: "Add state variables for the search"

// SCHRITT 3 (neue Funktion): Alle Namen einmal laden
// - Abbrechen, wenn die Namen schon geladen sind oder gerade geladen werden.
// - Flag auf true setzen.
// - try: mit fetchErrorHandling die Liste holen, mit einem sehr hohen limit (z. B. 10000).
// - Aus den Ergebnissen nur die Namen in allPokemonNames speichern (Tipp: map).
// - finally: Flag wieder auf false setzen.
// - Fehler im catch in der Konsole ausgeben, wie bei getPokemonData.
// Commit: "Add function to load all Pokémon names once"

// SCHRITT 4 (JS, bei init): Laden beim ersten Klick ins Suchfeld auslösen
// - Das Suchfeld über data-id="search-input" holen.
// - Ein focus-Event anhängen, das die Funktion aus Schritt 3 aufruft.
// - Prüfung, ob das Array schon gefüllt ist, kann in der Funktion aus Schritt 3 stehen.
// Commit: "Load Pokémon names on first focus of the search input"

// SCHRITT 5 (neue Funktion): Auf Tippen reagieren
// - Ein input-Event am Suchfeld anhängen.
// - Den Text aus event.target.value lesen, mit trim Leerzeichen entfernen
//   und mit toLowerCase klein schreiben.
// - Den Text an die Funktion aus Schritt 6 übergeben.
// Commit: "Handle input event of the search field"

// SCHRITT 6 (neue Funktion): Mindestlänge prüfen
// - Hat der Text weniger als 3 Zeichen: Vorschlagsliste leeren/verstecken und abbrechen (return).
// - Sonst weiter mit Schritt 7.
// Commit: "Require at least three characters before searching"

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
