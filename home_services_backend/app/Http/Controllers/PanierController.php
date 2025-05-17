<?php

namespace App\Http\Controllers;

use App\Models\Panier;
use Illuminate\Http\Request;

class PanierController extends Controller
{
    // List all paniers
    public function index()
    {
        $paniers = Panier::with(['user', 'tasker'])->get();
        return response()->json($paniers);
    }

    // Store a new panier
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'tasker_id' => 'required|exists:taskers,id',
        ]);

        $panier = Panier::create($validated);
        return response()->json($panier, 201);
    }

    // Show a specific panier
    public function show($id)
    {
        $panier = Panier::with(['user', 'tasker'])->findOrFail($id);
        return response()->json($panier);
    }

    // Update a panier
    public function update(Request $request, $id)
    {
        $panier = Panier::findOrFail($id);

        $validated = $request->validate([
            'user_id' => 'sometimes|exists:users,id',
            'tasker_id' => 'sometimes|exists:taskers,id',
        ]);

        $panier->update($validated);
        return response()->json($panier);
    }

    // Delete a panier
    public function destroy($id)
    {
        $panier = Panier::findOrFail($id);
        $panier->delete();
        return response()->json(['message' => 'Panier deleted successfully']);
    }
}
