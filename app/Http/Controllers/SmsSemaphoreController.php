<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class SmsSemaphoreController extends Controller
{
    protected $apiEndpoint = 'https://api.semaphore.co/api/v4';

    public function index()
    {
        return Inertia::render('SMS/Semaphore/Index', [
            'messages' => [], // TODO: Fetch messages from your database
            'stats' => [
                'sent' => 0,
                'delivered' => 0,
                'failed' => 0
            ]
        ]);
    }

    public function send(Request $request)
    {
        $request->validate([
            'to' => 'required|string',
            'message' => 'required|string|max:160', // Semaphore has a 160 character limit per message
        ]);

        try {
            $apiKey = config('services.semaphore.key');
            $sender = config('services.semaphore.sender_name');

            $response = Http::post($this->apiEndpoint . '/messages', [
                'apikey' => $apiKey,
                'number' => $request->to,
                'message' => $request->message,
                'sendername' => $sender,
            ]);

            if ($response->successful()) {
                // TODO: Save message to database
                return back()->with('success', 'Message sent successfully!');
            }

            return back()->with('error', 'Failed to send message: ' . $response->body());
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to send message: ' . $e->getMessage());
        }
    }

    public function getBalance()
    {
        try {
            $apiKey = config('services.semaphore.key');
            
            $response = Http::get($this->apiEndpoint . '/account', [
                'apikey' => $apiKey
            ]);

            if ($response->successful()) {
                $account = $response->json();
                return response()->json([
                    'balance' => $account['credit_balance'] ?? 0,
                    'currency' => 'PHP'
                ]);
            }

            return response()->json(['error' => 'Failed to fetch balance'], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getMessageStatus($messageId)
    {
        try {
            $apiKey = config('services.semaphore.key');
            
            $response = Http::get($this->apiEndpoint . '/messages/' . $messageId, [
                'apikey' => $apiKey
            ]);

            if ($response->successful()) {
                $message = $response->json();
                return response()->json([
                    'status' => $message['status'] ?? 'unknown',
                    'error_code' => $message['error_code'] ?? null,
                    'error_message' => $message['error_message'] ?? null
                ]);
            }

            return response()->json(['error' => 'Failed to fetch message status'], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getPricing()
    {
        try {
            $apiKey = config('services.semaphore.key');
            
            $response = Http::get($this->apiEndpoint . '/pricing', [
                'apikey' => $apiKey
            ]);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json(['error' => 'Failed to fetch pricing'], 500);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
