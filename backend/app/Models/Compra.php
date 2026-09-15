<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Compra extends Model
{
    protected $table = 'compras';

    protected $fillable = [
        'empresa_id',
        'proveedor_id',
        'usuario_id',
        'numero',
        'fecha',
        'subtotal',
        'impuesto',
        'total',
        'estado',
        'observaciones',
    ];

    protected function casts(): array
    {
        return [
            'fecha' => 'date',
            'subtotal' => 'decimal:2',
            'impuesto' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(
            Empresa::class,
            'empresa_id'
        );
    }

    public function proveedor(): BelongsTo
    {
        return $this->belongsTo(
            Proveedor::class,
            'proveedor_id'
        );
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'usuario_id'
        );
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(
            CompraDetalle::class,
            'compra_id'
        );
    }
}