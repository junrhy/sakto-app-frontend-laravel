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
        if (!Schema::hasTable('dashboards')) {
            Schema::create('dashboards', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained()->onDelete('cascade');
                $table->string('name');
                $table->integer('column_count')->default(2);
                $table->string('app')->nullable();
                $table->boolean('is_default')->default(false);
                $table->boolean('is_starred')->default(false);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('dashboards')) {
            $count = DB::table('dashboards')->count();
            if ($count === 0) {
                Schema::dropIfExists('dashboards');
            }
        }
    }
};
