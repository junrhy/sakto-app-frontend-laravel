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
        Schema::table('whats_app_accounts', function (Blueprint $table) {
            // Add Infobip-specific fields
            $table->string('infobip_api_key')->nullable()->after('access_token');
            $table->string('infobip_sender_number')->nullable()->after('phone_number_id');
            $table->enum('provider', ['facebook', 'infobip'])->default('facebook')->after('account_name');
            $table->json('available_templates')->nullable()->after('webhook_urls');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('whats_app_accounts', function (Blueprint $table) {
            $table->dropColumn([
                'infobip_api_key',
                'infobip_sender_number', 
                'provider',
                'available_templates'
            ]);
        });
    }
};