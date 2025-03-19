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
        Schema::create('user_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('identifier')->unique();
            $table->string('user_identifier');
            $table->foreignId('subscription_plan_id')->constrained('subscription_plans');
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->string('status')->default('pending'); // active, cancelled, expired, pending, failed
            $table->dateTime('cancelled_at')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('payment_transaction_id')->nullable();
            $table->decimal('amount_paid', 10, 2);
            $table->string('proof_of_payment')->nullable();
            $table->boolean('auto_renew')->default(false);
            $table->dateTime('last_credit_date')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->string('maya_checkout_id')->nullable();
            $table->timestamps();
            
            $table->index('user_identifier');
            $table->index('status');
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
                Schema::dropIfExists('user_subscriptions');
            }
        }
    }
};
