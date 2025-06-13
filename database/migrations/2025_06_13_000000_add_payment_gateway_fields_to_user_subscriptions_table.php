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
        Schema::table('user_subscriptions', function (Blueprint $table) {
            // Maya fields
            $table->string('maya_subscription_id')->nullable()->after('maya_checkout_id');
            $table->string('maya_payment_token_id')->nullable()->after('maya_subscription_id');
            
            // Stripe fields
            $table->string('stripe_session_id')->nullable()->after('maya_payment_token_id');
            $table->string('stripe_subscription_id')->nullable()->after('stripe_session_id');
            
            // Billing fields
            $table->dateTime('next_billing_date')->nullable()->after('stripe_subscription_id');
            $table->string('billing_cycle')->nullable()->after('next_billing_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_subscriptions', function (Blueprint $table) {
            $table->dropColumn([
                'maya_subscription_id',
                'maya_payment_token_id',
                'stripe_session_id',
                'stripe_subscription_id',
                'next_billing_date',
                'billing_cycle'
            ]);
        });
    }
}; 