<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Empresa;
use App\Models\TipoNegocio;
use App\Services\EmpresaContext;
use Illuminate\Http\Request;

class EmpresaController extends Controller
{
    /**
     * Obtener la empresa del usuario autenticado.
     */
    public function show(Request $request)
    {
        $usuario = $request->user();

        $empresa = $usuario->empresa()
            ->with('tipoNegocio')
            ->first();

        if (!$empresa) {
            return response()->json([
                'message' => 'El usuario no tiene una empresa configurada.',
            ], 404);
        }

        return response()->json([
            'empresa' => $empresa,
        ]);
    }

    /**
     * Crear o actualizar la empresa del usuario autenticado.
     *
     * El tipo de negocio solamente puede establecerse
     * durante la configuración inicial.
     */
    public function store(Request $request)
    {
        $usuario = $request->user();

        /*
        |--------------------------------------------------------------------------
        | EMPRESA YA CONFIGURADA
        |--------------------------------------------------------------------------
        |
        | Si la empresa ya tiene su configuración completada,
        | el tipo de negocio queda bloqueado.
        |
        */

        if ($usuario->empresa_id) {

            $empresa = $usuario->empresa;

            if (!$empresa) {
                return response()->json([
                    'message' => 'No se encontró la empresa asociada al usuario.',
                ], 404);
            }

            if ($empresa->configuracion_completada) {

                $datos = $request->validate([
                    'nombre' => [
                        'required',
                        'string',
                        'max:150',
                    ],

                    'nit' => [
                        'nullable',
                        'string',
                        'max:30',
                    ],

                    'telefono' => [
                        'nullable',
                        'string',
                        'max:30',
                    ],

                    'direccion' => [
                        'nullable',
                        'string',
                        'max:250',
                    ],
                ]);

                $empresa->update($datos);

                $empresa->load('tipoNegocio');

                return response()->json([
                    'message' => 'Configuración de empresa actualizada correctamente.',
                    'empresa' => $empresa,
                ]);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | CONFIGURACIÓN INICIAL
        |--------------------------------------------------------------------------
        */

        $datos = $request->validate([
            'nombre' => [
                'required',
                'string',
                'max:150',
            ],

            'nit' => [
                'nullable',
                'string',
                'max:30',
            ],

            'telefono' => [
                'nullable',
                'string',
                'max:30',
            ],

            'direccion' => [
                'nullable',
                'string',
                'max:250',
            ],

            'tipo_negocio_id' => [
                'required',
                'integer',
                'exists:tipos_negocio,id',
            ],
        ]);

        if (!$usuario->empresa_id) {

            $empresa = Empresa::create([
                ...$datos,
                'activo' => true,
                'configuracion_completada' => true,
            ]);

            $usuario->empresa_id = $empresa->id;
            $usuario->save();

        } else {

            $empresa = $usuario->empresa;

            $empresa->update([
                ...$datos,
                'configuracion_completada' => true,
            ]);
        }

        $empresa->load('tipoNegocio');

        return response()->json([
            'message' => 'Configuración inicial de empresa completada correctamente.',
            'empresa' => $empresa,
        ]);
    }

    /**
     * Obtener los tipos de negocio disponibles.
     *
     * Se utilizan durante la configuración inicial.
     */
    public function tiposNegocio()
    {
        $tipos = TipoNegocio::where('activo', true)
            ->orderBy('nombre')
            ->get([
                'id',
                'nombre',
                'descripcion',
            ]);

        return response()->json([
            'tipos_negocio' => $tipos,
        ]);
    }

    /**
     * Obtener el contexto de la instalación actual.
     *
     * Una instalación de GENISYS tiene una sola empresa
     * y un solo tipo de negocio.
     */
    public function contexto(
        Request $request,
        EmpresaContext $empresaContext
    ) {
        $usuario = $request->user();

        try {
            $empresa = $empresaContext->obtenerEmpresa($usuario);
            $tipoNegocio = $empresaContext->obtenerTipoNegocio($usuario);

            return response()->json([
                'empresa' => [
                    'id' => $empresa->id,
                    'nombre' => $empresa->nombre,
                    'tipo_negocio_id' => $empresa->tipo_negocio_id,
                    'configuracion_completada' => (bool) $empresa->configuracion_completada,
                ],

                'tipo_negocio' => [
                    'id' => $tipoNegocio->id,
                    'nombre' => $tipoNegocio->nombre,
                    'descripcion' => $tipoNegocio->descripcion,
                ],
            ]);

        } catch (\RuntimeException $error) {

            return response()->json([
                'message' => $error->getMessage(),
            ], 422);
        }
    }
}