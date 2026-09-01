<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoNegocio extends Model
{
    protected $table = 'tipos_negocio';

    protected $fillable = [
        'nombre',
        'descripcion',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];
}