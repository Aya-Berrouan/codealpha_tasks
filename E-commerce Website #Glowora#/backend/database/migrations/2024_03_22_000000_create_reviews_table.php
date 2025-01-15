<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->integer('rating')->unsigned();
            $table->text('comment')->nullable();
            $table->boolean('verified_purchase')->default(true);
            $table->timestamps();
            
            // Ensure one review per product per order
            $table->unique(['user_id', 'product_id', 'order_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('reviews');
    }
}; 