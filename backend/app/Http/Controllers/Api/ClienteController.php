<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use App\Services\EmpresaContext;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class ClienteController extends Controller
{
    /**
     * Verifica que el usuario tenga acceso al módulo
     * de catálogos según el tipo de negocio de su empresa.
     */
    private function verificarFuncionalidad(
        EmpresaContext $empresaContext,
        $usuario
    ): ?JsonResponse {
        if (!$empresaContext->tieneFuncionalidad(
            $usuario,
            'catalogos'
        )) {
            return response()->json([
                'message' => 'El módulo de catálogos no está habilitado para el tipo de negocio de esta empresa.',
            ], 403);
        }

        return null;
    }

    /**
     * Listar clientes de la empresa actual.
     */
    public function index(
        Request $request,
        EmpresaContext $empresaContext
    ) {
        $usuario = $request->user();

        if (!$usuario->tienePermiso('clientes.ver')) {
            return response()->json([
                'message' => 'No tienes permisos para consultar clientes.',
            ], 403);
        }

        $acceso = $this->verificarFuncionalidad(
            $empresaContext,
            $usuario
        );

        if ($acceso) {
            return $acceso;
        }

        try {
            $empresa = $empresaContext->obtenerEmpresa($usuario);

            $clientes = Cliente::where(
                'empresa_id',
                $empresa->id
            )
                ->orderBy('nombre')
                ->orderBy('apellido')
                ->get();

            return response()->json([
                'clientes' => $clientes,
            ]);

        } catch (\RuntimeException $error) {

            return response()->json([
                'message' => $error->getMessage(),
            ], 422);
        }
    }

    /**
     * Crear un cliente.
     */
    public function store(
        Request $request,
        EmpresaContext $empresaContext
    ) {
        $usuario = $request->user();

        if (!$usuario->tienePermiso('clientes.crear')) {
            return response()->json([
                'message' => 'No tienes permisos para crear clientes.',
            ], 403);
        }

        $acceso = $this->verificarFuncionalidad(
            $empresaContext,
            $usuario
        );

        if ($acceso) {
            return $acceso;
        }

        try {
            $empresa = $empresaContext->obtenerEmpresa($usuario);

            $datos = $request->validate([
                'tipo_documento' => [
                    'required',
                    'string',
                    'max:30',
                ],

                'numero_documento' => [
                    'required',
                    'string',
                    'max:50',
                    Rule::unique('clientes', 'numero_documento')
                        ->where(
                            fn ($query) =>
                            $query->where(
                                'empresa_id',
                                $empresa->id
                            )
                        ),
                ],

                'nombre' => [
                    'required',
                    'string',
                    'max:100',
                ],

                'apellido' => [
                    'nullable',
                    'string',
                    'max:100',
                ],

                'telefono' => [
                    'nullable',
                    'string',
                    'max:30',
                ],

                'email' => [
                    'nullable',
                    'email',
                    'max:150',
                ],

                'direccion' => [
                    'nullable',
                    'string',
                    'max:200',
                ],

                'ciudad' => [
                    'nullable',
                    'string',
                    'max:100',
                ],

                'observaciones' => [
                    'nullable',
                    'string',
                ],

                'activo' => [
                    'sometimes',
                    'boolean',
                ],
            ]);

            $cliente = Cliente::create([
                ...$datos,
                'empresa_id' => $empresa->id,
                'activo' => $datos['activo'] ?? true,
            ]);

            return response()->json([
                'message' => 'Cliente creado correctamente.',
                'cliente' => $cliente,
            ], 201);

        } catch (\RuntimeException $error) {

            return response()->json([
                'message' => $error->getMessage(),
            ], 422);
        }
    }

    /**
     * Actualizar un cliente.
     */
    public function update(
        Request $request,
        Cliente $cliente,
        EmpresaContext $empresaContext
    ) {
        $usuario = $request->user();

        if (!$usuario->tienePermiso('clientes.editar')) {
            return response()->json([
                'message' => 'No tienes permisos para editar clientes.',
            ], 403);
        }

        $acceso = $this->verificarFuncionalidad(
            $empresaContext,
            $usuario
        );

        if ($acceso) {
            return $acceso;
        }

        try {
            $empresa = $empresaContext->obtenerEmpresa($usuario);

            if (
                (int) $cliente->empresa_id !==
                (int) $empresa->id
            ) {
                return response()->json([
                    'message' => 'El cliente no pertenece a la empresa actual.',
                ], 403);
            }

            $datos = $request->validate([
                'tipo_documento' => [
                    'required',
                    'string',
                    'max:30',
                ],

                'numero_documento' => [
                    'required',
                    'string',
                    'max:50',
                    Rule::unique('clientes', 'numero_documento')
                        ->where(
                            fn ($query) =>
                            $query->where(
                                'empresa_id',
                                $empresa->id
                            )
                        )
                        ->ignore($cliente->id),
                ],

                'nombre' => [
                    'required',
                    'string',
                    'max:100',
                ],

                'apellido' => [
                    'nullable',
                    'string',
                    'max:100',
                ],

                'telefono' => [
                    'nullable',
                    'string',
                    'max:30',
                ],

                'email' => [
                    'nullable',
                    'email',
                    'max:150',
                ],

                'direccion' => [
                    'nullable',
                    'string',
                    'max:200',
                ],

                'ciudad' => [
                    'nullable',
                    'string',
                    'max:100',
                ],

                'observaciones' => [
                    'nullable',
                    'string',
                ],

                'activo' => [
                    'sometimes',
                    'boolean',
                ],
            ]);

            $cliente->update($datos);

            return response()->json([
                'message' => 'Cliente actualizado correctamente.',
                'cliente' => $cliente->fresh(),
            ]);

        } catch (\RuntimeException $error) {

            return response()->json([
                'message' => $error->getMessage(),
            ], 422);
        }
    }

    /**
     * Activar o desactivar un cliente.
     */
    public function cambiarEstado(
        Request $request,
        Cliente $cliente,
        EmpresaContext $empresaContext
    ) {
        $usuario = $request->user();

        if (!$usuario->tienePermiso('clientes.editar')) {
            return response()->json([
                'message' => 'No tienes permisos para cambiar el estado de clientes.',
            ], 403);
        }

        $acceso = $this->verificarFuncionalidad(
            $empresaContext,
            $usuario
        );

        if ($acceso) {
            return $acceso;
        }

        try {
            $empresa = $empresaContext->obtenerEmpresa($usuario);

            if (
                (int) $cliente->empresa_id !==
                (int) $empresa->id
            ) {
                return response()->json([
                    'message' => 'El cliente no pertenece a la empresa actual.',
                ], 403);
            }

            $cliente->activo = !$cliente->activo;
            $cliente->save();

            return response()->json([
                'message' => $cliente->activo
                    ? 'Cliente activado correctamente.'
                    : 'Cliente desactivado correctamente.',
                'cliente' => $cliente->fresh(),
            ]);

        } catch (\RuntimeException $error) {

            return response()->json([
                'message' => $error->getMessage(),
            ], 422);
        }
    }
}