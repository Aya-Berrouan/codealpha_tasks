<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        try {
            Log::info('Fetching wishlist items for user: ' . $request->user()->id);
            
            $wishlistItems = Wishlist::with(['product' => function($query) {
                $query->select('id', 'name', 'description', 'price', 'image', 'category_id', 'stock', 'status')
                    ->with(['images' => function($q) {
                        $q->where('is_primary', true);
                    }]);
            }, 'product.category'])
            ->where('user_id', $request->user()->id)
            ->get();

            if ($wishlistItems->isEmpty()) {
                return response()->json([]);
            }

            $formattedItems = $wishlistItems->map(function ($item) {
                if (!$item->product) {
                    Log::warning('Product not found for wishlist item: ' . $item->id);
                    return null;
                }

                // Get the image path
                $imagePath = $item->product->image;
                if ($item->product->images->isNotEmpty()) {
                    $primaryImage = $item->product->images->first();
                    $imagePath = $primaryImage->image;
                    Log::info('Using primary image for product ' . $item->product->id . ': ' . $imagePath);
                } else {
                    Log::info('Using default image for product ' . $item->product->id . ': ' . $imagePath);
                }

                $fullImageUrl = asset('storage/' . $imagePath);
                Log::info('Full image URL: ' . $fullImageUrl);

                return [
                    'id' => $item->id,
                    'product' => [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'description' => $item->product->description,
                        'price' => $item->product->price,
                        'image' => $imagePath,
                        'image_url' => $fullImageUrl,
                        'category' => $item->product->category ? $item->product->category->name : 'Uncategorized',
                        'stock' => $item->product->stock,
                        'status' => $item->product->status,
                    ],
                    'created_at' => $item->created_at
                ];
            })->filter()->values();

            Log::info('Formatted ' . $formattedItems->count() . ' wishlist items');
            return response()->json($formattedItems);

        } catch (\Exception $e) {
            Log::error('Wishlist index error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'Failed to fetch wishlist items',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'product_id' => 'required|exists:products,id'
            ]);

            // Check if product exists and load its category and primary image
            $product = Product::with(['category', 'images' => function($query) {
                $query->where('is_primary', true);
            }])->find($request->product_id);

            if (!$product) {
                return response()->json([
                    'message' => 'Product not found'
                ], 404);
            }

            // Check if item is already in wishlist
            $existingItem = Wishlist::where('user_id', $request->user()->id)
                ->where('product_id', $request->product_id)
                ->first();

            if ($existingItem) {
                return response()->json([
                    'message' => 'Product is already in wishlist'
                ], 409);
            }

            $wishlist = Wishlist::create([
                'user_id' => $request->user()->id,
                'product_id' => $request->product_id
            ]);

            // Get the image path
            $imagePath = $product->image;
            if ($product->images->isNotEmpty()) {
                $primaryImage = $product->images->first();
                $imagePath = $primaryImage->image;
            }

            $wishlistItem = [
                'id' => $wishlist->id,
                'product' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'price' => $product->price,
                    'image' => $imagePath,
                    'image_url' => asset('storage/' . $imagePath),
                    'category' => $product->category ? $product->category->name : 'Uncategorized',
                    'stock' => $product->stock,
                    'status' => $product->status,
                ],
                'created_at' => $wishlist->created_at
            ];

            return response()->json([
                'message' => 'Product added to wishlist',
                'data' => $wishlistItem
            ], 201);

        } catch (\Exception $e) {
            Log::error('Wishlist store error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'Failed to add product to wishlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Request $request, Wishlist $wishlist)
    {
        try {
            if ($wishlist->user_id !== $request->user()->id) {
                return response()->json([
                    'message' => 'Unauthorized'
                ], 403);
            }

            $wishlist->delete();

            return response()->json([
                'message' => 'Item removed from wishlist'
            ]);

        } catch (\Exception $e) {
            Log::error('Wishlist destroy error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'Failed to remove item from wishlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function clear(Request $request)
    {
        try {
            Wishlist::where('user_id', $request->user()->id)->delete();

            return response()->json([
                'message' => 'Wishlist cleared'
            ]);

        } catch (\Exception $e) {
            Log::error('Wishlist clear error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'Failed to clear wishlist',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 