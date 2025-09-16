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
        Schema::table('team_members', function (Blueprint $table) {
            // Drop the existing unique constraint on email
            $table->dropUnique(['email']);
            
            // Add a composite unique constraint on email and user_identifier
            // This allows the same email for different users but prevents duplicates within the same user's team
            $table->unique(['email', 'user_identifier'], 'team_members_email_user_unique');
        });
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