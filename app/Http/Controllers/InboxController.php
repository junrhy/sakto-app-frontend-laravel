<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InboxController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    public function index()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            Log::info('Fetching messages from API', [
                'url' => "{$this->apiUrl}/messages",
                'client_identifier' => $clientIdentifier
            ]);

            $response = Http::withToken($this->apiToken)
                ->get("{$this->apiUrl}/messages", [
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                Log::error('Failed to fetch messages', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'url' => "{$this->apiUrl}/messages"
                ]);
                
                return back()->withErrors(['error' => 'Failed to fetch messages']);
            }

            $messages = $response->json('messages', []);
            $unreadCount = $response->json('unread_count', 0);

            Log::info('API Response Debug', [
                'full_response' => $response->json(),
                'messages' => $messages,
                'unread_count' => $unreadCount,
                'response_status' => $response->status()
            ]);

            // Transform the API response to match the frontend Message interface
            $transformedMessages = array_map(function ($message) {
                return [
                    'id' => $message['id'],
                    'title' => $message['title'],
                    'content' => $message['content'],
                    'timestamp' => $message['created_at'],
                    'type' => $message['type'] ?? 'notification',
                    'isRead' => $message['is_read'] ?? false,
                ];
            }, $messages);

            return Inertia::render('Inbox', [
                'messages' => $transformedMessages,
                'unreadCount' => $unreadCount
            ]);
        } catch (\Exception $e) {
            Log::error('Exception in messages index', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return back()->withErrors(['error' => 'An error occurred while fetching messages']);
        }
    }

    public function markAsRead(Request $request, $id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->patch("{$this->apiUrl}/messages/{$id}/read", [
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                Log::error('Failed to mark message as read', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'message_id' => $id
                ]);
                
                return response()->json(['error' => 'Failed to mark message as read'], 500);
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Exception in marking message as read', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'message_id' => $id
            ]);
            
            return response()->json(['error' => 'An error occurred while marking message as read'], 500);
        }
    }

    public function delete(Request $request, $id)
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            $response = Http::withToken($this->apiToken)
                ->delete("{$this->apiUrl}/messages/{$id}", [
                    'client_identifier' => $clientIdentifier
                ]);

            if (!$response->successful()) {
                Log::error('Failed to delete message', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'message_id' => $id
                ]);
                
                return response()->json(['error' => 'Failed to delete message'], 500);
            }

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            Log::error('Exception in deleting message', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'message_id' => $id
            ]);
            
            return response()->json(['error' => 'An error occurred while deleting message'], 500);
        }
    }
} 