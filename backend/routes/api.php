<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmpresaController;
use App\Http\Controllers\Api\TipoNegocioController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\ProductoController;
use App\Http\Controllers\Api\FuncionalidadController;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\ProveedorController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    /*
    |--------------------------------------------------------------------------
    | USUARIOS
    |--------------------------------------------------------------------------
    */

    Route::get('/usuarios', [UsuarioController::class, 'index']);
    Route::post('/usuarios', [UsuarioController::class, 'store']);
    Route::put('/usuarios/{usuario}', [UsuarioController::class, 'update']);
    Route::patch('/usuarios/{usuario}/estado', [UsuarioController::class, 'cambiarEstado']);

    Route::get('/roles', [UsuarioController::class, 'roles']);
    Route::get('/usuarios-empresas', [UsuarioController::class, 'empresas']);
    Route::get('/mis-funcionalidades', [
    FuncionalidadController::class,
    'misFuncionalidades'
    ]);

    /*
    |--------------------------------------------------------------------------
    | EMPRESA
    |--------------------------------------------------------------------------
    */

    Route::get('/empresa', [EmpresaController::class, 'show']);
    Route::post('/empresa', [EmpresaController::class, 'store']);

    /*
    |--------------------------------------------------------------------------
    | TIPOS DE NEGOCIO
    |--------------------------------------------------------------------------
    */

    Route::get('/tipos-negocio', [TipoNegocioController::class, 'index']);
    Route::post('/tipos-negocio', [TipoNegocioController::class, 'store']);
    Route::put('/tipos-negocio/{tipo}', [TipoNegocioController::class, 'update']);
    Route::patch('/tipos-negocio/{tipo}/estado', [TipoNegocioController::class, 'cambiarEstado']);


    /*
    |--------------------------------------------------------------------------
    | funcionalidades
    |--------------------------------------------------------------------------
    */

    Route::get('/funcionalidades', [FuncionalidadController::class, 'index']);
    Route::get('/tipos-negocio/{tipo}/funcionalidades', [FuncionalidadController::class, 'porTipoNegocio']);
    Route::put('/tipos-negocio/{tipo}/funcionalidades', [FuncionalidadController::class, 'sincronizar']);

    /*
    |--------------------------------------------------------------------------
    | PRODUCTOS
    |--------------------------------------------------------------------------
    */
    Route::get('/productos', [ProductoController::class, 'index']);
    Route::post('/productos', [ProductoController::class, 'store']);
    Route::put('/productos/{producto}', [ProductoController::class, 'update']);
    Route::patch('/productos/{producto}/estado', [ProductoController::class, 'cambiarEstado']);
    /*

    /*
    |--------------------------------------------------------------------------
    | CLIENTES
    |--------------------------------------------------------------------------
    */
    Route::get('/clientes', [ClienteController::class, 'index']);
    Route::post('/clientes', [ClienteController::class, 'store']);
    Route::put('/clientes/{cliente}', [ClienteController::class, 'update']);
    Route::patch('/clientes/{cliente}/estado', [ClienteController::class, 'cambiarEstado']);

    /* 
    ||--------------------------------------------------------------------------
    PROVEEDORES
    ||--------------------------------------------------------------------------
    */
    Route::get('/proveedores', [ProveedorController::class, 'index']);
    Route::post('/proveedores', [ProveedorController::class, 'store']);
    Route::put('/proveedores/{proveedor}', [ProveedorController::class, 'update']);
    Route::patch('/proveedores/{proveedor}/estado', [ProveedorController::class, 'cambiarEstado']);

    /*
    |------------------------------------------------------------------------------
    | CONTEXTO DE LA INSTALACIÓN
    |------------------------------------------------------------------------------
    */

    Route::get('/contexto', [EmpresaController::class, 'contexto']);
});