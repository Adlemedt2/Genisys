<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Funcionalidad;
use App\Models\TipoNegocio;
use Illuminate\Http\Request;

class FuncionalidadController extends Controller
{
    /**
     * Listar todas las funcionalidades disponibles.
     *
     * Requiere: tipos_negocio.ver
     */
    public function index(Request $request)
    
    {
        if (!$request->user()->tienePermiso('tipos_negocio.ver')) {
            return response()->json([
                'message' => 'No tienes permiso para consultar las funcionalidades.'
            ], 403);
        }

        $funcionalidades = Funcionalidad::query()
            ->where('activo', true)
            ->orderBy('nombre')
            ->get([
                'id',
                'codigo',
                'nombre',
                'descripcion',
            ]);

        return response()->json([
            'funcionalidades' => $funcionalidades,
        ]);
    }
    public function misFuncionalidades(Request $request)
    {
        $usuario = $request->user();

        try {
            $funcionalidades = app(
                \App\Services\EmpresaContext::class
            )->obtenerFuncionalidades($usuario);

            return response()->json([
                'funcionalidades' => $funcionalidades
                    ->map(function ($funcionalidad) {
                        return [
                            'id' => $funcionalidad->id,
                            'codigo' => $funcionalidad->codigo,
                            'nombre' => $funcionalidad->nombre,
                            'descripcion' => $funcionalidad->descripcion,
                        ];
                    })
                    ->values(),
            ]);

        } catch (\RuntimeException $error) {

            return response()->json([
                'message' => $error->getMessage(),
            ], 422);
        }
    }    

    /**
     * Obtener las funcionalidades asignadas a un tipo de negocio.
     *
     * Requiere: tipos_negocio.ver
     */
    public function porTipoNegocio(
        Request $request,
        TipoNegocio $tipo
    ) {
        if (!$request->user()->tienePermiso('tipos_negocio.ver')) {
            return response()->json([
                'message' => 'No tienes permiso para consultar las funcionalidades.'
            ], 403);
        }

        $funcionalidades = $tipo->funcionalidades()
            ->where('funcionalidades.activo', true)
            ->orderBy('funcionalidades.nombre')
            ->get([
                'funcionalidades.id',
                'funcionalidades.codigo',
                'funcionalidades.nombre',
                'funcionalidades.descripcion',
            ]);

        return response()->json([
            'tipo_negocio' => [
                'id' => $tipo->id,
                'nombre' => $tipo->nombre,
            ],
            'funcionalidades' => $funcionalidades,
        ]);
    }

    /**
     * Asignar funcionalidades a un tipo de negocio.
     *
     * Requiere: tipos_negocio.editar
     */
    public function sincronizar(
        Request $request,
        TipoNegocio $tipo
    ) {
        if (!$request->user()->tienePermiso('tipos_negocio.editar')) {
            return response()->json([
                'message' => 'No tienes permiso para configurar las funcionalidades.'
            ], 403);
        }

        $datos = $request->validate([
            'funcionalidades' => [
                'required',
                'array',
            ],

            'funcionalidades.*' => [
                'integer',
                'distinct',
                'exists:funcionalidades,id',
            ],
        ]);

        $ids = $datos['funcionalidades'];

        $funcionalidadesActivas = Funcionalidad::query()
            ->whereIn('id', $ids)
            ->where('activo', true)
            ->pluck('id')
            ->values()
            ->all();

        if (count($funcionalidadesActivas) !== count($ids)) {
            return response()->json([
                'message' => 'Una o más funcionalidades seleccionadas no están disponibles.',
            ], 422);
        }

        $tipo->funcionalidades()->sync($funcionalidadesActivas);

        $funcionalidades = $tipo->funcionalidades()
            ->where('funcionalidades.activo', true)
            ->orderBy('funcionalidades.nombre')
            ->get([
                'funcionalidades.id',
                'funcionalidades.codigo',
                'funcionalidades.nombre',
                'funcionalidades.descripcion',
            ]);

        return response()->json([
            'message' => 'Funcionalidades actualizadas correctamente.',
            'tipo_negocio' => [
                'id' => $tipo->id,
                'nombre' => $tipo->nombre,
            ],
            'funcionalidades' => $funcionalidades,
        ]);
    }
}