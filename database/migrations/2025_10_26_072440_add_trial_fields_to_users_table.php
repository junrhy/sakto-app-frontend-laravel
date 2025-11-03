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
        if (!Schema::hasColumn('users', 'trial_started_at')) {
            Schema::table('users', function (Blueprint $table) {
                $table->timestamp('trial_started_at')->nullable()->after('updated_at');
                $table->timestamp('trial_ends_at')->nullable()->after('trial_started_at');
                $table->boolean('trial_expired_notification_sent')->default(false)->after('trial_ends_at');
                
                $table->index('trial_ends_at');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['trial_ends_at']);
            $table->dropColumn(['trial_started_at', 'trial_ends_at', 'trial_expired_notification_sent']);
        });
    }
};
