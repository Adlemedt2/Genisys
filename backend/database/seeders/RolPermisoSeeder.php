<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolPermisoSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | ADMINISTRADOR
        |--------------------------------------------------------------------------
        */

        $administrador = DB::table('roles')
            ->where('nombre', 'Administrador')
            ->first();

        $todosLosPermisos = DB::table('permisos')
            ->pluck('id');

        foreach ($todosLosPermisos as $permisoId) {
            DB::table('rol_permiso')->updateOrInsert([
                'rol_id' => $administrador->id,
                'permiso_id' => $permisoId,
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | VENDEDOR
        |--------------------------------------------------------------------------
        */

        $this->asignarPermisos(
            'Vendedor',
            [
                'productos.ver',

                'clientes.ver',
                'clientes.crear',
                'clientes.editar',

                'ventas.ver',
                'ventas.crear',
                'ventas.editar',
                'ventas.anular',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | CAJERO
        |--------------------------------------------------------------------------
        */

        $this->asignarPermisos(
            'Cajero',
            [
                'productos.ver',

                'clientes.ver',
                'clientes.crear',

                'ventas.ver',
                'ventas.crear',
                'ventas.editar',
                'ventas.anular',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | BODEGUERO
        |--------------------------------------------------------------------------
        */

        $this->asignarPermisos(
            'Bodeguero',
            [
                'productos.ver',
                'productos.crear',
                'productos.editar',

                'inventario.ver',
                'inventario.entradas',
                'inventario.salidas',
                'inventario.ajustes',

                'proveedores.ver',
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | CONTADOR
        |--------------------------------------------------------------------------
        */

        $this->asignarPermisos(
            'Contador',
            [
                'empresa.ver',

                'proveedores.ver',
                'clientes.ver',

                'compras.ver',
                'ventas.ver',

                'contabilidad.ver',
                'contabilidad.crear',
                'contabilidad.editar',

                'reportes.ver',
            ]
        );
    }

    /**
     * Asigna permisos específicos a un rol.
     */
    private function asignarPermisos(string $nombreRol, array $permisos): void
    {
        $rol = DB::table('roles')
            ->where('nombre', $nombreRol)
            ->first();

        if (!$rol) {
            return;
        }

        foreach ($permisos as $nombrePermiso) {
            $permiso = DB::table('permisos')
                ->where('nombre', $nombrePermiso)
                ->first();

            if (!$permiso) {
                continue;
            }

            DB::table('rol_permiso')->updateOrInsert([
                'rol_id' => $rol->id,
                'permiso_id' => $permiso->id,
            ]);
        }
    }
}