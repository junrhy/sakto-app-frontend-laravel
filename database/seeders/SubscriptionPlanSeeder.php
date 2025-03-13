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
                'credits_per_month' => 200,
                'features' => [
                    'Access to all basic features',
                    '200 credits per month',
                    'Email support',
                    'Access to community forums'
                ],
                'is_popular' => false,
                'is_active' => true,
                'badge_text' => 'Starter'
            ],
            [
                'name' => 'Pro Plan',
                'slug' => 'pro-plan',
                'description' => 'Ideal for growing businesses with more advanced needs.',
                'price' => 299.00,
                'duration_in_days' => 30,
                'credits_per_month' => 500,
                'features' => [
                    'All Basic Plan features',
                    '500 credits per month',
                    'Priority email support',
                    'Advanced analytics',
                    'Custom branding options'
                ],
                'is_popular' => true,
                'is_active' => true,
                'badge_text' => 'Most Popular'
            ],
            [
                'name' => 'Business Plan',
                'slug' => 'business-plan',
                'description' => 'For established businesses requiring maximum resources and support.',
                'price' => 599.00,
                'duration_in_days' => 30,
                'credits_per_month' => 1200,
                'features' => [
                    'All Pro Plan features',
                    '1,200 credits per month',
                    'Dedicated account manager',
                    'Phone support',
                    'API access',
                    'Custom integrations',
                    'Team collaboration tools'
                ],
                'is_popular' => false,
                'is_active' => true,
                'badge_text' => 'Enterprise'
            ],
            [
                'name' => 'Annual Basic',
                'slug' => 'annual-basic',
                'description' => 'Save 20% with our annual Basic plan subscription.',
                'price' => 1430.00,
                'duration_in_days' => 365,
                'credits_per_month' => 200,
                'features' => [
                    'All Basic Plan features',
                    '200 credits per month',
                    'Email support',
                    'Access to community forums',
                    '20% savings compared to monthly plan'
                ],
                'is_popular' => false,
                'is_active' => true,
                'badge_text' => 'Best Value'
            ],
            [
                'name' => 'Annual Pro',
                'slug' => 'annual-pro',
                'description' => 'Save 20% with our annual Pro plan subscription.',
                'price' => 2870.00,
                'duration_in_days' => 365,
                'credits_per_month' => 500,
                'features' => [
                    'All Pro Plan features',
                    '500 credits per month',
                    'Priority email support',
                    'Advanced analytics',
                    'Custom branding options',
                    '20% savings compared to monthly plan'
                ],
                'is_popular' => false,
                'is_active' => true,
                'badge_text' => null
            ],
            [
                'name' => 'Annual Business',
                'slug' => 'annual-business',
                'description' => 'Save 20% with our annual Business plan subscription.',
                'price' => 5750.00,
                'duration_in_days' => 365,
                'credits_per_month' => 1200,
                'features' => [
                    'All Business Plan features',
                    '1,200 credits per month',
                    'Dedicated account manager',
                    'Phone support',
                    'API access',
                    'Custom integrations',
                    'Team collaboration tools',
                    '20% savings compared to monthly plan'
                ],
                'is_popular' => false,
                'is_active' => true,
                'badge_text' => null
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
