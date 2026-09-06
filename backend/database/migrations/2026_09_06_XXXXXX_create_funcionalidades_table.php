<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('funcionalidades', function (Blueprint $table) {
            $table->id();

            $table->string('codigo', 100)->unique();

            $table->string('nombre', 150);

            $table->text('descripcion')->nullable();

            $table->boolean('activo')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('funcionalidades');
    }
};