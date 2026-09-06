<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Empresa extends Model
{
    protected $table = 'empresas';

    protected $fillable = [
        'tipo_negocio_id',
        'nombre',
        'razon_social',
        'nit',
        'telefono',
        'email',
        'direccion',
        'logo',
        'activo',
        'configuracion_completada',
    ];

    protected $casts = [
        'activo' => 'boolean',
        'configuracion_completada' => 'boolean',
    ];

    /**
     * Tipo de negocio de la empresa.
     */
    public function tipoNegocio(): BelongsTo
    {
        return $this->belongsTo(
            TipoNegocio::class,
            'tipo_negocio_id'
        );
    }

    /**
     * Productos de la empresa.
     */
    public function productos()
    {
        return $this->hasMany(Producto::class);
    }

    /**
     * Usuarios pertenecientes a la empresa.
     */
    public function usuarios(): HasMany
    {
        return $this->hasMany(
            User::class,
            'empresa_id'
        );
    }
    /**
     * Clientes pertenecientes a la empresa.
     */
    public function clientes(): HasMany
    {
        return $this->hasMany(
            Cliente::class,
            'empresa_id'
        );
    }
    public function proveedores(): HasMany
    {
        return $this->hasMany(
            Proveedor::class,
            'empresa_id'
        );
    }
}