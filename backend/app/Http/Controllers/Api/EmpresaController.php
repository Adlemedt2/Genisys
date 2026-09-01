<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Empresa;
use App\Models\TipoNegocio;
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
     */
    public function store(Request $request)
    {
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

        $usuario = $request->user();

        if ($usuario->empresa_id) {

            $empresa = $usuario->empresa;

            $empresa->update($datos);

        } else {

            $empresa = Empresa::create([
                ...$datos,
                'activo' => true,
            ]);

            $usuario->empresa_id = $empresa->id;
            $usuario->save();
        }

        $empresa->load('tipoNegocio');

        return response()->json([
            'message' => 'Configuración de empresa guardada correctamente.',
            'empresa' => $empresa,
        ]);
    }


    /**
     * Obtener los tipos de negocio disponibles.
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
}