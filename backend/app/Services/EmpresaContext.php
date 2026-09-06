<?php

namespace App\Services;

use App\Models\Empresa;
use App\Models\User;
use RuntimeException;

class EmpresaContext
{
    /**
     * Obtener la empresa del usuario autenticado.
     */
    public function obtenerEmpresa(User $usuario): Empresa
    {
        $empresa = $usuario->empresa;

        if (!$empresa) {
            throw new RuntimeException(
                'El usuario no tiene una empresa configurada.'
            );
        }

        return $empresa;
    }

    /**
     * Obtener el tipo de negocio de la empresa.
     */
    public function obtenerTipoNegocio(User $usuario)
    {
        $empresa = $this->obtenerEmpresa($usuario);

        $empresa->loadMissing('tipoNegocio');

        if (!$empresa->tipoNegocio) {
            throw new RuntimeException(
                'La empresa no tiene un tipo de negocio configurado.'
            );
        }

        return $empresa->tipoNegocio;
    }

    /**
     * Obtener el ID del tipo de negocio.
     */
    public function obtenerTipoNegocioId(User $usuario): int
    {
        $empresa = $this->obtenerEmpresa($usuario);

        if (!$empresa->tipo_negocio_id) {
            throw new RuntimeException(
                'La empresa no tiene un tipo de negocio configurado.'
            );
        }

        return (int) $empresa->tipo_negocio_id;
    }

    /**
     * Comprobar si la empresa pertenece a un tipo de negocio.
     */
    public function esTipoNegocio(
        User $usuario,
        int $tipoNegocioId
    ): bool {
        return $this->obtenerTipoNegocioId($usuario)
            === $tipoNegocioId;
    }
}