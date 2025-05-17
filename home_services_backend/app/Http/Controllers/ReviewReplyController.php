<?php

namespace App\Http\Controllers;

use App\Models\ReviewReply;
use Illuminate\Http\Request;

class ReviewReplyController extends Controller
{
    // List all replies ( optionally filter by review_id)
    public function index(Request $request)
    {
        $query = ReviewReply::with(['review', 'user']);

        if ($request->has('review_id')) {
            $query->where('review_id', $request->input('review_id'));
        }

        return response()->json($query->get());
    }

    // Store a new reply
    public function store(Request $request)
    {
        $validated = $request->validate([
            'review_id' => 'required|exists:reviews,id',
            'user_id' => 'required|exists:users,id',
            'reply' => 'required|string',
        ]);

        $reply = ReviewReply::create($validated);

        return response()->json($reply, 201);
    }

    // Show a specific reply
    public function show($id)
    {
        $reply = ReviewReply::with(['review', 'user'])->findOrFail($id);
        return response()->json($reply);
    }

    // Update a reply
    public function update(Request $request, $id)
    {
        $reply = ReviewReply::findOrFail($id);

        $validated = $request->validate([
            'reply' => 'required|string',
        ]);

        $reply->update($validated);

        return response()->json($reply);
    }

    // Delete a reply
    public function destroy($id)
    {
        $reply = ReviewReply::findOrFail($id);
        $reply->delete();

        return response()->json(['message' => 'Review reply deleted successfully']);
    }
}
