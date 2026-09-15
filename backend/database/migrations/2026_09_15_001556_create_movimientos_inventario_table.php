<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('movimientos_inventario', function (Blueprint $table) {
            $table->id();

            $table->foreignId('empresa_id')
                ->constrained('empresas')
                ->cascadeOnDelete();

            $table->foreignId('producto_id')
                ->constrained('productos')
                ->cascadeOnDelete();

            $table->foreignId('usuario_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->enum('tipo', [
                'entrada',
                'salida',
                'ajuste',
            ]);

            $table->decimal('cantidad', 15, 3);

            $table->decimal('stock_anterior', 15, 3);

            $table->decimal('stock_nuevo', 15, 3);

            $table->string('motivo', 150)->nullable();

            $table->text('observaciones')->nullable();

            $table->timestamps();

            $table->index([
                'empresa_id',
                'producto_id',
            ]);

            $table->index([
                'empresa_id',
                'tipo',
            ]);

            $table->index([
                'empresa_id',
                'created_at',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movimientos_inventario');
    }
};