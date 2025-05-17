<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use Illuminate\Http\Request;

class FaqController extends Controller
{
    // Get all FAQs (optionally filter by status)
    public function index(Request $request)
    {
        $query = Faq::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->get());
    }

    // Store a new FAQ
    public function store(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string|max:255',
            'answer' => 'required|string',
            'status' => 'in:active,inactive',
        ]);

        $faq = Faq::create($validated);

        return response()->json($faq, 201);
    }

    // Show a specific FAQ
    public function show($id)
    {
        $faq = Faq::findOrFail($id);
        return response()->json($faq);
    }

    // Update an FAQ
    public function update(Request $request, $id)
    {
        $faq = Faq::findOrFail($id);

        $validated = $request->validate([
            'question' => 'sometimes|string|max:255',
            'answer' => 'sometimes|string',
            'status' => 'in:active,inactive',
        ]);

        $faq->update($validated);

        return response()->json($faq);
    }

    // Delete an FAQ
    public function destroy($id)
    {
        $faq = Faq::findOrFail($id);
        $faq->delete();

        return response()->json(['message' => 'FAQ deleted successfully.']);
    }
}
