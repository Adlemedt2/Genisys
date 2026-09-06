<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Proveedor extends Model
{
    protected $table = 'proveedores';

    protected $fillable = [
        'empresa_id',
        'tipo_documento',
        'numero_documento',
        'nombre',
        'telefono',
        'email',
        'direccion',
        'ciudad',
        'contacto',
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
}