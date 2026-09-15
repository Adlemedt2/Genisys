<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MovimientoInventario extends Model
{
    protected $table = 'movimientos_inventario';

    protected $fillable = [
        'empresa_id',
        'producto_id',
        'usuario_id',
        'tipo',
        'cantidad',
        'stock_anterior',
        'stock_nuevo',
        'motivo',
        'observaciones',
    ];

    protected function casts(): array
    {
        return [
            'cantidad' => 'decimal:3',
            'stock_anterior' => 'decimal:3',
            'stock_nuevo' => 'decimal:3',
        ];
    }

    public function empresa(): BelongsTo
    {
        return $this->belongsTo(
            Empresa::class,
            'empresa_id'
        );
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(
            Producto::class,
            'producto_id'
        );
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'usuario_id'
        );
    }
}