<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Tasker;
use Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

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
            'photo' => 'nullable|file|mimes:jpg,jpeg,png',
        ]);

        DB::beginTransaction();

        try {
            $photoPath = $request->hasFile('photo') ? 
                         $request->file('photo')->store('users/photos', 'public') : null;

            $user = User::create([
                'first_name' => $request->first_name,
                'last_name'  => $request->last_name,
                'email'      => $request->email,
                'password'   => Hash::make($request->password),
                'phone'      => $request->phone,
                'address'    => $request->address,
                'role'       => $request->role ?? 'user',
                'photo'      => $photoPath,
            ]);

            if ($user->role === 'tasker') {
                $request->validate([
                    'city' => 'required|string',
                    'cin' => 'required|file|mimes:jpg,jpeg,png',
                    'certificate_police' => 'required|file|mimes:jpg,jpeg,png',
                    'certificate_police_date' => 'required|date',
                    'bio' => 'nullable|string',
                    'experience' => 'nullable|integer',
                    'country' => 'nullable|string',
                    'services' => 'required|array',
                    'services.*.id' => 'exists:services,id',
                    'services.*.experience' => 'required|integer|min:0'
                ]);

                $cinPath = $request->file('cin')->store('taskers/cin', 'public');
                $certificatePath = $request->file('certificate_police')->store('taskers/certificates', 'public');

                $status = (auth()->check() && auth()->user()->role === 'admin') ? 'approved' : 'pending';

                $tasker = $user->tasker()->create([
                    'city' => $request->city,
                    'cin' => $cinPath,
                    'certificate_police' => $certificatePath,
                    'certificate_police_date' => $request->certificate_police_date,
                    'bio' => $request->bio,
                    'experience' => $request->experience,
                    'country' => $request->country,
                    'status' => $status,
                ]);

                // Attach services with experience
                $servicesWithExperience = [];
                foreach ($request->services as $service) {
                    $servicesWithExperience[$service['id']] = ['experience' => $service['experience']];
                }
                $tasker->services()->sync($servicesWithExperience);
            }

            DB::commit();
            return response()->json($user->load('tasker', 'tasker.services'), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
$user=User::with(['tasker.services' => function($query) {
    $query->withPivot('experience');
}])->find($id); 
       return response()->json($user);
    }

    public function update(Request $request, User $user)
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
            'cin' => 'sometimes|file|mimes:jpg,jpeg,png|max:2048',
            'certificate_police' => 'sometimes|file|mimes:jpg,jpeg,png|max:2048',
            'certificate_police_date' => 'sometimes|date',
            'photo' => 'sometimes|image|mimes:jpeg,png,jpg|max:2048',
            'bio' => 'nullable|string',
            'experience' => 'nullable|integer',
            'country' => 'nullable|string',
            'services' => 'sometimes|array',
            'services.*.id' => 'exists:services,id',
            'services.*.experience' => 'required_with:services|integer|min:0'
        ]);

        DB::beginTransaction();

        try {
            // Update user data
            $userData = $request->except(['password', 'photo', 'cin', 'certificate_police', 'services']);
            
            if ($request->filled('password')) {
                $userData['password'] = Hash::make($request->password);
            }
            
            if ($request->hasFile('photo')) {
                if ($user->photo) {
                    Storage::disk('public')->delete($user->photo);
                }
                $userData['photo'] = $request->file('photo')->store('users/photos', 'public');
            }

            $user->update($userData);

            if ($user->role === 'tasker') {
                $taskerData = $request->only([
                    'city', 'certificate_police_date', 'bio', 'experience', 'country'
                ]);

                if ($request->hasFile('cin')) {
                    if ($user->tasker && $user->tasker->cin) {
                        Storage::disk('public')->delete($user->tasker->cin);
                    }
                    $taskerData['cin'] = $request->file('cin')->store('taskers/cin', 'public');
                }

                if ($request->hasFile('certificate_police')) {
                    if ($user->tasker && $user->tasker->certificate_police) {
                        Storage::disk('public')->delete($user->tasker->certificate_police);
                    }
                    $taskerData['certificate_police'] = $request->file('certificate_police')->store('taskers/certificates', 'public');
                }

                if ($user->tasker) {
                    $tasker = $user->tasker;
                    $tasker->update($taskerData);
                    
                    if ($request->has('services')) {
                        $servicesWithExperience = [];
                        foreach ($request->services as $service) {
                            $servicesWithExperience[$service['id']] = ['experience' => $service['experience']];
                        }
                        $tasker->services()->sync($servicesWithExperience);
                    }
                } else {
                    $tasker = $user->tasker()->create($taskerData);
                    
                    if ($request->has('services')) {
                        $servicesWithExperience = [];
                        foreach ($request->services as $service) {
                            $servicesWithExperience[$service['id']] = ['experience' => $service['experience']];
                        }
                        $tasker->services()->attach($servicesWithExperience);
                    }
                }
            }

            DB::commit();
            return response()->json([
                'success' => true,
                'user' => $user->load('tasker', 'tasker.services'),
                'message' => 'User updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(User $user)
    {
        DB::beginTransaction();
        
        try {
            if ($user->tasker) {
                // Delete tasker's files
                if ($user->tasker->cin) {
                    Storage::disk('public')->delete($user->tasker->cin);
                }
                if ($user->tasker->certificate_police) {
                    Storage::disk('public')->delete($user->tasker->certificate_police);
                }
                
                // Detach services
                $user->tasker->services()->detach();
                
                // Delete tasker
                $user->tasker()->delete();
            }
            
            if ($user->photo) {
                Storage::disk('public')->delete($user->photo);
            }
            
            // Delete user
            $user->delete();
            
            DB::commit();
            return response()->json(null, 204);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }













 public function profile()
    {
        $user = Auth::user();
        
        if ($user->role === 'tasker') {
            $user->load(['tasker.services' => function($query) {
                $query->withPivot('experience');
            }]);
        }
        
        return response()->json($user);
    }
 public function updateProfile(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'password' => ['sometimes', Rules\Password::defaults()],
            'phone' => 'sometimes|string|max:20',
            'address' => 'nullable|string|max:255',
            'photo' => 'sometimes|image|mimes:jpeg,png,jpg|max:2048',
            // Tasker-specific fields
            'city' => $user->role === 'tasker' ? 'sometimes|string|max:255' : '',
            'cin' => $user->role === 'tasker' ? 'sometimes|file|mimes:jpg,jpeg,png|max:2048' : '',
            'certificate_police' => $user->role === 'tasker' ? 'sometimes|file|mimes:jpg,jpeg,png|max:2048' : '',
            'certificate_police_date' => $user->role === 'tasker' ? 'sometimes|date' : '',
            'bio' => $user->role === 'tasker' ? 'nullable|string' : '',
            'experience' => $user->role === 'tasker' ? 'nullable|integer' : '',
            'country' => $user->role === 'tasker' ? 'nullable|string' : '',
            'services' => $user->role === 'tasker' ? 'sometimes|array' : '',
            'services.*.id' => $user->role === 'tasker' ? 'exists:services,id' : '',
            'services.*.experience' => $user->role === 'tasker' ? 'required_with:services|integer|min:0' : ''
        ]);

        DB::beginTransaction();

        try {
            $userData = $request->except(['password', 'photo', 'cin', 'certificate_police', 'services']);
            
            if ($request->filled('password')) {
                $userData['password'] = Hash::make($request->password);
            }
            
            if ($request->hasFile('photo')) {
                if ($user->photo) {
                    Storage::disk('public')->delete($user->photo);
                }
                $userData['photo'] = $request->file('photo')->store('users/photos', 'public');
            }

            $user->update($userData);

            if ($user->role === 'tasker') {
                $taskerData = $request->only([
                    'city', 'certificate_police_date', 'bio', 'experience', 'country'
                ]);

                if ($request->hasFile('cin')) {
                    if ($user->tasker && $user->tasker->cin) {
                        Storage::disk('public')->delete($user->tasker->cin);
                    }
                    $taskerData['cin'] = $request->file('cin')->store('taskers/cin', 'public');
                }

                if ($request->hasFile('certificate_police')) {
                    if ($user->tasker && $user->tasker->certificate_police) {
                        Storage::disk('public')->delete($user->tasker->certificate_police);
                    }
                    $taskerData['certificate_police'] = $request->file('certificate_police')->store('taskers/certificates', 'public');
                }

                if ($user->tasker) {
                    $tasker = $user->tasker;
                    $tasker->update($taskerData);
                    
                    if ($request->has('services')) {
                        $servicesWithExperience = [];
                        foreach ($request->services as $service) {
                            $servicesWithExperience[$service['id']] = ['experience' => $service['experience']];
                        }
                        $tasker->services()->sync($servicesWithExperience);
                    }
                } else {
                    $tasker = $user->tasker()->create($taskerData);
                    
                    if ($request->has('services')) {
                        $servicesWithExperience = [];
                        foreach ($request->services as $service) {
                            $servicesWithExperience[$service['id']] = ['experience' => $service['experience']];
                        }
                        $tasker->services()->attach($servicesWithExperience);
                    }
                }
            }

            DB::commit();
            return response()->json([
                'success' => true,
                'user' => $user->fresh()->load('tasker', 'tasker.services'),
                'message' => 'Profile updated successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    
}