<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TestController;
use App\Http\Controllers\ImageGenerationController;

// Original web routes
Route::get('/', function () {
    return response()->json(['message' => 'Laravel is working!']);
});

Route::get('/test', function () {
    return response()->json(['message' => 'Test route is working!']);
});

// API routes (temporary, for testing)
Route::prefix('api')->group(function () {
    // Simple test route
    Route::get('/simple-test', function() {
        return response()->json([
            'status' => 'ok',
            'message' => 'API is working',
            'timestamp' => now()
        ]);
    });

    // Routes check
    Route::get('/routes-check', function() {
        $routes = collect(Route::getRoutes())->map(function ($route) {
            return [
                'method' => $route->methods(),
                'uri' => $route->uri(),
                'name' => $route->getName(),
                'action' => $route->getActionName(),
            ];
        });

        return response()->json([
            'status' => 'Routes are working',
            'time' => now(),
            'registered_routes' => $routes
        ]);
    });

    // Test routes
    Route::get('/test', function () {
        return response()->json(['message' => 'API test successful']);
    });

    Route::get('/debug', [TestController::class, 'debug']);
    Route::post('/generate-candle', [ImageGenerationController::class, 'generate']);
});

// Debug route to show all registered routes
Route::get('/debug-routes', function () {
    $routes = collect(Route::getRoutes())->map(function ($route) {
        return [
            'uri' => $route->uri(),
            'methods' => $route->methods(),
            'name' => $route->getName(),
            'action' => $route->getActionName(),
        ];
    });

    return response()->json([
        'total_routes' => $routes->count(),
        'routes' => $routes->toArray(),
        'api_file_exists' => file_exists(base_path('routes/api.php')),
        'api_file_path' => base_path('routes/api.php'),
    ]);
});
