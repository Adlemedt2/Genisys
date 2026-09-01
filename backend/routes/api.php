<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmpresaController;
use App\Http\Controllers\Api\TipoNegocioController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Autenticación
    |--------------------------------------------------------------------------
    */

    Route::post('/logout', [AuthController::class, 'logout']);


    /*
    |--------------------------------------------------------------------------
    | Usuario
    |--------------------------------------------------------------------------
    */

    Route::get('/usuario', function (Illuminate\Http\Request $request) {

        return response()->json([
            'usuario' => $request->user()->load('roles'),
        ]);

    });


    /*
    |--------------------------------------------------------------------------
    | Empresa
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/empresa',
        [EmpresaController::class, 'show']
    );

    Route::post(
        '/empresa',
        [EmpresaController::class, 'store']
    );


    /*
    |--------------------------------------------------------------------------
    | Tipos de negocio
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/tipos-negocio',
        [TipoNegocioController::class, 'index']
    );

    Route::post(
        '/tipos-negocio',
        [TipoNegocioController::class, 'store']
    );

    Route::put(
        '/tipos-negocio/{tipo}',
        [TipoNegocioController::class, 'update']
    );

    Route::patch(
        '/tipos-negocio/{tipo}/estado',
        [TipoNegocioController::class, 'cambiarEstado']
    );

});