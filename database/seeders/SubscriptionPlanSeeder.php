<?php

namespace Database\Seeders;

use App\Models\SubscriptionPlan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Basic Plan',
                'slug' => 'basic-plan',
                'description' => 'Perfect for individuals and small businesses just getting started.',
                'price' => 149.00,
                'duration_in_days' => 30,
                'unlimited_access' => true,
                'features' => [
                    'Access to all basic features',
                    'Up to 10 tables',
                    'Up to 300 reservations',
                    'Up to 100 menu items',
                    '1 online store',
                ],
                'limits' => [
                    'fnb' => [
                        'tables' => 10,
                        'reservations' => 300,
                        'menu_items' => 100,
                        'online_stores' => 1,
                    ],
                ],
                'is_popular' => false,
                'is_active' => true,
                'badge_text' => 'Starter',
                'project_id' => 2, // Community project
                'lemon_squeezy_variant_id' => '1035735',
            ],
            [
                'name' => 'Pro Plan',
                'slug' => 'pro-plan',
                'description' => 'Ideal for growing businesses with more advanced needs.',
                'price' => 299.00,
                'duration_in_days' => 30,
                'unlimited_access' => true,
                'features' => [
                    'All Basic Plan features',
                    'Up to 30 tables',
                    'Up to 2,000 reservations',
                    'Up to 500 menu items',
                    'Up to 5 online stores',
                ],
                'limits' => [
                    'fnb' => [
                        'tables' => 30,
                        'reservations' => 2000,
                        'menu_items' => 500,
                        'online_stores' => 5,
                    ],
                ],
                'is_popular' => true,
                'is_active' => true,
                'badge_text' => 'Most Popular',
                'project_id' => 2, // Community project
                'lemon_squeezy_variant_id' => '1035748',
            ],
            [
                'name' => 'Business Plan',
                'slug' => 'business-plan',
                'description' => 'For individuals and small businesses just getting started.',
                'price' => 699.00,
                'duration_in_days' => 0,
                'unlimited_access' => false,
                'features' => [
                    'All Pro Plan features',
                    'Unlimited tables, reservations, menu items, and online stores',
                ],
                'limits' => [
                    'fnb' => [
                        'tables' => -1,
                        'reservations' => -1,
                        'menu_items' => -1,
                        'online_stores' => -1,
                    ],
                ],
                'is_popular' => false,
                'is_active' => true,
                'badge_text' => 'Business',
                'project_id' => 2, // Community project
                'lemon_squeezy_variant_id' => '1035749',
            ],
            [
                'name' => 'Annual Basic',
                'slug' => 'annual-basic',
                'description' => 'Save 20% with our annual Basic plan subscription.',
                'price' => 1430.00,
                'duration_in_days' => 365,
                'unlimited_access' => true,
                'features' => [
                    'All Basic Plan features',
                    '20% savings compared to monthly plan',
                    'Up to 10 tables',
                    'Up to 300 reservations',
                    'Up to 100 menu items',
                    '1 online store',
                ],
                'limits' => [
                    'fnb' => [
                        'tables' => 10,
                        'reservations' => 300,
                        'menu_items' => 100,
                        'online_stores' => 1,
                    ],
                ],
                'is_popular' => false,
                'is_active' => true,
                'badge_text' => 'Best Value',
                'project_id' => 2, // Community project
                'lemon_squeezy_variant_id' => '1035758',
            ],
            [
                'name' => 'Annual Pro',
                'slug' => 'annual-pro',
                'description' => 'Save 20% with our annual Pro plan subscription.',
                'price' => 2870.00,
                'duration_in_days' => 365,
                'unlimited_access' => true,
                'features' => [
                    'All Pro Plan features',
                    '20% savings compared to monthly plan',
                    'Up to 30 tables',
                    'Up to 2,000 reservations',
                    'Up to 500 menu items',
                    'Up to 5 online stores',
                ],
                'limits' => [
                    'fnb' => [
                        'tables' => 30,
                        'reservations' => 2000,
                        'menu_items' => 500,
                        'online_stores' => 5,
                    ],
                ],
                'is_popular' => false,
                'is_active' => true,
                'badge_text' => null,
                'project_id' => 2, // Community project
            ],
            [
                'name' => 'Annual Business',
                'slug' => 'annual-business',
                'description' => 'Save 20% with our annual Business plan subscription.',
                'price' => 6890.00,
                'duration_in_days' => 365,
                'unlimited_access' => false,
                'features' => [
                    'All Business Plan features',
                    '20% savings compared to monthly plan',
                    'Unlimited tables, reservations, menu items, and online stores',
                ],
                'limits' => [
                    'fnb' => [
                        'tables' => -1,
                        'reservations' => -1,
                        'menu_items' => -1,
                        'online_stores' => -1,
                    ],
                ],
                'is_popular' => false,
                'is_active' => true,
                'badge_text' => null,
                'project_id' => 2, // Community project
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }
    }
}
