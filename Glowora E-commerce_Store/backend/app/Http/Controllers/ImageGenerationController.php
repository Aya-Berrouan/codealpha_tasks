<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ImageGenerationController extends Controller
{
    protected $apiUrl = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0';

    public function generate(Request $request)
    {
        Log::info('Starting image generation request', [
            'style' => $request->style,
            'scent' => $request->scent,
            'has_label' => !empty($request->label),
        ]);

        $request->validate([
            'prompt' => 'required|string',
            'scent' => 'required|string',
            'style' => 'required|string',
            'label' => 'nullable|string|max:30',
        ]);

        try {
            // Set a longer timeout for the Hugging Face API request
            Http::timeout(150); // 2.5 minutes timeout

            // Construct a detailed prompt based on user selections
            $basePrompt = "A luxury candle in {$request->style} style with {$request->scent} scent, ";
            $detailPrompt = "professional product photography, studio lighting, 8k resolution, photorealistic, ";
            $stylePrompt = "elegant, sophisticated, minimalist composition, soft shadows, ";
            $fullPrompt = $basePrompt . $detailPrompt . $stylePrompt;

            Log::info('Making request to Hugging Face API', [
                'prompt' => $fullPrompt,
                'api_url' => $this->apiUrl,
            ]);

            // Make request to Hugging Face API
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.huggingface.token'),
                'Content-Type' => 'application/json',
            ])->post($this->apiUrl, [
                'inputs' => $fullPrompt,
                'options' => [
                    'wait_for_model' => true,
                ]
            ]);

            if ($response->successful()) {
                Log::info('Successfully received response from Hugging Face API');

                // Generate a unique filename
                $filename = 'candle-' . Str::random(10) . '.png';
                
                // Ensure the storage directory exists
                $storagePath = storage_path('app/public/generated');
                if (!file_exists($storagePath)) {
                    Log::info('Creating storage directory', ['path' => $storagePath]);
                    mkdir($storagePath, 0755, true);
                }
                
                try {
                    // Store the generated image
                    Storage::disk('public')->put(
                        'generated/' . $filename, 
                        $response->body()
                    );

                    Log::info('Successfully stored generated image', ['filename' => $filename]);

                    return response()->json([
                        'success' => true,
                        'image_url' => url('storage/generated/' . $filename),
                        'prompt' => $fullPrompt,
                    ]);
                } catch (\Exception $storageError) {
                    Log::error('Failed to store generated image', [
                        'error' => $storageError->getMessage(),
                        'trace' => $storageError->getTraceAsString()
                    ]);

                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to store the generated image',
                        'error' => $storageError->getMessage(),
                    ], 500);
                }
            }

            // Log the error response for debugging
            Log::error('Hugging Face API Error', [
                'status' => $response->status(),
                'body' => $response->body(),
                'headers' => $response->headers()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to generate image',
                'error' => $response->json(),
            ], 500);

        } catch (\Exception $e) {
            // Check for specific timeout exception
            if ($e instanceof \Illuminate\Http\Client\ConnectionException) {
                Log::error('Connection timeout while generating image', [
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'The image generation request timed out. Please try again with a simpler prompt.',
                    'error' => 'Request timeout',
                ], 504); // Gateway Timeout
            }

            // Log the full exception for debugging
            Log::error('Image Generation Error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An error occurred while generating the image',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
} 