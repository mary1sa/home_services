<?php

namespace App\Http\Controllers;

use App\Models\Panier;
use Illuminate\Http\Request;

class PanierController extends Controller
{
    // List all paniers for the authenticated user
    public function index()
    {
        $paniers = Panier::with(['user', 'tasker.user'])
            ->where('user_id', auth()->id())
            ->get();
        return response()->json($paniers);
    }

    // Store a new panier item
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tasker_id' => 'required|exists:taskers,id',
        ]);

        // Check if already in panier
        $existing = Panier::where('user_id', auth()->id())
            ->where('tasker_id', $validated['tasker_id'])
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Tasker already in panier'], 409);
        }

        $panier = Panier::create([
            'user_id' => auth()->id(),
            'tasker_id' => $validated['tasker_id']
        ]);

        return response()->json($panier, 201);
    }

    // Delete a panier item
    public function destroy($taskerId)
    {
        $panier = Panier::where('user_id', auth()->id())
            ->where('tasker_id', $taskerId)
            ->firstOrFail();

        $panier->delete();
        return response()->json(['message' => 'Tasker removed from panier']);
    }

    // Check if a tasker is in panier
    public function check($taskerId)
    {
        $inPanier = Panier::where('user_id', auth()->id())
            ->where('tasker_id', $taskerId)
            ->exists();

        return response()->json(['in_panier' => $inPanier]);
    }
}