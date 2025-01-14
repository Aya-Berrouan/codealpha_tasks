<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CouponController extends Controller
{
    public function index()
    {
        $coupons = Coupon::orderBy('created_at', 'desc')->get();
        return response()->json([
            'success' => true,
            'data' => $coupons
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->all();

        // Map the fields from the frontend to match database columns
        if (isset($data['code'])) {
            $data['coupon_code'] = $data['code'];
            unset($data['code']);
        }
        if (isset($data['discount_value'])) {
            $data['discount_percentage'] = $data['discount_value'];
            unset($data['discount_value']);
        }

        $validator = Validator::make($data, [
            'coupon_code' => 'required|string|max:50|unique:coupons',
            'discount_type' => 'required|in:percentage,fixed',
            'discount_percentage' => 'required|numeric|min:0|max:100',
            'valid_until' => 'required|date|after:now',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:0',
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $coupon = Coupon::create($data);
        return response()->json([
            'success' => true,
            'data' => $coupon,
            'message' => 'Coupon created successfully'
        ], 201);
    }

    public function show(Coupon $coupon)
    {
        return response()->json([
            'success' => true,
            'data' => $coupon
        ]);
    }

    public function update(Request $request, Coupon $coupon)
    {
        $data = $request->all();

        // Map the fields from the frontend to match database columns
        if (isset($data['code'])) {
            $data['coupon_code'] = $data['code'];
            unset($data['code']);
        }
        if (isset($data['discount_value'])) {
            $data['discount_percentage'] = $data['discount_value'];
            unset($data['discount_value']);
        }

        $validator = Validator::make($data, [
            'coupon_code' => 'required|string|max:50|unique:coupons,coupon_code,' . $coupon->id,
            'discount_type' => 'required|in:percentage,fixed',
            'discount_percentage' => 'required|numeric|min:0|max:100',
            'valid_until' => 'required|date|after:now',
            'min_purchase' => 'nullable|numeric|min:0',
            'max_uses' => 'nullable|integer|min:0',
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $coupon->update($data);
        return response()->json([
            'success' => true,
            'data' => $coupon,
            'message' => 'Coupon updated successfully'
        ]);
    }

    public function destroy(Coupon $coupon)
    {
        $coupon->delete();
        return response()->json([
            'success' => true,
            'message' => 'Coupon deleted successfully'
        ], 204);
    }
}
