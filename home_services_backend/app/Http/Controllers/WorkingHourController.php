<?php

namespace App\Http\Controllers;

use App\Models\WorkingHour;
use Illuminate\Http\Request;

class WorkingHourController extends Controller
{
    // List all working hours for a tasker
    public function index(Request $request)
    {
        $request->validate([
            'tasker_id' => 'required|exists:taskers,id',
        ]);

        $hours = WorkingHour::where('tasker_id', $request->tasker_id)->get();

        return response()->json($hours);
    }

    // Store new working hours
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tasker_id' => 'required|exists:taskers,id',
            'day_of_week' => 'required|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'is_active' => 'boolean',
        ]);

        $workingHour = WorkingHour::create($validated);

        return response()->json($workingHour, 201);
    }

    // Show a specific working hour
    public function show($id)
    {
        $hour = WorkingHour::findOrFail($id);
        return response()->json($hour);
    }

    // Update working hours
    public function update(Request $request, $id)
    {
        $hour = WorkingHour::findOrFail($id);

        $validated = $request->validate([
            'day_of_week' => 'sometimes|in:monday,tuesday,wednesday,thursday,friday,saturday,sunday',
            'start_time' => 'sometimes|date_format:H:i',
            'end_time' => 'sometimes|date_format:H:i|after:start_time',
            'is_active' => 'sometimes|boolean',
        ]);

        $hour->update($validated);

        return response()->json($hour);
    }

    // Delete working hour
    public function destroy($id)
    {
        $hour = WorkingHour::findOrFail($id);
        $hour->delete();

        return response()->json(['message' => 'Working hour deleted successfully.']);
    }
}
