<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use App\Models\PantryItem;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * "What's in my fridge" — the cook's own ingredient shelf.
 */
class PantryController extends Controller
{
    public function index(Request $request)
    {
        return response()->json([
            'data' => $this->itemsFor($request),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:120',
            'quantity' => 'nullable|numeric|min:0',
            'unit' => 'nullable|string|max:30',
            'expires_on' => 'nullable|date',
        ]);

        $ingredient = Ingredient::resolve($validated['name']);

        PantryItem::updateOrCreate(
            ['user_id' => $request->user()->id, 'ingredient_id' => $ingredient->id],
            [
                'quantity' => $validated['quantity'] ?? null,
                'unit' => $validated['unit'] ?? null,
                'expires_on' => $validated['expires_on'] ?? null,
            ]
        );

        return response()->json([
            'message' => $ingredient->name . ' added to your fridge.',
            'data' => $this->itemsFor($request),
        ], Response::HTTP_CREATED);
    }

    /** Replace the whole shelf in one call — used by the "quick add" chips. */
    public function sync(Request $request)
    {
        $validated = $request->validate([
            'names' => 'present|array',
            'names.*' => 'required|string|max:120',
        ]);

        $user = $request->user();
        $ids = collect($validated['names'])
            ->map(fn ($name) => Ingredient::resolve($name)->id)
            ->unique();

        $user->pantryItems()->whereNotIn('ingredient_id', $ids)->delete();

        foreach ($ids as $ingredientId) {
            PantryItem::firstOrCreate([
                'user_id' => $user->id,
                'ingredient_id' => $ingredientId,
            ]);
        }

        return response()->json([
            'message' => 'Fridge updated.',
            'data' => $this->itemsFor($request),
        ]);
    }

    public function destroy(Request $request, PantryItem $pantryItem)
    {
        if ((string) $pantryItem->user_id !== (string) $request->user()->id) {
            return response()->json([
                'message' => 'You can only edit your own fridge.',
            ], Response::HTTP_FORBIDDEN);
        }

        $pantryItem->delete();

        return response()->json([
            'message' => 'Item removed from your fridge.',
            'data' => $this->itemsFor($request),
        ]);
    }

    private function itemsFor(Request $request)
    {
        return $request->user()
            ->pantryItems()
            ->with('ingredient:id,name,slug,aisle')
            ->get()
            ->sortBy(fn (PantryItem $item) => $item->ingredient?->name)
            ->values();
    }
}
