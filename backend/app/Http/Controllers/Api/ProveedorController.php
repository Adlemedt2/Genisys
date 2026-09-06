<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proveedor;
use App\Services\EmpresaContext;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class ProveedorController extends Controller
{
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

    public function index(
        Request $request,
        EmpresaContext $empresaContext
    ) {
        $usuario = $request->user();

        if (!$usuario->tienePermiso('proveedores.ver')) {
            return response()->json([
                'message' => 'No tienes permisos para consultar proveedores.',
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

            $proveedores = Proveedor::where(
                'empresa_id',
                $empresa->id
            )
                ->orderBy('nombre')
                ->get();

            return response()->json([
                'proveedores' => $proveedores,
            ]);

        } catch (\RuntimeException $error) {

            return response()->json([
                'message' => $error->getMessage(),
            ], 422);
        }
    }

    public function store(
        Request $request,
        EmpresaContext $empresaContext
    ) {
        $usuario = $request->user();

        if (!$usuario->tienePermiso('proveedores.crear')) {
            return response()->json([
                'message' => 'No tienes permisos para crear proveedores.',
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
                    Rule::unique(
                        'proveedores',
                        'numero_documento'
                    )->where(
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
                    'max:150',
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
                'contacto' => [
                    'nullable',
                    'string',
                    'max:150',
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

            $proveedor = Proveedor::create([
                ...$datos,
                'empresa_id' => $empresa->id,
                'activo' => $datos['activo'] ?? true,
            ]);

            return response()->json([
                'message' => 'Proveedor creado correctamente.',
                'proveedor' => $proveedor,
            ], 201);

        } catch (\RuntimeException $error) {

            return response()->json([
                'message' => $error->getMessage(),
            ], 422);
        }
    }

    public function update(
        Request $request,
        Proveedor $proveedor,
        EmpresaContext $empresaContext
    ) {
        $usuario = $request->user();

        if (!$usuario->tienePermiso('proveedores.editar')) {
            return response()->json([
                'message' => 'No tienes permisos para editar proveedores.',
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
                (int) $proveedor->empresa_id !==
                (int) $empresa->id
            ) {
                return response()->json([
                    'message' => 'El proveedor no pertenece a la empresa actual.',
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
                    Rule::unique(
                        'proveedores',
                        'numero_documento'
                    )->where(
                        fn ($query) =>
                        $query->where(
                            'empresa_id',
                            $empresa->id
                        )
                    )->ignore($proveedor->id),
                ],
                'nombre' => [
                    'required',
                    'string',
                    'max:150',
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
                'contacto' => [
                    'nullable',
                    'string',
                    'max:150',
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

            $proveedor->update($datos);

            return response()->json([
                'message' => 'Proveedor actualizado correctamente.',
                'proveedor' => $proveedor->fresh(),
            ]);

        } catch (\RuntimeException $error) {

            return response()->json([
                'message' => $error->getMessage(),
            ], 422);
        }
    }

    public function cambiarEstado(
        Request $request,
        Proveedor $proveedor,
        EmpresaContext $empresaContext
    ) {
        $usuario = $request->user();

        if (!$usuario->tienePermiso('proveedores.editar')) {
            return response()->json([
                'message' => 'No tienes permisos para cambiar el estado de proveedores.',
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
                (int) $proveedor->empresa_id !==
                (int) $empresa->id
            ) {
                return response()->json([
                    'message' => 'El proveedor no pertenece a la empresa actual.',
                ], 403);
            }

            $proveedor->activo = !$proveedor->activo;
            $proveedor->save();

            return response()->json([
                'message' => $proveedor->activo
                    ? 'Proveedor activado correctamente.'
                    : 'Proveedor desactivado correctamente.',
                'proveedor' => $proveedor->fresh(),
            ]);

        } catch (\RuntimeException $error) {

            return response()->json([
                'message' => $error->getMessage(),
            ], 422);
        }
    }
}