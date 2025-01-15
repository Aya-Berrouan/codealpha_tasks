use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\CandleController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\ContactController;

// Test route without middleware
Route::get('/test', function () {
return response()->json(['message' => 'API is working!']);
});

// Public routes
Route::post('/send-faq-email', [FaqController::class, 'sendEmail']);
Route::post('/contact', [ContactController::class, 'sendEmail']);

// Protected routes
Route::middleware(['api'])->group(function () {
Route::post('/generate-candle', [CandleController::class, 'generate']);
});