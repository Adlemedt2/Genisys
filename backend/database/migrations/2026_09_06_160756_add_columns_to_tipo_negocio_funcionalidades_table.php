<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tipo_negocio_funcionalidades', function (Blueprint $table) {
            $table->foreignId('tipo_negocio_id')
                ->after('id')
                ->constrained('tipos_negocio')
                ->cascadeOnDelete();

            $table->foreignId('funcionalidad_id')
                ->after('tipo_negocio_id')
                ->constrained('funcionalidades')
                ->cascadeOnDelete();

            $table->unique(
                ['tipo_negocio_id', 'funcionalidad_id'],
                'tipo_negocio_funcionalidad_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::table('tipo_negocio_funcionalidades', function (Blueprint $table) {
            $table->dropUnique('tipo_negocio_funcionalidad_unique');

            $table->dropForeign([
                'tipo_negocio_id',
            ]);

            $table->dropForeign([
                'funcionalidad_id',
            ]);

            $table->dropColumn([
                'tipo_negocio_id',
                'funcionalidad_id',
            ]);
        });
    }
};