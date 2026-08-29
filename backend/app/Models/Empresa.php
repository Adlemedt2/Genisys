<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    public function tipoNegocio(): BelongsTo
    {
        return $this->belongsTo(TipoNegocio::class);
    }
}