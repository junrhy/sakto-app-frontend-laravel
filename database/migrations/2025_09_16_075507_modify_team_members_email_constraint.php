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
        if (Schema::hasTable('team_members')) {
            // Check if the composite unique constraint doesn't already exist
            $exists = DB::select("
                SELECT 1 FROM pg_constraint 
                WHERE conname = 'team_members_email_user_unique'
            ");
            
            if (empty($exists)) {
                Schema::table('team_members', function (Blueprint $table) {
                    // Drop the existing unique constraint on email
                    $table->dropUnique(['email']);
                    
                    // Add a composite unique constraint on email and user_identifier
                    // This allows the same email for different users but prevents duplicates within the same user's team
                    $table->unique(['email', 'user_identifier'], 'team_members_email_user_unique');
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('team_members', function (Blueprint $table) {
            // Drop the composite unique constraint
            $table->dropUnique('team_members_email_user_unique');
            
            // Restore the original unique constraint on email only
            $table->unique('email');
        });
    }
};