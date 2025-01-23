<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Module;

class ModuleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('modules')->delete();
        
        Module::create([
            'id' => 1,
            'name' => 'Retail',
            'identifier' => 'retail',
        ]);

        Module::create([
            'id' => 2,
            'name' => 'FnB',
            'identifier' => 'fnb',
        ]);

        Module::create([
            'id' => 3,
            'name' => 'Warehousing',
            'identifier' => 'warehousing',
        ]); 

        Module::create([
            'id' => 4,
            'name' => 'Transportation',
            'identifier' => 'transportation',
        ]);

        Module::create([
            'id' => 5,
            'name' => 'Rental Items',
            'identifier' => 'rental-items',
        ]);

        Module::create([
            'id' => 6,
            'name' => 'Rental Properties',
            'identifier' => 'rental-properties',
        ]);

        Module::create([
            'id' => 7,
            'name' => 'Clinical',
            'identifier' => 'clinical',
        ]);

        Module::create([
            'id' => 8,
            'name' => 'Lending',
            'identifier' => 'lending',
        ]);

        Module::create([
            'id' => 9,
            'name' => 'Payroll',
            'identifier' => 'payroll',
        ]);
    }
}
