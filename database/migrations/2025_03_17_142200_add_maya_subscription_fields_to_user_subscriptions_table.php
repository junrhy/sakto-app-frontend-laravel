<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_subscriptions', function (Blueprint $table) {
            $table->string('maya_subscription_id')->nullable()->after('maya_checkout_id');
            $table->string('maya_payment_token_id')->nullable()->after('maya_subscription_id');
            $table->timestamp('next_billing_date')->nullable()->after('maya_payment_token_id');
            $table->string('billing_cycle')->nullable()->after('next_billing_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('user_subscriptions')) {
            $count = DB::table('user_subscriptions')->count();
            if ($count === 0) {
                Schema::table('user_subscriptions', function (Blueprint $table) {
                    $table->dropColumn([
                        'maya_subscription_id',
                        'maya_payment_token_id',
                        'next_billing_date',
                        'billing_cycle',
                    ]);
                });
            }
        }
    }
};
