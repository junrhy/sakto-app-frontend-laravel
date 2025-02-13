<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Project;
use App\Models\Module;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $enabledModules = Module::all()->pluck('name')->toArray();

        $project = [
            'id' => 1,
            'name' => 'Trial',
            'identifier' => 'trial',
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
