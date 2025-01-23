<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Project;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $project = [
            'id' => 1,
            'name' => 'Project 1',
            'identifier' => 'project-1',
            'enabledModules' => json_encode([
                'retail', 
                'fnb', 
                'warehousing', 
                'transportation', 
                'rental-items',
                'rental-properties',
                'clinical', 
                'lending', 
                'payroll', 
            ]),
        ];

        if (!Project::where('identifier', $project['identifier'])->exists()) {
            Project::create($project);
        }
    }
}
