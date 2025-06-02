<?php

use App\Http\Controllers\LikeController;
use App\Models\User;
use App\Notifications\TestNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PanierController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\TaskerController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\AdminLogController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\ReviewReplyController;
use App\Http\Controllers\WorkingHourController;
use App\Http\Controllers\AvailabilityController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\CompanyReviewController;
use App\Http\Controllers\PromotionCodeController;
use App\Http\Controllers\ServiceReviewController;
use App\Http\Controllers\PortfolioImageController;

// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::post('register-user', [AuthController::class, 'registerUser']);
Route::post('register-tasker', [AuthController::class, 'registerTasker']);
Route::post('login', [AuthController::class, 'login']);


Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:api');
Route::get('me', [AuthController::class, 'me'])->middleware('auth:api');

Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);




//users
Route::prefix('users')->group(function () {
    Route::get('/', [UserController::class, 'index']);
    Route::post('/', [UserController::class, 'store'])->middleware('auth:api');
    Route::get('/{id}', [UserController::class, 'show']);


    Route::put('/{id}', [UserController::class, 'update']);
    Route::delete('/{user}', [UserController::class, 'destroy']);
});


//companies
Route::apiResource('companies', CompanyController::class);

// taskers
Route::get('/services/{id}/taskers', [TaskerController::class, 'taskers']);
Route::get('taskerspending', [TaskerController::class, 'pending']);
Route::post('taskersapprove/{id}', [TaskerController::class, 'approve']);
Route::post('taskersreject/{id}', [TaskerController::class, 'reject']);
Route::apiResource('taskers', TaskerController::class);


Route::get('/cities', [TaskerController::class, 'getCities']);

// categories
Route::get('/categories/{id}/services', [CategoryController::class, 'getCategoryWithServices']);
Route::apiResource('categories', CategoryController::class);

// portfolio images
Route::apiResource('portfolio-images', PortfolioImageController::class);

// promotions
Route::apiResource('promotions', PromotionController::class);

// services 
Route::apiResource('services', ServiceController::class);

// bookings
Route::apiResource('bookings', BookingController::class);

// invoices
Route::apiResource('invoices', InvoiceController::class);

// payments
Route::apiResource('payments', PaymentController::class);

// content
Route::apiResource('contents', ContentController::class);

// messages
Route::apiResource('messages', MessageController::class);

// reviews
Route::apiResource('reviews', ReviewController::class);

// review replies
Route::apiResource('review-replies', ReviewReplyController::class);

// availability
Route::apiResource('availabilities', AvailabilityController::class);

// notifications
Route::middleware('auth:api')->prefix('notifications')->group(function () {
    Route::get('/', [NotificationController::class, 'index']);
    Route::get('/unread', [NotificationController::class, 'unread']);
    Route::post('/mark-as-read/{id}', [NotificationController::class, 'markAsRead']);
    Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/{id}', [NotificationController::class, 'destroy']);
    Route::delete('/', [NotificationController::class, 'clearAll']);
});
// locations
Route::middleware('auth:api')->group(function(){

Route::apiResource('locations', LocationController::class);
});
// working hours
Route::apiResource('working-hours', WorkingHourController::class);

// service reviews
Route::apiResource('service-reviews', ServiceReviewController::class);

// company reviews
Route::apiResource('company-reviews', CompanyReviewController::class);

// faqs
Route::apiResource('faqs', FaqController::class);

// promotion codes
Route::apiResource('promotion-codes', PromotionCodeController::class);

// paniers
Route::middleware('auth:api')->group(function(){

Route::apiResource('paniers', PanierController::class);
    Route::get('/paniers/check/{taskerId}', [PanierController::class, 'check']);
});
// admin logs
Route::apiResource('admin-logs', AdminLogController::class);
Route::middleware('auth:api')->group(function(){
     Route::post('/taskers/{taskerId}/like', [LikeController::class, 'toggleLike']);
 Route::get('/taskers/{taskerId}/likes', [LikeController::class, 'getLikes']);
});
