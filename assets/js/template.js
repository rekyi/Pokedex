function pokemonGridTemplate() {
  return ` <li>
            <button type="button" class="pokemon-card">
              <img class="pokemon-sprite" src="" alt="" />
              <img class="card-blank" src="assets/images/card_blanks/" alt="" />

              <span class="card-header">
                <span class="header-left">
                  <span class="pokemon-id"></span>
                  <span class="pokemon-name"></span>
                </span>

                <span class="header-right">
                  <span class="pokemon-hp"></span>
                  <img class="pokemon-type-icon" src="assets/images/type_icons/" alt="Electric" />
                </span>
              </span>

              <span class="card-species-bar">
                <span class="pokemon-category"></span>
              </span>
            </button>
          </li>`;
}
