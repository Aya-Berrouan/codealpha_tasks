<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('custom_candles', function (Blueprint $table) {
            $table->string('scent_name')->after('description');
            $table->string('jar_style')->after('scent_name');
            $table->string('custom_label')->nullable()->after('jar_style');
            $table->json('custom_details')->nullable()->after('custom_label');
            $table->string('image_url')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('custom_candles', function (Blueprint $table) {
            $table->dropColumn([
                'scent_name',
                'jar_style',
                'custom_label',
                'custom_details'
            ]);
            $table->string('image_url')->change();
        });
    }
};
