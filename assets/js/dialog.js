function setupPokemonClicks() {
  const suggestionListRef = document.getElementById("suggestion-list");
  const cardRef = document.getElementById("card-content");
  suggestionListRef.addEventListener("click", handlePokemonClick);
  cardRef.addEventListener("click", handlePokemonClick);
}

function handlePokemonClick(event) {
  const target = event.target.closest("button");
  if (target && target.hasAttribute("data-name")) {
    const selectedName = target.dataset.name;
    openPokemonDialog(selectedName);
    hideSuggestions();
  }
}

async function loadAndRenderDialog(pokemonName) {
  await loadAllNames();
  const dialogData = await fetchDialogData(pokemonName);
  const pokemon = prepareDialogData(dialogData);
  renderDialogContent(pokemon);
  document.querySelector('[data-id="dialog"]').showModal();
  currentDialogIndex = allPokemonNames.indexOf(pokemonName);
}

async function openPokemonDialog(pokemonName) {
  if (isLoadingDialog) return;
  isLoadingDialog = true;
  try {
    await loadAndRenderDialog(pokemonName);
  } catch (error) {
    console.error(error);
    alert("Failed to load Pokémon details. Please try again later.");
  } finally {
    isLoadingDialog = false;
  }
}

function renderDialogContent(pokemon) {
  const dialogRef = document.querySelector('[data-id="dialog-content"]');
  dialogRef.innerHTML = pokemonDialogTemplate(pokemon);
}

function setupDialogClosing() {
  const dialogRef = document.querySelector('[data-id="dialog"]');
  dialogRef.addEventListener("click", (event) => {
    if (event.target === event.currentTarget) {
      event.currentTarget.close();
    }
  });
  document.querySelector('[data-id="close-dialog-button"]').addEventListener("click", () => dialogRef.close());
}

function setupDialogNav() {
  document.querySelector('[data-id="prev-button"]').addEventListener("click", () => changeDialog(-1));
  document.querySelector('[data-id="next-button"]').addEventListener("click", () => changeDialog(1));
  document.addEventListener("keydown", (event) => {
    const dialog = document.querySelector('[data-id="dialog"]');
    if (!dialog || !dialog.open) return;
    if (event.key === "ArrowLeft") {
      changeDialog(-1);
    } else if (event.key === "ArrowRight") {
      changeDialog(1);
    }
  });
}

function changeDialog(step) {
  if (allPokemonNames.length === 0) return;
  const nextPokemonName = getNeighborName(step);
  openPokemonDialog(nextPokemonName);
}

function getNeighborName(step) {
  let targetIndex = currentDialogIndex + step;
  if (targetIndex >= allPokemonNames.length) {
    targetIndex = 0;
  } else if (targetIndex < 0) {
    targetIndex = allPokemonNames.length - 1;
  }
  return allPokemonNames[targetIndex];
}
