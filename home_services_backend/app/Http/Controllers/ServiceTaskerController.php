<?php

namespace App\Http\Controllers;

use App\Models\Tasker;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceTaskerController extends Controller
{
    // List all services for a specific tasker
    public function index($taskerId)
    {
        $tasker = Tasker::with('services')->findOrFail($taskerId);
        return response()->json($tasker->services);
    }

    // Attach one or more services to a tasker
    public function attachServices(Request $request, $taskerId)
    {
        $tasker = Tasker::findOrFail($taskerId);

        $validated = $request->validate([
            'service_ids' => 'required|array',
            'service_ids.*' => 'exists:services,id',
        ]);

        $tasker->services()->attach($validated['service_ids']);

        return response()->json(['message' => 'Services attached successfully']);
    }

    // Detach one or more services from a tasker
    public function detachServices(Request $request, $taskerId)
    {
        $tasker = Tasker::findOrFail($taskerId);

        $validated = $request->validate([
            'service_ids' => 'required|array',
            'service_ids.*' => 'exists:services,id',
        ]);

        $tasker->services()->detach($validated['service_ids']);

        return response()->json(['message' => 'Services detached successfully']);
    }

    // Sync all services (overwrite)
    public function syncServices(Request $request, $taskerId)
    {
        $tasker = Tasker::findOrFail($taskerId);

        $validated = $request->validate([
            'service_ids' => 'required|array',
            'service_ids.*' => 'exists:services,id',
        ]);

        $tasker->services()->sync($validated['service_ids']);

        return response()->json(['message' => 'Services synced successfully']);
    }
}
