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
        Schema::create('user_customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // Business (user type)
            $table->foreignId('customer_id')->constrained('users')->onDelete('cascade'); // Customer (customer type)
            $table->string('relationship_type')->default('customer'); // customer, subscriber, member, etc.
            $table->boolean('is_active')->default(true);
            $table->decimal('total_spent', 15, 2)->default(0);
            $table->integer('total_orders')->default(0);
            $table->timestamp('first_purchase_at')->nullable();
            $table->timestamp('last_purchase_at')->nullable();
            $table->json('metadata')->nullable(); // For storing additional customer data
            $table->timestamps();
            
            // Ensure unique relationship between business and customer
            $table->unique(['user_id', 'customer_id']);
            
            // Indexes for performance
            $table->index(['user_id', 'is_active']);
            $table->index(['customer_id', 'is_active']);
            $table->index('relationship_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_customers');
    }
};