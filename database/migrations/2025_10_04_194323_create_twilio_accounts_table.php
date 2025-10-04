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
        Schema::create('twilio_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('client_identifier')->index();
            $table->string('account_name');
            $table->string('account_sid');
            $table->string('auth_token');
            $table->string('phone_number')->nullable();
            $table->string('default_country_code')->default('+1');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_verified')->default(false);
            $table->timestamp('last_verified_at')->nullable();
            $table->timestamps();
            
            // Indexes for performance
            $table->index(['client_identifier', 'is_active']);
            $table->index(['client_identifier', 'is_verified']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('twilio_accounts');
    }
};
