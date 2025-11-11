<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('wallet_id');
            $table->unsignedBigInteger('customer_id');
            $table->string('client_identifier')->nullable()->index();
            $table->string('type', 32);
            $table->string('status', 32)->default('completed');
            $table->decimal('amount', 18, 2);
            $table->decimal('balance_before', 18, 2);
            $table->decimal('balance_after', 18, 2);
            $table->string('reference')->nullable();
            $table->string('description')->nullable();
            $table->unsignedBigInteger('source_wallet_id')->nullable();
            $table->unsignedBigInteger('target_wallet_id')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('transaction_at')->useCurrent();
            $table->timestamps();

            $table->index(['customer_id', 'transaction_at']);
            $table->index('reference');

            $table->foreign('wallet_id')
                ->references('id')
                ->on('customer_wallets')
                ->onDelete('cascade');
            $table->foreign('source_wallet_id')
                ->references('id')
                ->on('customer_wallets')
                ->nullOnDelete();
            $table->foreign('target_wallet_id')
                ->references('id')
                ->on('customer_wallets')
                ->nullOnDelete();
            $table->foreign('created_by')
                ->references('id')
                ->on('users')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};

