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
        $enabledModules = Module::all()->pluck('identifier')->toArray();

        $projects = [
            [
                'id' => 1,
                'name' => 'Trial',
                'identifier' => 'trial',
                'enabledModules' => json_encode(array_values($enabledModules)),
            ],
            [
                'id' => 2,
                'name' => 'Community',
                'identifier' => 'community',
                'enabledModules' => json_encode(array_values(['genealogy', 'email', 'sms', 'contacts', 'pages', 'challenges', 'content-creator', 'digital-products', 'healthcare'])),
            ],
            [
                'id' => 3,
                'name' => 'Logistics',
                'identifier' => 'logistics',
                'enabledModules' => json_encode(array_values(['payroll', 'contacts', 'email', 'sms', 'warehousing', 'transportation'])),
            ],
            [
                'id' => 4,
                'name' => 'Medical',
                'identifier' => 'medical',
                'enabledModules' => json_encode(array_values(['clinical', 'payroll', 'contacts', 'email', 'sms'])),
            ],
            [
                'id' => 5,
                'name' => 'Enterprise',
                'identifier' => 'enterprise',
                'enabledModules' => json_encode(array_values($enabledModules)),
            ],
            
        ];

        foreach ($projects as $project) {
            $existingProject = Project::where('identifier', $project['identifier'])
                ->orWhere('id', $project['id'])
                ->first();

            if (!$existingProject) {
                Project::create($project);
            } else {
                // Get current enabled modules
                $currentModules = json_decode($existingProject->enabledModules, true) ?? [];
                
                // Filter out modules that don't exist in $enabledModules
                $currentModules = array_intersect($currentModules, $enabledModules);
                
                // Merge with new modules, removing duplicates and reindexing
                $updatedModules = array_values(array_unique(array_merge($currentModules, $enabledModules)));
                
                // Update the project with new modules
                $existingProject->update([
                    'name' => $project['name'],
                    'identifier' => $project['identifier'],
                    'enabledModules' => json_encode($updatedModules)
                ]);
            }
        }
    }
}
