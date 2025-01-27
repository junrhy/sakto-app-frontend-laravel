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
        $enabledModules = [
            'retail', 
            'fnb', 
            'warehousing', 
            'transportation', 
            'rental-items',
            'rental-properties',
            'clinical', 
            'lending', 
            'payroll',
            'sms',
            'email'
        ];

        $project = [
            'id' => 1,
            'name' => 'Project 1',
            'identifier' => 'project-1',
            'enabledModules' => json_encode(array_values($enabledModules)),
        ];

        $existingProject = Project::where('identifier', $project['identifier'])->first();

        if (!$existingProject) {
            Project::create($project);
        } else {
            // Get current enabled modules
            $currentModules = json_decode($existingProject->enabledModules, true) ?? [];
            
            // Merge with new modules, removing duplicates and reindexing
            $updatedModules = array_values(array_unique(array_merge($currentModules, $enabledModules)));
            
            // Update the project with new modules
            $existingProject->update([
                'enabledModules' => json_encode($updatedModules)
            ]);
        }
    }
}
