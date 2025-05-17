<?php

namespace App\Http\Controllers;

use App\Models\PortfolioImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PortfolioImageController extends Controller
{
    // List all portfolio images
    public function index()
    {
        return response()->json(PortfolioImage::with('tasker')->get());
    }

    // Store a new portfolio image
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tasker_id' => 'required|exists:taskers,id',
            'image_path' => 'required|image|mimes:jpg,jpeg,png|max:2048',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        // Store image
        if ($request->hasFile('image_path')) {
            $validated['image_path'] = $request->file('image_path')->store('portfolio', 'public');
        }

        $image = PortfolioImage::create($validated);

        return response()->json($image, 201);
    }

    // Show a specific image
    public function show($id)
    {
        $image = PortfolioImage::with('tasker')->findOrFail($id);
        return response()->json($image);
    }

    // Update a portfolio image
    public function update(Request $request, $id)
    {
        $image = PortfolioImage::findOrFail($id);

        $validated = $request->validate([
            'image_path' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        if ($request->hasFile('image_path')) {
            // Delete old image
            if ($image->image_path) {
                Storage::disk('public')->delete($image->image_path);
            }

            $validated['image_path'] = $request->file('image_path')->store('portfolio', 'public');
        }

        $image->update($validated);

        return response()->json($image);
    }

    // Delete a portfolio image
    public function destroy($id)
    {
        $image = PortfolioImage::findOrFail($id);

        if ($image->image_path) {
            Storage::disk('public')->delete($image->image_path);
        }

        $image->delete();

        return response()->json(['message' => 'Portfolio image deleted successfully']);
    }
}
