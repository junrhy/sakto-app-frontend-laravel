<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('merchant_profiles')) {
            Schema::create('merchant_profiles', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
                $table->string('business_name');
                $table->string('business_type')->nullable();
                $table->string('industry')->nullable();
                $table->string('website')->nullable();
                $table->string('phone')->nullable();
                $table->string('street')->nullable();
                $table->string('city')->nullable();
                $table->string('state')->nullable();
                $table->string('country')->nullable();
                $table->string('postal_code')->nullable();
                $table->json('metadata')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('merchant_profiles');
    }
};
