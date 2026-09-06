<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use App\Services\EmpresaContext;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductoController extends Controller
{
    /**
     * Listar productos de la empresa actual.
     */
    public function index(
        Request $request,
        EmpresaContext $empresaContext
    ) {
        $usuario = $request->user();

        if (!$usuario->tienePermiso('productos.ver')) {
            return response()->json([
                'message' => 'No tienes permisos para consultar productos.',
            ], 403);
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

    /**
     * Crear un producto.
     */
    public function store(
        Request $request,
        EmpresaContext $empresaContext
    ) {
        $usuario = $request->user();

        if (!$usuario->tienePermiso('productos.crear')) {
            return response()->json([
                'message' => 'No tienes permisos para crear productos.',
            ], 403);
        }

        try {
            $empresa = $empresaContext->obtenerEmpresa($usuario);

            $datos = $request->validate([
                'codigo' => [
                    'required',
                    'string',
                    'max:100',
                    Rule::unique('productos', 'codigo')
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
                    'max:150',
                ],

                'descripcion' => [
                    'nullable',
                    'string',
                ],

                'categoria' => [
                    'nullable',
                    'string',
                    'max:100',
                ],

                'unidad_medida' => [
                    'required',
                    'string',
                    'max:50',
                ],

                'precio_compra' => [
                    'required',
                    'numeric',
                    'min:0',
                ],

                'precio_venta' => [
                    'required',
                    'numeric',
                    'min:0',
                ],

                'stock_minimo' => [
                    'required',
                    'numeric',
                    'min:0',
                ],

                'stock_actual' => [
                    'required',
                    'numeric',
                    'min:0',
                ],

                'activo' => [
                    'sometimes',
                    'boolean',
                ],
            ]);

            $producto = Producto::create([
                ...$datos,
                'empresa_id' => $empresa->id,
                'activo' => $datos['activo'] ?? true,
            ]);

            return response()->json([
                'message' => 'Producto creado correctamente.',
                'producto' => $producto,
            ], 201);

        } catch (\RuntimeException $error) {

            return response()->json([
                'message' => $error->getMessage(),
            ], 422);
        }
    }

    /**
     * Actualizar un producto.
     */
    public function update(
        Request $request,
        Producto $producto,
        EmpresaContext $empresaContext
    ) {
        $usuario = $request->user();

        if (!$usuario->tienePermiso('productos.editar')) {
            return response()->json([
                'message' => 'No tienes permisos para editar productos.',
            ], 403);
        }

        try {
            $empresa = $empresaContext->obtenerEmpresa($usuario);

            if ((int) $producto->empresa_id !== (int) $empresa->id) {
                return response()->json([
                    'message' => 'El producto no pertenece a la empresa actual.',
                ], 403);
            }

            $datos = $request->validate([
                'codigo' => [
                    'required',
                    'string',
                    'max:100',
                    Rule::unique('productos', 'codigo')
                        ->where(
                            fn ($query) =>
                            $query->where(
                                'empresa_id',
                                $empresa->id
                            )
                        )
                        ->ignore($producto->id),
                ],

                'nombre' => [
                    'required',
                    'string',
                    'max:150',
                ],

                'descripcion' => [
                    'nullable',
                    'string',
                ],

                'categoria' => [
                    'nullable',
                    'string',
                    'max:100',
                ],

                'unidad_medida' => [
                    'required',
                    'string',
                    'max:50',
                ],

                'precio_compra' => [
                    'required',
                    'numeric',
                    'min:0',
                ],

                'precio_venta' => [
                    'required',
                    'numeric',
                    'min:0',
                ],

                'stock_minimo' => [
                    'required',
                    'numeric',
                    'min:0',
                ],

                'stock_actual' => [
                    'required',
                    'numeric',
                    'min:0',
                ],

                'activo' => [
                    'sometimes',
                    'boolean',
                ],
            ]);

            $producto->update($datos);

            return response()->json([
                'message' => 'Producto actualizado correctamente.',
                'producto' => $producto->fresh(),
            ]);

        } catch (\RuntimeException $error) {

            return response()->json([
                'message' => $error->getMessage(),
            ], 422);
        }
    }

    /**
     * Activar o desactivar un producto.
     */
    public function cambiarEstado(
        Request $request,
        Producto $producto,
        EmpresaContext $empresaContext
    ) {
        $usuario = $request->user();

        if (!$usuario->tienePermiso('productos.eliminar')) {
            return response()->json([
                'message' => 'No tienes permisos para cambiar el estado de productos.',
            ], 403);
        }

        try {
            $empresa = $empresaContext->obtenerEmpresa($usuario);

            if ((int) $producto->empresa_id !== (int) $empresa->id) {
                return response()->json([
                    'message' => 'El producto no pertenece a la empresa actual.',
                ], 403);
            }

            $producto->activo = !$producto->activo;
            $producto->save();

            return response()->json([
                'message' => $producto->activo
                    ? 'Producto activado correctamente.'
                    : 'Producto desactivado correctamente.',
                'producto' => $producto->fresh(),
            ]);

        } catch (\RuntimeException $error) {

            return response()->json([
                'message' => $error->getMessage(),
            ], 422);
        }
    }
}