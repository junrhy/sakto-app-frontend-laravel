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
        if (!Schema::hasTable('user_addresses')) {
            Schema::create('user_addresses', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users');
                $table->string('address_type');
                $table->string('street');
                $table->string('unit_number')->nullable();
                $table->string('city');
                $table->string('state');
                $table->string('postal_code');
                $table->string('country');
                $table->string('phone')->nullable();
                $table->boolean('is_primary')->default(false);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('user_addresses')) {
            $count = DB::table('user_addresses')->count();
            if ($count === 0) {
                Schema::dropIfExists('user_addresses');
            }
        }
    }
};
