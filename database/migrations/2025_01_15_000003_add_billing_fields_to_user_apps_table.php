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
        Schema::table('user_apps', function (Blueprint $table) {
            $table->enum('billing_type', ['free', 'one_time', 'subscription'])->default('free')->after('module_identifier');
            $table->decimal('price_paid', 10, 2)->nullable()->after('billing_type');
            $table->foreignId('invoice_id')->nullable()->constrained()->onDelete('set null')->after('price_paid');
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending')->after('invoice_id');
            $table->string('payment_transaction_id')->nullable()->after('payment_status');
            $table->date('next_billing_date')->nullable()->after('payment_transaction_id');
            $table->boolean('auto_renew')->default(false)->after('next_billing_date');
            $table->date('cancelled_at')->nullable()->after('auto_renew');
            $table->text('cancellation_reason')->nullable()->after('cancelled_at');
            $table->json('billing_metadata')->nullable()->after('cancellation_reason');
            
            $table->index(['billing_type', 'payment_status']);
            $table->index(['next_billing_date']);
            $table->index(['auto_renew']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_apps', function (Blueprint $table) {
            $table->dropColumn([
                'billing_type',
                'price_paid',
                'invoice_id',
                'payment_status',
                'payment_transaction_id',
                'next_billing_date',
                'auto_renew',
                'cancelled_at',
                'cancellation_reason',
                'billing_metadata'
            ]);
        });
    }
};
