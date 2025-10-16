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
        if (!Schema::hasTable('whats_app_accounts')) {
            Schema::create('whats_app_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('client_identifier')->index();
            $table->string('account_name');
            $table->string('access_token');
            $table->string('phone_number_id');
            $table->string('business_account_id');
            $table->string('webhook_verify_token')->nullable();
            $table->string('phone_number')->nullable();
            $table->string('display_name')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_verified')->default(false);
            $table->json('webhook_urls')->nullable();
            $table->timestamp('last_verified_at')->nullable();
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['client_identifier', 'is_active']);
            $table->index(['client_identifier', 'is_verified']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('whats_app_accounts');
    }
};
