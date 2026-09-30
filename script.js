const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
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

function init() {
  getPokemonData();
}
init();

async function getSinglePokemonDetails(listEntry) {
  const details = await fetchErrorHandling(listEntry.url);
  const speciesData = await fetchErrorHandling(details.species.url);

  return {
    spriteSrc: details.sprites.other["official-artwork"].front_default,
    name: details.name,
    id: details.id,
    type: details.types[0].type.name,
    cardElement: TYPE_TO_TCG_ELEMENT[details.types[0].type.name],
    hp: details.stats[0].base_stat,
    species: speciesData.genera.find((translation) => translation.language.name === "en").genus,
  };
}

async function getPokemonData() {
  try {
    toggleLoadingSpinner(true);
    const url = `${BASE_URL}?limit=20`;
    const pokemonData = await fetchErrorHandling(url);
    const mapped = pokemonData.results.map(getSinglePokemonDetails);
    const pokemonDetails = await Promise.all(mapped);
    renderPokemonGrid(pokemonDetails);
  } finally {
    toggleLoadingSpinner(false);
  }
}

async function fetchErrorHandling(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error.message);
  }
}

function toggleLoadingSpinner(isLoading) {
  const spinner = document.querySelector(".loader-card");
  isLoading ? spinner.classList.remove("hidden") : spinner.classList.add("hidden");
}

function renderPokemonGrid(pokemonList) {
  const contentRef = document.getElementById("card-content");
  contentRef.innerHTML = "";

  for (let i = 0; i < pokemonList.length; i++) {
    contentRef.innerHTML += pokemonGridTemplate(pokemonList[i]);
  }
}
