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
        // Get apps data from config
        $apps = config('apps');
        
        foreach ($apps as $index => $app) {
            // Generate identifier from title if not provided
            $identifier = $this->generateIdentifier($app['title']);
            
            $moduleData = [
                'name' => $app['title'],
                'identifier' => $identifier,
                'title' => $app['title'],
                'route' => $app['route'],
                'visible' => $app['visible'],
                'description' => $app['description'],
                'price' => $app['price'],
                'categories' => $app['categories'],
                'coming_soon' => $app['comingSoon'],
                'pricing_type' => $app['pricingType'],
                'included_in_plans' => $app['includedInPlans'],
                'bg_color' => $app['bgColor'],
                'rating' => $app['rating'],
                'order' => $index + 1,
                'is_active' => true
            ];

            $existingModule = Module::where('identifier', $identifier)
                ->orWhere('name', $app['title'])
                ->first();
            
            if ($existingModule) {
                // Update existing module
                $existingModule->update($moduleData);
            } else {
                // Create new module
                Module::create($moduleData);
            }
        }
    }

    /**
     * Generate identifier from title
     */
    private function generateIdentifier(string $title): string
    {
        return strtolower(str_replace([' ', '&', '-'], ['-', 'and', '-'], $title));
    }
}
