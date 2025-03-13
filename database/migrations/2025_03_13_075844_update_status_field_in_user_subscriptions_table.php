<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $connection = Config::get('database.default');
        $driver = Config::get("database.connections.{$connection}.driver");

        // Update any existing records with the new status values
        DB::statement("UPDATE user_subscriptions SET status = 'failed' WHERE status = 'expired' AND end_date < NOW()");
        
        if ($driver === 'mysql') {
            // MySQL syntax
            DB::statement("ALTER TABLE user_subscriptions MODIFY COLUMN status ENUM('active', 'cancelled', 'expired', 'pending', 'failed') NOT NULL DEFAULT 'pending'");
        } else if ($driver === 'pgsql') {
            // PostgreSQL syntax
            // First, create the enum type if it doesn't exist
            DB::statement("DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status_enum') THEN
                    CREATE TYPE subscription_status_enum AS ENUM('active', 'cancelled', 'expired', 'pending', 'failed');
                END IF;
            END$$;");
            
            // Then alter the column to use the enum type
            DB::statement("ALTER TABLE user_subscriptions ALTER COLUMN status TYPE subscription_status_enum USING status::subscription_status_enum");
            
            // Set the default value
            DB::statement("ALTER TABLE user_subscriptions ALTER COLUMN status SET DEFAULT 'pending'");
            
            // Set NOT NULL constraint
            DB::statement("ALTER TABLE user_subscriptions ALTER COLUMN status SET NOT NULL");
        } else {
            // For other database systems, use a generic approach with CHECK constraints
            Schema::table('user_subscriptions', function (Blueprint $table) {
                $table->string('status')->default('pending')->change();
            });
            
            // Add check constraint to limit values
            DB::statement("ALTER TABLE user_subscriptions ADD CONSTRAINT check_status CHECK (status IN ('active', 'cancelled', 'expired', 'pending', 'failed'))");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $connection = Config::get('database.default');
        $driver = Config::get("database.connections.{$connection}.driver");

        if ($driver === 'mysql') {
            // Revert to the original status options for MySQL
            DB::statement("ALTER TABLE user_subscriptions MODIFY COLUMN status ENUM('active', 'cancelled', 'expired') NOT NULL DEFAULT 'active'");
        } else if ($driver === 'pgsql') {
            // Revert to the original status options for PostgreSQL
            // Convert back to varchar
            DB::statement("ALTER TABLE user_subscriptions ALTER COLUMN status TYPE VARCHAR(255) USING status::VARCHAR");
            
            // Set the default value
            DB::statement("ALTER TABLE user_subscriptions ALTER COLUMN status SET DEFAULT 'active'");
            
            // We don't drop the enum type as it might be used elsewhere
        } else {
            // For other database systems
            // Remove the check constraint
            DB::statement("ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS check_status");
            
            // Change the column back
            Schema::table('user_subscriptions', function (Blueprint $table) {
                $table->string('status')->default('active')->change();
            });
        }
    }
};
