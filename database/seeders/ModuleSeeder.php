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
        $modules = [
            ['id' => 1, 'name' => 'Retail', 'identifier' => 'retail'],
            ['id' => 2, 'name' => 'FnB', 'identifier' => 'fnb'],
            ['id' => 3, 'name' => 'Warehousing', 'identifier' => 'warehousing'],
            ['id' => 4, 'name' => 'Transportation', 'identifier' => 'transportation'],
            ['id' => 5, 'name' => 'Rental Items', 'identifier' => 'rental-items'],
            ['id' => 6, 'name' => 'Rental Properties', 'identifier' => 'rental-properties'],
            ['id' => 7, 'name' => 'Clinical', 'identifier' => 'clinical'],
            ['id' => 8, 'name' => 'Lending', 'identifier' => 'lending'],
            ['id' => 9, 'name' => 'Payroll', 'identifier' => 'payroll'],
            ['id' => 10, 'name' => 'SMS', 'identifier' => 'sms'],
            ['id' => 11, 'name' => 'Email', 'identifier' => 'email'],
            ['id' => 12, 'name' => 'Contacts', 'identifier' => 'contacts'],
            ['id' => 13, 'name' => 'Genealogy', 'identifier' => 'genealogy'],
            ['id' => 14, 'name' => 'Pages', 'identifier' => 'pages'],
            ['id' => 15, 'name' => 'Challenges', 'identifier' => 'challenges'],
            ['id' => 16, 'name' => 'Content Creator', 'identifier' => 'content-creator'],
            ['id' => 17, 'name' => 'Digital Products', 'identifier' => 'digital-products'],
            ['id' => 18, 'name' => 'Healthcare', 'identifier' => 'healthcare'],
        ];

        foreach ($modules as $module) {
            $existingModule = Module::where('id', $module['id'])->first();
            
            if ($existingModule) {
                // Update existing module
                $existingModule->update([
                    'name' => $module['name'],
                    'identifier' => $module['identifier']
                ]);
            } else {
                // Create new module
                Module::create($module);
            }
        }
    }
}
