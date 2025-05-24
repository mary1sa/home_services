<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    

    public function index(Request $request)
    {
        $user = $request->user();
        
        return response()->json([
            'notifications' => $user->notifications()->get(), 
            'unread_count' => $user->unreadNotifications()->count()
        ]);
    }
    
    public function markAsRead($id)
    {
        $notification = auth()->user()->notifications()->where('id', $id)->first();
        
        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        $notification->markAsRead();
        return response()->json(['message' => 'Notification marked as read']);
    }

    public function markAllAsRead()
    {
        auth()->user()->unreadNotifications->markAsRead();
        return response()->json(['message' => 'All notifications marked as read']);
    }
}