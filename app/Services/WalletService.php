<?php

namespace App\Services;

use App\Models\CustomerWallet;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WalletService
{
    public function getOrCreateWallet(User $customer, ?string $clientIdentifier = null): CustomerWallet
    {
        return CustomerWallet::firstOrCreate(
            ['customer_id' => $customer->id],
            [
                'client_identifier' => $clientIdentifier ?? ($customer->project_identifier ?? null),
                'currency' => 'USD',
            ],
        );
    }

    public function credit(
        CustomerWallet $wallet,
        float $amount,
        string $type,
        array $context = []
    ): WalletTransaction {
        return $this->recordTransaction($wallet, $amount, $type, 'credit', $context);
    }

    public function debit(
        CustomerWallet $wallet,
        float $amount,
        string $type,
        array $context = []
    ): WalletTransaction {
        if (bccomp($wallet->balance, $amount, 2) === -1) {
            throw new ModelNotFoundException('Insufficient balance.');
        }

        return $this->recordTransaction($wallet, $amount, $type, 'debit', $context);
    }

    public function transfer(
        CustomerWallet $fromWallet,
        CustomerWallet $toWallet,
        float $amount,
        array $context = []
    ): array {
        if ($fromWallet->id === $toWallet->id) {
            throw new \InvalidArgumentException('Cannot transfer to the same wallet.');
        }

        $reference = $context['reference'] ?? Str::uuid()->toString();

        return DB::transaction(function () use ($fromWallet, $toWallet, $amount, $context, $reference) {
            $debitTransaction = $this->recordTransaction(
                $fromWallet,
                $amount,
                'transfer_out',
                'debit',
                array_merge($context, [
                    'reference' => $reference,
                    'target_wallet_id' => $toWallet->id,
                    'customer_id' => $fromWallet->customer_id,
                ])
            );

            $creditTransaction = $this->recordTransaction(
                $toWallet,
                $amount,
                'transfer_in',
                'credit',
                array_merge($context, [
                    'reference' => $reference,
                    'source_wallet_id' => $fromWallet->id,
                    'customer_id' => $toWallet->customer_id,
                ])
            );

            return [$debitTransaction, $creditTransaction];
        });
    }

    protected function recordTransaction(
        CustomerWallet $wallet,
        float $amount,
        string $type,
        string $direction,
        array $context = []
    ): WalletTransaction {
        return DB::transaction(function () use ($wallet, $amount, $type, $direction, $context) {
            $wallet->refresh();
            $before = $wallet->balance;

            if ($direction === 'credit') {
                $wallet->credit($amount);
            } else {
                if (bccomp($wallet->balance, $amount, 2) === -1) {
                    throw new ModelNotFoundException('Insufficient balance.');
                }
                $wallet->debit($amount);
            }

            $wallet->save();

            return WalletTransaction::create([
                'wallet_id' => $wallet->id,
                'customer_id' => $context['customer_id'] ?? $wallet->customer_id,
                'client_identifier' => $context['client_identifier'] ?? $wallet->client_identifier,
                'type' => $type,
                'status' => $context['status'] ?? 'completed',
                'amount' => $amount,
                'balance_before' => $before,
                'balance_after' => $wallet->balance,
                'reference' => $context['reference'] ?? Str::uuid()->toString(),
                'description' => $context['description'] ?? null,
                'source_wallet_id' => $context['source_wallet_id'] ?? null,
                'target_wallet_id' => $context['target_wallet_id'] ?? null,
                'created_by' => $context['created_by'] ?? null,
                'metadata' => $context['metadata'] ?? null,
                'transaction_at' => $context['transaction_at'] ?? now(),
            ]);
        });
    }
}

