<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Traits\NotificationTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    use NotificationTrait;

    public function store(Request $request)
    {
        try {
            Log::info('Order creation request received', [
                'user_id' => Auth::id(),
                'request_data' => $request->all()
            ]);

            // Validate the request
            $validator = Validator::make($request->all(), [
                'total_amount' => 'required|numeric|min:0',
                'shipping_address' => 'required|string',
                'billing_address' => 'required|string',
                'payment_method' => 'required|string',
                'items' => 'required|array|min:1',
                'items.*.type' => 'required|string|in:product,custom_candle',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.price' => 'required|numeric|min:0',
                'items.*.product_id' => 'required_if:items.*.type,product|nullable|exists:products,id',
                'items.*.custom_details' => 'required_if:items.*.type,custom_candle|nullable|array',
                'items.*.custom_details.scent_name' => 'required_if:items.*.type,custom_candle|string',
                'items.*.custom_details.jar_style' => 'required_if:items.*.type,custom_candle|string',
                'coupon_code' => 'nullable|string|exists:coupons,coupon_code',
                'discount_amount' => 'nullable|numeric|min:0'
            ]);

            if ($validator->fails()) {
                Log::error('Order validation failed', [
                    'errors' => $validator->errors()->toArray()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            try {
                // Generate order number
                $orderNumber = 'GLW' . date('ymd') . str_pad(mt_rand(1, 9999), 4, '0', STR_PAD_LEFT);

                Log::info('Creating order with data', [
                    'order_number' => $orderNumber,
                    'total_amount' => $request->total_amount,
                    'user_id' => Auth::id()
                ]);

                // Create the order
                $order = Order::create([
                    'user_id' => Auth::id(),
                    'order_number' => $orderNumber,
                    'total_amount' => $request->total_amount,
                    'shipping_address' => $request->shipping_address,
                    'billing_address' => $request->billing_address,
                    'payment_method' => $request->payment_method,
                    'payment_status' => 'pending',
                    'status' => 'pending',
                    'coupon_code' => $request->coupon_code,
                    'discount_amount' => $request->discount_amount ?? 0
                ]);

                Log::info('Order created', ['order_id' => $order->id]);

                // Create order items
                foreach ($request->items as $index => $item) {
                    try {
                        Log::info('Processing order item', [
                            'index' => $index,
                            'item_data' => $item,
                            'order_id' => $order->id
                        ]);

                        $orderItemData = [
                            'order_id' => $order->id,
                            'quantity' => $item['quantity'],
                            'price' => $item['price'],
                            'subtotal' => $item['price'] * $item['quantity'],
                            'type' => $item['type']
                        ];

                        if ($item['type'] === 'custom_candle') {
                            if (!isset($item['custom_details']) || !is_array($item['custom_details'])) {
                                throw new \Exception('Invalid custom candle details for item at index ' . $index);
                            }

                            Log::info('Processing custom candle item', [
                                'custom_details' => $item['custom_details']
                            ]);

                            $orderItemData['product_id'] = null;
                            $orderItemData['custom_details'] = json_encode([
                                'scent_name' => $item['custom_details']['scent_name'] ?? '',
                                'jar_style' => $item['custom_details']['jar_style'] ?? '',
                                'custom_label' => $item['custom_details']['custom_label'] ?? null,
                                'generated_image' => $item['custom_details']['generated_image'] ?? null,
                                'scent' => $item['custom_details']['scent'] ?? null,
                                'jar' => $item['custom_details']['jar'] ?? null
                            ]);
                        } else {
                            if (!isset($item['product_id'])) {
                                throw new \Exception('Product ID is required for regular product at index ' . $index);
                            }

                            $orderItemData['product_id'] = $item['product_id'];
                            $orderItemData['custom_details'] = null;
                        }

                        $orderItem = OrderItem::create($orderItemData);

                        Log::info('Order item created', [
                            'order_item_id' => $orderItem->id,
                            'type' => $item['type']
                        ]);
                    } catch (\Exception $e) {
                        Log::error('Failed to create order item', [
                            'index' => $index,
                            'item_data' => $item,
                            'error' => $e->getMessage(),
                            'trace' => $e->getTraceAsString()
                        ]);
                        throw $e;
                    }
                }

                // Clear the user's cart
                Cart::where('user_id', Auth::id())->delete();
                Log::info('Cart cleared for user', ['user_id' => Auth::id()]);

                // Create notification for admin users
                $order->load('user'); // Make sure user relation is loaded
                $this->createOrderNotification($order);

                DB::commit();

                // Load the order with its relationships
                $order->load(['orderItems']);

                // Format the response
                $formattedOrder = [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'total_amount' => $order->total_amount,
                    'shipping_address' => $order->shipping_address,
                    'billing_address' => $order->billing_address,
                    'payment_method' => $order->payment_method,
                    'payment_status' => $order->payment_status,
                    'status' => $order->status,
                    'created_at' => $order->created_at,
                    'coupon_code' => $order->coupon_code,
                    'discount_amount' => $order->discount_amount,
                    'user' => [
                        'id' => $order->user->id,
                        'first_name' => $order->user->first_name,
                        'last_name' => $order->user->last_name,
                        'email' => $order->user->email,
                        'avatar_url' => $order->user->avatar_url
                    ],
                    'order_items' => $order->orderItems->map(function ($item) {
                        $data = [
                            'id' => $item->id,
                            'quantity' => $item->quantity,
                            'price' => $item->price,
                            'subtotal' => $item->subtotal,
                            'type' => $item->type,
                            'name' => $item->name,
                            'image_url' => $item->image_url
                        ];

                        if ($item->type === 'product') {
                            $data['product'] = $item->product;
                        } else {
                            $data['custom_details'] = json_decode($item->custom_details, true);
                        }

                        return $data;
                    })
                ];

                return response()->json([
                    'success' => true,
                    'message' => 'Order created successfully',
                    'order' => $formattedOrder
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Transaction failed', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }
        } catch (\Exception $e) {
            Log::error('Order creation failed', [
                'error_message' => $e->getMessage(),
                'stack_trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error creating order: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $user = Auth::user();
            $query = Order::with(['orderItems.product.images', 'user'])
                ->where('id', $id);

            // If not admin, only show user's own orders
            if ($user->role !== 'admin') {
                $query->where('user_id', $user->id);
            }

            $order = $query->firstOrFail();

            // Format the response
            $formattedOrder = [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'total_amount' => $order->total_amount,
                'shipping_address' => $order->shipping_address,
                'billing_address' => $order->billing_address,
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'status' => $order->status,
                'created_at' => $order->created_at,
                'coupon_code' => $order->coupon_code,
                'discount_amount' => $order->discount_amount,
                'user' => [
                    'id' => $order->user->id,
                    'first_name' => $order->user->first_name,
                    'last_name' => $order->user->last_name,
                    'email' => $order->user->email,
                    'avatar_url' => $order->user->avatar_url
                ],
                'order_items' => $order->orderItems->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'quantity' => $item->quantity,
                        'price' => $item->price,
                        'subtotal' => $item->subtotal,
                        'type' => $item->type,
                        'name' => $item->name,
                        'image_url' => $item->image_url,
                        'product' => $item->type === 'product' ? $item->product : null,
                        'custom_details' => $item->type === 'custom_candle' ? $item->custom_details : null
                    ];
                })
            ];

            return response()->json([
                'success' => true,
                'order' => $formattedOrder
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch order', [
                'order_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Order not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function index()
    {
        try {
            $user = Auth::user();
            $query = Order::with(['orderItems.product.images', 'user']);

            // If not admin, only show user's orders
            if ($user->role !== 'admin') {
                $query->where('user_id', $user->id);
            }

            // Apply search filters if provided
            if (request()->has('search')) {
                $search = request()->search;
                $query->where(function ($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($q) use ($search) {
                            $q->where('first_name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        });
                });
            }

            // Apply status filter
            if (request()->has('status')) {
                $query->where('status', request()->status);
            }

            // Apply date range filters
            if (request()->has('start_date')) {
                $query->whereDate('created_at', '>=', request()->start_date);
            }
            if (request()->has('end_date')) {
                $query->whereDate('created_at', '<=', request()->end_date);
            }

            // Apply sorting
            $sortBy = request()->get('sort_by', 'created_at');
            $order = request()->get('order', 'desc');
            $query->orderBy($sortBy, $order);

            // Get paginated results
            $perPage = request()->get('per_page', 10);
            $orders = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'orders' => $orders->items(),
                'total' => $orders->total(),
                'per_page' => $orders->perPage(),
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage()
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching orders: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $order = Order::findOrFail($id);
            $user = Auth::user();

            // Check if user is authorized to update the order
            if ($user->role !== 'admin' && $order->user_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }

            $order->update([
                'status' => $request->status
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order updated successfully',
                'order' => $order->load('orderItems.product')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dashboard data including orders with all necessary relationships
     */
    public function getDashboardData()
    {
        try {
            // Get orders with relationships
            $orders = Order::with([
                'orderItems.product.category',
                'user'
            ])
                ->orderBy('created_at', 'desc')
                ->get();

            // Get cart analytics for the last 30 days
            $thirtyDaysAgo = now()->subDays(30)->startOfDay();

            // Get total carts created
            $totalCarts = \App\Models\Cart::where('created_at', '>=', $thirtyDaysAgo)
                ->distinct('user_id')
                ->count();

            // Get completed orders (converted carts)
            $completedOrders = Order::where('created_at', '>=', $thirtyDaysAgo)
                ->where('status', '!=', 'cancelled')
                ->count();

            // Calculate abandonment rate
            $abandonedCarts = max($totalCarts - $completedOrders, 0);
            $abandonmentRate = $totalCarts > 0
                ? round(($abandonedCarts / $totalCarts) * 100, 1)
                : 0;

            // Get ratings distribution
            $ratingsDistribution = \App\Models\Review::select('rating')
                ->selectRaw('COUNT(*) as count')
                ->groupBy('rating')
                ->orderBy('rating', 'asc')
                ->get()
                ->reduce(function ($carry, $item) {
                    $carry[$item->rating] = $item->count;
                    return $carry;
                }, array_fill(1, 5, 0)); // Initialize with 0 for ratings 1-5

            $formattedOrders = $orders->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'total_amount' => $order->total_amount,
                    'status' => $order->status,
                    'created_at' => $order->created_at,
                    'user' => [
                        'id' => $order->user->id,
                        'first_name' => $order->user->first_name,
                        'last_name' => $order->user->last_name
                    ],
                    'order_items' => $order->orderItems->map(function ($item) {
                        $data = [
                            'id' => $item->id,
                            'quantity' => $item->quantity,
                            'price' => $item->price,
                            'type' => $item->type
                        ];

                        if ($item->product) {
                            $data['product'] = [
                                'id' => $item->product->id,
                                'name' => $item->product->name,
                                'category' => $item->product->category ? [
                                    'id' => $item->product->category->id,
                                    'name' => $item->product->category->name
                                ] : null
                            ];
                        }

                        return $data;
                    })
                ];
            });

            return response()->json([
                'success' => true,
                'orders' => $formattedOrders,
                'cart_analytics' => [
                    'total_carts' => $totalCarts,
                    'completed_orders' => $completedOrders,
                    'abandoned_carts' => $abandonedCarts,
                    'abandonment_rate' => $abandonmentRate,
                    'period' => '30 days'
                ],
                'ratings_distribution' => $ratingsDistribution
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch dashboard data', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard data: ' . $e->getMessage()
            ], 500);
        }
    }
}
