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
        if (!Schema::hasTable('viber_accounts')) {
            Schema::create('viber_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('client_identifier')->index();
            $table->string('account_name');
            $table->string('auth_token');
            $table->string('webhook_url')->nullable();
            $table->json('webhook_events')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_verified')->default(false);
            $table->timestamp('last_verified_at')->nullable();
            $table->string('public_account_id')->nullable();
            $table->string('uri')->nullable();
            $table->string('icon')->nullable();
            $table->string('background')->nullable();
            $table->string('category')->nullable();
            $table->string('subcategory')->nullable();
            $table->json('location')->nullable();
            $table->string('country')->nullable();
            $table->json('webhook_urls')->nullable();
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
        Schema::dropIfExists('viber_accounts');
    }
};
