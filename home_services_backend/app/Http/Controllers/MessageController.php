<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    // List all messages 
    public function index()
    {
        return response()->json(Message::with(['sender', 'receiver'])->get());
    }

    // Store a new message
    public function store(Request $request)
    {
        $validated = $request->validate([
            'sender_id' => 'required|exists:users,id',
            'receiver_id' => 'required|exists:taskers,id',
            'message' => 'required|string',
        ]);

        $message = Message::create($validated);

        return response()->json($message, 201);
    }

    // Show a specific message
    public function show($id)
    {
        $message = Message::with(['sender', 'receiver'])->findOrFail($id);
        return response()->json($message);
    }

    // Update a message 
    public function update(Request $request, $id)
    {
        $message = Message::findOrFail($id);

        $validated = $request->validate([
            'message' => 'required|string',
        ]);

        $message->update($validated);

        return response()->json($message);
    }

    // Delete a message
    public function destroy($id)
    {
        $message = Message::findOrFail($id);
        $message->delete();

        return response()->json(['message' => 'Message deleted successfully']);
    }
}
