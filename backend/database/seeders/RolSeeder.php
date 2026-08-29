<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'nombre' => 'Administrador',
                'descripcion' => 'Acceso completo a la administración de GENISYS.',
                'activo' => true,
            ],
            [
                'nombre' => 'Vendedor',
                'descripcion' => 'Usuario encargado de realizar y consultar ventas.',
                'activo' => true,
            ],
            [
                'nombre' => 'Cajero',
                'descripcion' => 'Usuario encargado de gestionar cobros y operaciones de caja.',
                'activo' => true,
            ],
            [
                'nombre' => 'Bodeguero',
                'descripcion' => 'Usuario encargado de gestionar inventario y movimientos de bodega.',
                'activo' => true,
            ],
            [
                'nombre' => 'Contador',
                'descripcion' => 'Usuario encargado de las funciones contables y financieras.',
                'activo' => true,
            ],
        ];

        foreach ($roles as $rol) {
            DB::table('roles')->updateOrInsert(
                ['nombre' => $rol['nombre']],
                $rol
            );
        }
    }
}