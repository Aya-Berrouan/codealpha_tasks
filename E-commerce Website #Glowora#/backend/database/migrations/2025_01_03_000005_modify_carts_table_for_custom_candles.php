<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            // Make product_id nullable
            $table->foreignId('product_id')->nullable()->change();

            // Add custom_candle_id if it doesn't exist
            if (!Schema::hasColumn('carts', 'custom_candle_id')) {
                $table->foreignId('custom_candle_id')->nullable()->after('product_id')
                    ->references('id')
                    ->on('custom_candles')
                    ->onDelete('cascade');
            }
        });
    }

    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            // Drop custom_candle_id column if it exists
            if (Schema::hasColumn('carts', 'custom_candle_id')) {
                $table->dropForeign(['custom_candle_id']);
                $table->dropColumn('custom_candle_id');
            }

            // Make product_id required again
            $table->foreignId('product_id')->change();
        });
    }
};
