<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('games')) {
            Schema::create('games', function (Blueprint $table) {
                $table->id();
                $table->foreignId('winner_id')->nullable()->constrained('users')->onDelete('set null');
                $table->string('status')->default('pending'); // pending, active, completed
                $table->timestamps();
            });
        }
    }

    public function down()
    {
        Schema::dropIfExists('games');
    }
};
