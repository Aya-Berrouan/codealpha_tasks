<?php

namespace App\Traits;

use App\Models\Notification;
use App\Models\User;

trait NotificationTrait
{
    public function createOrderNotification($order)
    {
        // Get all admin users
        $adminUsers = User::where('role', 'admin')->get();

        foreach ($adminUsers as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'order',
                'message' => "New order #{$order->order_number} has been placed",
                'data' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'total_amount' => $order->total_amount,
                    'customer_name' => $order->user->first_name . ' ' . $order->user->last_name
                ]
            ]);
        }
    }
}
