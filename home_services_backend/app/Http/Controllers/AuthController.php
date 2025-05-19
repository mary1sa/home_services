<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Tasker;
use App\Notifications\NewTaskerRegistered;
use DB;

use Illuminate\Http\Request;
// use Illuminate\Support\Facades\DB;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function registerUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string',
            'last_name'  => 'required|string',
            'email'      => 'required|email|unique:users',
            'password'   => 'required|min:6',
            'phone'      => 'required|string'
        ]);

        if ($validator->fails()) return response()->json($validator->errors(), 422);

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name'  => $request->last_name,
            'email'      => $request->email,
            'password'   => Hash::make($request->password),
            'phone'      => $request->phone,
            'role'       => 'user'
        ]);

        $token = JWTAuth::fromUser($user);
        return response()->json(compact('user', 'token'), 201);
    }

   public function registerTasker(Request $request)
{
    $validator = Validator::make($request->all(), [
        'first_name' => 'required|string',
        'last_name'  => 'required|string',
        'email'      => 'required|email|unique:users',
        'password'   => 'required|min:6',
        'phone'      => 'required|string',
        'city'       => 'required|string',
        'country'    => 'nullable|string',
'cin' => 'required|file|mimes:jpg,jpeg,png|max:2048',
'certificate_police' => 'required|file|mimes:jpg,jpeg,png|max:2048',
'photo' => 'nullable|file|mimes:jpg,jpeg,png|max:2048',        'certificate_police_date' => 'required|date',
        'bio'        => 'nullable|string',
        'experience' => 'nullable|integer',
        'role'       => 'tasker'

    ]);

    if ($validator->fails()) return response()->json($validator->errors(), 422);

    DB::beginTransaction(); 

    try {
        $cinPath = $request->hasFile('cin') ? $request->file('cin')->storeAs('uploads/cin', time().'_cin.'.$request->file('cin')->extension(), 'public') : null;
        $certPath = $request->hasFile('certificate_police') ? $request->file('certificate_police')->storeAs('uploads/certificates', time().'_cert.'.$request->file('certificate_police')->extension(), 'public') : null;
        $photoPath = $request->hasFile('photo') ? $request->file('photo')->storeAs('uploads/photos', time().'_photo.'.$request->file('photo')->extension(), 'public') : null;

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name'  => $request->last_name,
            'email'      => $request->email,
            'password'   => Hash::make($request->password),
            'phone'      => $request->phone,
            'role'       => 'tasker'
        ]);

       
        $tasker = Tasker::create([
            'user_id' => $user->id,
            'city'    => $request->city,
            'country' => $request->country,  
            'cin'     => $cinPath,
            'certificate_police' => $certPath,
            'certificate_police_date' => $request->certificate_police_date,
            'bio'     => $request->bio, 
            'experience' => $request->experience, 
            'photo'   => $photoPath,  
            'status'  => 'pending',  
        ]);
   $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new NewTaskerRegistered($tasker));
        }
        DB::commit(); 

        $token = JWTAuth::fromUser($user);
        return response()->json(compact('user', 'tasker', 'token'), 201);

    } catch (\Exception $e) {
        DB::rollBack(); 
        return response()->json(['error' => $e->getMessage()], 500);
    }
}


 public function login(Request $request)
{
    $credentials = $request->only('email', 'password');

    if (!$token = JWTAuth::attempt($credentials)) {
        return response()->json(['error' => 'Invalid credentials'], 401);
    }

    $user = auth()->user();

    if ($user->role === 'tasker') {
        $tasker = $user->tasker; 

        if ($tasker && $tasker->status !== 'approved') {

            try {
                if (JWTAuth::getToken()) {
                    JWTAuth::invalidate($token);
                }
            } catch (\Exception $e) {
                return response()->json(['error' => 'Error invalidating token: ' . $e->getMessage()], 500);
            }

            return response()->json(['error' => 'Your account is not approved yet.'], 403);
        }
    }

    $user->update(['is_online' => true]);

    return response()->json(compact('user', 'token'));
}


    public function logout()
    {
        $user = auth()->user();
        if ($user) $user->update(['is_online' => false]);

        JWTAuth::invalidate(JWTAuth::getToken());
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me()
    {
        return response()->json(auth()->user());
    }
}

