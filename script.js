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
