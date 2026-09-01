<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TipoNegocio;
use Illuminate\Http\Request;

class TipoNegocioController extends Controller
{
    /**
     * Listar tipos de negocio.
     *
     * Requiere: tipos_negocio.ver
     */
    public function index(Request $request)
    {
        if (!$request->user()->tienePermiso('tipos_negocio.ver')) {
            return response()->json([
                'message' => 'No tienes permiso para consultar los tipos de negocio.'
            ], 403);
        }

        $tipos = TipoNegocio::orderBy('nombre')->get();

        return response()->json([
            'tipos_negocio' => $tipos
        ]);
    }

    /**
     * Crear un tipo de negocio.
     *
     * Requiere: tipos_negocio.crear
     */
    public function store(Request $request)
    {
        if (!$request->user()->tienePermiso('tipos_negocio.crear')) {
            return response()->json([
                'message' => 'No tienes permiso para crear tipos de negocio.'
            ], 403);
        }

        $datos = $request->validate([
            'nombre' => [
                'required',
                'string',
                'max:100',
                'unique:tipos_negocio,nombre',
            ],

            'descripcion' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        $tipo = TipoNegocio::create([
            'nombre' => $datos['nombre'],
            'descripcion' => $datos['descripcion'] ?? null,
            'activo' => true,
        ]);

        return response()->json([
            'message' => 'Tipo de negocio creado correctamente.',
            'tipo' => $tipo,
        ], 201);
    }

    /**
     * Actualizar un tipo de negocio.
     *
     * Requiere: tipos_negocio.editar
     */
    public function update(Request $request, TipoNegocio $tipo)
    {
        if (!$request->user()->tienePermiso('tipos_negocio.editar')) {
            return response()->json([
                'message' => 'No tienes permiso para editar tipos de negocio.'
            ], 403);
        }

        $datos = $request->validate([
            'nombre' => [
                'required',
                'string',
                'max:100',
                'unique:tipos_negocio,nombre,' . $tipo->id,
            ],

            'descripcion' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        $tipo->update($datos);

        return response()->json([
            'message' => 'Tipo de negocio actualizado correctamente.',
            'tipo' => $tipo,
        ]);
    }

    /**
     * Activar o desactivar un tipo.
     *
     * Requiere: tipos_negocio.activar
     */
    public function cambiarEstado(Request $request, TipoNegocio $tipo)
    {
        if (!$request->user()->tienePermiso('tipos_negocio.activar')) {
            return response()->json([
                'message' => 'No tienes permiso para activar o desactivar tipos de negocio.'
            ], 403);
        }

        $tipo->activo = !$tipo->activo;
        $tipo->save();

        return response()->json([
            'message' => 'Estado actualizado correctamente.',
            'tipo' => $tipo,
        ]);
    }
}