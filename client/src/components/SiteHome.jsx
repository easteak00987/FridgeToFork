import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/api";

function getRecipeCountLabel(count) {
  return `${count} ${count === 1 ? "recipe" : "recipes"}`;
}

function getLabel(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function RecipeImage({ recipe, className, alt }) {
  if (!recipe?.image_url) {
    return null;
  }

  return <img alt={alt || recipe.title} className={className} src={recipe.image_url} />;
}

function RecipeShelf({ title, description, recipes = [], variant = "default" }) {
  const isTopRail = variant === "top10";

  return (
    <section className={`recipe-shelf ${isTopRail ? "recipe-shelf--top10" : ""}`}>
      <div className="section-row">
        <div>
          <p className="eyebrow">{isTopRail ? "Top 10 Now Cooking" : title}</p>
          <h2>{title}</h2>
          <p className="section-copy">{description}</p>
        </div>
        <Link className="link-button" to="/recipes">
          View all recipes
        </Link>
      </div>

      {recipes.length ? (
        <div
          className={`recipe-shelf__track ${isTopRail ? "recipe-shelf__track--top10" : ""}`}
          aria-label={title}
        >
          {recipes.map((recipe, index) => (
            <article
              className={`recipe-shelf__card ${isTopRail ? "recipe-shelf__card--top10" : ""}`}
              key={`${title}-${recipe.id}`}
            >
              {isTopRail ? (
                <div className="recipe-shelf__rank-wrap">
                  <span className="recipe-shelf__rank" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div className="recipe-shelf__poster">
                    <RecipeImage
                      recipe={recipe}
                      className="recipe-shelf__poster-image"
                      alt={recipe.title}
                    />
                    <div className="recipe-shelf__media recipe-shelf__media--top10">
                      <div className="recipe-shelf__topline">
                        <span className="recipe-shelf__badge">
                          {recipe.categories?.[0]?.name || "Chef's Pick"}
                        </span>
                        <div className="recipe-shelf__rating">
                          <span>&#9733;</span>
                          <strong>{Number(recipe.average_rating || 0).toFixed(1)}</strong>
                        </div>
                      </div>

                      <div className="recipe-shelf__headline">
                        <p className="recipe-shelf__kicker">Top recipe #{index + 1}</p>
                        <h3 className="recipe-shelf__title">{recipe.title}</h3>
                        <p className="recipe-shelf__description">{recipe.description}</p>
                      </div>

                      <div className="recipe-shelf__footer">
                        <span className="recipe-shelf__author">
                          By {recipe.user?.name || "Unknown chef"}
                        </span>
                        <span className="recipe-shelf__reviews">
                          {recipe.reviews_count ?? recipe.reviews?.length ?? 0} reviews
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="recipe-shelf__media">
                    <RecipeImage
                      recipe={recipe}
                      className="recipe-shelf__media-image"
                      alt={recipe.title}
                    />
                    <span className="recipe-shelf__badge">
                      {recipe.categories?.[0]?.name || "Chef's Pick"}
                    </span>
                    <div className="recipe-shelf__rating">
                      <span>&#9733;</span>
                      <strong>{Number(recipe.average_rating || 0).toFixed(1)}</strong>
                    </div>
                  </div>

                  <div className="recipe-shelf__body">
                    <h3>{recipe.title}</h3>
                    <p>{recipe.description}</p>

                    <div className="chip-row">
                      {(recipe.categories || []).slice(0, 3).map((category) => (
                        <span className="chip" key={category.id ?? category.name}>
                          {category.name}
                        </span>
                      ))}
                    </div>

                    <div className="recipe-shelf__meta">
                      <span>By {recipe.user?.name || "Unknown chef"}</span>
                      <span>{recipe.reviews_count ?? recipe.reviews?.length ?? 0} reviews</span>
                    </div>
                  </div>
                </>
              )}

              {isTopRail && (
                <div className="recipe-shelf__top10-tags">
                  {(recipe.categories || []).slice(0, 3).map((category) => (
                    <span className="chip" key={category.id ?? category.name}>
                      {category.name}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="leaderboard-card">
          <p className="section-copy">No recipes to show yet.</p>
        </div>
      )}
    </section>
  );
}

export default function SiteHome({ user, onOpenAuth }) {
  const [leaderboards, setLeaderboards] = useState({
    top_users: [],
    top_recipes: [],
    trending_categories: [],
    rising_chef: null,
    platform_stats: { recipes: 0, reviews: 0, categories: 0, chefs: 0 },
  });
  const [recentRecipes, setRecentRecipes] = useState([]);

  useEffect(() => {
    let active = true;

    api.leaderboards()
      .then((leaderboardData) => {
        if (active) {
          setLeaderboards(leaderboardData);
        }
      })
      .catch(() => {});

    api.recipes()
      .then((recipeData) => {
        if (active) {
          setRecentRecipes((recipeData?.data || []).slice(0, 10));
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const featuredRecipe = leaderboards.top_recipes[0] || recentRecipes[0] || null;
  const topUsers = leaderboards.top_users.slice(0, 5);
  const trendingCategories = leaderboards.trending_categories || [];
  const risingChef = leaderboards.rising_chef;
  const platformStats = leaderboards.platform_stats || {
    recipes: 0,
    reviews: 0,
    categories: 0,
    chefs: 0,
  };

  return (
    <div className="page-grid home-page">
      <section className="hero-panel home-hero">
        <div className="home-hero__content">
          <p className="eyebrow">Cook. Share. Waste less.</p>
          <h1>Tell us what&apos;s in your fridge. We&apos;ll tell you what to cook.</h1>
          <p className="section-copy">
            Add the ingredients you already have and FridgeToFork ranks every recipe by
            how much of it you can make right now — then walks you through it step by
            step, timers and all.
          </p>

          <div className="hero-actions">
            <Link className="button" to="/fridge">
              Search My Fridge
            </Link>
            <Link className="button button--ghost" to="/cuisines">
              Explore the Cuisine Map
            </Link>
            {user ? (
              <Link className="button button--secondary" to="/recipes/new">
                Share a Recipe
              </Link>
            ) : (
              <button
                className="button button--secondary"
                onClick={() => onOpenAuth("signup")}
                type="button"
              >
                Join Free
              </button>
            )}
          </div>

          <div className="home-hero__stats">
            <div className="home-stat-pill">
              <strong>{getRecipeCountLabel(platformStats.recipes)}</strong>
              <span>Total recipes on the platform</span>
            </div>
            <div className="home-stat-pill">
              <strong>{getLabel(platformStats.categories, "category", "categories")}</strong>
              <span>Browseable recipe collections</span>
            </div>
            <div className="home-stat-pill">
              <strong>{getLabel(platformStats.reviews, "review", "reviews")}</strong>
              <span>Community ratings and feedback</span>
            </div>
          </div>
        </div>

        <div className="hero-card home-hero__feature">
          <p className="eyebrow">Featured Recipe</p>
          {featuredRecipe ? (
            <>
              <RecipeImage
                recipe={featuredRecipe}
                className="home-feature__image"
                alt={featuredRecipe.title}
              />
              <h2>{featuredRecipe.title}</h2>
              <p className="section-copy">{featuredRecipe.description}</p>

              <div className="chip-row">
                {(featuredRecipe.categories || []).slice(0, 3).map((category) => (
                  <span className="chip" key={category.id ?? category.name}>
                    {category.name}
                  </span>
                ))}
              </div>

              <div className="home-feature__footer">
                <span>By {featuredRecipe.user?.name || "Unknown chef"}</span>
                <strong>{Number(featuredRecipe.average_rating || 0).toFixed(1)} / 5</strong>
              </div>
            </>
          ) : (
            <p className="section-copy">
              Your featured recipe will appear here as soon as uploads or ratings start coming in.
            </p>
          )}
        </div>
      </section>

      <section className="home-highlights">
        <div className="leaderboard-card">
          <p className="eyebrow">Top Users</p>
          <h2>Community leaderboard</h2>
          <ol>
            {topUsers.map((userItem) => (
              <li key={userItem.id}>
                <span>{userItem.name}</span>
                <strong>{userItem.points} pts</strong>
              </li>
            ))}
          </ol>
        </div>

        <article className="info-card home-note-card">
          <p className="eyebrow">Trending Categories</p>
          <h2>What people are cooking most.</h2>
          {trendingCategories.length ? (
            <>
              <div className="home-trending-list">
                {trendingCategories.map((category) => (
                  <div className="home-trending-item" key={category.id}>
                    <strong>{category.name}</strong>
                    <span>{getLabel(category.recipes_count, "recipe", "recipes")}</span>
                  </div>
                ))}
              </div>
              <p className="section-copy">
                These categories are pulled from live recipe counts in your backend, so the home
                page updates as the library grows.
              </p>
            </>
          ) : (
            <p className="section-copy">
              Category trends will appear here as soon as recipes are grouped into categories.
            </p>
          )}
        </article>
      </section>

      <section className="home-pulse">
        <article className="leaderboard-card home-pulse__card">
          <p className="eyebrow">Rising Chef</p>
          <h2>Creator spotlight</h2>
          {risingChef ? (
            <div className="home-spotlight">
              <strong>{risingChef.name}</strong>
              <p className="section-copy">
                Currently leading the momentum with {getRecipeCountLabel(risingChef.recipes_count)}{" "}
                and {risingChef.points} points.
              </p>
              <div className="chip-row">
                <span className="chip">{risingChef.points} pts</span>
                <span className="chip">{getRecipeCountLabel(risingChef.recipes_count)}</span>
              </div>
            </div>
          ) : (
            <p className="section-copy">
              Your next active contributor will appear here once members start publishing recipes.
            </p>
          )}
        </article>

        <article className="info-card home-pulse__card">
          <p className="eyebrow">Backend Pulse</p>
          <h2>Live platform snapshot</h2>
          <div className="home-pulse__stats">
            <div className="home-pulse__stat">
              <strong>{platformStats.chefs}</strong>
              <span>Community chefs</span>
            </div>
            <div className="home-pulse__stat">
              <strong>{recentRecipes.length}</strong>
              <span>Fresh uploads shown</span>
            </div>
          </div>
        </article>
      </section>

      <RecipeShelf
        title="Recent Uploads"
        description="Fresh additions from the FridgeToFork community, arranged in a smooth, binge-browse row."
        recipes={recentRecipes}
      />

      <RecipeShelf
        title="Top Recipes"
        description="Highest-rated dishes on the platform, ready for a Netflix-style scroll across your home page."
        recipes={leaderboards.top_recipes}
        variant="top10"
      />
    </div>
  );
}
