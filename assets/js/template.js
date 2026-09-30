function pokemonGridTemplate(pokemon) {
  return ` <li>
            <button type="button" class="pokemon-card">
              <img class="pokemon-sprite" src="${pokemon.spriteSrc}" alt="" />
              <img class="card-blank" src="assets/images/card_blanks/${pokemon.cardElement}_card.webp" alt="" />

              <span class="card-header">
                <span class="header-left">
                  <span class="pokemon-id">${pokemon.id}</span>
                  <span class="pokemon-name">${pokemon.name}</span>
                </span>

                <span class="header-right">
                  <span class="pokemon-hp">${pokemon.hp}HP</span>
                  <img class="pokemon-type-icon" src="assets/images/type_icons/${pokemon.cardElement}.webp" alt="${pokemon.type}" />
                </span>
              </span>

              <span class="card-species-bar">
                <span class="pokemon-category">${pokemon.species}</span>
              </span>
            </button>
          </li>`;
}
