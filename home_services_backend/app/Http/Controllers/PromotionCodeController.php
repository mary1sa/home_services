<?php

namespace App\Http\Controllers;

use App\Models\PromotionCode;
use Illuminate\Http\Request;

class PromotionCodeController extends Controller
{
    // List all promotion codes
    public function index()
    {
        $codes = PromotionCode::with('promotion')->get();
        return response()->json($codes);
    }

    // Store a new promotion code
    public function store(Request $request)
    {
        $validated = $request->validate([
            'promotion_id' => 'required|exists:promotions,id',
            'code' => 'required|string|unique:promotion_codes,code',
        ]);

        $code = PromotionCode::create($validated);

        return response()->json($code, 201);
    }

    // Show a specific promotion code
    public function show($id)
    {
        $code = PromotionCode::with('promotion')->findOrFail($id);
        return response()->json($code);
    }

    // Update a promotion code
    public function update(Request $request, $id)
    {
        $code = PromotionCode::findOrFail($id);

        $validated = $request->validate([
            'promotion_id' => 'sometimes|exists:promotions,id',
            'code' => 'sometimes|string|unique:promotion_codes,code,' . $id,
        ]);

        $code->update($validated);

        return response()->json($code);
    }

    // Delete a promotion code
    public function destroy($id)
    {
        $code = PromotionCode::findOrFail($id);
        $code->delete();

        return response()->json(['message' => 'Promotion code deleted successfully.']);
    }
}
