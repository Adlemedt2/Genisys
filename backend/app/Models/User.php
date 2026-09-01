<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['name', 'email', 'password', 'empresa_id'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Empresa a la que pertenece el usuario.
     */
    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class);
    }

    /**
     * Roles asignados al usuario.
     */
    public function roles()
    {
        return $this->belongsToMany(
            Rol::class,
            'usuario_rol',
            'user_id',
            'rol_id'
        );
    }

    /**
     * Comprueba si el usuario tiene un rol determinado.
     */
    public function tieneRol(string $nombreRol): bool
    {
        return $this->roles()
            ->where('nombre', $nombreRol)
            ->exists();
    }

    /**
     * Comprueba si el usuario tiene un permiso determinado.
     */
    public function tienePermiso(string $nombrePermiso): bool
    {
        return $this->roles()
            ->whereHas('permisos', function ($query) use ($nombrePermiso) {
                $query->where('nombre', $nombrePermiso);
            })
            ->exists();
    }

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}