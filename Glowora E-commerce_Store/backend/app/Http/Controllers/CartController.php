<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Product;
use App\Models\CustomCandle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    public function index(Request $request)
    {
        try {
            Log::info('Fetching cart items for user: ' . $request->user()->id);

            $cartItems = Cart::with(['product' => function ($query) {
                $query->select('id', 'name', 'description', 'price', 'image', 'category_id', 'stock', 'status');
            }, 'product.category', 'product.primaryImage', 'customCandle'])
                ->where('user_id', $request->user()->id)
                ->get();

            Log::info('Cart items found: ' . $cartItems->count());

            if ($cartItems->isEmpty()) {
                return response()->json([]);
            }

            $formattedItems = $cartItems->map(function ($item) {
                if (!$item->product && !$item->customCandle) {
                    Log::warning('Neither product nor custom candle found for cart item: ' . $item->id);
                    return null;
                }

                if ($item->product) {
                    $imagePath = $item->product->primaryImage
                        ? basename($item->product->primaryImage->image)
                        : basename($item->product->image ?? 'default.jpg');

                    return [
                        'id' => $item->id,
                        'quantity' => $item->quantity,
                        'product' => [
                            'id' => $item->product->id,
                            'name' => $item->product->name,
                            'description' => $item->product->description,
                            'price' => $item->product->price,
                            'image' => $imagePath,
                            'image_url' => url('storage/products/' . $imagePath),
                            'category' => $item->product->category ? $item->product->category->name : 'Uncategorized',
                            'stock' => $item->product->stock,
                            'status' => $item->product->status,
                        ],
                        'type' => 'product',
                        'created_at' => $item->created_at
                    ];
                } else {
                    return [
                        'id' => $item->id,
                        'quantity' => $item->quantity,
                        'custom_candle' => [
                            'id' => $item->customCandle->id,
                            'name' => $item->customCandle->name,
                            'description' => $item->customCandle->description,
                            'price' => $item->customCandle->price,
                            'image_url' => $item->customCandle->image_url,
                            'scent_name' => $item->customCandle->scent_name,
                            'jar_style' => $item->customCandle->jar_style,
                            'custom_label' => $item->customCandle->custom_label,
                            'custom_details' => $item->customCandle->custom_details,
                        ],
                        'type' => 'custom_candle',
                        'created_at' => $item->created_at
                    ];
                }
            })->filter()->values();

            Log::info('Formatted items count: ' . $formattedItems->count());
            return response()->json($formattedItems);
        } catch (\Exception $e) {
            Log::error('Cart index error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'message' => 'Failed to fetch cart items',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            Log::info('Adding item to cart - Request data:', $request->all());

            // Validate the request
            try {
                $validated = $request->validate([
                    'product_id' => 'required_without:custom_candle|exists:products,id|nullable',
                    'custom_candle' => 'required_without:product_id|array|nullable',
                    'custom_candle.name' => 'required_with:custom_candle',
                    'custom_candle.price' => 'required_with:custom_candle|numeric|min:0',
                    'custom_candle.scent_name' => 'required_with:custom_candle|string',
                    'custom_candle.jar_style' => 'required_with:custom_candle|string',
                    'quantity' => 'required|integer|min:1'
                ]);
                Log::info('Validation passed', $validated);
            } catch (\Illuminate\Validation\ValidationException $e) {
                Log::error('Validation failed:', $e->errors());
                throw $e;
            }

            $userId = Auth::id();
            Log::info('User ID: ' . $userId);

            // Handle custom candle creation if provided
            $customCandleId = null;
            if ($request->has('custom_candle')) {
                Log::info('Creating custom candle with data:', [
                    'name' => $request->input('custom_candle.name'),
                    'price' => $request->input('custom_candle.price'),
                    'scent_name' => $request->input('custom_candle.scent_name'),
                    'jar_style' => $request->input('custom_candle.jar_style')
                ]);

                try {
                    $customCandle = CustomCandle::create([
                        'name' => $request->input('custom_candle.name'),
                        'price' => floatval($request->input('custom_candle.price')),
                        'description' => $request->input('custom_candle.description', ''),
                        'image_url' => $request->input('custom_candle.image_url', ''),
                        'scent_name' => $request->input('custom_candle.scent_name'),
                        'jar_style' => $request->input('custom_candle.jar_style'),
                        'custom_label' => $request->input('custom_candle.custom_label', ''),
                        'custom_details' => $request->input('custom_candle.custom_details', []),
                        'user_id' => $userId
                    ]);
                    $customCandleId = $customCandle->id;
                    Log::info('Custom candle created with ID: ' . $customCandleId);
                } catch (\Exception $e) {
                    Log::error('Failed to create custom candle: ' . $e->getMessage());
                    Log::error('SQL Error: ' . $e->getPrevious()?->getMessage());
                    throw new \Exception('Failed to create custom candle: ' . $e->getMessage());
                }
            }

            // Check if the item already exists in the cart
            Log::info('Checking for existing cart item');
            $existingItem = Cart::where('user_id', $userId)
                ->where(function ($query) use ($request, $customCandleId) {
                    if ($request->product_id) {
                        $query->where('product_id', $request->product_id)
                            ->whereNull('custom_candle_id');
                    } else {
                        $query->where('custom_candle_id', $customCandleId)
                            ->whereNull('product_id');
                    }
                })
                ->first();

            if ($existingItem) {
                Log::info('Updating existing cart item');
                $existingItem->quantity += $request->quantity;
                $existingItem->save();
                $item = $existingItem;
            } else {
                Log::info('Creating new cart item');
                try {
                    $cartData = [
                        'user_id' => $userId,
                        'quantity' => $request->quantity
                    ];

                    if ($request->has('custom_candle')) {
                        $cartData['custom_candle_id'] = $customCandleId;
                        $cartData['product_id'] = null;
                    } else {
                        $cartData['product_id'] = $request->product_id;
                        $cartData['custom_candle_id'] = null;
                    }

                    $item = Cart::create($cartData);
                    Log::info('New cart item created with ID: ' . $item->id);
                } catch (\Exception $e) {
                    Log::error('Failed to create cart item: ' . $e->getMessage());
                    Log::error('SQL Error: ' . $e->getPrevious()?->getMessage());
                    throw new \Exception('Failed to create cart item: ' . $e->getMessage());
                }
            }

            // Load the relationships
            $item->load(['product', 'customCandle']);
            Log::info('Cart item created/updated successfully');

            return response()->json([
                'message' => 'Item added to cart successfully',
                'cart_item' => $item
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to add item to cart: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            Log::error('Request data: ' . json_encode($request->all()));

            return response()->json([
                'message' => 'Failed to add item to cart',
                'error' => $e->getMessage(),
                'details' => 'Please check the data format and try again'
            ], 500);
        }
    }

    public function update(Request $request, Cart $cart)
    {
        try {
            $request->validate([
                'quantity' => 'required|integer|min:1'
            ]);

            if ($cart->user_id !== $request->user()->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $cart->update([
                'quantity' => $request->quantity
            ]);

            $cartItem = Cart::with(['product' => function ($query) {
                $query->select('id', 'name', 'description', 'price', 'image', 'category_id', 'stock', 'status');
            }, 'product.category', 'product.primaryImage'])->find($cart->id);

            if (!$cartItem->product) {
                return response()->json([
                    'message' => 'Product not found'
                ], 404);
            }

            $imagePath = $cartItem->product->primaryImage
                ? basename($cartItem->product->primaryImage->image)
                : basename($cartItem->product->image ?? 'default.jpg');

            $formattedItem = [
                'id' => $cartItem->id,
                'quantity' => $cartItem->quantity,
                'product' => [
                    'id' => $cartItem->product->id,
                    'name' => $cartItem->product->name,
                    'description' => $cartItem->product->description,
                    'price' => $cartItem->product->price,
                    'image' => $imagePath,
                    'image_url' => url('storage/products/' . $imagePath),
                    'category' => $cartItem->product->category ? $cartItem->product->category->name : 'Uncategorized',
                    'stock' => $cartItem->product->stock,
                    'status' => $cartItem->product->status,
                ],
                'created_at' => $cartItem->created_at
            ];

            return response()->json([
                'message' => 'Cart updated',
                'data' => $formattedItem
            ]);
        } catch (\Exception $e) {
            Log::error('Cart update error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'message' => 'Failed to update cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Request $request, Cart $cart)
    {
        try {
            if ($cart->user_id !== $request->user()->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $cart->delete();

            return response()->json(['message' => 'Item removed from cart']);
        } catch (\Exception $e) {
            Log::error('Cart destroy error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'message' => 'Failed to remove item from cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function clear(Request $request)
    {
        try {
            Cart::where('user_id', $request->user()->id)->delete();

            return response()->json(['message' => 'Cart cleared']);
        } catch (\Exception $e) {
            Log::error('Cart clear error: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());

            return response()->json([
                'message' => 'Failed to clear cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
