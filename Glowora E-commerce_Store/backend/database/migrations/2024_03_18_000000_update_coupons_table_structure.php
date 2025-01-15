<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::table('coupons', function (Blueprint $table) {
            // Add new columns
            $table->enum('discount_type', ['percentage', 'fixed'])->default('percentage')->after('coupon_code');
            $table->decimal('min_purchase', 10, 2)->nullable()->after('discount_percentage');
            $table->integer('max_uses')->nullable()->after('min_purchase');
            $table->text('description')->nullable()->after('max_uses');
        });

        // Rename discount_percentage to discount_value
        DB::statement('ALTER TABLE coupons CHANGE discount_percentage discount_value DECIMAL(5,2)');

        // Drop unused columns
        Schema::table('coupons', function (Blueprint $table) {
            $table->dropColumn(['start_date', 'status']);
        });
    }

    public function down()
    {
        Schema::table('coupons', function (Blueprint $table) {
            // Drop new columns
            $table->dropColumn(['discount_type', 'min_purchase', 'max_uses', 'description']);
        });

        // Rename discount_value back to discount_percentage
        DB::statement('ALTER TABLE coupons CHANGE discount_value discount_percentage DECIMAL(5,2)');

        // Add back old columns
        Schema::table('coupons', function (Blueprint $table) {
            $table->timestamp('start_date')->useCurrent();
            $table->string('status', 50)->default('active');
        });
    }
};
