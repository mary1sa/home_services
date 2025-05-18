<?php

namespace App\Http\Controllers;

use App\Models\Content;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    // List all content sections
    public function index()
    {
        return response()->json(Content::all());
    }

    // Store a new content section
    public function store(Request $request)
    {
        $validated = $request->validate([
            'section_name' => 'required|unique:content,section_name',
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|string|max:255',
            'status' => 'in:active,inactive',
        ]);

        $content = Content::create($validated);

        return response()->json($content, 201);
    }

    // Show a specific content section
    public function show($id)
    {
        $content = Content::findOrFail($id);
        return response()->json($content);
    }

    // Update a content section
    public function update(Request $request, $id)
    {
        $content = Content::findOrFail($id);

        $validated = $request->validate([
            'section_name' => 'sometimes|unique:content,section_name,' . $content->id,
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'image' => 'nullable|string|max:255',
            'status' => 'sometimes|in:active,inactive',
        ]);

        $content->update($validated);

        return response()->json($content);
    }

    // Delete a content section
    public function destroy($id)
    {
        $content = Content::findOrFail($id);
        $content->delete();

        return response()->json(['message' => 'Content deleted successfully']);
    }
}
