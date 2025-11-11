<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomerWallet;
use App\Models\User;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class WalletController extends Controller
{
    public function __construct(protected WalletService $walletService)
    {
    }

    public function show(Request $request, User $customer): JsonResponse
    {
        $wallet = $this->walletService->getOrCreateWallet($customer);

        $transactions = $wallet->transactions()
            ->latest('transaction_at')
            ->limit($request->integer('limit', 20))
            ->get();

        return response()->json([
            'wallet' => $wallet,
            'transactions' => $transactions,
        ]);
    }

    public function history(Request $request, User $customer): JsonResponse
    {
        $wallet = $this->walletService->getOrCreateWallet($customer);

        $transactions = $wallet
            ->transactions()
            ->when($request->filled('type'), fn ($query) => $query->where('type', $request->input('type')))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->input('status')))
            ->when($request->filled('from'), fn ($query) => $query->whereDate('transaction_at', '>=', $request->input('from')))
            ->when($request->filled('to'), fn ($query) => $query->whereDate('transaction_at', '<=', $request->input('to')))
            ->orderByDesc('transaction_at')
            ->paginate($request->integer('per_page', 20));

        return response()->json($transactions);
    }

    public function transfer(Request $request): JsonResponse
    {
        $request->validate([
            'recipient' => 'required',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:255',
        ]);

        /** @var User $sender */
        $sender = $request->user();

        $recipient = $this->resolveRecipient($request->input('recipient'));

        if ($recipient->id === $sender->id) {
            throw ValidationException::withMessages([
                'recipient' => 'You cannot transfer funds to yourself.',
            ]);
        }

        $senderWallet = $this->walletService->getOrCreateWallet($sender);
        $recipientWallet = $this->walletService->getOrCreateWallet($recipient);

        [$debit, $credit] = $this->walletService->transfer(
            $senderWallet,
            $recipientWallet,
            (float) $request->input('amount'),
            [
                'description' => $request->input('description'),
                'metadata' => [
                    'initiated_by' => $sender->id,
                    'initiated_at' => now(),
                ],
            ],
        );

        return response()->json([
            'message' => 'Transfer completed successfully.',
            'debit' => $debit,
            'credit' => $credit,
        ]);
    }

    public function topUp(Request $request, User $customer): JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'reference' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:255',
        ]);

        /** @var User $admin */
        $admin = $request->user();

        if (!$admin->is_admin) {
            abort(403, 'Unauthorized.');
        }

        $wallet = $this->walletService->getOrCreateWallet($customer);

        $transaction = $this->walletService->credit(
            $wallet,
            (float) $request->input('amount'),
            'manual_top_up',
            [
                'reference' => $request->input('reference'),
                'description' => $request->input('description'),
                'created_by' => $admin->id,
                'metadata' => [
                    'source' => 'admin_manual_top_up',
                ],
            ],
        );

        return response()->json([
            'message' => 'Funds added successfully.',
            'transaction' => $transaction,
        ]);
    }

    protected function resolveRecipient(string $value): User
    {
        $recipient = User::query()
            ->where('id', $value)
            ->orWhere('identifier', $value)
            ->orWhere('email', $value)
            ->orWhere('contact_number', $value)
            ->first();

        if (!$recipient) {
            throw ValidationException::withMessages([
                'recipient' => 'Recipient not found.',
            ]);
        }

        if ($recipient->user_type !== 'customer') {
            throw ValidationException::withMessages([
                'recipient' => 'Recipient must be a customer account.',
            ]);
        }

        return $recipient;
    }
}

