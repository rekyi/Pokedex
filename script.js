const BASE_URL = "https://pokeapi.co/api/v2/pokemon";
let currentOffset = 0;
let isLoading = false;
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
    ...getCardExtras(details),
    size: `${details.height / 10} m · ${details.weight / 10} kg`,
  };
}

function getCardExtras(details) {
  return {
    ability: details.abilities[0].ability.name.replaceAll("-", " "),
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
  try {
    toggleLoadingSpinner(true);
    const url = `${BASE_URL}?limit=40&offset=${currentOffset}`;
    const pokemonList = await fetchPokemonList(url);
    renderPokemonGrid(pokemonList);
    currentOffset += 40;
  } finally {
    toggleLoadingSpinner(false);
    isLoading = false;
  }
}

async function fetchPokemonList(url) {
  const pokemonData = await fetchErrorHandling(url);
  const mapped = pokemonData.results.map(getSinglePokemonDetails);
  const pokemonList = await Promise.all(mapped);
  return pokemonList;
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
