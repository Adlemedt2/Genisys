<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            TipoNegocioSeeder::class,
            RolSeeder::class,
            PermisoSeeder::class,
            RolPermisoSeeder::class,
            AdminUserSeeder::class,            
        ]);
    }
}
