<?php

namespace App\Http\Controllers;

use App\Models\CustomCandle;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CustomCandleController extends Controller
{
    public function store(Request $request)
    {
        try {
            // Validate the request
            $request->validate([
                'name' => 'required|string',
                'price' => 'required|numeric',
                'image_url' => 'required|string',
                'description' => 'nullable|string',
                'scent_name' => 'required|string',
                'jar_style' => 'required|string',
                'custom_label' => 'nullable|string',
                'custom_details' => 'nullable|array'
            ]);

            // Create the custom candle
            $customCandle = CustomCandle::create([
                'name' => $request->name,
                'price' => $request->price,
                'image_url' => $request->image_url,
                'description' => $request->description,
                'scent_name' => $request->scent_name,
                'jar_style' => $request->jar_style,
                'custom_label' => $request->custom_label,
                'custom_details' => $request->custom_details,
                'user_id' => Auth::id()
            ]);

            // Add to cart
            Cart::create([
                'user_id' => Auth::id(),
                'custom_candle_id' => $customCandle->id,
                'quantity' => 1
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Custom candle added to cart successfully',
                'data' => $customCandle
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add custom candle to cart',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
