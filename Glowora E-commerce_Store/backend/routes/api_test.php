<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TestController;

Route::get('/test', function () {
    return response()->json([
        'message' => 'API is working',
        'timestamp' => now(),
        'environment' => config('app.env')
    ]);
});

Route::get('/controller-test', [TestController::class, 'test']);
Route::get('/debug', [TestController::class, 'debug']);
Route::options('/test', [TestController::class, 'options']);
