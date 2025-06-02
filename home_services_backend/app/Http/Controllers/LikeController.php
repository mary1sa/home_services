<?php


namespace App\Http\Controllers;

use App\Models\Like;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LikeController extends Controller
{
   public function toggleLike(Request $request, $taskerId)
{
    $request->validate([
        'is_like' => 'nullable|boolean'  // Allow null to remove the vote
    ]);

    $userId = Auth::id();
    
    // Check if user already has a like/dislike for this tasker
    $existingLike = Like::where('user_id', $userId)
                        ->where('tasker_id', $taskerId)
                        ->first();

    // If is_like is null, we're removing the vote
    if ($request->is_like === null) {
        if ($existingLike) {
            $existingLike->delete();
        }
    } else {
        // Update or create the like/dislike
        Like::updateOrCreate(
            [
                'user_id' => $userId,
                'tasker_id' => $taskerId
            ],
            [
                'is_like' => $request->is_like
            ]
        );
    }

    return response()->json([
        'success' => true,
        'likes_count' => Like::where('tasker_id', $taskerId)->where('is_like', true)->count(),
        'dislikes_count' => Like::where('tasker_id', $taskerId)->where('is_like', false)->count()
    ]);
}
   public function getLikes($taskerId)
{
    $userLike = null;
    if (Auth::check()) {
        $like = Like::where('tasker_id', $taskerId)
            ->where('user_id', Auth::id())
            ->first();
        if ($like) {
            $userLike = ['is_like' => (bool)$like->is_like];
        }
    }

    return response()->json([
        'likes_count' => Like::where('tasker_id', $taskerId)->where('is_like', true)->count(),
        'dislikes_count' => Like::where('tasker_id', $taskerId)->where('is_like', false)->count(),
        'user_like' => $userLike
    ]);
}}

