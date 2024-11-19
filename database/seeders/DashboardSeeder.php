<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Dashboard;
use Illuminate\Support\Facades\DB;

class DashboardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('dashboards')->delete();
        Dashboard::create([
            'name' => 'Your Dashboard',
            'user_id' => 1,
            'is_default' => true,
            'app' => 'retail',
        ]);

        Dashboard::create([
            'name' => 'Your Dashboard',
            'user_id' => 1,
            'is_default' => true,
            'app' => 'fnb',
        ]);

        Dashboard::create([
            'name' => 'Your Dashboard',
            'user_id' => 1,
            'is_default' => true,
            'app' => 'lending',
        ]);

        Dashboard::create([
            'name' => 'Your Dashboard',
            'user_id' => 1,
            'is_default' => true,
            'app' => 'warehousing',
        ]);

        Dashboard::create([
            'name' => 'Your Dashboard',
            'user_id' => 1,
            'is_default' => true,
            'app' => 'transportation',
        ]); 

        Dashboard::create([
            'name' => 'Your Dashboard',
            'user_id' => 1,
            'is_default' => true,
            'app' => 'rental-item',
        ]);

        Dashboard::create([
            'name' => 'Your Dashboard',
            'user_id' => 1,
            'is_default' => true,
            'app' => 'real-estate',
        ]);

        Dashboard::create([
            'name' => 'Your Dashboard',
            'user_id' => 1,
            'is_default' => true,
            'app' => 'clinic',
        ]);

        Dashboard::create([
            'name' => 'Your Dashboard',
            'user_id' => 1,
            'is_default' => true,
            'app' => 'loan',
        ]);

        Dashboard::create([
            'name' => 'Your Dashboard',
            'user_id' => 1,
            'is_default' => true,
            'app' => 'payroll',
        ]);

        Dashboard::create([
            'name' => 'Your Dashboard',
            'user_id' => 1,
            'is_default' => true,
            'app' => 'travel',
        ]);
    }
}
