<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Product::with(['category', 'images']);

            // Search functionality
            if ($request->has('search')) {
                $searchTerm = $request->search;
                $query->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%");
            }

            // Filter by category
            if ($request->has('category')) {
                $query->where('category_id', $request->category);
            }

            // Filter by price range
            if ($request->has('min_price')) {
                $query->where('price', '>=', $request->min_price);
            }
            if ($request->has('max_price')) {
                $query->where('price', '<=', $request->max_price);
            }

            // Sort functionality
            $sortField = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('order', 'desc');
            $query->orderBy($sortField, $sortOrder);

            // Get all products without pagination
            $products = $query->get();

            // Transform the data
            $transformedProducts = $products->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'price' => $product->price,
                    'stock_quantity' => $product->stock,
                    'fragrance_notes' => $product->fragrance_notes,
                    'burn_time' => $product->burn_time,
                    'category' => [
                        'id' => $product->category->id,
                        'name' => $product->category->name
                    ],
                    'images' => $product->images->map(function ($image) {
                        return [
                            'id' => $image->id,
                            'image_url' => asset('storage/' . $image->image),
                            'is_primary' => $image->is_primary,
                            'sort_order' => $image->sort_order
                        ];
                    }),
                    'created_at' => $product->created_at,
                    'updated_at' => $product->updated_at
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformedProducts
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching products: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error fetching products'
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            DB::beginTransaction();

            // Validate the request
            $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'fragrance_notes' => 'nullable|string',
                'burn_time' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'stock_quantity' => 'required|integer|min:0',
                'category_id' => 'required|exists:categories,id',
                'images' => 'required|array|min:1',
                'images.*' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048'
            ]);

            // Create the product
            $product = Product::create([
                'name' => $request->name,
                'description' => $request->description,
                'fragrance_notes' => $request->fragrance_notes,
                'burn_time' => $request->burn_time,
                'price' => $request->price,
                'stock' => $request->stock_quantity,
                'category_id' => $request->category_id,
                'status' => 'active'
            ]);

            // Handle image uploads
            if ($request->hasFile('images')) {
                $images = $request->file('images');
                foreach ($images as $index => $image) {
                    try {
                        // Generate a unique filename
                        $filename = uniqid('product_') . '_' . time() . '.' . $image->getClientOriginalExtension();

                        // Store the file in the public disk
                        $path = $image->storeAs('products', $filename, 'public');

                        if (!$path) {
                            throw new \Exception('Failed to store image');
                        }

                        // First image is primary by default
                        $isPrimary = ($index === 0);

                        ProductImage::create([
                            'product_id' => $product->id,
                            'image' => $path,
                            'is_primary' => $isPrimary,
                            'sort_order' => $index
                        ]);

                        Log::info('Image stored successfully', [
                            'path' => $path,
                            'url' => asset('storage/' . $path),
                            'product_id' => $product->id
                        ]);
                    } catch (\Exception $e) {
                        Log::error('Failed to store image: ' . $e->getMessage(), [
                            'product_id' => $product->id,
                            'index' => $index
                        ]);
                        throw $e;
                    }
                }
            }

            DB::commit();

            // Return transformed product data
            $transformedProduct = [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price' => $product->price,
                'stock_quantity' => $product->stock,
                'fragrance_notes' => $product->fragrance_notes,
                'burn_time' => $product->burn_time,
                'category' => [
                    'id' => $product->category->id,
                    'name' => $product->category->name
                ],
                'images' => $product->images->fresh()->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'image_url' => asset('storage/' . $image->image),
                        'is_primary' => $image->is_primary,
                        'sort_order' => $image->sort_order
                    ];
                }),
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at
            ];

            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'data' => $transformedProduct
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating product: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $product = Product::with(['category', 'images'])->findOrFail($id);

            $transformedProduct = [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'price' => $product->price,
                'stock_quantity' => $product->stock,
                'fragrance_notes' => $product->fragrance_notes,
                'burn_time' => $product->burn_time,
                'category' => [
                    'id' => $product->category->id,
                    'name' => $product->category->name
                ],
                'images' => $product->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'image_url' => asset('storage/' . $image->image),
                        'is_primary' => $image->is_primary,
                        'sort_order' => $image->sort_order
                    ];
                }),
                'created_at' => $product->created_at,
                'updated_at' => $product->updated_at
            ];

            return response()->json([
                'success' => true,
                'data' => $transformedProduct
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching product: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $product = Product::findOrFail($id);

            // Validate the request
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'required|string',
                'fragrance_notes' => 'nullable|string',
                'burn_time' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'stock_quantity' => 'required|integer|min:0',
                'category_id' => 'required|exists:categories,id',
                'images.*' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
                'existing_images' => 'nullable|json'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Update basic product information
            $product->update([
                'name' => $request->name,
                'description' => $request->description,
                'fragrance_notes' => $request->fragrance_notes,
                'burn_time' => $request->burn_time,
                'price' => $request->price,
                'stock_quantity' => $request->stock_quantity,
                'category_id' => $request->category_id
            ]);

            // Handle existing images
            if ($request->has('existing_images')) {
                $existingImages = json_decode($request->existing_images, true);
                
                if (is_array($existingImages)) {
                    // First, set all images to non-primary
                    ProductImage::where('product_id', $id)->update(['is_primary' => false]);
                    
                    // Update existing images
                    foreach ($existingImages as $imageData) {
                        if (isset($imageData['id'])) {
                            ProductImage::where('id', $imageData['id'])
                                ->where('product_id', $id)
                                ->update([
                                    'is_primary' => $imageData['is_primary'] ?? false
                                ]);
                        }
                    }
                }
            }

            // Handle new images
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $image) {
                    try {
                        // Generate a unique filename
                        $filename = uniqid('product_') . '_' . time() . '.' . $image->getClientOriginalExtension();
                        
                        // Store the file in the public disk
                        $path = $image->storeAs('products', $filename, 'public');
                        
                        if (!$path) {
                            throw new \Exception('Failed to store image');
                        }

                        // Create new image record
                        ProductImage::create([
                            'product_id' => $id,
                            'image' => $path,
                            'is_primary' => false, // New images are not primary by default when updating
                            'sort_order' => $index
                        ]);

                        Log::info('New image added during update', [
                            'path' => $path,
                            'url' => asset('storage/' . $path),
                            'product_id' => $id
                        ]);
                    } catch (\Exception $e) {
                        Log::error('Failed to store new image during update: ' . $e->getMessage(), [
                            'product_id' => $id,
                            'index' => $index
                        ]);
                        throw $e;
                    }
                }
            }

            // Refresh the product with relationships
            $product = $product->fresh(['category', 'images']);

            // Transform the product data
            $transformedProduct = [
                'id' => $product->id,
                'name' => $product->name,
                'description' => $product->description,
                'fragrance_notes' => $product->fragrance_notes,
                'burn_time' => $product->burn_time,
                'price' => $product->price,
                'stock_quantity' => $product->stock_quantity,
                'category' => [
                    'id' => $product->category->id,
                    'name' => $product->category->name
                ],
                'images' => $product->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'image_url' => asset('storage/' . $image->image),
                        'is_primary' => $image->is_primary,
                        'sort_order' => $image->sort_order
                    ];
                })
            ];

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully',
                'data' => $transformedProduct
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating product: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error updating product: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $product = Product::findOrFail($id);

            // Delete associated images from storage
            foreach ($product->images as $image) {
                Storage::disk('public')->delete(str_replace('storage/', '', $image->image));
            }

            // Delete the product (this will also delete associated images due to cascade)
            $product->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting product: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error deleting product'
            ], 500);
        }
    }

    public function deleteImage($productId, $imageId)
    {
        try {
            DB::beginTransaction();

            $product = Product::findOrFail($productId);
            $image = ProductImage::where('product_id', $productId)
                ->where('id', $imageId)
                ->firstOrFail();

            // Get the actual file path
            $filePath = str_replace('storage/', '', $image->image);

            // Delete the physical file
            if (Storage::disk('public')->exists($filePath)) {
                Storage::disk('public')->delete($filePath);
            }

            // If this was the primary image, make another image primary
            if ($image->is_primary) {
                $otherImage = ProductImage::where('product_id', $productId)
                    ->where('id', '!=', $imageId)
                    ->first();

                if ($otherImage) {
                    $otherImage->update(['is_primary' => true]);
                }
            }

            // Delete the database record
            $image->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Image deleted successfully'
            ]);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Image not found'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting product image: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error deleting image'
            ], 500);
        }
    }

    public function setPrimaryImage($productId, $imageId)
    {
        try {
            DB::beginTransaction();

            $product = Product::findOrFail($productId);

            // First, set all images of this product to non-primary
            ProductImage::where('product_id', $productId)
                ->update(['is_primary' => false]);

            // Then set the selected image as primary
            $image = ProductImage::where('product_id', $productId)
                ->where('id', $imageId)
                ->firstOrFail();

            $image->update(['is_primary' => true]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Primary image updated successfully'
            ]);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Image not found'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating primary image: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error updating primary image'
            ], 500);
        }
    }

    public function recommended()
    {
        try {
            $products = Product::with(['category', 'images'])
                ->where('status', 'active')
                ->inRandomOrder()
                ->take(4)
                ->get();

            $formattedProducts = $products->map(function ($product) {
                $primaryImage = $product->images->firstWhere('is_primary', true) ?? $product->images->first();
                $imagePath = $primaryImage ? basename($primaryImage->image) : basename($product->image ?? 'default.jpg');

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'price' => $product->price,
                    'category' => $product->category ? $product->category->name : 'Uncategorized',
                    'image' => $imagePath,
                    'image_url' => url('storage/products/' . $imagePath),
                    'images' => $product->images->map(function ($image) {
                        return [
                            'id' => $image->id,
                            'url' => url('storage/products/' . basename($image->image)),
                            'is_primary' => $image->is_primary
                        ];
                    }),
                    'stock' => $product->stock,
                    'status' => $product->status,
                    'fragrance_notes' => $product->fragrance_notes,
                    'burn_time' => $product->burn_time
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedProducts
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching recommended products: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch recommended products',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
