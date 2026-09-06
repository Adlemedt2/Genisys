<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Cliente extends Model
{
    protected $table = 'clientes';

    protected $fillable = [
        'empresa_id',
        'tipo_documento',
        'numero_documento',
        'nombre',
        'apellido',
        'telefono',
        'email',
        'direccion',
        'ciudad',
        'observaciones',
        'activo',
    ];

    protected function casts(): array
    {
        return [
            'activo' => 'boolean',
        ];
    }

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(
            Empresa::class,
            'empresa_id'
        );
    }

    public function getNombreCompletoAttribute(): string
    {
        return trim(
            $this->nombre . ' ' . ($this->apellido ?? '')
        );
    }
}