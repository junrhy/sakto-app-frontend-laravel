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
        if (!Schema::hasTable('user_apps')) {
            Schema::create('user_apps', function (Blueprint $table) {
                $table->id();
                $table->string('user_identifier');
                $table->string('module_identifier');
                $table->timestamps();
                
                // Ensure a user can only add the same app once
                $table->unique(['user_identifier', 'module_identifier']);
                
                // Add foreign key constraints if needed
                $table->index(['user_identifier']);
                $table->index(['module_identifier']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_apps');
    }
};
