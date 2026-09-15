<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /*
         * empresa_id ya fue creada en el intento anterior.
         * Solo la convertimos en obligatoria.
         */
        DB::statement("
            ALTER TABLE compras
            MODIFY empresa_id BIGINT UNSIGNED NOT NULL
        ");
    }

    public function down(): void
    {
        Schema::table('compras', function ($table) {
            $table->dropForeign(['empresa_id']);
            $table->dropColumn('empresa_id');
        });
    }
};
