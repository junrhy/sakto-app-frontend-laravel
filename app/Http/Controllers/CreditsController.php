<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class CreditsController extends Controller
{
    public function buy()
    {
        // Simulated payment history data - replace with actual data from your API
        $paymentHistory = [
            [
                'id' => 1,
                'date' => '2024-03-15 14:30:00',
                'credits' => 500,
                'amount' => 450.00,
                'payment_method' => 'GCash',
                'transaction_id' => 'GC123456789',
                'status' => 'completed',
            ],
            [
                'id' => 2,
                'date' => '2024-03-10 09:15:00',
                'credits' => 100,
                'amount' => 100.00,
                'payment_method' => 'Maya',
                'transaction_id' => 'MP987654321',
                'status' => 'pending',
            ],
            // Add more history items as needed
        ];

        return Inertia::render('Credits/Buy', [
            'packages' => [
                [
                    'id' => 1,
                    'credits' => 100,
                    'price' => 100.00,
                    'popular' => false,
                ],
                [
                    'id' => 2,
                    'credits' => 500,
                    'price' => 450.00,
                    'popular' => true,
                    'savings' => '10%',
                ],
                [
                    'id' => 3,
                    'credits' => 1000,
                    'price' => 800.00,
                    'popular' => false,
                    'savings' => '20%',
                ],
            ],
            'paymentMethods' => [
                [
                    'id' => 'gcash',
                    'name' => 'GCash',
                    'accountName' => 'John Doe',
                    'accountNumber' => '09123456789',
                ],
                [
                    'id' => 'maya',
                    'name' => 'Maya',
                    'accountName' => 'John Doe',
                    'accountNumber' => '09123456789',
                ],
                [
                    'id' => 'bank',
                    'name' => 'Bank Transfer',
                    'accountName' => 'John Doe',
                    'accountNumber' => '1234567890',
                    'bankName' => 'BDO'
                ],
            ],
            'paymentHistory' => $paymentHistory
        ]);
    }

    public function purchase(Request $request)
    {
        $request->validate([
            'package_id' => 'required|integer|min:1|max:3',
            'payment_method' => 'required|in:gcash,maya,bank',
            'transaction_id' => 'required|string|max:255',
            'proof_of_payment' => 'required|image|max:5120', // 5MB max
        ]);

        try {
            // Get package details
            $packages = [
                1 => ['credits' => 100, 'price' => 10.00],
                2 => ['credits' => 500, 'price' => 45.00],
                3 => ['credits' => 1000, 'price' => 80.00],
            ];

            $package = $packages[$request->package_id];

            // Store the proof of payment
            $proofPath = $request->file('proof_of_payment')->store('payment-proofs', 'public');

            // Make API call to external payment/credits service
            $response = Http::post(env('CREDITS_API_URL') . '/purchase', [
                'user_id' => $request->user()->id,
                'package_id' => $request->package_id,
                'amount' => $package['price'],
                'credits' => $package['credits'],
                'payment_method' => $request->payment_method,
                'transaction_id' => $request->transaction_id,
                'proof_of_payment_url' => Storage::url($proofPath),
            ]);

            if (!$response->successful()) {
                // Delete the uploaded file if API call fails
                Storage::disk('public')->delete($proofPath);
                throw new \Exception($response->json()['message'] ?? 'Failed to process purchase');
            }

            return response()->json([
                'success' => true,
                'message' => 'Purchase submitted successfully. We will verify your payment and credit your account.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
