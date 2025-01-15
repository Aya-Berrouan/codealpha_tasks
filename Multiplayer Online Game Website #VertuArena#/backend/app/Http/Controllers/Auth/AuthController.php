<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\PlayerStats;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        try {
            $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'username' => ['required', 'string', 'max:50', 'unique:users'],
                'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
                'password' => ['required', 'confirmed', Rules\Password::defaults()],
                'avatar' => ['nullable', 'string'],
            ]);

            $user = User::create([
                'name' => $request->name,
                'username' => $request->username,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'avatar' => $request->avatar,
                'rank' => 0,
            ]);

            // Create initial player stats
            PlayerStats::create([
                'user_id' => $user->id,
                'games_played' => 0,
                'games_won' => 0,
                'games_lost' => 0,
                'rank' => 0,
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Registration failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => ['required', 'string', 'email'],
                'password' => ['required', 'string'],
            ]);

            if (!Auth::attempt($request->only('email', 'password'))) {
                throw ValidationException::withMessages([
                    'email' => ['The provided credentials are incorrect.'],
                ]);
            }

            $user = User::where('email', $request->email)->firstOrFail();

            // Revoke all existing tokens
            $user->tokens()->delete();

            // Create new token
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'user' => $user->load('playerStats'),
                'token' => $token,
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Login failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function logout(Request $request)
    {
        try {
            if (!$request->user()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            // Delete all tokens for the user
            $request->user()->tokens()->delete();

            return response()->json(['message' => 'Logged out successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function user(Request $request)
    {
        try {
            if (!$request->user()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            return response()->json($request->user()->load('playerStats'));
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch user data',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function profile(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            // Load player stats
            $playerStats = $user->playerStats;
            if (!$playerStats) {
                // Create initial player stats if they don't exist
                $playerStats = PlayerStats::create([
                    'user_id' => $user->id,
                    'games_played' => 0,
                    'games_won' => 0,
                    'games_lost' => 0,
                    'current_streak' => 0,
                    'rank' => 0,
                ]);
            }

            // Format the response data
            $userData = [
                'id' => $user->id,
                'username' => $user->username,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ?? 'player',
                'avatar' => $user->avatar,
                'created_at' => $user->created_at,
                'last_login' => $user->last_login ?? $user->created_at,
                'is_active' => true,
                'level' => $user->level ?? 1,
                'rank' => $user->rank ?? 0,
                'playerStats' => [
                    'games_played' => $playerStats->games_played,
                    'games_won' => $playerStats->games_won,
                    'games_lost' => $playerStats->games_lost,
                    'current_streak' => $playerStats->current_streak,
                    'rank' => $playerStats->rank,
                ],
                'achievements' => [],
                'activities' => []
            ];

            return response()->json([
                'status' => 'success',
                'data' => [
                    'user' => $userData
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch profile data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }

            $request->validate([
                'username' => ['sometimes', 'string', 'max:50', 'unique:users,username,' . $user->id],
                'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
                'current_password' => ['required_with:password', 'string'],
                'password' => ['sometimes', 'string', 'min:6', 'confirmed'],
                'avatar' => ['sometimes', 'string', 'regex:/^data:image\/[a-zA-Z]+;base64,/'],
            ]);

            // Check current password if trying to change password
            if ($request->password) {
                if (!Hash::check($request->current_password, $user->password)) {
                    return response()->json([
                        'message' => 'Current password is incorrect.',
                        'errors' => ['current_password' => ['The provided password is incorrect.']]
                    ], 422);
                }
            }

            // Update basic info
            if ($request->username) {
                $user->username = $request->username;
            }
            if ($request->email) {
                $user->email = $request->email;
            }

            // Handle avatar update
            if ($request->has('avatar')) {
                // Validate base64 image
                if (!preg_match('/^data:image\/(\w+);base64,/', $request->avatar, $type)) {
                    throw new \Exception('Invalid image format');
                }

                // Get file extension
                $type = strtolower($type[1]); // jpg, png, gif

                // Check if file type is valid
                if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png'])) {
                    throw new \Exception('Invalid image type');
                }

                // Get base64 content
                $base64_content = substr($request->avatar, strpos($request->avatar, ',') + 1);
                $image = base64_decode($base64_content);

                if ($image === false) {
                    throw new \Exception('Failed to decode image');
                }

                // Check file size (max 2MB)
                if (strlen($image) > 2 * 1024 * 1024) {
                    throw new \Exception('Image size should be less than 2MB');
                }

                $user->avatar = $request->avatar;
            }

            // Update password if provided
            if ($request->password) {
                $user->password = Hash::make($request->password);
            }

            $user->save();

            // Return updated user data with player stats
            $userData = [
                'id' => $user->id,
                'username' => $user->username,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ?? 'player',
                'avatar' => $user->avatar,
                'created_at' => $user->created_at,
                'last_login' => $user->last_login ?? $user->created_at,
                'is_active' => true,
                'level' => $user->level ?? 1,
                'rank' => $user->rank ?? 0,
                'playerStats' => $user->playerStats ? [
                    'games_played' => $user->playerStats->games_played,
                    'games_won' => $user->playerStats->games_won,
                    'games_lost' => $user->playerStats->games_lost,
                    'current_streak' => $user->playerStats->current_streak,
                    'rank' => $user->playerStats->rank,
                ] : null,
            ];

            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => $userData
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function users()
    {
        return response()->json(User::where('id', '!=', Auth::id())->get());
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => __($status)]);
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => __($status)]);
        }

        throw ValidationException::withMessages([
            'email' => [__($status)],
        ]);
    }
}
