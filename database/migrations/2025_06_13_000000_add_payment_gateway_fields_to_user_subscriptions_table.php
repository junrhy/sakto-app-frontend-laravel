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
        if (!Schema::hasColumn('user_subscriptions', 'stripe_session_id') && !Schema::hasColumn('user_subscriptions', 'stripe_subscription_id')) {
            Schema::table('user_subscriptions', function (Blueprint $table) {
                $table->string('stripe_session_id')->nullable()->after('maya_payment_token_id');
                $table->string('stripe_subscription_id')->nullable()->after('stripe_session_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('user_subscriptions', 'stripe_session_id') && Schema::hasColumn('user_subscriptions', 'stripe_subscription_id')) {
            $count = DB::table('user_subscriptions')->count();
            if ($count === 0) {
                Schema::table('user_subscriptions', function (Blueprint $table) {
                    $table->dropColumn([
                        'stripe_session_id',
                        'stripe_subscription_id'
                    ]);
                });
            }
        }
    }
}; 