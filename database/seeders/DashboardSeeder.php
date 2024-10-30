<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Dashboard;
class DashboardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Dashboard::create([
            'name' => 'Your Dashboard',
            'user_id' => 1,
            'is_default' => true,
        ]);

        Dashboard::create([
            'name' => 'Your Dashboard',
            'user_id' => 2,
            'is_default' => true,
        ]);

        Dashboard::create([
            'name' => 'Your Dashboard',
            'user_id' => 3,
            'is_default' => true,
        ]); 
    }
}
