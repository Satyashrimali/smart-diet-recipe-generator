const API_KEY = "60503f050fc341dc99933a91adf34f8f";
const BASE_URL = "https://api.spoonacular.com/recipes/findByIngredients";

document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("search-btn");
  const searchInput = document.getElementById("ingredients-input");

  searchBtn.addEventListener("click", () => {
    const ingredients = searchInput.value.trim();
    if (ingredients) {
      getRecipes(ingredients);
    }
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const ingredients = searchInput.value.trim();
      if (ingredients) {
        getRecipes(ingredients);
      }
    }
  });
});

async function getRecipes(ingredients) {
  const loadingState = document.getElementById("loading-state");
  const errorState = document.getElementById("error-state");
  const emptyState = document.getElementById("empty-state");
  const recipeGrid = document.getElementById("recipe-grid");

  // Reset UI states
  recipeGrid.innerHTML = "";
  errorState.classList.add("hidden");
  emptyState.classList.add("hidden");
  loadingState.classList.remove("hidden"); // Show loading

  const url = `${BASE_URL}?ingredients=${encodeURIComponent(ingredients)}&number=12&apiKey=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`We hit a snag! HTTP Error: ${response.status}`);
    }
    const data = await response.json();

    loadingState.classList.add("hidden"); // Hide loading

    if (data.length === 0) {
      emptyState.innerHTML = "<p>No recipes found. Try using different ingredients.</p>";
      emptyState.classList.remove("hidden");
    } else {
      displayRecipes(data);
    }
  } catch (error) {
    loadingState.classList.add("hidden");
    errorState.innerHTML = `<p>Error fetching recipes: ${error.message}</p>`;
    errorState.classList.remove("hidden");
    console.error(error);
  }
}

function displayRecipes(recipes) {
  const recipeGrid = document.getElementById("recipe-grid");

  // Apply a filter, sort, and map pipeline
  const recipesHTML = recipes
    // 1. Filter: Keep only recipes that have a valid image
    .filter(recipe => recipe.image)
    // 2. Sort: Order by the least number of missed ingredients first (best match)
    .sort((a, b) => a.missedIngredientCount - b.missedIngredientCount)
    // 3. Map: Transform the recipe objects into HTML string cards
    .map(recipe => {
      // Keep up to 3 used and 3 missed ingredients to keep the UI clean
      const usedIngs = recipe.usedIngredients.slice(0, 3).map(ing =>
        `<span class="ingredient-tag used">✓ ${ing.name}</span>`
      ).join("");

      const missedIngs = recipe.missedIngredients.slice(0, 3).map(ing =>
        `<span class="ingredient-tag missed">+ ${ing.name}</span>`
      ).join("");

      return `
        <div class="recipe-card">
          <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image" loading="lazy">
          <div class="recipe-content">
            <h3 class="recipe-title">${recipe.title}</h3>
            <div class="recipe-ingredients">
              ${usedIngs}
              ${missedIngs}
            </div>
            <button class="view-recipe-btn" onclick="alert('Viewing recipe details (Future Implementation)')">View Recipe</button>
          </div>
        </div>
      `;
    })
    .join("");

  recipeGrid.innerHTML = recipesHTML || "<p>No suitable recipes found.</p>";
}