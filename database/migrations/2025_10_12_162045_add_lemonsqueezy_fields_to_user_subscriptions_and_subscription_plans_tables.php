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
        // Add Lemon Squeezy fields to user_subscriptions table
        if (!Schema::hasColumn('user_subscriptions', 'lemonsqueezy_checkout_id')) {
            Schema::table('user_subscriptions', function (Blueprint $table) {
                $table->string('lemonsqueezy_checkout_id')->nullable()->after('stripe_subscription_id');
                $table->string('lemonsqueezy_subscription_id')->nullable()->after('lemonsqueezy_checkout_id');
            });
        }
        
        // Add Lemon Squeezy variant ID to subscription_plans table
        if (!Schema::hasColumn('subscription_plans', 'lemon_squeezy_variant_id')) {
            Schema::table('subscription_plans', function (Blueprint $table) {
                $table->string('lemon_squeezy_variant_id')->nullable()->after('slug');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove Lemon Squeezy fields from user_subscriptions table
        Schema::table('user_subscriptions', function (Blueprint $table) {
            $table->dropColumn(['lemonsqueezy_checkout_id', 'lemonsqueezy_subscription_id']);
        });
        
        // Remove Lemon Squeezy variant ID from subscription_plans table
        Schema::table('subscription_plans', function (Blueprint $table) {
            $table->dropColumn('lemon_squeezy_variant_id');
        });
    }
};
