<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('compras', function (Blueprint $table) {
            $table->id();

            $table->foreignId('empresa_id')
                ->constrained('empresas')
                ->cascadeOnDelete();

            $table->foreignId('proveedor_id')
                ->nullable()
                ->constrained('proveedores')
                ->nullOnDelete();

            $table->foreignId('usuario_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->string('numero', 50);

            $table->date('fecha');

            $table->decimal('subtotal', 15, 2)
                ->default(0);

            $table->decimal('impuesto', 15, 2)
                ->default(0);

            $table->decimal('total', 15, 2)
                ->default(0);

            $table->enum('estado', [
                'pendiente',
                'recibida',
                'anulada',
            ])->default('pendiente');

            $table->text('observaciones')
                ->nullable();

            $table->timestamps();

            $table->unique(
                ['empresa_id', 'numero'],
                'compras_empresa_numero_unique'
            );

            $table->index([
                'empresa_id',
                'fecha',
            ]);

            $table->index([
                'empresa_id',
                'estado',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('compras');
    }
};
