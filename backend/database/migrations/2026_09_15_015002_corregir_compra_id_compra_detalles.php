<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('compra_detalles', 'compra_id')) {
            Schema::table('compra_detalles', function (Blueprint $table) {
                $table->unsignedBigInteger('compra_id')
                    ->nullable()
                    ->after('id');
            });
        }

        /*
         * Creamos la relación solamente si la columna existe.
         */
        Schema::table('compra_detalles', function (Blueprint $table) {
            $table->foreign('compra_id')
                ->references('id')
                ->on('compras')
                ->cascadeOnDelete();
        });

        /*
         * Índice para las consultas de detalles por compra.
         */
        Schema::table('compra_detalles', function (Blueprint $table) {
            $table->index('compra_id', 'compra_detalles_compra_id_index');
        });
    }

    public function down(): void
    {
        Schema::table('compra_detalles', function (Blueprint $table) {
            $table->dropForeign([
                'compra_id',
            ]);

            $table->dropIndex(
                'compra_detalles_compra_id_index'
            );

            $table->dropColumn('compra_id');
        });
    }
};