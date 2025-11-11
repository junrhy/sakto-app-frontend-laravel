<?php

namespace App\Http\Controllers\Customer;

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
        $customer = $request->user();

        $wallet = $this->walletService->getOrCreateWallet($customer);

        $transactions = $wallet
            ->transactions()
            ->latest('transaction_at')
            ->limit(20)
            ->get();

        return Inertia::render('Customer/Wallet/Index', [
            'wallet' => $wallet,
            'transactions' => $transactions,
            'isAdmin' => (bool) $customer->is_admin,
        ]);
    }

    public function history(Request $request): JsonResponse
    {
        $wallet = $this->walletService->getOrCreateWallet($request->user());

        $transactions = $wallet
            ->transactions()
            ->when($request->filled('type'), fn ($query) => $query->where('type', $request->input('type')))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->input('status')))
            ->when(
                $request->filled('from'),
                fn ($query) => $query->whereDate('transaction_at', '>=', $request->input('from'))
            )
            ->when(
                $request->filled('to'),
                fn ($query) => $query->whereDate('transaction_at', '<=', $request->input('to'))
            )
            ->orderByDesc('transaction_at')
            ->paginate($request->integer('per_page', 20));

        return response()->json($transactions);
    }

    public function transfer(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contact_number' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:255',
        ]);

        $sender = $request->user();
        $recipient = $this->resolveCustomer($validated['contact_number']);

        if ($recipient->id === $sender->id) {
            throw ValidationException::withMessages([
                'contact_number' => 'You cannot transfer funds to yourself.',
            ]);
        }

        $senderWallet = $this->walletService->getOrCreateWallet($sender);
        $recipientWallet = $this->walletService->getOrCreateWallet($recipient);

        [$debit, $credit] = $this->walletService->transfer(
            $senderWallet,
            $recipientWallet,
            (float) $validated['amount'],
            [
                'description' => $validated['description'],
                'metadata' => [
                    'initiated_by' => $sender->id,
                    'initiated_at' => now(),
                ],
            ]
        );

        return response()->json([
            'message' => 'Transfer completed successfully.',
            'debit' => $debit,
            'credit' => $credit,
        ]);
    }

    public function topUp(Request $request): JsonResponse
    {
        abort_unless($request->user()->is_admin, 403, 'Unauthorized');

        $validated = $request->validate([
            'customer' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'reference' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:255',
        ]);

        $customer = $this->resolveCustomer($validated['customer']);
        $wallet = $this->walletService->getOrCreateWallet($customer);

        $transaction = $this->walletService->credit(
            $wallet,
            (float) $validated['amount'],
            'manual_top_up',
            [
                'reference' => $validated['reference'],
                'description' => $validated['description'],
                'created_by' => $request->user()->id,
                'metadata' => [
                    'source' => 'customer_portal_admin_top_up',
                ],
            ]
        );

        return response()->json([
            'message' => 'Funds added successfully.',
            'transaction' => $transaction,
        ]);
    }

    protected function resolveCustomer(string $value): User
    {
        $customer = User::query()
            ->where('contact_number', $value)
            ->orWhere('id', $value)
            ->orWhere('identifier', $value)
            ->orWhere('email', $value)
            ->first();

        if (!$customer) {
            throw ValidationException::withMessages([
                'contact_number' => 'Customer not found.',
            ]);
        }

        if ($customer->user_type !== 'customer') {
            throw ValidationException::withMessages([
                'contact_number' => 'Recipient must be a customer account.',
            ]);
        }

        return $customer;
    }
}

