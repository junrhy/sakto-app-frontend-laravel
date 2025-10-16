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
        if (!Schema::hasTable('invoices')) {
            Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->string('user_identifier');
            $table->enum('type', ['subscription', 'app_purchase', 'app_subscription']);
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);
            $table->enum('status', ['draft', 'pending', 'paid', 'failed', 'cancelled', 'refunded']);
            $table->enum('payment_method', ['credits'])->nullable();
            $table->string('payment_transaction_id')->nullable();
            $table->text('notes')->nullable();
            $table->date('due_date')->nullable();
            $table->date('paid_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['user_identifier', 'status']);
            $table->index(['type', 'status']);
            $table->index(['due_date']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
