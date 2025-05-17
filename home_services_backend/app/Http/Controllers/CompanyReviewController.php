<?php

namespace App\Http\Controllers;

use App\Models\CompanyReview;
use Illuminate\Http\Request;

class CompanyReviewController extends Controller
{
    // List all company reviews (optionally filter by company_id)
    public function index(Request $request)
    {
        $query = CompanyReview::query();

        if ($request->has('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $reviews = $query->with(['user', 'company'])->get();

        return response()->json($reviews);
    }

    // Store a new review
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'company_id' => 'required|exists:companies,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $review = CompanyReview::create($validated);

        return response()->json($review, 201);
    }

    // Show a specific review
    public function show($id)
    {
        $review = CompanyReview::with(['user', 'company'])->findOrFail($id);

        return response()->json($review);
    }

    // Update a review
    public function update(Request $request, $id)
    {
        $review = CompanyReview::findOrFail($id);

        $validated = $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $review->update($validated);

        return response()->json($review);
    }

    // Delete a review
    public function destroy($id)
    {
        $review = CompanyReview::findOrFail($id);
        $review->delete();

        return response()->json(['message' => 'Review deleted successfully.']);
    }
}
