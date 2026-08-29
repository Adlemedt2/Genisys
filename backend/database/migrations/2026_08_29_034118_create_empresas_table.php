<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('empresas', function (Blueprint $table) {
            $table->id();

            $table->foreignId('tipo_negocio_id')
                ->constrained('tipos_negocio')
                ->restrictOnDelete();

            $table->string('nombre', 150);
            $table->string('razon_social', 200)->nullable();
            $table->string('nit', 30)->nullable();
            $table->string('telefono', 30)->nullable();
            $table->string('email', 150)->nullable();
            $table->string('direccion', 250)->nullable();
            $table->string('logo')->nullable();

            $table->boolean('activo')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('empresas');
    }
};