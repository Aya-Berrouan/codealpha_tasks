<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;

class TestController extends Controller
{
    public function test()
    {
        Log::info('Test endpoint hit');
        
        return response()->json([
            'message' => 'API is working!',
            'timestamp' => now(),
            'environment' => app()->environment(),
            'debug' => config('app.debug'),
        ], 200, [
            'Content-Type' => 'application/json',
            'Access-Control-Allow-Origin' => 'http://localhost:5173',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type, Accept, Authorization, X-Requested-With',
            'Access-Control-Allow-Credentials' => 'true',
        ]);
    }

    public function debug()
    {
        Log::info('Debug endpoint hit');
        
        return response()->json([
            'routes' => collect(Route::getRoutes())->map(function ($route) {
                return [
                    'uri' => $route->uri(),
                    'methods' => $route->methods(),
                    'name' => $route->getName(),
                    'middleware' => $route->middleware(),
                ];
            }),
            'server' => $_SERVER,
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'debug_mode' => config('app.debug'),
            'environment' => app()->environment(),
        ]);
    }

    public function options()
    {
        Log::info('Options endpoint hit');
        
        return response('', 200)
            ->header('Access-Control-Allow-Origin', 'http://localhost:5173')
            ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With')
            ->header('Access-Control-Allow-Credentials', 'true');
    }
} 