<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Compra;
use App\Models\CompraDetalle;
use App\Models\MovimientoInventario;
use App\Models\Producto;
use App\Models\Proveedor;
use App\Services\EmpresaContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CompraController extends Controller
{
    private function verificarFuncionalidad(
        EmpresaContext $empresaContext,
        $usuario
    ): ?JsonResponse {
        if (!$empresaContext->tieneFuncionalidad(
            $usuario,
            'compras'
        )) {
            return response()->json([
                'message' =>
                    'El módulo de compras no está habilitado para el tipo de negocio de esta empresa.',
            ], 403);
        }

        return null;
    }

    public function index(
        Request $request,
        EmpresaContext $empresaContext
    ) {
        $usuario = $request->user();

        if (!$usuario->tienePermiso('compras.ver')) {
            return response()->json([
                'message' =>
                    'No tienes permisos para consultar las compras.',
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
            $empresa = $empresaContext->obtenerEmpresa(
                $usuario
            );

            $compras = Compra::with([
                'proveedor:id,nombre,numero_documento',
                'usuario:id,name',
            ])
                ->where(
                    'empresa_id',
                    $empresa->id
                )
                ->orderByDesc('fecha')
                ->orderByDesc('id')
                ->get();

            return response()->json([
                'compras' => $compras,
            ]);

        } catch (\RuntimeException $error) {

            return response()->json([
                'message' => $error->getMessage(),
            ], 422);
        }
    }

    public function show(
        Request $request,
        Compra $compra,
        EmpresaContext $empresaContext
    ) {
        $usuario = $request->user();

        if (!$usuario->tienePermiso('compras.ver')) {
            return response()->json([
                'message' =>
                    'No tienes permisos para consultar la compra.',
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
            $empresa = $empresaContext->obtenerEmpresa(
                $usuario
            );

            if (
                (int) $compra->empresa_id !==
                (int) $empresa->id
            ) {
                return response()->json([
                    'message' =>
                        'La compra no pertenece a la empresa actual.',
                ], 403);
            }

            $compra->load([
                'proveedor',
                'usuario:id,name',
                'detalles.producto',
            ]);

            return response()->json([
                'compra' => $compra,
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

        if (!$usuario->tienePermiso('compras.crear')) {
            return response()->json([
                'message' =>
                    'No tienes permisos para crear compras.',
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
            $empresa = $empresaContext->obtenerEmpresa(
                $usuario
            );

            $datos = $request->validate([
                'proveedor_id' => [
                    'nullable',
                    'integer',
                    'exists:proveedores,id',
                ],

                'numero' => [
                    'required',
                    'string',
                    'max:50',
                    Rule::unique(
                        'compras',
                        'numero'
                    )->where(
                        fn ($query) =>
                        $query->where(
                            'empresa_id',
                            $empresa->id
                        )
                    ),
                ],

                'fecha' => [
                    'required',
                    'date',
                ],

                'impuesto' => [
                    'nullable',
                    'numeric',
                    'min:0',
                ],

                'observaciones' => [
                    'nullable',
                    'string',
                ],

                'detalles' => [
                    'required',
                    'array',
                    'min:1',
                ],

                'detalles.*.producto_id' => [
                    'required',
                    'integer',
                    'exists:productos,id',
                ],

                'detalles.*.cantidad' => [
                    'required',
                    'numeric',
                    'gt:0',
                ],

                'detalles.*.precio_unitario' => [
                    'required',
                    'numeric',
                    'gte:0',
                ],
            ]);

            /*
             * Verificamos que el proveedor pertenezca
             * a la empresa actual.
             */
            if (!empty($datos['proveedor_id'])) {

                $proveedorExiste =
                    Proveedor::where(
                        'empresa_id',
                        $empresa->id
                    )
                        ->where(
                            'id',
                            $datos['proveedor_id']
                        )
                        ->exists();

                if (!$proveedorExiste) {
                    return response()->json([
                        'message' =>
                            'El proveedor no pertenece a la empresa actual.',
                    ], 403);
                }
            }

            /*
             * Verificamos que todos los productos
             * pertenezcan a la empresa actual.
             */
            $productoIds = collect(
                $datos['detalles']
            )
                ->pluck('producto_id')
                ->unique()
                ->values();

            $productosEmpresa = Producto::where(
                'empresa_id',
                $empresa->id
            )
                ->whereIn(
                    'id',
                    $productoIds
                )
                ->pluck('id');

            if (
                $productosEmpresa->count() !==
                $productoIds->count()
            ) {
                return response()->json([
                    'message' =>
                        'Uno o más productos no pertenecen a la empresa actual.',
                ], 403);
            }

            $resultado = DB::transaction(
                function () use (
                    $datos,
                    $empresa,
                    $usuario
                ) {

                    $subtotal = 0;

                    foreach (
                        $datos['detalles']
                        as $detalle
                    ) {
                        $subtotal +=
                            (
                                (float) $detalle['cantidad']
                                *
                                (float) $detalle['precio_unitario']
                            );
                    }

                    $impuesto =
                        (float) (
                            $datos['impuesto'] ?? 0
                        );

                    $total =
                        $subtotal +
                        $impuesto;

                    $compra = Compra::create([
                        'empresa_id' =>
                            $empresa->id,

                        'proveedor_id' =>
                            $datos['proveedor_id']
                            ?? null,

                        'usuario_id' =>
                            $usuario->id,

                        'numero' =>
                            $datos['numero'],

                        'fecha' =>
                            $datos['fecha'],

                        'subtotal' =>
                            round($subtotal, 2),

                        'impuesto' =>
                            round($impuesto, 2),

                        'total' =>
                            round($total, 2),

                        'estado' =>
                            'pendiente',

                        'observaciones' =>
                            $datos['observaciones']
                            ?? null,
                    ]);

                    foreach (
                        $datos['detalles']
                        as $detalle
                    ) {

                        $cantidad =
                            (float) $detalle['cantidad'];

                        $precio =
                            (float) $detalle['precio_unitario'];

                        $detalleSubtotal =
                            $cantidad * $precio;

                        CompraDetalle::create([
                            'compra_id' =>
                                $compra->id,

                            'producto_id' =>
                                $detalle['producto_id'],

                            'cantidad' =>
                                $cantidad,

                            'precio_unitario' =>
                                round($precio, 2),

                            'subtotal' =>
                                round(
                                    $detalleSubtotal,
                                    2
                                ),
                        ]);
                    }

                    return $compra;
                }
            );

            $resultado->load([
                'proveedor',
                'usuario:id,name',
                'detalles.producto',
            ]);

            return response()->json([
                'message' =>
                    'Compra creada correctamente.',

                'compra' =>
                    $resultado,
            ], 201);

        } catch (\RuntimeException $error) {

            return response()->json([
                'message' => $error->getMessage(),
            ], 422);
        }
    }

    public function recibir(
        Request $request,
        Compra $compra,
        EmpresaContext $empresaContext
    ) {
        $usuario = $request->user();

        if (!$usuario->tienePermiso('compras.editar')) {
            return response()->json([
                'message' =>
                    'No tienes permisos para recibir compras.',
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
            $empresa = $empresaContext->obtenerEmpresa(
                $usuario
            );

            if (
                (int) $compra->empresa_id !==
                (int) $empresa->id
            ) {
                return response()->json([
                    'message' =>
                        'La compra no pertenece a la empresa actual.',
                ], 403);
            }

            $resultado = DB::transaction(
                function () use (
                    $compra,
                    $empresa,
                    $usuario
                ) {

                    /*
                     * Bloqueamos la compra para evitar
                     * dos recepciones simultáneas.
                     */
                    $compraBloqueada =
                        Compra::where(
                            'empresa_id',
                            $empresa->id
                        )
                            ->where(
                                'id',
                                $compra->id
                            )
                            ->lockForUpdate()
                            ->first();

                    if (!$compraBloqueada) {
                        return response()->json([
                            'message' =>
                                'La compra no pertenece a la empresa actual.',
                        ], 403);
                    }

                    if (
                        $compraBloqueada->estado !==
                        'pendiente'
                    ) {
                        return response()->json([
                            'message' =>
                                'La compra no puede recibirse porque su estado actual es "' .
                                $compraBloqueada->estado .
                                '".',
                        ], 422);
                    }

                    $detalles =
                        CompraDetalle::where(
                            'compra_id',
                            $compraBloqueada->id
                        )
                            ->get();

                    if ($detalles->isEmpty()) {
                        return response()->json([
                            'message' =>
                                'La compra no tiene productos registrados.',
                        ], 422);
                    }

                    foreach (
                        $detalles
                        as $detalle
                    ) {

                        /*
                         * Bloqueamos el producto mientras
                         * modificamos su existencia.
                         */
                        $producto =
                            Producto::where(
                                'empresa_id',
                                $empresa->id
                            )
                                ->where(
                                    'id',
                                    $detalle->producto_id
                                )
                                ->lockForUpdate()
                                ->first();

                        if (!$producto) {
                            return response()->json([
                                'message' =>
                                    'Uno de los productos de la compra no pertenece a la empresa actual.',
                            ], 403);
                        }

                        $stockAnterior =
                            (float) $producto->stock_actual;

                        $cantidad =
                            (float) $detalle->cantidad;

                        $stockNuevo =
                            $stockAnterior +
                            $cantidad;

                        $producto->stock_actual =
                            $stockNuevo;

                        $producto->save();

                        MovimientoInventario::create([
                            'empresa_id' =>
                                $empresa->id,

                            'producto_id' =>
                                $producto->id,

                            'usuario_id' =>
                                $usuario->id,

                            'tipo' =>
                                'entrada',

                            'cantidad' =>
                                $cantidad,

                            'stock_anterior' =>
                                $stockAnterior,

                            'stock_nuevo' =>
                                $stockNuevo,

                            'motivo' =>
                                'Compra ' .
                                $compraBloqueada->numero,

                            'observaciones' =>
                                'Entrada generada automáticamente al recibir la compra.',
                        ]);
                    }

                    $compraBloqueada->estado =
                        'recibida';

                    $compraBloqueada->save();

                    return response()->json([
                        'message' =>
                            'Compra recibida correctamente y el inventario fue actualizado.',

                        'compra' =>
                            $compraBloqueada->fresh([
                                'proveedor',
                                'usuario:id,name',
                                'detalles.producto',
                            ]),
                    ]);
                }
            );

            return $resultado;

        } catch (\RuntimeException $error) {

            return response()->json([
                'message' => $error->getMessage(),
            ], 422);
        }
    }

    public function anular(
        Request $request,
        Compra $compra,
        EmpresaContext $empresaContext
    ) {
        $usuario = $request->user();

        if (!$usuario->tienePermiso('compras.editar')) {
            return response()->json([
                'message' =>
                    'No tienes permisos para anular compras.',
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
            $empresa = $empresaContext->obtenerEmpresa(
                $usuario
            );

            if (
                (int) $compra->empresa_id !==
                (int) $empresa->id
            ) {
                return response()->json([
                    'message' =>
                        'La compra no pertenece a la empresa actual.',
                ], 403);
            }

            $compraBloqueada =
                Compra::where(
                    'empresa_id',
                    $empresa->id
                )
                    ->where(
                        'id',
                        $compra->id
                    )
                    ->lockForUpdate()
                    ->first();

            if (!$compraBloqueada) {
                return response()->json([
                    'message' =>
                        'La compra no pertenece a la empresa actual.',
                ], 403);
            }

            if (
                $compraBloqueada->estado ===
                'recibida'
            ) {
                return response()->json([
                    'message' =>
                        'Una compra recibida no puede anularse directamente porque ya afectó el inventario.',
                ], 422);
            }

            if (
                $compraBloqueada->estado ===
                'anulada'
            ) {
                return response()->json([
                    'message' =>
                        'La compra ya se encuentra anulada.',
                ], 422);
            }

            $compraBloqueada->estado =
                'anulada';

            $compraBloqueada->save();

            return response()->json([
                'message' =>
                    'Compra anulada correctamente.',

                'compra' =>
                    $compraBloqueada->fresh([
                        'proveedor',
                        'usuario:id,name',
                        'detalles.producto',
                    ]),
            ]);

        } catch (\RuntimeException $error) {

            return response()->json([
                'message' => $error->getMessage(),
            ], 422);
        }
    }
}