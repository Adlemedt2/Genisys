<?php

namespace Database\Seeders;

use App\Models\Funcionalidad;
use Illuminate\Database\Seeder;

class FuncionalidadSeeder extends Seeder
{
    public function run(): void
    {
        $funcionalidades = [
            [
                'codigo' => 'catalogos',
                'nombre' => 'Catálogos',
                'descripcion' => 'Administración de catálogos principales del negocio.',
                'activo' => true,
            ],

            [
                'codigo' => 'inventario',
                'nombre' => 'Inventario',
                'descripcion' => 'Control de existencias y movimientos de inventario.',
                'activo' => true,
            ],

            [
                'codigo' => 'compras',
                'nombre' => 'Compras',
                'descripcion' => 'Gestión de compras y abastecimiento.',
                'activo' => true,
            ],

            [
                'codigo' => 'ventas',
                'nombre' => 'Ventas',
                'descripcion' => 'Gestión de ventas y operaciones comerciales.',
                'activo' => true,
            ],

            [
                'codigo' => 'produccion',
                'nombre' => 'Producción',
                'descripcion' => 'Gestión de procesos de producción.',
                'activo' => true,
            ],

            [
                'codigo' => 'contabilidad',
                'nombre' => 'Contabilidad',
                'descripcion' => 'Gestión contable y financiera.',
                'activo' => true,
            ],

            [
                'codigo' => 'reportes',
                'nombre' => 'Reportes',
                'descripcion' => 'Consulta y generación de reportes.',
                'activo' => true,
            ],
        ];

        foreach ($funcionalidades as $funcionalidad) {
            Funcionalidad::updateOrCreate(
                [
                    'codigo' => $funcionalidad['codigo'],
                ],
                $funcionalidad
            );
        }
    }
}