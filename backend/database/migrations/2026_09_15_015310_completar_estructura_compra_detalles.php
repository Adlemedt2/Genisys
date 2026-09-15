<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
         * compra_id
         */
        if (!Schema::hasColumn('compra_detalles', 'compra_id')) {
            Schema::table('compra_detalles', function (Blueprint $table) {
                $table->unsignedBigInteger('compra_id')
                    ->nullable()
                    ->after('id');
            });
        }

        /*
         * producto_id
         */
        if (!Schema::hasColumn('compra_detalles', 'producto_id')) {
            Schema::table('compra_detalles', function (Blueprint $table) {
                $table->unsignedBigInteger('producto_id')
                    ->nullable()
                    ->after('compra_id');
            });
        }

        /*
         * cantidad
         */
        if (!Schema::hasColumn('compra_detalles', 'cantidad')) {
            Schema::table('compra_detalles', function (Blueprint $table) {
                $table->decimal('cantidad', 15, 3)
                    ->nullable();
            });
        }

        /*
         * precio_unitario
         */
        if (!Schema::hasColumn('compra_detalles', 'precio_unitario')) {
            Schema::table('compra_detalles', function (Blueprint $table) {
                $table->decimal('precio_unitario', 15, 2)
                    ->nullable();
            });
        }

        /*
         * subtotal
         */
        if (!Schema::hasColumn('compra_detalles', 'subtotal')) {
            Schema::table('compra_detalles', function (Blueprint $table) {
                $table->decimal('subtotal', 15, 2)
                    ->nullable();
            });
        }

        /*
         * Relación con compras.
         *
         * Solo se crea si todavía no existe.
         */
        if (Schema::hasColumn('compra_detalles', 'compra_id')) {
            $foreignKeys = collect(
                \Illuminate\Support\Facades\DB::select(
                    "
                    SELECT CONSTRAINT_NAME
                    FROM information_schema.KEY_COLUMN_USAGE
                    WHERE TABLE_SCHEMA = DATABASE()
                    AND TABLE_NAME = 'compra_detalles'
                    AND COLUMN_NAME = 'compra_id'
                    AND REFERENCED_TABLE_NAME IS NOT NULL
                    "
                )
            );

            if ($foreignKeys->isEmpty()) {
                Schema::table('compra_detalles', function (Blueprint $table) {
                    $table->foreign('compra_id')
                        ->references('id')
                        ->on('compras')
                        ->cascadeOnDelete();
                });
            }
        }

        /*
         * Relación con productos.
         *
         * Solo se crea si todavía no existe.
         */
        if (Schema::hasColumn('compra_detalles', 'producto_id')) {
            $foreignKeys = collect(
                \Illuminate\Support\Facades\DB::select(
                    "
                    SELECT CONSTRAINT_NAME
                    FROM information_schema.KEY_COLUMN_USAGE
                    WHERE TABLE_SCHEMA = DATABASE()
                    AND TABLE_NAME = 'compra_detalles'
                    AND COLUMN_NAME = 'producto_id'
                    AND REFERENCED_TABLE_NAME IS NOT NULL
                    "
                )
            );

            if ($foreignKeys->isEmpty()) {
                Schema::table('compra_detalles', function (Blueprint $table) {
                    $table->foreign('producto_id')
                        ->references('id')
                        ->on('productos')
                        ->restrictOnDelete();
                });
            }
        }

        /*
         * Índices.
         *
         * Solo intentamos crearlos si no existen.
         */
        $indices = collect(
            \Illuminate\Support\Facades\DB::select(
                "SHOW INDEX FROM compra_detalles"
            )
        )->pluck('Key_name')->unique();

        if (
            Schema::hasColumn('compra_detalles', 'compra_id') &&
            !$indices->contains('compra_detalles_compra_id_index')
        ) {
            Schema::table('compra_detalles', function (Blueprint $table) {
                $table->index(
                    'compra_id',
                    'compra_detalles_compra_id_index'
                );
            });
        }

        if (
            Schema::hasColumn('compra_detalles', 'producto_id') &&
            !$indices->contains('compra_detalles_producto_id_index')
        ) {
            Schema::table('compra_detalles', function (Blueprint $table) {
                $table->index(
                    'producto_id',
                    'compra_detalles_producto_id_index'
                );
            });
        }
    }

    public function down(): void
    {
        /*
         * No eliminamos columnas existentes para proteger datos.
         */
    }
};