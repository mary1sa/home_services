<?php

namespace App\Http\Controllers;

use App\Models\Availability;
use Illuminate\Http\Request;

class AvailabilityController extends Controller
{
    // List all availabilities (optionally filter by tasker)
    public function index(Request $request)
    {
        $query = Availability::with('tasker');

        if ($request->has('tasker_id')) {
            $query->where('tasker_id', $request->input('tasker_id'));
        }

        return response()->json($query->get());
    }

    // Store a new availability
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tasker_id' => 'required|exists:taskers,id',
            'available_date' => 'required|date',
            'start_time' => 'required|date_format:H:i:s',
            'end_time' => 'required|date_format:H:i:s|after:start_time',
        ]);

        $availability = Availability::create($validated);

        return response()->json($availability, 201);
    }

    // Show a specific availability
    public function show($id)
    {
        $availability = Availability::with('tasker')->findOrFail($id);
        return response()->json($availability);
    }

    // Update an availability
    public function update(Request $request, $id)
    {
        $availability = Availability::findOrFail($id);

        $validated = $request->validate([
            'available_date' => 'sometimes|date',
            'start_time' => 'sometimes|date_format:H:i:s',
            'end_time' => 'sometimes|date_format:H:i:s|after:start_time',
        ]);

        $availability->update($validated);

        return response()->json($availability);
    }

    // Delete an availability
    public function destroy($id)
    {
        $availability = Availability::findOrFail($id);
        $availability->delete();

        return response()->json(['message' => 'Availability deleted successfully']);
    }
}
