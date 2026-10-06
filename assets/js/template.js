function pokemonGridTemplate(pokemon) {
  return `
  <li>
    <button type="button" data-name="${pokemon.name}" class="pokemon-card card-${pokemon.cardElement}">
      <img class="pokemon-sprite ${pokemon.isPlaceholder ? "is-placeholder" : ""}" src="${pokemon.spriteSrc}" alt="${pokemon.name}" onerror="handleImgError(this)" />
      <img class="card-blank" src="assets/images/card_blanks/${pokemon.cardElement}_card.webp" alt="" />
      <span class="card-header">
        <span class="header-left">
          <span class="pokemon-name">${pokemon.displayName}</span>
          ${pokemon.formName ? `<span class="pokemon-form">${pokemon.formName}</span>` : ""}
        </span>
        <span class="header-right">
          <span class="pokemon-hp">${pokemon.hp}HP</span>
          <img class="pokemon-type-icon" src="assets/images/type_icons/${pokemon.cardElement}.webp" alt="${pokemon.type}" />
        </span>
      </span>
      <span class="card-species-bar">
        <span class="pokemon-category">${pokemon.species}</span>
      </span>
      <span class="card-stats">${pokemon.stats.map(statBarTemplate).join("")}</span>
      <span class="card-size">${pokemon.size}</span>
    </button>
  </li>`;
}

function statBarTemplate(stat) {
  return `
  <span class="stat-row">
    <span class="stat-label">${stat.label}</span>
    <span class="stat-track"><span class="stat-fill" style="width: ${Math.min(stat.value / 1.5, 100)}%"></span></span>
    <span class="stat-value">${stat.value}</span>
  </span>`;
}

function suggestionTemplate(pokemonName) {
  return `
  <li>
    <button type="button" data-name="${pokemonName}">
      <span>${pokemonName}</span>
    </button>
  </li>`;
}

function pokemonDialogTemplate(pokemon) {
  const element = pokemon.types[0].element;
  return `
  <div class="dialog-scene" style="--glow: var(--element-${element})">
    <article class="dialog-card card-${element}">
      <div class="dialog-card-surface">
        <img class="dialog-card-blank" src="assets/images/card_blanks/${element}_card.webp" alt="" />
        <span class="dialog-card-stage">${pokemon.stage}</span>
        <ul class="dialog-card-attacks">
          ${pokemon.attacks
            .map(
              (attack) => `
          <li class="dialog-card-attack">
            <img class="dialog-attack-icon" src="assets/images/type_icons/${attack.element}.webp" alt="" />
            <span class="dialog-attack-name">${attack.name}</span>
            ${attack.power ? `<span class="dialog-attack-power">${attack.power}</span>` : ""}
          </li>`,
            )
            .join("")}
        </ul>
        <h2 class="dialog-card-name">
          ${pokemon.displayName}
          ${pokemon.formName ? `<span class="dialog-card-form">${pokemon.formName}</span>` : ""}
        </h2>
      </div>
      <span class="dialog-card-id">#${pokemon.id}</span>
      <div class="hologram">
        <img class="hologram-sprite" src="${pokemon.spriteSrc}" alt="${pokemon.displayName}" onerror="handleImgError(this)" />
        <ul class="hologram-types">
          ${pokemon.types.map((type) => `<li class="hologram-type" style="--orb: var(--element-${type.element})"><img class="hologram-type-icon" src="assets/images/type_icons/${type.element}.webp" alt="${type.name}" /></li>`).join("")}
        </ul>
      </div>
    </article>
  </div>`;
}
