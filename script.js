const BASE_URL = "https://pokeapi.co/api/v2/pokemon";

getPokemonData();

async function getSinglePokemonDetails(pokemon) {
  const details = await fetchErrorHandling(pokemon.url);
  const speciesData = await fetchErrorHandling(details.species.url);

  return {
    spriteSrc: details.sprites.front_default,
    name: details.name,
    id: details.id,
    hp: details.stats[0].base_stat,
    species: speciesData.genera.find((translation) => translation.language.name === "en").genus,
  };
}

async function getPokemonData() {
  const url = `${BASE_URL}?limit=20`;
  const pokemonData = await fetchErrorHandling(url);
  const mapped = pokemonData.results.map(getSinglePokemonDetails);
  const pokemonDetails = await Promise.all(mapped);
  console.log(pokemonDetails);
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

// 5. Die Template-Funktion pro Pokémon aufrufen und die Werte übergeben

// 6. Den zurückgegebenen HTML-String in #card-content einfügen
//    -> Wie verhindere ich, dass Karten doppelt erscheinen?

// 7. Die Render-Funktion beim Start der Seite aufrufen

// function renderPokemonGrid() {
//   const contentRef = document.getElementById("card-content");
//   contentRef.innerHTML = "";

//   for (let i = 0; i < array.length; i++) {
//     const element = array[i];
//   }

//   contentRef.innerHTML += pokemonGridTemplate();
// }
// renderPokemonGrid();
