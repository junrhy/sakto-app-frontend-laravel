<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class ChatController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    /**
     * Extract chat token from cookie or header
     */
    private function getChatToken(Request $request)
    {
        // Try Laravel's built-in methods first
        $chatToken = request()->cookie('chat_token') ?? request()->cookies->get('chat_token');
        
        // If Laravel methods fail, try manual parsing of cookie header
        if (!$chatToken) {
            $cookieHeader = request()->header('Cookie');
            if ($cookieHeader) {
                $cookiePairs = explode(';', $cookieHeader);
                foreach ($cookiePairs as $pair) {
                    $pair = trim($pair);
                    if (str_starts_with($pair, 'chat_token=')) {
                        $chatToken = substr($pair, 11); // Remove 'chat_token='
                        // URL decode the token in case it was encoded
                        $chatToken = urldecode($chatToken);
                        break;
                    }
                }
            }
        }
        
        // Fallback to Authorization header
        if (!$chatToken) {
            $chatToken = request()->header('Authorization');
        }
        
        // Clean the token - remove "Bearer " prefix if it exists
        if ($chatToken && str_starts_with($chatToken, 'Bearer ')) {
            $chatToken = substr($chatToken, 7);
        }
        
        return $chatToken;
    }

    /**
     * Display the chat dashboard.
     */
    public function index(Request $request)
    {
        // Check if user has chat authentication first
        $chatToken = $this->getChatToken($request);
        
        if (!$chatToken) {
            // If no token, redirect to login (client_identifier will be provided in login form)
            return redirect()->route('chat.login');
        }

        // Debug: Log token info
        \Log::info('Chat token debug', [
            'token_length' => strlen($chatToken),
            'token_start' => substr($chatToken, 0, 10) . '...'
        ]);

        try {
            // Get chat user profile to verify authentication and get user data
            $profileResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $chatToken,
                'Content-Type' => 'application/json'
            ])
            ->get("{$this->apiUrl}/chat-auth/profile");

            // Debug: Log the raw response
            \Log::info('Chat profile API response', [
                'status' => $profileResponse->status(),
                'headers' => $profileResponse->headers(),
                'body_length' => strlen($profileResponse->body()),
                'body_start' => substr($profileResponse->body(), 0, 200),
                'token' => substr($chatToken, 0, 10) . '...',
                'api_url' => "{$this->apiUrl}/chat-auth/profile"
            ]);

            if (!$profileResponse->successful()) {
                // Log the error for debugging
                \Log::error('Chat profile request failed', [
                    'status' => $profileResponse->status(),
                    'body' => $profileResponse->body(),
                    'token' => substr($chatToken, 0, 10) . '...'
                ]);
                
                // If profile request fails, redirect to login
                return redirect()->route('chat.login');
            }

            $chatUser = $profileResponse->json()['data'] ?? null;
            if (!$chatUser) {
                \Log::error('Chat user data is null', [
                    'response' => $profileResponse->json()
                ]);
                return redirect()->route('chat.login');
            }

            // Get client_identifier from chat user profile
            $clientIdentifier = $chatUser['client_identifier'] ?? null;
            if (!$clientIdentifier) {
                \Log::error('Client identifier not found in chat user profile', [
                    'chat_user' => $chatUser
                ]);
                return redirect()->route('chat.login');
            }

            // Get conversations for the chat user using the authenticated user's identifier
            $conversationsResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $chatToken,
                'Content-Type' => 'application/json'
            ])
            ->get("{$this->apiUrl}/chat-conversations", [
                'client_identifier' => $clientIdentifier,
                'user_id' => $chatUser['id']
            ]);

            if (!$conversationsResponse->successful()) {
                throw new \Exception('Failed to fetch conversations: ' . $conversationsResponse->body());
            }

            $conversations = $conversationsResponse->json()['data'] ?? [];

            return Inertia::render('Chat/Index', [
                'conversations' => $conversations,
                'user' => [
                    'id' => $chatUser['id'],
                    'name' => $chatUser['display_name'],
                    'email' => $chatUser['email'],
                    'identifier' => $clientIdentifier
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Chat index error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Display a specific conversation.
     */
    public function show(Request $request, $id)
    {
        $clientIdentifier = auth()->user()->identifier;

        // Check if user has chat authentication first
        $chatToken = $this->getChatToken($request);
        
        if (!$chatToken) {
            // If no token, redirect to login with user's identifier
            return redirect()->route('chat.login', ['client_identifier' => $clientIdentifier]);
        }

        try {
            // Get chat user profile to verify authentication and get user data
            $profileResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $chatToken,
                'Content-Type' => 'application/json'
            ])
            ->get("{$this->apiUrl}/chat-auth/profile");

            if (!$profileResponse->successful()) {
                // If profile request fails, redirect to login with user's identifier
                return redirect()->route('chat.login', ['client_identifier' => $clientIdentifier]);
            }

            $chatUser = $profileResponse->json()['data'] ?? null;
            if (!$chatUser) {
                return redirect()->route('chat.login', ['client_identifier' => $clientIdentifier]);
            }

            $userId = $chatUser['id'];

            // Get conversation details
            $conversationResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $chatToken,
                'Content-Type' => 'application/json'
            ])
            ->get("{$this->apiUrl}/chat-conversations/{$id}", [
                'client_identifier' => $clientIdentifier,
                'user_id' => $userId
            ]);

            if (!$conversationResponse->successful()) {
                throw new \Exception('Failed to fetch conversation: ' . $conversationResponse->body());
            }

            $conversation = $conversationResponse->json()['data'];

            // Get messages for the conversation
            $messagesResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $chatToken,
                'Content-Type' => 'application/json'
            ])
            ->get("{$this->apiUrl}/chat-messages", [
                'client_identifier' => $clientIdentifier,
                'conversation_id' => $id,
                'user_id' => $userId
            ]);

            if (!$messagesResponse->successful()) {
                throw new \Exception('Failed to fetch messages: ' . $messagesResponse->body());
            }

            $messages = $messagesResponse->json()['data'] ?? [];

            return Inertia::render('Chat/Conversation', [
                'conversation' => $conversation,
                'messages' => $messages,
                'user' => [
                    'id' => $chatUser['id'],
                    'name' => $chatUser['display_name'],
                    'email' => $chatUser['email'],
                    'identifier' => $clientIdentifier
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Create a new conversation.
     */
    public function createConversation(Request $request)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;

            // Get chat user from token
            $chatToken = $this->getChatToken($request);
            if (!$chatToken) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            // Get chat user profile
            $profileResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $chatToken,
                'Content-Type' => 'application/json'
            ])
            ->get("{$this->apiUrl}/chat-auth/profile");

            if (!$profileResponse->successful()) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            $chatUser = $profileResponse->json()['data'] ?? null;
            if (!$chatUser) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            $userId = $chatUser['id'];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $chatToken,
                'Content-Type' => 'application/json'
            ])
            ->post("{$this->apiUrl}/chat-conversations", [
                'client_identifier' => $clientIdentifier,
                'title' => $request->input('title'),
                'type' => $request->input('type', 'direct'),
                'participants' => $request->input('participants'),
                'created_by' => $userId
            ]);

            if (!$response->successful()) {
                throw new \Exception('Failed to create conversation: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Send a message.
     */
    public function sendMessage(Request $request)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;

            // Get chat user from token
            $chatToken = $this->getChatToken($request);
            if (!$chatToken) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            // Get chat user profile
            $profileResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $chatToken,
                'Content-Type' => 'application/json'
            ])
            ->get("{$this->apiUrl}/chat-auth/profile");

            if (!$profileResponse->successful()) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            $chatUser = $profileResponse->json()['data'] ?? null;
            if (!$chatUser) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            $userId = $chatUser['id'];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $chatToken,
                'Content-Type' => 'application/json'
            ])
            ->post("{$this->apiUrl}/chat-messages", [
                'client_identifier' => $clientIdentifier,
                'chat_conversation_id' => $request->input('conversation_id'),
                'sender_id' => $userId,
                'content' => $request->input('content'),
                'message_type' => $request->input('message_type', 'text'),
                'metadata' => $request->input('metadata', [])
            ]);

            if (!$response->successful()) {
                throw new \Exception('Failed to send message: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Mark messages as read.
     */
    public function markAsRead(Request $request)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;

            // Get chat user from token
            $chatToken = $this->getChatToken($request);
            if (!$chatToken) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            // Get chat user profile
            $profileResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $chatToken,
                'Content-Type' => 'application/json'
            ])
            ->get("{$this->apiUrl}/chat-auth/profile");

            if (!$profileResponse->successful()) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            $chatUser = $profileResponse->json()['data'] ?? null;
            if (!$chatUser) {
                return response()->json(['error' => 'Unauthenticated'], 401);
            }

            $userId = $chatUser['id'];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $chatToken,
                'Content-Type' => 'application/json'
            ])
            ->post("{$this->apiUrl}/chat-messages/mark-as-read", [
                'client_identifier' => $clientIdentifier,
                'conversation_id' => $request->input('conversation_id'),
                'user_id' => $userId
            ]);

            if (!$response->successful()) {
                throw new \Exception('Failed to mark messages as read: ' . $response->body());
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Debug method to test token authentication
     */
    public function debugToken(Request $request)
    {
        // Use the helper method to get the token
        $chatToken = $this->getChatToken($request);
        
        // Debug all cookies for troubleshooting
        $allCookies = request()->cookies->all();
        $cookieHeader = request()->header('Cookie');
        
        if (!$chatToken) {
            return response()->json([
                'error' => 'No token found',
                'debug' => [
                    'all_cookies' => $allCookies,
                    'cookie_header' => $cookieHeader
                ]
            ], 400);
        }

        try {
            // Test the profile endpoint directly with chat token
            $profileResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $chatToken,
                'Content-Type' => 'application/json'
            ])
            ->get("{$this->apiUrl}/chat-auth/profile");

            return response()->json([
                'token' => substr($chatToken, 0, 10) . '...',
                'status' => $profileResponse->status(),
                'response' => $profileResponse->json(),
                'response_body' => $profileResponse->body(),
                'response_headers' => $profileResponse->headers(),
                'api_url' => $this->apiUrl,
                'api_token' => substr($this->apiToken, 0, 10) . '...'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'token' => substr($chatToken, 0, 10) . '...',
                'api_url' => $this->apiUrl
            ]);
        }
    }

    /**
     * Get users for starting a new conversation.
     */
    public function getUsers()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            // Get chat token using the helper method
            $chatToken = $this->getChatToken(request());
            
            if (!$chatToken) {
                return response()->json(['error' => 'No chat token found'], 401);
            }

            // Get chat users from backend API
            $chatUsersResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $chatToken,
                'Content-Type' => 'application/json'
            ])
            ->get("{$this->apiUrl}/chat-auth/online-users", [
                'client_identifier' => $clientIdentifier
            ]);

            if (!$chatUsersResponse->successful()) {
                throw new \Exception('Failed to fetch chat users: ' . $chatUsersResponse->body());
            }

            $chatUsers = $chatUsersResponse->json()['data'] ?? [];

            // Transform chat users to user format for chat
            $users = array_map(function($chatUser) {
                return [
                    'id' => $chatUser['id'],
                    'name' => $chatUser['display_name'],
                    'email' => $chatUser['email'] ?? '',
                    'avatar_url' => $chatUser['avatar_url'] ?? '',
                    'is_online' => $chatUser['is_online'] ?? false,
                    'last_seen_at' => $chatUser['last_seen_at'] ?? null,
                ];
            }, $chatUsers);

            return response()->json([
                'status' => 'success',
                'data' => $users
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
