<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Tasker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TaskerController extends Controller
{
    // Get all taskers
    public function index()
    {
        return response()->json(Tasker::with('user','portfolioImages','services')->get());
    }
public function taskers($id)
{
    $service = Service::with('taskers.user')->findOrFail($id);
    
    return response()->json( $service);
}
    // Store a new tasker
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'country' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'cin' => 'required|string|max:100|unique:taskers,cin',
            'certificate_police' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'certificate_police_date' => 'required|date',
            'bio' => 'nullable|string',
            'experience' => 'nullable|integer|min:0',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'status' => 'in:pending,approved,rejected',
        ]);

        if ($request->hasFile('certificate_police')) {
            $validated['certificate_police'] = $request->file('certificate_police')->store('certificates', 'public');
        }

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('photos', 'public');
        }

        $tasker = Tasker::create($validated);

        return response()->json($tasker, 201);
    }

    // Get a single tasker
    public function show($id)
    {
        $tasker = Tasker::with('user')->findOrFail($id);
        return response()->json($tasker);
    }

    // Update an existing tasker
    public function update(Request $request, $id)
    {
        $tasker = Tasker::findOrFail($id);

        $validated = $request->validate([
            'country' => 'nullable|string|max:255',
            'city' => 'sometimes|required|string|max:255',
            'cin' => 'sometimes|required|string|max:100|unique:taskers,cin,' . $tasker->id,
            'certificate_police' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'certificate_police_date' => 'sometimes|required|date',
            'bio' => 'nullable|string',
            'experience' => 'nullable|integer|min:0',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'status' => 'in:pending,approved,rejected',
        ]);

        if ($request->hasFile('certificate_police')) {
            if ($tasker->certificate_police) {
                Storage::disk('public')->delete($tasker->certificate_police);
            }
            $validated['certificate_police'] = $request->file('certificate_police')->store('certificates', 'public');
        }

        if ($request->hasFile('photo')) {
            if ($tasker->photo) {
                Storage::disk('public')->delete($tasker->photo);
            }
            $validated['photo'] = $request->file('photo')->store('photos', 'public');
        }

        $tasker->update($validated);

        return response()->json($tasker);
    }

    // Delete a tasker
    public function destroy($id)
    {
        $tasker = Tasker::findOrFail($id);

        if ($tasker->certificate_police) {
            Storage::disk('public')->delete($tasker->certificate_police);
        }

        if ($tasker->photo) {
            Storage::disk('public')->delete($tasker->photo);
        }

        $tasker->delete();

        return response()->json(['message' => 'Tasker deleted successfully']);
    }






    public function pending()
{
    return response()->json(Tasker::with('user')
        ->where('status', 'pending')
        ->get());
}


  public function approve($id)
    {
        $tasker = Tasker::findOrFail($id);
        
        $tasker->update([
            'status' => 'approved',
            'rejection_reason' => null 
        ]);

        return response()->json([
            'message' => 'Tasker approved successfully',
            'tasker' => $tasker
        ]);
    }

    public function reject(Request $request, $id)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:500'
        ]);

        $tasker = Tasker::findOrFail($id);
        
        $tasker->update([
            'status' => 'rejected',
            'rejection_reason' => $request->rejection_reason
        ]);

        return response()->json([
            'message' => 'Tasker rejected successfully',
            'tasker' => $tasker
        ]);
    }



    // Get all distinct cities where taskers are available
public function getCities()
{
    try {
        $cities = Tasker::whereNotNull('city')
                       ->where('city', '!=', '')
                       ->where('status', 'approved') // Only approved taskers
                       ->distinct()
                       ->pluck('city');
        
        return response()->json($cities);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to fetch cities',
            'error' => $e->getMessage()
        ], 500);
    }
}


}
