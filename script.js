const BASE_URL = "https://pokeapi.co/api/v2/pokemon";

getPokemonData();

async function getPokemonData() {
  const url = `${BASE_URL}?limit=20`;
  const response = await fetch(url);
  const pokemonData = await response.json();

  const mapped = pokemonData.results.map(async (pokemon) => {
    const response = await fetch(pokemon.url);
    const details = await response.json();
    const speciesUrl = await fetch(details.species.url);
    const speciesData = await speciesUrl.json();

    return {
      spriteSrc: details.sprites.front_default,
      name: details.name,
      id: details.id,
      hp: details.stats[0].base_stat,
      species: speciesData.genera.find((translation) => translation.language.name === "en").genus,
    };
  });
  const pokemonDetails = await Promise.all(mapped);
  console.log(pokemonDetails);
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
