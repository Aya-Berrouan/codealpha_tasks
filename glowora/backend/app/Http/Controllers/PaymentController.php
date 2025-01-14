<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Webhook;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(env('STRIPE_SECRET_KEY'));
    }

    public function createPaymentIntent(Request $request)
    {
        try {
            $order = Order::findOrFail($request->order_id);

            // Create a PaymentIntent with the order amount and currency
            $paymentIntent = PaymentIntent::create([
                'amount' => round($order->total_amount * 100), // Convert to cents and round
                'currency' => 'usd',
                'metadata' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number
                ]
            ]);

            return response()->json([
                'success' => true,
                'clientSecret' => $paymentIntent->client_secret
            ]);
        } catch (\Exception $e) {
            Log::error('Payment intent creation failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment intent'
            ], 500);
        }
    }

    public function handleWebhook(Request $request)
    {
        try {
            Log::info('Webhook received', ['payload' => $request->all()]);

            $payload = $request->getContent();
            $sig_header = $request->header('Stripe-Signature');
            $endpoint_secret = env('STRIPE_WEBHOOK_SECRET');

            try {
                $event = Webhook::constructEvent(
                    $payload,
                    $sig_header,
                    $endpoint_secret
                );
            } catch (\UnexpectedValueException $e) {
                Log::error('Invalid payload', ['error' => $e->getMessage()]);
                return response()->json(['error' => 'Invalid payload'], 400);
            } catch (\Stripe\Exception\SignatureVerificationException $e) {
                Log::error('Invalid signature', ['error' => $e->getMessage()]);
                return response()->json(['error' => 'Invalid signature'], 400);
            }

            Log::info('Webhook verified', ['type' => $event->type]);

            // Handle the event
            switch ($event->type) {
                case 'payment_intent.succeeded':
                    $paymentIntent = $event->data->object;

                    // Get order ID from metadata
                    if (!isset($paymentIntent->metadata->order_id)) {
                        Log::error('Order ID not found in metadata', ['payment_intent' => $paymentIntent->id]);
                        return response()->json(['error' => 'Order ID not found'], 400);
                    }

                    $orderId = $paymentIntent->metadata->order_id;

                    Log::info('Payment succeeded', [
                        'payment_intent_id' => $paymentIntent->id,
                        'order_id' => $orderId,
                        'amount' => $paymentIntent->amount,
                        'status' => $paymentIntent->status
                    ]);

                    // Update order payment status
                    $order = Order::find($orderId);
                    if ($order) {
                        try {
                            DB::beginTransaction();

                            $order->update([
                                'payment_status' => 'paid',
                                'status' => 'processing'
                            ]);

                            // Create payment record
                            Payment::create([
                                'order_id' => $orderId,
                                'payment_date' => now(),
                                'payment_method' => 'credit_card',
                                'payment_amount' => $paymentIntent->amount / 100
                            ]);

                            // Update product quantities
                            foreach ($order->orderItems as $orderItem) {
                                if ($orderItem->type === 'product' && $orderItem->product) {
                                    $product = $orderItem->product;
                                    $newStock = $product->stock - $orderItem->quantity;

                                    if ($newStock < 0) {
                                        throw new \Exception("Insufficient stock for product: {$product->name}");
                                    }

                                    $product->update(['stock' => $newStock]);

                                    Log::info('Product stock updated', [
                                        'product_id' => $product->id,
                                        'old_stock' => $product->stock + $orderItem->quantity,
                                        'new_stock' => $newStock,
                                        'order_quantity' => $orderItem->quantity
                                    ]);
                                }
                            }

                            DB::commit();

                            Log::info('Order updated successfully', [
                                'order_id' => $orderId,
                                'payment_status' => 'paid',
                                'status' => 'processing'
                            ]);
                        } catch (\Exception $e) {
                            DB::rollBack();
                            Log::error('Failed to update order', [
                                'order_id' => $orderId,
                                'error' => $e->getMessage()
                            ]);
                            throw $e;
                        }
                    } else {
                        Log::error('Order not found', ['order_id' => $orderId]);
                        return response()->json(['error' => 'Order not found'], 404);
                    }
                    break;

                case 'payment_intent.payment_failed':
                    $paymentIntent = $event->data->object;
                    $orderId = $paymentIntent->metadata->order_id;

                    Log::info('Payment failed', [
                        'payment_intent_id' => $paymentIntent->id,
                        'order_id' => $orderId,
                        'error' => $paymentIntent->last_payment_error
                    ]);

                    // Update order payment status
                    $order = Order::find($orderId);
                    if ($order) {
                        try {
                            $order->update([
                                'payment_status' => 'failed',
                                'status' => 'cancelled'
                            ]);

                            Log::info('Order updated as failed', [
                                'order_id' => $orderId,
                                'payment_status' => 'failed',
                                'status' => 'cancelled'
                            ]);
                        } catch (\Exception $e) {
                            Log::error('Failed to update order status', [
                                'order_id' => $orderId,
                                'error' => $e->getMessage()
                            ]);
                            throw $e;
                        }
                    } else {
                        Log::error('Order not found', ['order_id' => $orderId]);
                        return response()->json(['error' => 'Order not found'], 404);
                    }
                    break;

                default:
                    Log::info('Unhandled event type', ['type' => $event->type]);
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Webhook handling failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
