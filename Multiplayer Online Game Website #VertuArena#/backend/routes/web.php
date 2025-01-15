<?php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

// API Routes
Route::prefix('api')->group(function () {
    // Public routes
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
    });
});

// Password Reset Routes
Route::get('/reset-password/{token}', function (string $token) {
    return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/reset-password?token=' . $token);
})->name('password.reset');

Route::post('/reset-password', function (Request $request) {
    return redirect(env('FRONTEND_URL', 'http://localhost:3000') . '/reset-password?' . http_build_query([
        'token' => $request->token,
        'email' => $request->email,
    ]));
})->name('password.update');

// Fallback route
Route::fallback(function () {
    return response()->json([
        'message' => 'Route not found.'
    ], 404);
});
