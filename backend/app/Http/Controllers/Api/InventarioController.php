<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MovimientoInventario;
use App\Models\Producto;
use App\Services\EmpresaContext;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class InventarioController extends Controller
{
    private function verificarFuncionalidad(
        EmpresaContext $empresaContext,
        $usuario
    ): ?JsonResponse {
        if (!$empresaContext->tieneFuncionalidad(
            $usuario,
            'inventario'
        )) {
            return response()->json([
                'message' =>
                    'El módulo de inventario no está habilitado para el tipo de negocio de esta empresa.',
            ], 403);
        }

        return null;
    }

    public function index(
        Request $request,
        EmpresaContext $empresaContext
    ) {
        $usuario = $request->user();

        if (!$usuario->tienePermiso('inventario.ver')) {
            return response()->json([
                'message' =>
                    'No tienes permisos para consultar el inventario.',
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

            $productos = Producto::where(
                'empresa_id',
                $empresa->id
            )
                ->orderBy('nombre')
                ->get();

            return response()->json([
                'productos' => $productos,
            ]);

        } catch (\RuntimeException $error) {

            return response()->json([
                'message' => $error->getMessage(),
            ], 422);
        }
    }

    public function movimientos(
        Request $request,
        EmpresaContext $empresaContext
    ) {
        $usuario = $request->user();

        if (!$usuario->tienePermiso('inventario.ver')) {
            return response()->json([
                'message' =>
                    'No tienes permisos para consultar los movimientos de inventario.',
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

            $movimientos = MovimientoInventario::with([
                'producto:id,nombre,codigo,unidad_medida',
                'usuario:id,name',
            ])
                ->where(
                    'empresa_id',
                    $empresa->id
                )
                ->orderByDesc('created_at')
                ->get();

            return response()->json([
                'movimientos' => $movimientos,
            ]);

        } catch (\RuntimeException $error) {

            return response()->json([
                'message' => $error->getMessage(),
            ], 422);
        }
    }

    public function entrada(
        Request $request,
        EmpresaContext $empresaContext
    ) {
        $usuario = $request->user();

        if (!$usuario->tienePermiso('inventario.entradas')) {
            return response()->json([
                'message' =>
                    'No tienes permisos para registrar entradas de inventario.',
            ], 403);
        }

        return $this->registrarMovimiento(
            $request,
            $empresaContext,
            $usuario,
            'entrada'
        );
    }

    public function salida(
        Request $request,
        EmpresaContext $empresaContext
    ) {
        $usuario = $request->user();

        if (!$usuario->tienePermiso('inventario.salidas')) {
            return response()->json([
                'message' =>
                    'No tienes permisos para registrar salidas de inventario.',
            ], 403);
        }

        return $this->registrarMovimiento(
            $request,
            $empresaContext,
            $usuario,
            'salida'
        );
    }

    public function ajuste(
        Request $request,
        EmpresaContext $empresaContext
    ) {
        $usuario = $request->user();

        if (!$usuario->tienePermiso('inventario.ajustes')) {
            return response()->json([
                'message' =>
                    'No tienes permisos para realizar ajustes de inventario.',
            ], 403);
        }

        return $this->registrarMovimiento(
            $request,
            $empresaContext,
            $usuario,
            'ajuste'
        );
    }

    private function registrarMovimiento(
        Request $request,
        EmpresaContext $empresaContext,
        $usuario,
        string $tipo
    ) {
        $acceso = $this->verificarFuncionalidad(
            $empresaContext,
            $usuario
        );

        if ($acceso) {
            return $acceso;
        }

        try {
            $empresa = $empresaContext->obtenerEmpresa($usuario);

            $reglas = [
                'producto_id' => [
                    'required',
                    'integer',
                    'exists:productos,id',
                ],
                'cantidad' => [
                    'required',
                    'numeric',
                    'gt:0',
                ],
                'motivo' => [
                    'nullable',
                    'string',
                    'max:150',
                ],
                'observaciones' => [
                    'nullable',
                    'string',
                ],
            ];

            $datos = $request->validate($reglas);

            $resultado = DB::transaction(function () use (
                $datos,
                $empresa,
                $usuario,
                $tipo
            ) {
                $producto = Producto::where(
                    'empresa_id',
                    $empresa->id
                )
                    ->where(
                        'id',
                        $datos['producto_id']
                    )
                    ->lockForUpdate()
                    ->first();

                if (!$producto) {
                    return response()->json([
                        'message' =>
                            'El producto no pertenece a la empresa actual.',
                    ], 403);
                }

                $stockAnterior = (float) $producto->stock_actual;
                $cantidad = (float) $datos['cantidad'];

                if ($tipo === 'entrada') {
                    $stockNuevo =
                        $stockAnterior + $cantidad;
                } elseif ($tipo === 'salida') {
                    $stockNuevo =
                        $stockAnterior - $cantidad;

                    if ($stockNuevo < 0) {
                        return response()->json([
                            'message' =>
                                'No hay existencias suficientes para realizar esta salida.',
                            'stock_actual' =>
                                $stockAnterior,
                        ], 422);
                    }
                } else {
                    $stockNuevo = $cantidad;
                }

                $producto->stock_actual = $stockNuevo;
                $producto->save();

                $movimiento =
                    MovimientoInventario::create([
                        'empresa_id' =>
                            $empresa->id,

                        'producto_id' =>
                            $producto->id,

                        'usuario_id' =>
                            $usuario->id,

                        'tipo' =>
                            $tipo,

                        'cantidad' =>
                            $cantidad,

                        'stock_anterior' =>
                            $stockAnterior,

                        'stock_nuevo' =>
                            $stockNuevo,

                        'motivo' =>
                            $datos['motivo'] ?? null,

                        'observaciones' =>
                            $datos['observaciones'] ?? null,
                    ]);

                return response()->json([
                    'message' =>
                        ucfirst($tipo) .
                        ' de inventario registrada correctamente.',

                    'movimiento' =>
                        $movimiento->load([
                            'producto:id,nombre,codigo,unidad_medida',
                            'usuario:id,name',
                        ]),

                    'producto' =>
                        $producto->fresh(),
                ], 201);
            });

            return $resultado;

        } catch (\RuntimeException $error) {

            return response()->json([
                'message' => $error->getMessage(),
            ], 422);
        }
    }
}