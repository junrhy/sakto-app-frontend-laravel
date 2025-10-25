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
        Schema::create('community_join_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('community_id')->constrained('users')->onDelete('cascade'); // The community (user type)
            $table->foreignId('customer_id')->constrained('users')->onDelete('cascade'); // The customer requesting to join
            $table->string('status')->default('pending'); // pending, approved, denied
            $table->string('approval_token')->unique(); // For secure approve/deny links
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('denied_at')->nullable();
            $table->text('message')->nullable(); // Optional message from customer
            $table->timestamps();
            
            // Ensure unique pending request per customer per community
            $table->unique(['community_id', 'customer_id', 'status']);
            
            // Indexes for performance
            $table->index(['community_id', 'status']);
            $table->index(['customer_id', 'status']);
            $table->index('approval_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('community_join_requests');
    }
};
