<?php

namespace App\Http\Controllers;

use App\Models\AdminLog;
use Illuminate\Http\Request;

class AdminLogController extends Controller
{
    // List all logs
    public function index()
    {
        $logs = AdminLog::with('admin')->latest()->get();
        return response()->json($logs);
    }

    // Store a new log entry
    public function store(Request $request)
    {
        $validated = $request->validate([
            'admin_id' => 'required|exists:users,id',
            'action' => 'required|string|max:255',
            'description' => 'required|string',
            'ip_address' => 'nullable|ip',
        ]);

        $log = AdminLog::create($validated);
        return response()->json($log, 201);
    }

    // Show a specific log
    public function show($id)
    {
        $log = AdminLog::with('admin')->findOrFail($id);
        return response()->json($log);
    }

    // Update an existing log 
    public function update(Request $request, $id)
    {
        $log = AdminLog::findOrFail($id);

        $validated = $request->validate([
            'action' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'ip_address' => 'nullable|ip',
        ]);

        $log->update($validated);
        return response()->json($log);
    }

    // Delete a log 
    public function destroy($id)
    {
        $log = AdminLog::findOrFail($id);
        $log->delete();
        return response()->json(['message' => 'Log deleted successfully']);
    }
}
