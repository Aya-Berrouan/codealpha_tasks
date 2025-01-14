<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\TestController;
use App\Http\Controllers\ImageGenerationController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\CustomCandleController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\NotificationController;

Log::info('API routes file is being loaded');

// Test and Debug Routes
Route::get('/simple-test', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'API is working',
        'timestamp' => now()
    ]);
});

Route::get('/healthcheck', function () {
    return response()->json([
        'status' => 'ok',
        'routes_file' => __FILE__,
        'timestamp' => now()
    ]);
});

Route::get('/debug-route', function () {
    return response()->json([
        'message' => 'Debug route is working',
        'time' => now()
    ]);
});

Route::get('/ping', function () {
    return ['message' => 'pong'];
});

Route::get('/test', function () {
    return response()->json(['message' => 'API test successful']);
});

Route::get('/controller-test', [TestController::class, 'test']);
Route::get('/debug', [TestController::class, 'debug']);
Route::options('/test', [TestController::class, 'options']);

// Public Authentication Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);

// Public Product and Category Routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/recommended', [ProductController::class, 'recommended']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

// Public Review Routes
Route::get('/reviews', [ReviewController::class, 'index']);
Route::get('/reviews/statistics', [ReviewController::class, 'statistics']);

// Contact Routes
Route::post('/contact', [ContactController::class, 'store']);
Route::post('/send-faq-email', [FaqController::class, 'sendEmail']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    // User Routes
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/users/profile', [UserController::class, 'updateProfile']);
    Route::post('/users/avatar', [UserController::class, 'updateAvatar']);
    Route::put('/users/password', [UserController::class, 'updatePassword']);

    // Notification Routes
    Route::get('/admin/notifications', [NotificationController::class, 'index']);
    Route::post('/admin/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/admin/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/admin/notifications/{id}', [NotificationController::class, 'destroy']);

    // Protected Product Routes
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    Route::delete('products/{product}/images/{image}', [ProductController::class, 'deleteImage']);
    Route::patch('products/{product}/images/{image}/primary', [ProductController::class, 'setPrimaryImage']);

    // Protected Category Routes
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    // Protected Coupon Routes
    Route::get('/coupons', [CouponController::class, 'index']);
    Route::get('/coupons/{coupon}', [CouponController::class, 'show']);
    Route::post('/coupons', [CouponController::class, 'store']);
    Route::put('/coupons/{coupon}', [CouponController::class, 'update']);
    Route::delete('/coupons/{coupon}', [CouponController::class, 'destroy']);

    // Protected Contact Routes (Admin only)
    Route::middleware('admin')->group(function () {
        Route::get('/contact-messages', [ContactController::class, 'index']);
        Route::get('/contact-messages/{id}', [ContactController::class, 'show']);
        Route::put('/contact-messages/{id}', [ContactController::class, 'update']);
        Route::delete('/contact-messages/{id}', [ContactController::class, 'destroy']);
    });

    // Cart Routes
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart', [CartController::class, 'store']);
    Route::put('/cart/{cart}', [CartController::class, 'update']);
    Route::delete('/cart/{cart}', [CartController::class, 'destroy']);
    Route::delete('/cart', [CartController::class, 'clear']);

    // Wishlist Routes
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{wishlist}', [WishlistController::class, 'destroy']);
    Route::delete('/wishlist', [WishlistController::class, 'clear']);

    // Orders
    Route::get('/orders/dashboard-data', [OrderController::class, 'getDashboardData']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}', [OrderController::class, 'update']);
    Route::delete('/orders/{id}', [OrderController::class, 'destroy']);

    // Protected Review Routes
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);
    Route::get('/reviews/{id}', [ReviewController::class, 'show']);

    // User Management Routes
    Route::get('users/statistics', [UserController::class, 'statistics']);
    Route::apiResource('users', UserController::class);

    // Analytics Routes
    Route::get('analytics/dashboard', [AnalyticsController::class, 'getDashboardStats']);
    Route::get('analytics/sales-report', [AnalyticsController::class, 'getSalesReport']);

    // Custom Candles
    Route::post('/custom-candles', [CustomCandleController::class, 'store']);

    // Payment routes
    Route::post('/payment/create-intent', [PaymentController::class, 'createPaymentIntent']);
});

Route::post('/webhook/stripe', [PaymentController::class, 'handleWebhook']);
