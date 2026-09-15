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
                $table->foreignId('compra_id')
                    ->nullable()
                    ->after('id')
                    ->constrained('compras')
                    ->cascadeOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('compra_detalles', 'compra_id')) {
            Schema::table('compra_detalles', function (Blueprint $table) {
                $table->dropForeign(['compra_id']);
                $table->dropColumn('compra_id');
            });
        }
    }
};
