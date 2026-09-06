<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Empresa;
use App\Models\Rol;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UsuarioController extends Controller
{
    /**
     * Listar usuarios.
     */
    public function index(Request $request)
    {
        $usuarioActual = $request->user();

        if (!$usuarioActual->tienePermiso('usuarios.ver')) {
            return response()->json([
                'message' => 'No tienes permiso para consultar los usuarios.',
            ], 403);
        }

        $usuarios = User::with([
            'empresa:id,nombre',
            'roles:id,nombre',
        ])
        ->orderBy('name')
        ->get([
            'id',
            'empresa_id',
            'name',
            'email',
            'activo',
            'created_at',
        ]);

        return response()->json([
            'usuarios' => $usuarios,
        ]);
    }

    /**
     * Crear usuario.
     */
    public function store(Request $request)
    {
        $usuarioActual = $request->user();

        if (!$usuarioActual->tienePermiso('usuarios.crear')) {
            return response()->json([
                'message' => 'No tienes permiso para crear usuarios.',
            ], 403);
        }

        $datos = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email',
            ],
            'password' => [
                'required',
                'string',
                'min:8',
            ],
            'empresa_id' => [
                'required',
                'integer',
                'exists:empresas,id',
            ],
            'rol_id' => [
                'required',
                'integer',
                'exists:roles,id',
            ],
            'activo' => [
                'sometimes',
                'boolean',
            ],
        ]);

        $rol = Rol::findOrFail($datos['rol_id']);

        if (!$rol->activo) {
            return response()->json([
                'message' => 'No puedes asignar un rol inactivo.',
            ], 422);
        }

        $empresa = Empresa::findOrFail($datos['empresa_id']);

        if (!$empresa->activo) {
            return response()->json([
                'message' => 'No puedes asignar un usuario a una empresa inactiva.',
            ], 422);
        }

        $usuario = User::create([
            'name' => $datos['name'],
            'email' => $datos['email'],
            'password' => $datos['password'],
            'empresa_id' => $datos['empresa_id'],
            'activo' => $datos['activo'] ?? true,
        ]);

        $usuario->roles()->sync([
            $datos['rol_id'],
        ]);

        $usuario->load([
            'empresa:id,nombre',
            'roles:id,nombre',
        ]);

        return response()->json([
            'message' => 'Usuario creado correctamente.',
            'usuario' => $usuario,
        ], 201);
    }

    /**
     * Actualizar usuario.
     */
    public function update(Request $request, User $usuario)
    {
        $usuarioActual = $request->user();

        if (!$usuarioActual->tienePermiso('usuarios.editar')) {
            return response()->json([
                'message' => 'No tienes permiso para editar usuarios.',
            ], 403);
        }

        $datos = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email,' . $usuario->id,
            ],
            'password' => [
                'nullable',
                'string',
                'min:8',
            ],
            'empresa_id' => [
                'required',
                'integer',
                'exists:empresas,id',
            ],
            'rol_id' => [
                'required',
                'integer',
                'exists:roles,id',
            ],
        ]);

        $rol = Rol::findOrFail($datos['rol_id']);

        if (!$rol->activo) {
            return response()->json([
                'message' => 'No puedes asignar un rol inactivo.',
            ], 422);
        }

        $empresa = Empresa::findOrFail($datos['empresa_id']);

        if (!$empresa->activo) {
            return response()->json([
                'message' => 'No puedes asignar un usuario a una empresa inactiva.',
            ], 422);
        }

        $usuario->name = $datos['name'];
        $usuario->email = $datos['email'];
        $usuario->empresa_id = $datos['empresa_id'];

        if (!empty($datos['password'])) {
            $usuario->password = $datos['password'];
        }

        $usuario->save();

        $usuario->roles()->sync([
            $datos['rol_id'],
        ]);

        $usuario->load([
            'empresa:id,nombre',
            'roles:id,nombre',
        ]);

        return response()->json([
            'message' => 'Usuario actualizado correctamente.',
            'usuario' => $usuario,
        ]);
    }

    /**
     * Activar o desactivar usuario.
     */
    public function cambiarEstado(Request $request, User $usuario)
    {
        $usuarioActual = $request->user();

        if (!$usuarioActual->tienePermiso('usuarios.eliminar')) {
            return response()->json([
                'message' => 'No tienes permiso para cambiar el estado de usuarios.',
            ], 403);
        }

        if ($usuario->id === $usuarioActual->id) {
            return response()->json([
                'message' => 'No puedes desactivar tu propio usuario.',
            ], 422);
        }

        $usuario->activo = !$usuario->activo;
        $usuario->save();

        return response()->json([
            'message' => $usuario->activo
                ? 'Usuario activado correctamente.'
                : 'Usuario desactivado correctamente.',
            'activo' => $usuario->activo,
        ]);
    }

    /**
     * Obtener roles activos.
     */
    public function roles(Request $request)
    {
        $usuarioActual = $request->user();

        if (!$usuarioActual->tienePermiso('usuarios.crear')) {
            return response()->json([
                'message' => 'No tienes permiso para consultar los roles.',
            ], 403);
        }

        $roles = Rol::where('activo', true)
            ->orderBy('nombre')
            ->get([
                'id',
                'nombre',
                'descripcion',
            ]);

        return response()->json([
            'roles' => $roles,
        ]);
    }

    /**
     * Obtener empresas activas.
     */
    public function empresas(Request $request)
    {
        $usuarioActual = $request->user();

        if (!$usuarioActual->tienePermiso('usuarios.crear')) {
            return response()->json([
                'message' => 'No tienes permiso para consultar las empresas.',
            ], 403);
        }

        $empresas = Empresa::where('activo', true)
            ->orderBy('nombre')
            ->get([
                'id',
                'nombre',
            ]);

        return response()->json([
            'empresas' => $empresas,
        ]);
    }
}