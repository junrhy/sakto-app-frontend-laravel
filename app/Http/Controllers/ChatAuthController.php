<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class ChatAuthController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }
    /**
     * Show chat login page
     */
    public function showLogin(Request $request)
    {
        $clientIdentifier = $request->query('client_identifier');
        $slug = $request->query('slug');
        
        if (!$clientIdentifier && !$slug) {
            return response()->json([
                'error' => 'Either client_identifier or slug parameter is required'
            ], 400);
        }
        
        // If slug is provided, look up the user to get the client_identifier
        if ($slug && !$clientIdentifier) {
            $user = \App\Models\User::where('slug', $slug)
                ->select('identifier')
                ->first();
            
            if (!$user) {
                return response()->json([
                    'error' => 'User not found with the provided slug'
                ], 404);
            }
            
            $clientIdentifier = $user->identifier;
        }
        
        return Inertia::render('Chat/Auth/Login', [
            'clientIdentifier' => $clientIdentifier
        ]);
    }

    /**
     * Show chat registration page
     */
    public function showRegister(Request $request)
    {
        $clientIdentifier = $request->query('client_identifier');
        $slug = $request->query('slug');
        
        if (!$clientIdentifier && !$slug) {
            return response()->json([
                'error' => 'Either client_identifier or slug parameter is required'
            ], 400);
        }
        
        // If slug is provided, look up the user to get the client_identifier
        if ($slug && !$clientIdentifier) {
            $user = \App\Models\User::where('slug', $slug)
                ->select('identifier')
                ->first();
            
            if (!$user) {
                return response()->json([
                    'error' => 'User not found with the provided slug'
                ], 404);
            }
            
            $clientIdentifier = $user->identifier;
        }
        
        return Inertia::render('Chat/Auth/Register', [
            'clientIdentifier' => $clientIdentifier
        ]);
    }

    /**
     * Register a new chat user
     */
    public function register(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/chat-auth/register", $request->all());

            if (!$response->successful()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Registration failed',
                    'errors' => $response->json()
                ], $response->status());
            }

            $data = $response->json();
            
            // Set the chat token as a cookie
            if (isset($data['data']['token'])) {
                return response()->json($data)
                    ->cookie('chat_token', $data['data']['token'], 60 * 24 * 7, '/', null, false, false); // 7 days
            }

            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Registration failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Login a chat user
     */
    public function login(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->post("{$this->apiUrl}/chat-auth/login", $request->all());

            if (!$response->successful()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Login failed',
                    'errors' => $response->json()
                ], $response->status());
            }

            $data = $response->json();
            
            // Set the chat token as a cookie
            if (isset($data['data']['token'])) {
                return response()->json($data)
                    ->cookie('chat_token', $data['data']['token'], 60 * 24 * 7, '/', null, false, false); // 7 days
            }

            return response()->json($data);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Login failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout a chat user
     */
    public function logout(Request $request)
    {
        try {
            $chatToken = $request->cookie('chat_token') ?? $request->header('Authorization');
            
            $response = Http::withToken($this->apiToken)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $chatToken
                ])
                ->post("{$this->apiUrl}/chat-auth/logout");

            // Clear the chat token cookie
            return response()->json([
                'status' => 'success',
                'message' => 'Logged out successfully'
            ])->cookie('chat_token', '', -1, '/', null, false, false);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Logout failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get chat user profile
     */
    public function profile(Request $request)
    {
        try {
            $chatToken = $request->cookie('chat_token') ?? $request->header('Authorization');
            
            $response = Http::withToken($this->apiToken)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $chatToken
                ])
                ->get("{$this->apiUrl}/chat-auth/profile");

            if (!$response->successful()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to get profile',
                    'errors' => $response->json()
                ], $response->status());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get profile: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update chat user profile
     */
    public function updateProfile(Request $request)
    {
        try {
            $chatToken = $request->cookie('chat_token') ?? $request->header('Authorization');
            
            $response = Http::withToken($this->apiToken)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $chatToken
                ])
                ->put("{$this->apiUrl}/chat-auth/profile", $request->all());

            if (!$response->successful()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to update profile',
                    'errors' => $response->json()
                ], $response->status());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to update profile: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change chat user password
     */
    public function changePassword(Request $request)
    {
        try {
            $chatToken = $request->cookie('chat_token') ?? $request->header('Authorization');
            
            $response = Http::withToken($this->apiToken)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . $chatToken
                ])
                ->post("{$this->apiUrl}/chat-auth/change-password", $request->all());

            if (!$response->successful()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to change password',
                    'errors' => $response->json()
                ], $response->status());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to change password: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get online chat users
     */
    public function getOnlineUsers(Request $request)
    {
        try {
            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/chat-auth/online-users", [
                    'client_identifier' => $request->input('client_identifier')
                ]);

            if (!$response->successful()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to get online users',
                    'errors' => $response->json()
                ], $response->status());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get online users: ' . $e->getMessage()
            ], 500);
        }
    }
}