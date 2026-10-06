function prepareLoadingUI() {
  const loadingDiv = document.getElementById("loading");
  if (currentOffset === 0) {
    toggleLoadingSpinner(true);
    loadingDiv.style.visibility = "hidden";
  } else {
    loadingDiv.style.visibility = "visible";
  }
}

async function getPokemonData() {
  if (isLoading) return;
  isLoading = true;
  prepareLoadingUI();
  try {
    await delay(1500);
    await loadNextBatch();
  } catch (error) {
    console.error(error);
    alert("Failed to load Pokémon. Please try again later.");
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

function handleImgError(img) {
  img.onerror = null;
  img.src = PLACEHOLDER_SPRITE_IMG;
  img.classList.add("is-placeholder");
}

function toggleLoadingSpinner(isLoading) {
  const spinner = document.querySelector(".loader-card");
  isLoading ? spinner.classList.remove("hidden") : spinner.classList.add("hidden");
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
