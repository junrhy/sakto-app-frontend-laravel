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
                ],
                'is_popular' => false,
                'is_active' => true,
                'badge_text' => 'Starter',
                'project_id' => 5, // Enterprise project
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
                ],
                'is_popular' => true,
                'is_active' => true,
                'badge_text' => 'Most Popular',
                'project_id' => 5, // Enterprise project
            ],
            [
                'name' => 'Business Plan',
                'slug' => 'business-plan',
                'description' => 'For individuals and small businesses just getting started.',
                'price' => 699.00,
                'duration_in_days' => 0,
                'unlimited_access' => false,
                'features' => [
                    'All Pro Plan features'
                ],
                'is_popular' => false,
                'is_active' => true,
                'badge_text' => 'Business',
                'project_id' => 5, // Enterprise project
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
                    '20% savings compared to monthly plan'
                ],
                'is_popular' => false,
                'is_active' => true,
                'badge_text' => 'Best Value',
                'project_id' => 5, // Enterprise project
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
                    '20% savings compared to monthly plan'
                ],
                'is_popular' => false,
                'is_active' => true,
                'badge_text' => null,
                'project_id' => 5, // Enterprise project
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
