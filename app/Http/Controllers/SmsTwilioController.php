<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Twilio\Rest\Client;

class SmsTwilioController extends Controller
{
    protected $apiUrl, $apiToken;

    public function __construct()
    {
        $this->apiUrl = config('api.url');
        $this->apiToken = config('api.token');
    }

    public function index()
    {
        $clientIdentifier = auth()->user()->identifier;
        
        $accounts = \App\Models\TwilioAccount::where('client_identifier', $clientIdentifier)
            ->orderBy('is_verified', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('SMS/Twilio/Index', [
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

    public function settings()
    {
        try {
            $clientIdentifier = auth()->user()->identifier;
            
            // Get all Twilio accounts for the client
            $accounts = \App\Models\TwilioAccount::where('client_identifier', $clientIdentifier)
                ->orderBy('is_verified', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();

            // Get the active account (first verified and active account)
            $activeAccount = $accounts->where('is_active', true)->where('is_verified', true)->first();

            $settings = [
                'accounts' => $accounts,
                'active_account' => $activeAccount,
                'has_active_account' => $activeAccount !== null,
                'message_templates' => [
                    'appointment_reminder' => 'Hi {name}, reminder for your appointment on {date} at {time}.',
                    'payment_confirmation' => 'Thank you for your payment of {amount}.',
                    'general_notification' => 'Important: {message}'
                ],
                'notification_preferences' => [
                    'send_reminders' => true,
                    'send_confirmations' => true,
                    'reminder_time' => '24h'
                ]
            ];

            return Inertia::render('SMS/Settings', [
                'settings' => $settings,
                'auth' => [
                    'user' => auth()->user()
                ]
            ]);
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load settings');
        }
    }

    public function send(Request $request)
    {
        $request->validate([
            'to' => 'required|string',
            'message' => 'required|string|max:1600',
            'account_id' => 'required|integer|exists:twilio_accounts,id',
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;
            
            // Get the Twilio account
            $twilioAccount = \App\Models\TwilioAccount::where('client_identifier', $clientIdentifier)
                ->where('id', $request->account_id)
                ->where('is_active', true)
                ->where('is_verified', true)
                ->first();

            if (!$twilioAccount) {
                return back()->with('error', 'Twilio account not found or not verified');
            }

            $client = new Client($twilioAccount->account_sid, $twilioAccount->auth_token);

            // Use the account's phone number
            $fromNumber = $twilioAccount->phone_number;
            
            if (!$fromNumber) {
                return back()->with('error', 'No phone number configured for this Twilio account. Please add a phone number in the account settings.');
            }

            $message = $client->messages->create(
                $request->to,
                [
                    'from' => $fromNumber,
                    'body' => $request->message
                ]
            );

            // TODO: Save message to database with account reference

            return back()->with('success', 'Message sent successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to send message: ' . $e->getMessage());
        }
    }

    public function getBalance(Request $request)
    {
        $request->validate([
            'account_id' => 'required|integer|exists:twilio_accounts,id',
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;
            
            // Get the Twilio account
            $twilioAccount = \App\Models\TwilioAccount::where('client_identifier', $clientIdentifier)
                ->where('id', $request->account_id)
                ->where('is_active', true)
                ->where('is_verified', true)
                ->first();

            if (!$twilioAccount) {
                return response()->json(['error' => 'Twilio account not found or not verified'], 404);
            }

            $client = new Client($twilioAccount->account_sid, $twilioAccount->auth_token);
            $account = $client->api->v2010->accounts($twilioAccount->account_sid)->fetch();

            return response()->json([
                'balance' => $account->balance,
                'currency' => 'USD'
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getMessageStatus(Request $request, $messageId)
    {
        $request->validate([
            'account_id' => 'required|integer|exists:twilio_accounts,id',
        ]);

        try {
            $clientIdentifier = auth()->user()->identifier;
            
            // Get the Twilio account
            $twilioAccount = \App\Models\TwilioAccount::where('client_identifier', $clientIdentifier)
                ->where('id', $request->account_id)
                ->where('is_active', true)
                ->where('is_verified', true)
                ->first();

            if (!$twilioAccount) {
                return response()->json(['error' => 'Twilio account not found or not verified'], 404);
            }

            $client = new Client($twilioAccount->account_sid, $twilioAccount->auth_token);
            $message = $client->messages($messageId)->fetch();

            return response()->json([
                'status' => $message->status,
                'error_code' => $message->errorCode,
                'error_message' => $message->errorMessage
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
