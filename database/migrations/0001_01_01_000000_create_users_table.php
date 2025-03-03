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
        if (!Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table) {
                $table->id();
                $table->string('identifier')->unique()->default(
                DB::connection()->getDriverName() === 'pgsql' 
                    ? DB::raw('uuid_generate_v4()')
                    : DB::raw('(UUID())')
            );
            $table->string('name');
            $table->string('email')->unique();
            $table->string('google_id')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('contact_number')->nullable();
            $table->string('project_identifier');
            $table->string('referer')->nullable();
            $table->json('app_currency')->nullable();
            $table->string('theme')->default('light');
                $table->string('theme_color')->nullable();
                $table->rememberToken();
                $table->timestamps();
            });

            // Add default value after table creation
            if (DB::connection()->getDriverName() === 'pgsql') {
                DB::statement("ALTER TABLE users ALTER COLUMN app_currency SET DEFAULT '{\"symbol\": \"$\", \"decimal_separator\": \".\", \"thousands_separator\": \",\"}'::jsonb");
            } else {
                DB::statement("ALTER TABLE users ALTER app_currency SET DEFAULT (JSON_OBJECT('symbol', '$', 'decimal_separator', '.', 'thousands_separator', ','))");
            }
        }

        if (!Schema::hasTable('password_reset_tokens')) {
            Schema::create('password_reset_tokens', function (Blueprint $table) {
                $table->string('email')->primary();
                $table->string('token');
                $table->timestamp('created_at')->nullable();
            });
        }

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('users')) {
            $count = DB::table('users')->count();
            if ($count === 0) {
                Schema::dropIfExists('users');
            }
        }

        if (Schema::hasTable('password_reset_tokens')) {
            $count = DB::table('password_reset_tokens')->count();
            if ($count === 0) {
                Schema::dropIfExists('password_reset_tokens');
            }
        }

        Schema::dropIfExists('sessions');
    }
};
