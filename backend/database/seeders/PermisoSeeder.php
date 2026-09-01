<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermisoSeeder extends Seeder
{
    public function run(): void
    {
        $permisos = [
            // Usuarios
            ['nombre' => 'usuarios.ver', 'modulo' => 'Usuarios', 'descripcion' => 'Ver usuarios.'],
            ['nombre' => 'usuarios.crear', 'modulo' => 'Usuarios', 'descripcion' => 'Crear usuarios.'],
            ['nombre' => 'usuarios.editar', 'modulo' => 'Usuarios', 'descripcion' => 'Editar usuarios.'],
            ['nombre' => 'usuarios.eliminar', 'modulo' => 'Usuarios', 'descripcion' => 'Eliminar usuarios.'],

            // Roles y permisos
            ['nombre' => 'roles.ver', 'modulo' => 'Roles', 'descripcion' => 'Ver roles.'],
            ['nombre' => 'roles.crear', 'modulo' => 'Roles', 'descripcion' => 'Crear roles.'],
            ['nombre' => 'roles.editar', 'modulo' => 'Roles', 'descripcion' => 'Editar roles.'],
            ['nombre' => 'roles.eliminar', 'modulo' => 'Roles', 'descripcion' => 'Eliminar roles.'],

            // Empresa
            ['nombre' => 'empresa.ver', 'modulo' => 'Empresa', 'descripcion' => 'Ver información de la empresa.'],
            ['nombre' => 'empresa.editar', 'modulo' => 'Empresa', 'descripcion' => 'Editar información de la empresa.'],

            // Tipos de negocio
            ['nombre' => 'tipos_negocio.ver', 'modulo' => 'Tipos de negocio', 'descripcion' => 'Ver los tipos de negocio disponibles.'],
            ['nombre' => 'tipos_negocio.crear', 'modulo' => 'Tipos de negocio', 'descripcion' => 'Crear tipos de negocio.'],
            ['nombre' => 'tipos_negocio.editar', 'modulo' => 'Tipos de negocio', 'descripcion' => 'Editar tipos de negocio.'],
            ['nombre' => 'tipos_negocio.activar', 'modulo' => 'Tipos de negocio', 'descripcion' => 'Activar o desactivar tipos de negocio.'],

            // Productos
            ['nombre' => 'productos.ver', 'modulo' => 'Productos', 'descripcion' => 'Ver productos.'],
            ['nombre' => 'productos.crear', 'modulo' => 'Productos', 'descripcion' => 'Crear productos.'],
            ['nombre' => 'productos.editar', 'modulo' => 'Productos', 'descripcion' => 'Editar productos.'],
            ['nombre' => 'productos.eliminar', 'modulo' => 'Productos', 'descripcion' => 'Eliminar productos.'],

            // Clientes
            ['nombre' => 'clientes.ver', 'modulo' => 'Clientes', 'descripcion' => 'Ver clientes.'],
            ['nombre' => 'clientes.crear', 'modulo' => 'Clientes', 'descripcion' => 'Crear clientes.'],
            ['nombre' => 'clientes.editar', 'modulo' => 'Clientes', 'descripcion' => 'Editar clientes.'],

            // Proveedores
            ['nombre' => 'proveedores.ver', 'modulo' => 'Proveedores', 'descripcion' => 'Ver proveedores.'],
            ['nombre' => 'proveedores.crear', 'modulo' => 'Proveedores', 'descripcion' => 'Crear proveedores.'],
            ['nombre' => 'proveedores.editar', 'modulo' => 'Proveedores', 'descripcion' => 'Editar proveedores.'],

            // Inventario
            ['nombre' => 'inventario.ver', 'modulo' => 'Inventario', 'descripcion' => 'Consultar inventario.'],
            ['nombre' => 'inventario.entradas', 'modulo' => 'Inventario', 'descripcion' => 'Registrar entradas de inventario.'],
            ['nombre' => 'inventario.salidas', 'modulo' => 'Inventario', 'descripcion' => 'Registrar salidas de inventario.'],
            ['nombre' => 'inventario.ajustes', 'modulo' => 'Inventario', 'descripcion' => 'Realizar ajustes de inventario.'],

            // Compras
            ['nombre' => 'compras.ver', 'modulo' => 'Compras', 'descripcion' => 'Ver compras.'],
            ['nombre' => 'compras.crear', 'modulo' => 'Compras', 'descripcion' => 'Registrar compras.'],
            ['nombre' => 'compras.editar', 'modulo' => 'Compras', 'descripcion' => 'Editar compras.'],

            // Ventas
            ['nombre' => 'ventas.ver', 'modulo' => 'Ventas', 'descripcion' => 'Ver ventas.'],
            ['nombre' => 'ventas.crear', 'modulo' => 'Ventas', 'descripcion' => 'Registrar ventas.'],
            ['nombre' => 'ventas.editar', 'modulo' => 'Ventas', 'descripcion' => 'Editar ventas.'],
            ['nombre' => 'ventas.anular', 'modulo' => 'Ventas', 'descripcion' => 'Anular ventas.'],

            // Producción
            ['nombre' => 'produccion.ver', 'modulo' => 'Producción', 'descripcion' => 'Ver producción.'],
            ['nombre' => 'produccion.crear', 'modulo' => 'Producción', 'descripcion' => 'Registrar producción.'],
            ['nombre' => 'produccion.editar', 'modulo' => 'Producción', 'descripcion' => 'Editar producción.'],

            // Contabilidad
            ['nombre' => 'contabilidad.ver', 'modulo' => 'Contabilidad', 'descripcion' => 'Consultar información contable.'],
            ['nombre' => 'contabilidad.crear', 'modulo' => 'Contabilidad', 'descripcion' => 'Crear registros contables.'],
            ['nombre' => 'contabilidad.editar', 'modulo' => 'Contabilidad', 'descripcion' => 'Editar registros contables.'],

            // Reportes
            ['nombre' => 'reportes.ver', 'modulo' => 'Reportes', 'descripcion' => 'Consultar reportes.'],
        ];

        foreach ($permisos as $permiso) {
            DB::table('permisos')->updateOrInsert(
                ['nombre' => $permiso['nombre']],
                $permiso
            );
        }
    }
}