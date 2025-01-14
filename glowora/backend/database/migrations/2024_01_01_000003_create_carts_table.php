<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('custom_candle_id')->nullable()->constrained()->onDelete('cascade');
            $table->integer('quantity')->default(1);
            $table->timestamps();

            // Ensure either product_id or custom_candle_id is set, but not both
            $table->check('(product_id IS NOT NULL AND custom_candle_id IS NULL) OR (product_id IS NULL AND custom_candle_id IS NOT NULL)');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carts');
    }
};
