<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    public function __construct(protected WalletService $walletService)
    {
    }

    public function index(Request $request): Response
    {
        $wallet = null;
        $transactions = [];
        $customer = null;

        if ($request->filled('contact_number')) {
            $customer = User::query()
                ->where('contact_number', $request->input('contact_number'))
                ->first();

            if ($customer) {
                $wallet = $this->walletService->getOrCreateWallet($customer);

                $transactions = $wallet
                    ->transactions()
                    ->latest('transaction_at')
                    ->limit(50)
                    ->get();
            }
        }

        return Inertia::render('Admin/Wallets/Index', [
            'customer' => $customer,
            'wallet' => $wallet,
            'transactions' => $transactions,
            'filters' => $request->only('contact_number'),
        ]);
    }

    public function topUp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contact_number' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'reference' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:255',
        ]);

        $customer = User::query()
            ->where('contact_number', $validated['contact_number'])
            ->first();

        if (!$customer) {
            throw ValidationException::withMessages([
                'contact_number' => 'Customer not found for the provided contact number.',
            ]);
        }

        $wallet = $this->walletService->getOrCreateWallet($customer);

        $transaction = $this->walletService->credit(
            $wallet,
            (float) $validated['amount'],
            'admin_manual_top_up',
            [
                'reference' => $validated['reference'] ?? null,
                'description' => $validated['description'] ?? null,
                'created_by' => $request->user()->id,
                'metadata' => [
                    'initiated_via' => 'admin_portal',
                ],
            ],
        );

        return response()->json([
            'message' => 'Funds added successfully.',
            'transaction' => $transaction,
        ]);
    }
}

