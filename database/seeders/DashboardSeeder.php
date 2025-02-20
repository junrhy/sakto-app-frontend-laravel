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
        $users = User::where('name', 'Developer')
            ->orWhere('name', 'Project Manager')
            ->orWhere('name', 'Product Owner')
            ->orWhere('name', 'Tester 1')
            ->orWhere('name', 'Tester 2')
            ->get();

        foreach ($users as $user) {
            $dashboards = [
                ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'retail'],
                ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'fnb'],
                ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'lending'],
                ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'warehousing'],
                ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'transportation'],
                ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'rental-item'],
                ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'real-estate'],
                ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'clinic'],
                ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'loan'],
                ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'payroll'],
                ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'travel'],
                ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'sms'],
                ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'email'],
                ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'contacts'],
                ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'family-tree'],
            ];

            foreach ($dashboards as $dashboard) {
                if (!Dashboard::where('user_id', $dashboard['user_id'])
                    ->where('app', $dashboard['app'])
                    ->exists()) {
                    Dashboard::create($dashboard);
                }
            }
        }
    }
}
