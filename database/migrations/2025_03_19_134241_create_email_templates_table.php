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
        Schema::create('email_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('subject');
            $table->text('body');
            $table->json('variables')->nullable(); // Store available variables for the template
            $table->string('category')->nullable(); // e.g., 'welcome', 'notification', 'marketing'
            $table->boolean('is_active')->default(true);
            $table->string('client_identifier');
            $table->timestamps();

            $table->index('client_identifier');
            $table->index('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('email_templates')) {
            $count = DB::table('email_templates')->count();
            if ($count === 0) {
                Schema::dropIfExists('email_templates');
            }
        }
    }
};
