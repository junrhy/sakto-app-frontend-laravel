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
        return Inertia::render('SMS/Twilio', [
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    public function settings()
    {
        try {
            // $clientIdentifier = auth()->user()->identifier;
            // $response = Http::withToken($this->apiToken)
            //     ->get("{$this->apiUrl}/sms/settings", [
            //         'client_identifier' => $clientIdentifier
            //     ]);

            // if (!$response->successful()) {
            //     throw new \Exception('Failed to fetch SMS settings');
            // }

            // Dummy data
            $dummySettings = [
                'data' => [
                    'twilio_account_sid' => 'AC********************************',
                    'twilio_auth_token' => '********************************',
                    'twilio_phone_number' => '+1234567890',
                    'default_country_code' => '+1',
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
                ]
            ];

            return Inertia::render('SMS/Settings', [
                'settings' => $dummySettings['data'],
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
        ]);

        try {
            $account_sid = config('services.twilio.sid');
            $auth_token = config('services.twilio.token');
            $twilio_number = config('services.twilio.phone_number');

            $client = new Client($account_sid, $auth_token);

            $message = $client->messages->create(
                $request->to,
                [
                    'from' => $twilio_number,
                    'body' => $request->message
                ]
            );

            // TODO: Save message to database

            return back()->with('success', 'Message sent successfully!');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to send message: ' . $e->getMessage());
        }
    }

    public function getBalance()
    {
        try {
            $account_sid = config('services.twilio.sid');
            $auth_token = config('services.twilio.token');

            $client = new Client($account_sid, $auth_token);
            $account = $client->api->v2010->accounts($account_sid)->fetch();

            return response()->json([
                'balance' => $account->balance,
                'currency' => 'USD'
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getMessageStatus($messageId)
    {
        try {
            $account_sid = config('services.twilio.sid');
            $auth_token = config('services.twilio.token');

            $client = new Client($account_sid, $auth_token);
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
