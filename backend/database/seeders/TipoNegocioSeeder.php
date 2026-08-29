<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TipoNegocioSeeder extends Seeder
{
    public function run(): void
    {
        $tipos = [
            [
                'nombre' => 'Panadería',
                'descripcion' => 'Negocio dedicado a la elaboración y venta de productos de panadería.',
                'activo' => true,
            ],
            [
                'nombre' => 'Ferretería',
                'descripcion' => 'Negocio dedicado a la venta de herramientas, materiales y artículos de construcción.',
                'activo' => true,
            ],
            [
                'nombre' => 'Tienda',
                'descripcion' => 'Negocio dedicado a la venta de productos de consumo general.',
                'activo' => true,
            ],
            [
                'nombre' => 'Supermercado',
                'descripcion' => 'Establecimiento dedicado a la venta de productos de consumo masivo.',
                'activo' => true,
            ],
            [
                'nombre' => 'Carnicería',
                'descripcion' => 'Negocio dedicado a la comercialización de carnes y productos relacionados.',
                'activo' => true,
            ],
            [
                'nombre' => 'Papelería',
                'descripcion' => 'Negocio dedicado a la venta de artículos escolares, oficina y papelería.',
                'activo' => true,
            ],
        ];

        foreach ($tipos as $tipo) {
            DB::table('tipos_negocio')->updateOrInsert(
                ['nombre' => $tipo['nombre']],
                $tipo
            );
        }
    }
}