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
        // First, update any existing records with the new status values
        DB::statement("UPDATE user_subscriptions SET status = 'failed' WHERE status = 'expired' AND end_date < NOW()");
        
        // Then modify the column to use ENUM with the new status options
        DB::statement("ALTER TABLE user_subscriptions MODIFY COLUMN status ENUM('active', 'cancelled', 'expired', 'pending', 'failed') NOT NULL DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert to the original status options
        DB::statement("ALTER TABLE user_subscriptions MODIFY COLUMN status ENUM('active', 'cancelled', 'expired') NOT NULL DEFAULT 'active'");
    }
};
