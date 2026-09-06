<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('productos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('empresa_id')
                ->constrained('empresas')
                ->restrictOnDelete();

            $table->string('codigo', 100);

            $table->string('nombre', 150);

            $table->text('descripcion')
                ->nullable();

            $table->string('categoria', 100)
                ->nullable();

            $table->string('unidad_medida', 50)
                ->default('unidad');

            $table->decimal('precio_compra', 15, 2)
                ->default(0);

            $table->decimal('precio_venta', 15, 2)
                ->default(0);

            $table->decimal('stock_minimo', 15, 3)
                ->default(0);

            $table->decimal('stock_actual', 15, 3)
                ->default(0);

            $table->boolean('activo')
                ->default(true);

            $table->timestamps();

            $table->unique(
                ['empresa_id', 'codigo'],
                'productos_empresa_codigo_unique'
            );

            $table->index(
                ['empresa_id', 'nombre'],
                'productos_empresa_nombre_index'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('productos');
    }
};
