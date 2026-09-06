<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Funcionalidad extends Model
{
    protected $table = 'funcionalidades';

    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    /**
     * Tipos de negocio que utilizan esta funcionalidad.
     */
    public function tiposNegocio(): BelongsToMany
    {
        return $this->belongsToMany(
            TipoNegocio::class,
            'tipo_negocio_funcionalidades',
            'funcionalidad_id',
            'tipo_negocio_id'
        );
    }
}