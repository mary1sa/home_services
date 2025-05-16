<?php

namespace App\Http\Controllers;

use Hash;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Tasker;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
      public function getApprovedTaskersAndNonTaskers()
    {
        $approvedTaskers = Tasker::where('status', 'approved')
            ->with('user')  
            ->get()
            ->map(function ($tasker) {
                $tasker->type = 'tasker'; 
                return $tasker;
            });

        $nonTaskerUsers = User::where('role', '!=', 'tasker')
            ->get()
            ->map(function ($user) {
                $user->type = 'user'; 
                return $user;
            });

        $combined = $approvedTaskers->merge($nonTaskerUsers);

        return response()->json($combined);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string',
            'last_name'  => 'required|string',
            'email'      => 'required|email|unique:users',
            'password'   => 'required|min:6',
            'phone'      => 'required|string',
            'role'       => 'required|in:user,admin,tasker',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        DB::beginTransaction();

        try {
            $user = User::create([
                'first_name' => $request->first_name,
                'last_name'  => $request->last_name,
                'email'      => $request->email,
                'password'   => Hash::make($request->password),
                'phone'      => $request->phone,
                'role'       => $request->role,
            ]);

            if ($request->role === 'tasker') {
                $tasker = Tasker::create([
                    'user_id' => $user->id,
                    'status'  => 'pending',  
                    'city'    => $request->city,
                    'country' => $request->country,
                    'cin'     => $request->hasFile('cin') ? $request->file('cin')->storeAs('uploads/cin', time().'_cin.'.$request->file('cin')->extension(), 'public') : null,
                    'certificate_police' => $request->hasFile('certificate_police') ? $request->file('certificate_police')->storeAs('uploads/certificates', time().'_cert.'.$request->file('certificate_police')->extension(), 'public') : null,
                    'certificate_police_date' => $request->certificate_police_date,
                    'bio'     => $request->bio,
                    'experience' => $request->experience,
                    'photo'   => $request->hasFile('photo') ? $request->file('photo')->storeAs('uploads/photos', time().'_photo.'.$request->file('photo')->extension(), 'public') : null,
                ]);
            }

            DB::commit();

            return response()->json($user, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|required|string',
            'last_name'  => 'sometimes|required|string',
            'email'      => 'sometimes|required|email|unique:users,email,' . $id,
            'password'   => 'sometimes|required|min:6',
            'phone'      => 'sometimes|required|string',
            'role'       => 'sometimes|required|in:user,admin,tasker',
            'city'       => 'sometimes|required|string',
            'country'    => 'sometimes|required|string',
            'certificate_police_date' => 'sometimes|required|date',
            'bio'        => 'sometimes|nullable|string',
            'experience' => 'sometimes|nullable|integer',
            'photo'      => 'sometimes|nullable|file|mimes:jpg,jpeg,png',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

       
        $user->update($request->only('first_name', 'last_name', 'email', 'password', 'phone', 'role'));

        if ($user->role === 'tasker') {
            $tasker = $user->tasker;
            
            $taskerData = $request->only('city', 'country', 'bio', 'experience');
            
            if ($request->hasFile('cin')) {
                $taskerData['cin'] = $request->file('cin')->storeAs('uploads/cin', time().'_cin.'.$request->file('cin')->extension(), 'public');
            }
            if ($request->hasFile('certificate_police')) {
                $taskerData['certificate_police'] = $request->file('certificate_police')->storeAs('uploads/certificates', time().'_cert.'.$request->file('certificate_police')->extension(), 'public');
            }
            if ($request->hasFile('photo')) {
                $taskerData['photo'] = $request->file('photo')->storeAs('uploads/photos', time().'_photo.'.$request->file('photo')->extension(), 'public');
            }

            $tasker->update($taskerData);
        }

        return response()->json($user);
    }



 public function destroy($id)
    {
        DB::beginTransaction();

        try {
            // Find the user by ID
            $user = User::find($id);
            
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            // If the user is a tasker, delete the associated tasker record
            if ($user->role === 'tasker') {
                $tasker = $user->tasker;
                
                // Delete tasker record
                if ($tasker) {
                    $tasker->delete();
                }
            }

            $user->delete();

            DB::commit();

            return response()->json(['message' => 'User deleted successfully']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }



}
