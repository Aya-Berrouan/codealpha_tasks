<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->enum('discount_type', ['percentage', 'fixed'])->default('percentage')->after('coupon_code');
            $table->decimal('min_purchase', 10, 2)->nullable()->after('discount_percentage');
            $table->integer('max_uses')->nullable()->after('min_purchase');
            $table->text('description')->nullable()->after('max_uses');
        });
    }

    public function down()
    {
        Schema::table('coupons', function (Blueprint $table) {
            $table->dropColumn(['discount_type', 'min_purchase', 'max_uses', 'description']);
        });
    }
};
