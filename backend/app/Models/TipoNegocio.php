<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function empresas(): HasMany
    {
        return $this->hasMany(Empresa::class);
    }
}