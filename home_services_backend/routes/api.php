<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::post('register', [AuthController::class, 'registerUser']);
Route::post('register/tasker', [AuthController::class, 'registerTasker']);
Route::post('login', [AuthController::class, 'login']);
Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:api');
Route::get('me', [AuthController::class, 'me'])->middleware('auth:api');



//users
Route::get('/users/approved-taskers', [UserController::class, 'getApprovedTaskersAndNonTaskers']);

Route::post('/users', [UserController::class, 'store']);

Route::post('/users/{id}', [UserController::class, 'update']); 

Route::delete('/users/{id}', [UserController::class, 'destroy']);