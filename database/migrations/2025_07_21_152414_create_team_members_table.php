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
        if (!Schema::hasTable('team_members')) {
            Schema::create('team_members', function (Blueprint $table) {
                $table->id();
                $table->string('identifier')->unique();
                $table->string('first_name');
                $table->string('last_name');
                $table->string('email')->unique();
                $table->string('contact_number')->nullable();
                $table->string('password');
                $table->json('roles')->nullable(); // Array of roles like ['admin', 'manager', 'user']
                $table->json('allowed_apps')->nullable(); // Array of allowed app identifiers
                $table->timestamp('last_logged_in')->nullable();
                $table->string('user_identifier'); // Reference to the main user account
                $table->string('project_identifier'); // Reference to the project
                $table->boolean('is_active')->default(true);
                $table->boolean('email_verified')->default(false);
                $table->timestamp('email_verified_at')->nullable();
                $table->string('profile_picture')->nullable();
                $table->text('notes')->nullable();
                $table->json('permissions')->nullable(); // Additional granular permissions
                $table->string('timezone')->default('UTC');
                $table->string('language')->default('en');
                $table->timestamp('password_changed_at')->nullable();
                $table->timestamp('last_activity_at')->nullable();
                $table->rememberToken();
                $table->timestamps();
                
                $table->index('user_identifier');
                $table->index('project_identifier');
                $table->index('email');
                $table->index('is_active');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('team_members')) {
            $count = DB::table('team_members')->count();
            if ($count === 0) {
                Schema::dropIfExists('team_members');
            }
        }
    }
};
