<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_candles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->decimal('price', 8, 2);
            $table->text('description')->nullable();
            $table->string('image_url');
            $table->string('scent_name');
            $table->string('jar_style');
            $table->text('custom_label')->nullable();
            $table->json('custom_details')->nullable();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        // Add foreign key constraint to carts table
        Schema::table('carts', function (Blueprint $table) {
            $table->foreign('custom_candle_id')
                ->references('id')
                ->on('custom_candles')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        // Remove foreign key constraint first
        Schema::table('carts', function (Blueprint $table) {
            $table->dropForeign(['custom_candle_id']);
        });

        Schema::dropIfExists('custom_candles');
    }
};
