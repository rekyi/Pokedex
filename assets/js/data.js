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

async function fetchErrorHandling(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Response status: ${response.status} (${url})`);
  }
  return await response.json();
}

async function fetchPokemonList(url) {
  const pokemonData = await fetchErrorHandling(url);
  const mapped = pokemonData.results.map(getSinglePokemonDetails);
  const pokemonList = await Promise.all(mapped);
  return pokemonList;
}

async function fetchDialogData(pokemonName) {
  const details = await fetchErrorHandling(`${BASE_URL}/${pokemonName}`);
  const speciesData = await fetchErrorHandling(details.species.url);
  const moves = await fetchMoves(details);
  return { details, speciesData, moves };
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

function getDialogBasics(details) {
  return {
    ...getNameParts(details),
    spriteSrc: getDialogSpriteSrc(details.sprites),
    id: details.id,
  };
}

function getDialogSpriteSrc(sprites) {
  return sprites.other?.home?.front_default || sprites.other?.["official-artwork"]?.front_default || sprites.front_default || PLACEHOLDER_SPRITE_IMG;
}

function getDialogTypes(details) {
  return {
    types: details.types.map((typeEntry) => ({
      name: typeEntry.type.name,
      element: TYPE_TO_TCG_ELEMENT[typeEntry.type.name],
    })),
  };
}

function getDialogStage(speciesData) {
  return {
    stage: getStageText(speciesData),
  };
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

function getDialogMoves(moves) {
  return {
    attacks: moves.map((moveEntry) => ({
      name: moveEntry.name.replaceAll("-", " "),
      element: TYPE_TO_TCG_ELEMENT[moveEntry.type.name],
      power: moveEntry.power,
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
