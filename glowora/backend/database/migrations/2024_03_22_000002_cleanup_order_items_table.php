<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            // Drop foreign key if it exists
            $foreignKeys = Schema::getConnection()
                ->getDoctrineSchemaManager()
                ->listTableForeignKeys('order_items');

            foreach ($foreignKeys as $foreignKey) {
                if (in_array('custom_candle_id', $foreignKey->getLocalColumns())) {
                    $table->dropForeign($foreignKey->getName());
                    break;
                }
            }

            // Drop the columns
            if (Schema::hasColumn('order_items', 'custom_candle_id')) {
                $table->dropColumn('custom_candle_id');
            }
            if (Schema::hasColumn('order_items', 'type')) {
                $table->dropColumn('type');
            }
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->foreignId('custom_candle_id')->nullable()->after('product_id');
            $table->string('type')->default('product')->after('custom_candle_id');

            // Add back the foreign key constraint
            $table->foreign('custom_candle_id')
                ->references('id')
                ->on('custom_candles')
                ->onDelete('cascade');
        });
    }
};
