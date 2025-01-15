<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ReviewController extends Controller
{
    public function store(Request $request)
    {
        try {
            Log::info('Attempting to submit review', [
                'user_id' => Auth::id(),
                'product_id' => $request->product_id,
                'order_id' => $request->order_id
            ]);

            $validator = Validator::make($request->all(), [
                'product_id' => 'required|exists:products,id',
                'order_id' => 'required|exists:orders,id',
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'nullable|string|max:1000'
            ]);

            if ($validator->fails()) {
                Log::warning('Review validation failed', [
                    'errors' => $validator->errors()->toArray()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verify that the user has purchased this product in this order
            $order = Order::with('orderItems')->findOrFail($request->order_id);
            
            if ($order->user_id !== Auth::id()) {
                Log::warning('Unauthorized review attempt', [
                    'user_id' => Auth::id(),
                    'order_user_id' => $order->user_id
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'You can only review products from your own orders'
                ], 403);
            }

            $hasProduct = $order->orderItems->contains('product_id', $request->product_id);
            if (!$hasProduct) {
                Log::warning('Product not found in order', [
                    'product_id' => $request->product_id,
                    'order_id' => $request->order_id
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'This product was not found in the specified order'
                ], 400);
            }

            // Check if review already exists
            $existingReview = Review::where([
                'user_id' => Auth::id(),
                'product_id' => $request->product_id,
                'order_id' => $request->order_id
            ])->first();

            if ($existingReview) {
                Log::warning('Duplicate review attempt', [
                    'review_id' => $existingReview->id
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'You have already reviewed this product for this order'
                ], 400);
            }

            $review = Review::create([
                'user_id' => Auth::id(),
                'product_id' => $request->product_id,
                'order_id' => $request->order_id,
                'rating' => $request->rating,
                'comment' => $request->comment ? trim($request->comment) : null,
                'verified_purchase' => true
            ]);

            // Load relationships with specific fields
            $review->load([
                'user:id,first_name,last_name',
                'product:id,name'
            ]);

            // Update product average rating
            $product = Product::find($request->product_id);
            $avgRating = Review::where('product_id', $request->product_id)->avg('rating');
            $product->update(['average_rating' => round($avgRating, 2)]);

            Log::info('Review submitted successfully', [
                'review_id' => $review->id
            ]);

            // Transform the response
            $response = [
                'id' => $review->id,
                'user_id' => $review->user_id,
                'product_id' => $review->product_id,
                'order_id' => $review->order_id,
                'rating' => $review->rating,
                'comment' => $review->comment,
                'verified_purchase' => $review->verified_purchase,
                'created_at' => $review->created_at,
                'user' => [
                    'id' => $review->user->id,
                    'first_name' => $review->user->first_name,
                    'last_name' => $review->user->last_name,
                ],
                'product' => [
                    'id' => $review->product->id,
                    'name' => $review->product->name,
                ],
            ];

            return response()->json([
                'success' => true,
                'message' => 'Review submitted successfully',
                'review' => $response
            ]);

        } catch (\Exception $e) {
            Log::error('Error submitting review: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'product_id' => $request->product_id ?? null,
                'order_id' => $request->order_id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error submitting review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function index(Request $request)
    {
        try {
            Log::info('Fetching reviews', [
                'product_id' => $request->product_id,
                'user_id' => $request->user_id,
                'rating' => $request->rating
            ]);

            $query = Review::with(['user:id,first_name,last_name', 'product:id,name'])
                ->select(['id', 'user_id', 'product_id', 'order_id', 'rating', 'comment', 'verified_purchase', 'created_at'])
                ->when($request->product_id, function($q) use ($request) {
                    return $q->where('product_id', $request->product_id);
                })
                ->when($request->user_id, function($q) use ($request) {
                    return $q->where('user_id', $request->user_id);
                })
                ->when($request->rating, function($q) use ($request) {
                    return $q->where('rating', $request->rating);
                })
                ->orderBy('created_at', 'desc');

            $perPage = min($request->get('per_page', 10), 50); // Limit max per page to 50
            $reviews = $query->paginate($perPage);

            // Transform the data to include only necessary fields
            $reviews->getCollection()->transform(function ($review) {
                return [
                    'id' => $review->id,
                    'user_id' => $review->user_id,
                    'product_id' => $review->product_id,
                    'order_id' => $review->order_id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'verified_purchase' => $review->verified_purchase,
                    'created_at' => $review->created_at,
                    'user' => [
                        'id' => $review->user->id,
                        'first_name' => $review->user->first_name,
                        'last_name' => $review->user->last_name,
                    ],
                    'product' => [
                        'id' => $review->product->id,
                        'name' => $review->product->name,
                    ],
                ];
            });

            return response()->json([
                'success' => true,
                'reviews' => $reviews
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching reviews: ' . $e->getMessage(), [
                'product_id' => $request->product_id ?? null,
                'user_id' => $request->user_id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error fetching reviews',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $review = Review::with(['user', 'product', 'order'])
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'review' => $review
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching review: ' . $e->getMessage(), [
                'review_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Review not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $review = Review::findOrFail($id);

            // Only allow users to update their own reviews
            if ($review->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'rating' => 'required|integer|min:1|max:5',
                'comment' => 'nullable|string|max:1000'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $review->update([
                'rating' => $request->rating,
                'comment' => $request->comment
            ]);

            // Update product average rating
            $avgRating = Review::where('product_id', $review->product_id)->avg('rating');
            $review->product->update(['average_rating' => $avgRating]);

            return response()->json([
                'success' => true,
                'message' => 'Review updated successfully',
                'review' => $review->load(['user', 'product'])
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating review: ' . $e->getMessage(), [
                'review_id' => $id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error updating review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $review = Review::findOrFail($id);
            $user = Auth::user();

            // Allow admins to delete any review, but regular users can only delete their own
            if ($user->role !== 'admin' && $review->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $review->delete();

            // Update product average rating
            $avgRating = Review::where('product_id', $review->product_id)->avg('rating');
            $review->product->update(['average_rating' => $avgRating]);

            return response()->json([
                'success' => true,
                'message' => 'Review deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting review: ' . $e->getMessage(), [
                'review_id' => $id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error deleting review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function statistics(Request $request)
    {
        try {
            Log::info('Fetching review statistics', [
                'product_id' => $request->product_id
            ]);

            $query = Review::query();

            if ($request->product_id) {
                $query->where('product_id', $request->product_id);
            }

            $totalReviews = $query->count();
            $avgRating = $totalReviews > 0 ? round($query->avg('rating'), 1) : 0;

            // Clone the query for each rating count to avoid interference
            $stats = [
                'total_reviews' => $totalReviews,
                'average_rating' => $avgRating,
                'rating_distribution' => [
                    5 => (clone $query)->where('rating', 5)->count(),
                    4 => (clone $query)->where('rating', 4)->count(),
                    3 => (clone $query)->where('rating', 3)->count(),
                    2 => (clone $query)->where('rating', 2)->count(),
                    1 => (clone $query)->where('rating', 1)->count(),
                ]
            ];

            return response()->json([
                'success' => true,
                'statistics' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching review statistics: ' . $e->getMessage(), [
                'product_id' => $request->product_id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error fetching review statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 