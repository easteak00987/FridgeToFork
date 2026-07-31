<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\CookModeController;
use App\Http\Controllers\CuisineController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\IngredientController;
use App\Http\Controllers\MealPlanController;
use App\Http\Controllers\PantryController;
use App\Http\Controllers\PantrySearchController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RecipeController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ShoppingListController;
use App\Http\Controllers\TipController;
use Illuminate\Support\Facades\Route;

/**
 * Service index. Hitting the API root is the first thing anyone does when
 * handed a deployed URL, so answer with something useful rather than a bare
 * 404. Public endpoints only — nothing here is sensitive.
 */
Route::get('/', function () {
    return response()->json([
        'service' => config('app.name'),
        'status' => 'ok',
        'docs' => 'https://github.com/easteak00987/FridgeToFork#readme',
        'endpoints' => [
            'public' => [
                'GET  /api/recipes' => 'Recipe library. Filters: search, categories, cuisine, region, difficulty, diets, ingredients, max_minutes',
                'GET  /api/recipes/{id}' => 'A single recipe',
                'GET  /api/recipes/{id}/cook' => 'Guided cooking steps, timers and scaled ingredients',
                'GET  /api/recipes/{id}/artwork.svg' => 'Generated dish illustration',
                'POST /api/pantry/search' => 'Ingredient-based search: what can I cook from these?',
                'GET  /api/cuisines' => 'Cuisine map: every country with a recipe count',
                'GET  /api/cuisines/{code}' => 'Recipes from one country',
                'GET  /api/ingredients' => 'Ingredient autocomplete',
                'GET  /api/categories' => 'Recipe categories',
                'GET  /api/leaderboards' => 'Community leaderboard',
                'POST /api/register, /api/login' => 'Authentication',
            ],
            'authenticated' => [
                'GET|POST|PUT|DELETE /api/pantry' => 'Your fridge',
                'GET|POST|PUT|DELETE /api/meal-plan' => 'Weekly meal planner',
                'GET|POST|PUT|DELETE /api/shopping-list' => 'Auto shopping list',
                'POST /api/shopping-list/generate' => 'Build the list from the planned week',
                'GET|PUT /api/profile' => 'Dietary preferences and skill level',
            ],
        ],
    ]);
});

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::post('auth/google', [AuthController::class, 'google']);

Route::get('categories', [CategoryController::class, 'index']);
Route::get('recipes', [RecipeController::class, 'index']);
Route::get('recipes/{recipe}', [RecipeController::class, 'show']);
Route::get('recipe-images/{path}', [RecipeController::class, 'image'])->where('path', '.*');
Route::get('recipes/{recipe}/artwork.svg', [RecipeController::class, 'artwork']);
Route::get('leaderboards', [DashboardController::class, 'leaderboards']);
Route::get('users/{user}/tips', [TipController::class, 'show']);
Route::post('contact', [ContactController::class, 'store']);

// Ingredient-Based Search — works signed out too, using ad-hoc ingredients.
Route::get('ingredients', [IngredientController::class, 'index']);
Route::get('ingredients/aisles', [IngredientController::class, 'aisles']);
Route::post('pantry/search', PantrySearchController::class);

// Cuisine Map Explorer
Route::get('cuisines', [CuisineController::class, 'index']);
Route::get('cuisines/{code}', [CuisineController::class, 'show']);

// Guided Cooking Mode
Route::get('recipes/{recipe}/cook', CookModeController::class);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('me', [AuthController::class, 'me']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('dashboard', [DashboardController::class, 'user']);

    Route::post('recipes', [RecipeController::class, 'store']);
    Route::put('recipes/{recipe}', [RecipeController::class, 'update']);
    Route::post('recipes/{recipe}', [RecipeController::class, 'update']);
    Route::delete('recipes/{recipe}', [RecipeController::class, 'destroy']);
    Route::post('recipes/{recipe}/favorite', [FavoriteController::class, 'store']);
    Route::delete('recipes/{recipe}/favorite', [FavoriteController::class, 'destroy']);
    Route::post('recipes/{recipe}/reviews', [ReviewController::class, 'store']);
    Route::delete('recipes/{recipe}/reviews/{review}', [ReviewController::class, 'destroy']);
    Route::post('tips', [TipController::class, 'store']);

    // Account & Profiles — dietary preferences and skill level
    Route::get('profile', [ProfileController::class, 'show']);
    Route::put('profile', [ProfileController::class, 'update']);

    // What's in my fridge
    Route::get('pantry', [PantryController::class, 'index']);
    Route::post('pantry', [PantryController::class, 'store']);
    Route::put('pantry', [PantryController::class, 'sync']);
    Route::delete('pantry/{pantryItem}', [PantryController::class, 'destroy']);

    // Meal planner
    Route::get('meal-plan', [MealPlanController::class, 'index']);
    Route::post('meal-plan', [MealPlanController::class, 'store']);
    Route::put('meal-plan/{mealPlanEntry}', [MealPlanController::class, 'update']);
    Route::delete('meal-plan/{mealPlanEntry}', [MealPlanController::class, 'destroy']);

    // Auto shopping list
    Route::get('shopping-list', [ShoppingListController::class, 'index']);
    Route::post('shopping-list', [ShoppingListController::class, 'store']);
    Route::post('shopping-list/generate', [ShoppingListController::class, 'generate']);
    Route::put('shopping-list/{shoppingListItem}', [ShoppingListController::class, 'update']);
    Route::delete('shopping-list/{shoppingListItem}', [ShoppingListController::class, 'destroy']);
    Route::post('shopping-list/clear', [ShoppingListController::class, 'clear']);

    Route::middleware('admin')->group(function () {
        Route::get('admin/dashboard', [AdminController::class, 'dashboard']);
        Route::delete('admin/recipes/{recipe}', [AdminController::class, 'deleteRecipe']);
        Route::delete('admin/users/{user}', [AdminController::class, 'deleteUser']);
        Route::delete('admin/reviews/{review}', [AdminController::class, 'deleteReview']);
        Route::delete('admin/contacts/{contact}', [AdminController::class, 'deleteContact']);
    });
});
