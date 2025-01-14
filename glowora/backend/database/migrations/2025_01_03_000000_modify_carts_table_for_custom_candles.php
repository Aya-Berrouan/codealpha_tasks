<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            // Make product_id nullable first
            $table->foreignId('product_id')->nullable()->change();

            // Add custom_candle_id column
            $table->foreignId('custom_candle_id')->nullable()->after('product_id');
        });
    }

    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->dropColumn('custom_candle_id');
            $table->foreignId('product_id')->change();
        });
    }
};
