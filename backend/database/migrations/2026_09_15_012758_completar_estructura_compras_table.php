<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
         * Número de compra
         */
        if (!Schema::hasColumn('compras', 'numero')) {
            Schema::table('compras', function (Blueprint $table) {
                $table->string('numero', 50)->nullable();
            });
        }

        /*
         * Proveedor
         */
        if (!Schema::hasColumn('compras', 'proveedor_id')) {
            Schema::table('compras', function (Blueprint $table) {
                $table->foreignId('proveedor_id')
                    ->nullable()
                    ->constrained('proveedores')
                    ->nullOnDelete();
            });
        }

        /*
         * Usuario que registra la compra
         */
        if (!Schema::hasColumn('compras', 'usuario_id')) {
            Schema::table('compras', function (Blueprint $table) {
                $table->foreignId('usuario_id')
                    ->nullable()
                    ->constrained('users')
                    ->restrictOnDelete();
            });
        }

        /*
         * Fecha
         */
        if (!Schema::hasColumn('compras', 'fecha')) {
            Schema::table('compras', function (Blueprint $table) {
                $table->date('fecha')->nullable();
            });
        }

        /*
         * Valores monetarios
         */
        if (!Schema::hasColumn('compras', 'subtotal')) {
            Schema::table('compras', function (Blueprint $table) {
                $table->decimal('subtotal', 15, 2)->default(0);
            });
        }

        if (!Schema::hasColumn('compras', 'impuesto')) {
            Schema::table('compras', function (Blueprint $table) {
                $table->decimal('impuesto', 15, 2)->default(0);
            });
        }

        if (!Schema::hasColumn('compras', 'total')) {
            Schema::table('compras', function (Blueprint $table) {
                $table->decimal('total', 15, 2)->default(0);
            });
        }

        /*
         * Estado
         */
        if (!Schema::hasColumn('compras', 'estado')) {
            Schema::table('compras', function (Blueprint $table) {
                $table->enum('estado', [
                    'pendiente',
                    'recibida',
                    'anulada',
                ])->default('pendiente');
            });
        }

        /*
         * Observaciones
         */
        if (!Schema::hasColumn('compras', 'observaciones')) {
            Schema::table('compras', function (Blueprint $table) {
                $table->text('observaciones')->nullable();
            });
        }

        /*
         * Índices.
         * Solo se agregan si las columnas existen.
         */
        Schema::table('compras', function (Blueprint $table) {
            $table->index(['empresa_id', 'fecha'], 'compras_empresa_fecha_index');
            $table->index(['empresa_id', 'estado'], 'compras_empresa_estado_index');
        });

        /*
         * Como actualmente no tenemos compras registradas,
         * podemos completar los campos obligatorios.
         */
        if (Schema::hasColumn('compras', 'numero')) {
            Schema::table('compras', function (Blueprint $table) {
                $table->string('numero', 50)->nullable(false)->change();
            });
        }

        if (Schema::hasColumn('compras', 'fecha')) {
            Schema::table('compras', function (Blueprint $table) {
                $table->date('fecha')->nullable(false)->change();
            });
        }
    }

    public function down(): void
    {
        /*
         * No eliminamos columnas aquí para proteger
         * cualquier información existente.
         */
    }
};