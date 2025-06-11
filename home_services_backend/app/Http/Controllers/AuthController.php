<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Tasker;
use App\Notifications\NewTaskerRegistered;
use App\Notifications\NewUserRegistered;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Mail\PasswordResetMail;
use Illuminate\Support\Facades\Mail;


use Illuminate\Http\Request;
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
        'phone'      => 'required|string',
        'address'    => 'nullable|string',
        'photo'      => 'nullable|file|mimes:jpg,jpeg,png|max:2048',
        'role'       => 'sometimes|in:user,tasker,admin',
    ]);

    if ($validator->fails()) return response()->json($validator->errors(), 422);

    $photoPath = null;
    if ($request->hasFile('photo')) {
        $photoPath = $request->file('photo')->store('photos', 'public');
    }

    $user = User::create([
        'first_name' => $request->first_name,
        'last_name'  => $request->last_name,
        'email'      => $request->email,
        'password'   => Hash::make($request->password),
        'phone'      => $request->phone,
        'address'    => $request->address,
        'photo'      => $photoPath,
        'is_online'  => false, 
        'role'       => $request->role ?? 'user', 
    ]);

    $admins = User::where('role', 'admin')->get();
    foreach ($admins as $admin) {
        $admin->notify(new NewUserRegistered($user));
    }

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
        'address'    => 'nullable|string',
            'photo' => 'nullable|file|mimes:jpg,jpeg,png|max:2048',

            'phone'      => 'required|string',
            'city'       => 'required|string',
            'country'    => 'nullable|string',
            'cin' => 'required|file|mimes:jpg,jpeg,png|max:2048',
            'certificate_police' => 'required|file|mimes:jpg,jpeg,png|max:2048',
            'certificate_police_date' => 'required|date',
            'bio'        => 'nullable|string',
            'experience' => 'nullable|integer',
            'role'       => 'tasker',
             'services'   => 'required|array', 
        'services.*' => 'exists:services,id',
'services.*.experience' => 'required|integer|min:0'
        ]);

        if ($validator->fails()) return response()->json($validator->errors(), 422);

        DB::beginTransaction();

        try {
            $cinPath = $request->hasFile('cin') ? $request->file('cin')->storeAs('uploads/cin', time() . '_cin.' . $request->file('cin')->extension(), 'public') : null;
            $certPath = $request->hasFile('certificate_police') ? $request->file('certificate_police')->storeAs('uploads/certificates', time() . '_cert.' . $request->file('certificate_police')->extension(), 'public') : null;
            $photoPath = $request->hasFile('photo') ? $request->file('photo')->storeAs('uploads/photos', time() . '_photo.' . $request->file('photo')->extension(), 'public') : null;

            $user = User::create([
                'first_name' => $request->first_name,
                'last_name'  => $request->last_name,
                'email'      => $request->email,
                'password'   => Hash::make($request->password),
                'phone'      => $request->phone,
                 'address' => $request->address,
                'role'       => 'tasker',
                'photo'   => $photoPath,

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
                'status'  => 'pending',
            ]);
    $servicesWithExperience = [];
        foreach ($request->services as $service) {
            $servicesWithExperience[$service['id']] = ['experience' => $service['experience']];
        }
        $tasker->services()->attach($servicesWithExperience);
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

    // Forgot Password method
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ], [
            'email.required' => 'The email address is required.',
            'email.email' => 'The email address is invalid.',
            'email.exists' => 'No account matches this email address.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::where('email', $request->email)->first();
            $token = Str::random(60);

            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                [
                    'token' => Hash::make($token),
                    'created_at' => now()
                ]
            );

            $resetUrl = url(config('app.frontend_url') . '/reset-password?token=' . $token . '&email=' . $user->email);
            Mail::to($user->email)->send(new PasswordResetMail($resetUrl));

            return response()->json([
                'success' => true,
                'message' => 'Password reset link has been sent to your email'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process password reset request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Reset Password method
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|string|min:6|confirmed',
        ], [
            'token.required' => 'The token is required.',
            'email.required' => 'The email address is required.',
            'email.email' => 'The email address is invalid.',
            'password.required' => 'The password is required.',
            'password.min' => 'The password must be at least 6 characters.',
            'password.confirmed' => 'The password confirmation does not match.'
        ]);



        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $resetRecord = DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->first();

            if (!$resetRecord || !Hash::check($request->token, $resetRecord->token)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired token'
                ], 400);
            }

            $tokenExpired = now()->subMinutes(60)->gt($resetRecord->created_at);
            if ($tokenExpired) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token has expired'
                ], 400);
            }

            $user = User::where('email', $request->email)->first();
            $user->password = Hash::make($request->password);
            $user->save();

            DB::table('password_reset_tokens')->where('email', $request->email)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Password has been reset successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reset password',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
