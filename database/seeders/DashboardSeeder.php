<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Dashboard;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = User::all();

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
                ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'genealogy'],
                ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'events'],
                ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'challenges'],
                ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'content-creator'],
                ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'products'],
                ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'pages'],
                ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'healthcare'],
                ['name' => 'Your Dashboard', 'user_id' => $user->id, 'is_default' => true, 'app' => 'mortuary'],
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
