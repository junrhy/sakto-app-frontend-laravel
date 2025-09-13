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
        Schema::table('modules', function (Blueprint $table) {
            $table->string('title')->nullable()->after('identifier');
            $table->string('route')->nullable()->after('title');
            $table->boolean('visible')->default(false)->after('route');
            $table->text('description')->nullable()->after('visible');
            $table->decimal('price', 10, 2)->default(0)->after('description');
            $table->json('categories')->nullable()->after('price');
            $table->boolean('coming_soon')->default(false)->after('categories');
            $table->string('pricing_type')->default('subscription')->after('coming_soon');
            $table->json('included_in_plans')->nullable()->after('pricing_type');
            $table->string('bg_color')->nullable()->after('included_in_plans');
            $table->decimal('rating', 3, 1)->default(0)->after('bg_color');
            $table->integer('order')->default(0)->after('rating');
            $table->boolean('is_active')->default(true)->after('order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->dropColumn([
                'title',
                'route',
                'visible',
                'description',
                'price',
                'categories',
                'coming_soon',
                'pricing_type',
                'included_in_plans',
                'bg_color',
                'rating',
                'order',
                'is_active'
            ]);
        });
    }
};
