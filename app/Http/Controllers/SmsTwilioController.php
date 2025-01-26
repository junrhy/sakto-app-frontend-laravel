<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Twilio\Rest\Client;

class SmsTwilioController extends Controller
{
    public function index()
    {
        return Inertia::render('SMS/Twilio/Index', [
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
