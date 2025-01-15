<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index()
    {
        $customers = User::where('role', 'customer')->get();
        return response()->json($customers);
    }

    public function statistics()
    {
        $totalCustomers = User::where('role', 'customer')->count();
        return response()->json(['total_customers' => $totalCustomers]);
    }
}
