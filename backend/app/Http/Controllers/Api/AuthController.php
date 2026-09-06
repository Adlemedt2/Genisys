<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\EmpresaContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(
        Request $request,
        EmpresaContext $empresaContext
    ) {
        $credenciales = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::attempt([
            'email' => $credenciales['email'],
            'password' => $credenciales['password'],
            'activo' => true,
        ])) {
            return response()->json([
                'message' => 'Las credenciales son incorrectas o el usuario está inactivo.',
            ], 401);
        }

        $usuario = $request->user();

        /*
        |--------------------------------------------------------------------------
        | ROLES Y PERMISOS
        |--------------------------------------------------------------------------
        */

        $usuario->load('roles.permisos');

        $permisos = $usuario->roles
            ->flatMap(function ($rol) {
                return $rol->permisos;
            })
            ->pluck('nombre')
            ->unique()
            ->values();

        /*
        |--------------------------------------------------------------------------
        | FUNCIONALIDADES DE LA EMPRESA
        |--------------------------------------------------------------------------
        */

        $funcionalidades = $empresaContext
            ->obtenerFuncionalidades($usuario)
            ->map(function ($funcionalidad) {
                return [
                    'id' => $funcionalidad->id,
                    'codigo' => $funcionalidad->codigo,
                    'nombre' => $funcionalidad->nombre,
                    'descripcion' => $funcionalidad->descripcion,
                ];
            })
            ->values();

        /*
        |--------------------------------------------------------------------------
        | TOKEN
        |--------------------------------------------------------------------------
        */

        $token = $usuario
            ->createToken('genisys')
            ->plainTextToken;

        /*
        |--------------------------------------------------------------------------
        | RESPUESTA
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'message' => 'Inicio de sesión exitoso.',

            'token' => $token,

            'usuario' => [
                'id' => $usuario->id,
                'name' => $usuario->name,
                'email' => $usuario->email,
                'empresa_id' => $usuario->empresa_id,

                'roles' => $usuario->roles
                    ->pluck('nombre')
                    ->values(),

                'permisos' => $permisos,

                'funcionalidades' => $funcionalidades,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()
            ->currentAccessToken()
            ->delete();

        return response()->json([
            'message' => 'Sesión cerrada correctamente.',
        ]);
    }
}