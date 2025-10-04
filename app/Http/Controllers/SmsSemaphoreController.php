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
        $clientIdentifier = auth()->user()->identifier;
        
        $accounts = \App\Models\SemaphoreAccount::where('client_identifier', $clientIdentifier)
            ->orderBy('is_verified', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        // Debug logging
        \Log::info('Semaphore Index Debug', [
            'client_identifier' => $clientIdentifier,
            'accounts_count' => $accounts->count(),
            'accounts' => $accounts->toArray()
        ]);

        // Simple debug output
        error_log('Semaphore Controller Called - Accounts: ' . $accounts->count());

        return Inertia::render('SMS/Semaphore/Index', [
            'messages' => [], // TODO: Fetch messages from your database
            'stats' => [
                'sent' => 0,
                'delivered' => 0,
                'failed' => 0
            ],
            'accounts' => $accounts,
            'hasActiveAccount' => $accounts->where('is_active', true)->where('is_verified', true)->count() > 0
        ]);
    }

    public function send(Request $request)
    {
        $request->validate([
            'to' => 'required|string',
            'message' => 'required|string|max:160', // Semaphore has a 160 character limit per message
            'account_id' => 'required|integer|exists:semaphore_accounts,id',
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;
            
            // Get the Semaphore account
            $semaphoreAccount = \App\Models\SemaphoreAccount::where('client_identifier', $clientIdentifier)
                ->where('id', $request->account_id)
                ->where('is_active', true)
                ->where('is_verified', true)
                ->first();

            if (!$semaphoreAccount) {
                return back()->with('error', 'Semaphore account not found or not verified');
            }

            $response = Http::post($this->apiEndpoint . '/messages', [
                'apikey' => $semaphoreAccount->api_key,
                'number' => $request->to,
                'message' => $request->message,
                'sendername' => $semaphoreAccount->sender_name,
            ]);

            if ($response->successful()) {
                // TODO: Save message to database with account reference
                return back()->with('success', 'Message sent successfully!');
            }

            return back()->with('error', 'Failed to send message: ' . $response->body());
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to send message: ' . $e->getMessage());
        }
    }

    public function getBalance(Request $request)
    {
        $request->validate([
            'account_id' => 'required|integer|exists:semaphore_accounts,id',
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;
            
            // Get the Semaphore account
            $semaphoreAccount = \App\Models\SemaphoreAccount::where('client_identifier', $clientIdentifier)
                ->where('id', $request->account_id)
                ->where('is_active', true)
                ->where('is_verified', true)
                ->first();

            if (!$semaphoreAccount) {
                return response()->json(['error' => 'Semaphore account not found or not verified'], 404);
            }
            
            $response = Http::get($this->apiEndpoint . '/account', [
                'apikey' => $semaphoreAccount->api_key
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

    public function getMessageStatus(Request $request, $messageId)
    {
        $request->validate([
            'account_id' => 'required|integer|exists:semaphore_accounts,id',
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;
            
            // Get the Semaphore account
            $semaphoreAccount = \App\Models\SemaphoreAccount::where('client_identifier', $clientIdentifier)
                ->where('id', $request->account_id)
                ->where('is_active', true)
                ->where('is_verified', true)
                ->first();

            if (!$semaphoreAccount) {
                return response()->json(['error' => 'Semaphore account not found or not verified'], 404);
            }
            
            $response = Http::get($this->apiEndpoint . '/messages/' . $messageId, [
                'apikey' => $semaphoreAccount->api_key
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

    public function getPricing(Request $request)
    {
        $request->validate([
            'account_id' => 'required|integer|exists:semaphore_accounts,id',
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;
            
            // Get the Semaphore account
            $semaphoreAccount = \App\Models\SemaphoreAccount::where('client_identifier', $clientIdentifier)
                ->where('id', $request->account_id)
                ->where('is_active', true)
                ->where('is_verified', true)
                ->first();

            if (!$semaphoreAccount) {
                return response()->json(['error' => 'Semaphore account not found or not verified'], 404);
            }
            
            $response = Http::get($this->apiEndpoint . '/pricing', [
                'apikey' => $semaphoreAccount->api_key
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
