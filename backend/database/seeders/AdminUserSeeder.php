<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $usuario = User::updateOrCreate(
            [
                'email' => 'admin@genisys.local',
            ],
            [
                'name' => 'Administrador',
                'password' => Hash::make('Genisys123*'),
            ]
        );

        $rol = Rol::where('nombre', 'Administrador')->first();

        if ($rol) {
            $usuario->roles()->syncWithoutDetaching([$rol->id]);
        }
    }
}