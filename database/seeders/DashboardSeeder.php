<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Dashboard;
use App\Models\User;
use App\Models\Module;
use Illuminate\Support\Facades\DB;

class DashboardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();
        $modules = Module::where('is_active', true)->get();

        foreach ($users as $user) {
            // Create dashboards dynamically based on modules from database
            foreach ($modules as $module) {
                if (!Dashboard::where('user_id', $user->id)
                    ->where('app', $module->identifier)
                    ->exists()) {
                    Dashboard::create([
                        'name' => 'Your Dashboard',
                        'user_id' => $user->id,
                        'is_default' => true,
                        'app' => $module->identifier,
                    ]);
                }
            }
        }
    }
}
