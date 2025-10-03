<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class SmsWhatsAppController extends Controller
{
    public function index()
    {
        return Inertia::render('SMS/WhatsApp/Index', [
            'messages' => [], // TODO: Fetch messages from your database
            'stats' => [
                'sent' => 0,
                'delivered' => 0,
                'failed' => 0
            ]
        ]);
    }

    public function getBalance()
    {
        try {
            $accessToken = config('services.whatsapp.access_token');
            $phoneNumberId = config('services.whatsapp.phone_number_id');
            
            if (!$accessToken || !$phoneNumberId) {
                return response()->json([
                    'error' => 'WhatsApp credentials not configured'
                ], 400);
            }

            // TODO: Implement actual WhatsApp API balance check
            // For now, return a placeholder response
            return response()->json([
                'balance' => 0.00,
                'currency' => 'USD'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch WhatsApp balance: ' . $e->getMessage()
            ], 500);
        }
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'to' => 'required|array',
            'to.*' => 'required|string',
            'message' => 'required|string|max:1000',
        ]);

        try {
            $accessToken = config('services.whatsapp.access_token');
            $phoneNumberId = config('services.whatsapp.phone_number_id');
            
            if (!$accessToken || !$phoneNumberId) {
                return response()->json([
                    'error' => 'WhatsApp credentials not configured'
                ], 400);
            }

            $recipients = $request->input('to');
            $message = $request->input('message');
            $results = [];

            foreach ($recipients as $recipient) {
                // TODO: Implement actual WhatsApp API message sending
                // For now, return a placeholder response
                $results[] = [
                    'recipient' => $recipient,
                    'message_id' => 'wa_' . uniqid(),
                    'status' => 'sent'
                ];
            }

            return response()->json([
                'success' => true,
                'message' => 'WhatsApp messages sent successfully',
                'results' => $results
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to send WhatsApp message: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getPricing()
    {
        try {
            // TODO: Implement actual WhatsApp API pricing check
            // For now, return a placeholder response
            return response()->json([
                'cost_per_message' => 0.05, // $0.05 per WhatsApp message
                'currency' => 'USD'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch WhatsApp pricing: ' . $e->getMessage()
            ], 500);
        }
    }
}
