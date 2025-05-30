<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Storage;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
public function index()
{
    $users = User::whereDoesntHave('tasker')  
                ->orWhereHas('tasker', function($query) {
                    $query->where('status', 'approved'); 
                })
                
                ->get();
    
    return response()->json($users);
}

   
   public function store(Request $request)
{
    $request->validate([
        'first_name' => 'required|string|max:255',
        'last_name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => ['required', Rules\Password::defaults()],
        'phone' => 'required|string|max:20',
        'address' => 'nullable|string|max:255',
        'role' => 'sometimes|in:user,tasker,admin',
    ]);

    $user = User::create([
        'first_name' => $request->first_name,
        'last_name'  => $request->last_name,
        'email'      => $request->email,
        'password'   => Hash::make($request->password),
        'phone'      => $request->phone,
        'address'    => $request->address,
        'role'       => $request->role ?? 'user',
    ]);

    if ($user->role === 'tasker') {
        $request->validate([
            'city' => 'required|string',
            'cin' => 'required|file|mimes:jpg,jpeg,png',
            'certificate_police' => 'required|file|mimes:jpg,jpeg,png',
            'certificate_police_date' => 'required|date',
            'bio' => 'nullable|string',
            'experience' => 'nullable|integer',
            'photo' => 'nullable|file|mimes:jpg,jpeg,png',
            'country' => 'nullable|string',
        ]);

        // Store uploaded files
        $photoPath = $request->hasFile('photo') ? 
                     $request->file('photo')->store('taskers/photos', 'public') : null;

        $cinPath = $request->file('cin')->store('taskers/cin', 'public');
        $certificatePath = $request->file('certificate_police')->store('taskers/certificates', 'public');
\Log::info('Authenticated user:', ['user' => auth()->user()]);

        // If the currently authenticated user is admin, approve the tasker
        $status = (auth()->check() && auth()->user()->role === 'admin') ? 'approved' : 'pending';

        // Create tasker profile
        $user->tasker()->create([
            'city' => $request->city,
            'cin' => $cinPath,
            'certificate_police' => $certificatePath,
            'certificate_police_date' => $request->certificate_police_date,
            'bio' => $request->bio,
            'experience' => $request->experience,
            'photo' => $photoPath,
            'country' => $request->country,
            'status' => $status,
        ]);
    }

    return response()->json($user->load('tasker'), 201);
}


   
//    public function show(User $user)
// {
//     return response()->json($user->load('tasker'));
// }


    public function show($id)
{
    $user = User::with('tasker')->findOrFail($id);
    return response()->json($user);
}public function update(Request $request, User $user)
{
    $request->validate([
        'first_name' => 'sometimes|string|max:255',
        'last_name' => 'sometimes|string|max:255',
        'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
        'password' => ['sometimes', Rules\Password::defaults()],
        'phone' => 'sometimes|string|max:20',
        'address' => 'nullable|string|max:255',
        'role' => 'sometimes|in:user,tasker,admin',
        'is_online' => 'sometimes|boolean',
        'city' => 'sometimes|string|max:255',
        'cin' => 'sometimes|string|max:255',
        'certificate_police' => 'sometimes|string|max:255',
        'certificate_police_date' => 'sometimes|date',
        'photo' => 'sometimes|image|mimes:jpeg,png,jpg|max:2048',
        'bio' => 'nullable|string',
        'experience' => 'nullable|string',
        'country' => 'nullable|string',
    ]);

    // Update user data
    $userData = $request->except(['password', 'photo']);
    if ($request->filled('password')) {
        $userData['password'] = Hash::make($request->password);
    }
    $user->update($userData);

    // Handle tasker-specific data
    if ($user->role === 'tasker') {
        $taskerData = $request->only([
            'city', 'cin', 'certificate_police', 'certificate_police_date',
            'bio', 'experience', 'country',
        ]);

        // Handle photo upload
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($user->tasker && $user->tasker->photo) {
                Storage::disk('public')->delete($user->tasker->photo);
            }
            $taskerData['photo'] = $request->file('photo')->store('taskers/photos', 'public');
        }

        // Update or create tasker profile
        if ($user->tasker) {
            $user->tasker->update($taskerData);
        } else {
            $user->tasker()->create($taskerData);
        }
    }

    return response()->json([
        'success' => true,
        'user' => $user->load('tasker'),
        'message' => 'User updated successfully'
    ]);
}
    /**
     */
    public function destroy(User $user)
{
    $user->delete();
    return response()->json(null, 204);
}
   






    
   
}