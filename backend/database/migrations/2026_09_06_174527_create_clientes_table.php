<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clientes', function (Blueprint $table) {
            $table->id();

            $table->foreignId('empresa_id')
                ->constrained('empresas')
                ->cascadeOnDelete();

            $table->string('tipo_documento', 30);
            $table->string('numero_documento', 50);

            $table->string('nombre', 100);
            $table->string('apellido', 100)->nullable();

            $table->string('telefono', 30)->nullable();
            $table->string('email', 150)->nullable();

            $table->string('direccion', 200)->nullable();
            $table->string('ciudad', 100)->nullable();

            $table->text('observaciones')->nullable();

            $table->boolean('activo')->default(true);

            $table->timestamps();

            $table->unique(
                ['empresa_id', 'numero_documento'],
                'clientes_empresa_documento_unique'
            );

            $table->index([
                'empresa_id',
                'nombre',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clientes');
    }
};