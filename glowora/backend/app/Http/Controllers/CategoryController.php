<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Debug information
            Log::info('Starting category index request', [
                'request_url' => $request->fullUrl(),
                'request_method' => $request->method(),
                'user' => $request->user() ? $request->user()->id : 'unauthenticated',
                'headers' => $request->headers->all()
            ]);

            // Check database connection
            try {
                $connection = DB::connection()->getPdo();
                Log::info('Database connection successful', [
                    'database_name' => DB::connection()->getDatabaseName()
                ]);

                // Debug: Check if categories table exists and count records
                $categoriesCount = DB::table('categories')->count();
                Log::info('Categories table check', [
                    'table_exists' => Schema::hasTable('categories'),
                    'total_records' => $categoriesCount
                ]);

            } catch (\Exception $e) {
                Log::error('Database connection failed', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Database connection failed',
                    'error' => $e->getMessage()
                ], 500);
            }

            // Simple query without pagination first
            try {
                $query = Category::query();

                // Add search functionality if search parameter is present
                if ($request->has('search')) {
                    $searchTerm = $request->search;
                    $query->where('name', 'like', "%{$searchTerm}%")
                        ->orWhere('description', 'like', "%{$searchTerm}%");
                }

                // Add sorting if sort parameters are present
                $sortField = $request->get('sort_by', 'created_at');
                $sortOrder = $request->get('order', 'desc');
                $query->orderBy($sortField, $sortOrder);

                // Debug: Log the SQL query
                Log::info('Category query', [
                    'sql' => $query->toSql(),
                    'bindings' => $query->getBindings()
                ]);

                // Get categories with pagination
                $categories = $query->paginate(10);

                // Debug: Log raw categories data
                Log::info('Raw categories data', [
                    'count' => count($categories->items()),
                    'total' => $categories->total(),
                    'data' => $categories->items()
                ]);

                // Transform the data to include image URLs
                $transformedCategories = collect($categories->items())->map(function ($category) {
                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'slug' => $category->slug,
                        'description' => $category->description,
                        'image' => $category->image,
                        'image_url' => $category->image ? url($category->image) : null,
                        'icon' => $category->icon,
                        'icon_url' => $category->icon ? url($category->icon) : null,
                        'created_at' => $category->created_at,
                        'updated_at' => $category->updated_at
                    ];
                });

                Log::info('Categories fetched successfully', [
                    'total_count' => $categories->total(),
                    'current_page' => $categories->currentPage(),
                    'per_page' => $categories->perPage(),
                    'transformed_count' => $transformedCategories->count()
                ]);

                $response = [
                    'success' => true,
                    'data' => $transformedCategories,
                    'meta' => [
                        'current_page' => $categories->currentPage(),
                        'from' => $categories->firstItem(),
                        'last_page' => $categories->lastPage(),
                        'per_page' => $categories->perPage(),
                        'to' => $categories->lastItem(),
                        'total' => $categories->total()
                    ]
                ];

                Log::info('Final response', ['response' => $response]);

                return response()->json($response);
            } catch (\Exception $e) {
                Log::error('Error fetching categories', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Error fetching categories',
                    'error' => $e->getMessage()
                ], 500);
            }
        } catch (\Exception $e) {
            Log::error('Unexpected error in category index', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Unexpected error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            Log::info('Category store request', [
                'request_data' => $request->all()
            ]);

            $request->validate([
                'name' => 'required|string|max:255|unique:categories',
                'description' => 'nullable|string',
                'icon' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            $data = [
                'name' => $request->name,
                'description' => $request->description,
                'slug' => Str::slug($request->name)
            ];

            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('categories/images', 'public');
                $data['image'] = 'storage/' . $imagePath;
            }

            if ($request->hasFile('icon')) {
                $iconPath = $request->file('icon')->store('categories/icons', 'public');
                $data['icon'] = 'storage/' . $iconPath;
            }

            Log::info('Creating category with data', ['data' => $data]);

            $category = Category::create($data);

            Log::info('Category created successfully', ['category' => $category]);

            return response()->json([
                'success' => true,
                'message' => 'Category created successfully',
                'data' => $category
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error creating category', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error creating category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $category = Category::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'image' => $category->image,
                'image_url' => $category->image ? url($category->image) : null,
                'icon' => $category->icon,
                'icon_url' => $category->icon ? url($category->icon) : null,
                'created_at' => $category->created_at,
                'updated_at' => $category->updated_at
            ]);
        } catch (\Exception $e) {
            Log::error('Error showing category: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Category not found'
            ], 404);
        }
    }

    public function update(Request $request, Category $category)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
                'description' => 'nullable|string',
                'icon' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            $data = [
                'name' => $request->name,
                'description' => $request->description,
                'slug' => Str::slug($request->name)
            ];

            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($category->image) {
                    Storage::disk('public')->delete(str_replace('storage/', '', $category->image));
                }
                
                $imagePath = $request->file('image')->store('categories/images', 'public');
                $data['image'] = 'storage/' . $imagePath;
            }

            if ($request->hasFile('icon')) {
                // Delete old icon if exists
                if ($category->icon) {
                    Storage::disk('public')->delete(str_replace('storage/', '', $category->icon));
                }
                
                $iconPath = $request->file('icon')->store('categories/icons', 'public');
                $data['icon'] = 'storage/' . $iconPath;
            }

            $category->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Category updated successfully',
                'data' => $category
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating category', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error updating category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $category = Category::findOrFail($id);
            
            // Check if category has products
            if ($category->products()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete category with associated products'
                ], 422);
            }

            // Delete category image and icon
            if ($category->image) {
                Storage::disk('public')->delete(str_replace('storage/', '', $category->image));
            }
            if ($category->icon) {
                Storage::disk('public')->delete(str_replace('storage/', '', $category->icon));
            }

            $category->delete();
            return response()->json([
                'success' => true,
                'message' => 'Category deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error deleting category: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error deleting category',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 