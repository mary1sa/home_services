<?php

namespace App\Http\Controllers;

use App\Models\ServiceReview;
use Illuminate\Http\Request;

class ServiceReviewController extends Controller
{
    // List all reviews or filter by service_id
    public function index(Request $request)
    {
        $query = ServiceReview::query();

        if ($request->has('service_id')) {
            $query->where('service_id', $request->service_id);
        }

        $reviews = $query->with(['user', 'service'])->get();

        return response()->json($reviews);
    }

    // Store a new review
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'service_id' => 'required|exists:services,id',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $review = ServiceReview::create($validated);

        return response()->json($review, 201);
    }

    // Show a specific review
    public function show($id)
    {
        $review = ServiceReview::with(['user', 'service'])->findOrFail($id);

        return response()->json($review);
    }

    // Update a review
    public function update(Request $request, $id)
    {
        $review = ServiceReview::findOrFail($id);

        $validated = $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
        ]);

        $review->update($validated);

        return response()->json($review);
    }

    // Delete a review
    public function destroy($id)
    {
        $review = ServiceReview::findOrFail($id);
        $review->delete();

        return response()->json(['message' => 'Review deleted successfully.']);
    }
}
