<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class AnalyticsController extends Controller
{
    public function getDashboardStats()
    {
        try {
            // Sales Overview
            $totalSales = Order::sum('total_amount');
            $totalOrders = Order::count();
            $averageOrderValue = $totalOrders > 0 ? $totalSales / $totalOrders : 0;

            // Customer Metrics
            $totalCustomers = User::where('role', 'customer')->count();
            $newCustomersThisMonth = User::where('role', 'customer')
                ->whereMonth('created_at', Carbon::now()->month)
                ->count();

            // Product Performance
            $topProducts = DB::table('orders')
                ->join('order_items', 'orders.id', '=', 'order_items.order_id')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->select(
                    'products.id as product_id',
                    'products.name',
                    'products.image_url',
                    DB::raw('SUM(order_items.quantity) as total_sold'),
                    DB::raw('SUM(order_items.quantity * order_items.price) as revenue')
                )
                ->groupBy('products.id', 'products.name', 'products.image_url')
                ->orderBy('total_sold', 'desc')
                ->take(5)
                ->get();

            // Sales Trends
            $salesTrend = Order::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(total_amount) as revenue')
            )
                ->groupBy('date')
                ->orderBy('date', 'desc')
                ->take(30)
                ->get();

            // Customer Satisfaction
            $averageRating = Review::avg('rating');
            $totalReviews = Review::count();
            $ratingDistribution = Review::select('rating', DB::raw('count(*) as count'))
                ->groupBy('rating')
                ->get();

            // Recent Activity
            $recentOrders = Order::with(['user'])
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();

            $recentReviews = Review::with(['user', 'product'])
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();

            // Category Performance
            $categoryPerformance = DB::table('orders')
                ->join('order_items', 'orders.id', '=', 'order_items.order_id')
                ->join('products', 'order_items.product_id', '=', 'products.id')
                ->join('categories', 'products.category_id', '=', 'categories.id')
                ->select(
                    'categories.category_name as name',
                    DB::raw('COUNT(DISTINCT orders.id) as order_count'),
                    DB::raw('SUM(order_items.quantity) as items_sold'),
                    DB::raw('SUM(order_items.quantity * order_items.price) as revenue')
                )
                ->groupBy('categories.id', 'categories.category_name')
                ->get();

            // Inventory Status
            $lowStockProducts = Product::where('stock_quantity', '<=', 10)
                ->orderBy('stock_quantity')
                ->take(5)
                ->get();

            return response()->json([
                'sales_overview' => [
                    'total_sales' => round($totalSales, 2),
                    'total_orders' => $totalOrders,
                    'average_order_value' => round($averageOrderValue, 2)
                ],
                'customer_metrics' => [
                    'total_customers' => $totalCustomers,
                    'new_customers_this_month' => $newCustomersThisMonth
                ],
                'top_products' => $topProducts,
                'sales_trend' => $salesTrend,
                'customer_satisfaction' => [
                    'average_rating' => round($averageRating, 1),
                    'total_reviews' => $totalReviews,
                    'rating_distribution' => $ratingDistribution
                ],
                'recent_activity' => [
                    'orders' => $recentOrders,
                    'reviews' => $recentReviews
                ],
                'category_performance' => $categoryPerformance,
                'inventory_alerts' => $lowStockProducts
            ]);
        } catch (\Exception $e) {
            Log::error('Analytics Dashboard Error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error fetching analytics data',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    public function getSalesReport(Request $request)
    {
        try {
            $startDate = $request->get('start_date', Carbon::now()->subDays(30));
            $endDate = $request->get('end_date', Carbon::now());

            $salesData = Order::whereBetween('created_at', [$startDate, $endDate])
                ->select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('COUNT(*) as order_count'),
                    DB::raw('SUM(total_amount) as revenue'),
                    DB::raw('AVG(total_amount) as average_order_value')
                )
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            return response()->json($salesData);
        } catch (\Exception $e) {
            Log::error('Sales Report Error: ' . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Error generating sales report',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }
}
