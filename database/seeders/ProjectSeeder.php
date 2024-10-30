<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Project;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Project::create([
            'id' => 1,
            'name' => 'Project 1',
            'identifier' => 'project-1',
            'enabledModules' => json_encode([
                'retail', 
                'fnb', 
                'warehousing', 
                'transportation', 
                'rental-it8ems',
                'rental-properties',
                'clinical', 
                'lending', 
                'payroll', 
            ]),
        ]);
    }
}
