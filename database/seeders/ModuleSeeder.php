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
        // Apps data migrated from config/apps.php
        $apps = $this->getAppsData();
        
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
                'icon' => $app['icon'] ?? $this->getSmartIconSuggestion($app['title']),
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

    /**
     * Get smart icon suggestion based on app title
     */
    private function getSmartIconSuggestion(string $title): string
    {
        $lowerTitle = strtolower($title);
        
        // Business & Productivity
        if (strpos($lowerTitle, 'retail') !== false || strpos($lowerTitle, 'store') !== false || strpos($lowerTitle, 'shop') !== false) {
            return 'RxDashboard';
        }
        if (strpos($lowerTitle, 'office') !== false || strpos($lowerTitle, 'business') !== false) {
            return 'RxHome';
        }
        if (strpos($lowerTitle, 'warehouse') !== false || strpos($lowerTitle, 'warehousing') !== false || strpos($lowerTitle, 'inventory') !== false) {
            return 'RxHome';
        }
        
        // Technology
        if (strpos($lowerTitle, 'transport') !== false || strpos($lowerTitle, 'delivery') !== false) {
            return 'RxRocket';
        }
        if (strpos($lowerTitle, 'tech') !== false || strpos($lowerTitle, 'software') !== false) {
            return 'RxMobile';
        }
        
        // Health & Medical
        if (strpos($lowerTitle, 'clinic') !== false || strpos($lowerTitle, 'medical') !== false || strpos($lowerTitle, 'health') !== false) {
            return 'RxHeart';
        }
        if (strpos($lowerTitle, 'hospital') !== false || strpos($lowerTitle, 'healthcare') !== false) {
            return 'RxHeart';
        }
        
        // Food & Beverage
        if (strpos($lowerTitle, 'food') !== false || strpos($lowerTitle, 'restaurant') !== false || strpos($lowerTitle, 'cafe') !== false || strpos($lowerTitle, 'fnb') !== false) {
            return 'RxFace';
        }
        if (strpos($lowerTitle, 'kitchen') !== false || strpos($lowerTitle, 'dining') !== false) {
            return 'RxFace';
        }
        
        // Finance
        if (strpos($lowerTitle, 'lending') !== false || strpos($lowerTitle, 'loan') !== false || strpos($lowerTitle, 'finance') !== false) {
            return 'RxCardStack';
        }
        if (strpos($lowerTitle, 'payment') !== false || strpos($lowerTitle, 'billing') !== false || strpos($lowerTitle, 'payroll') !== false) {
            return 'RxCardStack';
        }
        
        // Real Estate
        if (strpos($lowerTitle, 'real estate') !== false || strpos($lowerTitle, 'property') !== false) {
            return 'RxHome';
        }
        if (strpos($lowerTitle, 'rental') !== false || strpos($lowerTitle, 'rent') !== false) {
            return 'RxTokens';
        }
        
        // Education
        if (strpos($lowerTitle, 'course') !== false || strpos($lowerTitle, 'education') !== false || strpos($lowerTitle, 'learning') !== false) {
            return 'RxTarget';
        }
        if (strpos($lowerTitle, 'school') !== false || strpos($lowerTitle, 'training') !== false) {
            return 'RxTarget';
        }
        
        // Events
        if (strpos($lowerTitle, 'event') !== false || strpos($lowerTitle, 'calendar') !== false) {
            return 'RxCalendar';
        }
        if (strpos($lowerTitle, 'appointment') !== false || strpos($lowerTitle, 'meeting') !== false) {
            return 'RxCalendar';
        }
        
        // Content
        if (strpos($lowerTitle, 'content') !== false || strpos($lowerTitle, 'creator') !== false || strpos($lowerTitle, 'blog') !== false) {
            return 'RxPencil1';
        }
        if (strpos($lowerTitle, 'media') !== false || strpos($lowerTitle, 'video') !== false) {
            return 'RxImage';
        }
        
        // Digital
        if (strpos($lowerTitle, 'digital') !== false || strpos($lowerTitle, 'product') !== false) {
            return 'RxMobile';
        }
        if (strpos($lowerTitle, 'website') !== false || strpos($lowerTitle, 'page') !== false) {
            return 'RxFile';
        }
        
        // Games
        if (strpos($lowerTitle, 'game') !== false || strpos($lowerTitle, 'gaming') !== false) {
            return 'RxStar';
        }
        if (strpos($lowerTitle, 'challenge') !== false || strpos($lowerTitle, 'fun') !== false) {
            return 'RxStar';
        }
        
        // Family
        if (strpos($lowerTitle, 'family') !== false || strpos($lowerTitle, 'genealogy') !== false) {
            return 'RxShare1';
        }
        
        // Communication
        if (strpos($lowerTitle, 'sms') !== false || strpos($lowerTitle, 'message') !== false) {
            return 'RxChatBubble';
        }
        if (strpos($lowerTitle, 'email') !== false || strpos($lowerTitle, 'mail') !== false) {
            return 'RxEnvelopeClosed';
        }
        if (strpos($lowerTitle, 'contact') !== false || strpos($lowerTitle, 'customer') !== false) {
            return 'RxIdCard';
        }
        
        // Travel
        if (strpos($lowerTitle, 'travel') !== false) {
            return 'RxGlobe';
        }
        
        // Default fallback
        return 'RxDashboard';
    }

    /**
     * Get apps data (migrated from config/apps.php)
     */
    private function getAppsData(): array
    {
        return [
            [
                'title' => 'Retail',
                'route' => '/dashboard?app=retail',
                'visible' => false,
                'description' => 'Complete POS system with inventory tracking, sales analytics, and customer management for retail stores',
                'price' => 0,
                'categories' => ['Business', 'Sales', 'Inventory'],
                'comingSoon' => true,
                'pricingType' => 'subscription',
                'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'annual-business'],
                'bgColor' => 'bg-blue-100 dark:bg-blue-900/30',
                'rating' => 4.5
            ],
            [
                'title' => 'F&B',
                'route' => '/dashboard?app=fnb',
                'visible' => false,
                'description' => 'Restaurant management system with table ordering, kitchen display, and menu customization features',
                'price' => 0,
                'categories' => ['Food', 'Business', 'Inventory'],
                'comingSoon' => false,
                'pricingType' => 'subscription',
                'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'annual-business'],
                'bgColor' => 'bg-orange-100 dark:bg-orange-900/30',
                'rating' => 4.8
            ],
            [
                'title' => 'Clinic',
                'route' => '/dashboard?app=clinic',
                'visible' => false,
                'description' => 'Medical practice management with patient records, appointment scheduling, and billing system',
                'price' => 149,
                'categories' => ['Medical', 'Healthcare', 'Appointments'],
                'comingSoon' => false,
                'pricingType' => 'subscription',
                'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'annual-business', 'business-plan-1757753311'],
                'bgColor' => 'bg-red-100 dark:bg-red-900/30',
                'rating' => 4.6
            ],
            [
                'title' => 'Lending',
                'route' => '/dashboard?app=lending',
                'visible' => false,
                'description' => 'Loan management system with payment tracking, interest calculation, and automated billing features',
                'price' => 0,
                'categories' => ['Finance', 'Business', 'Payments'],
                'comingSoon' => false,
                'pricingType' => 'subscription',
                'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'annual-business'],
                'bgColor' => 'bg-green-100 dark:bg-green-900/30',
                'rating' => 4.7
            ],
            [
                'title' => 'Rental',
                'route' => '/dashboard?app=rental-item',
                'visible' => false,
                'description' => 'Equipment and item rental system with booking calendar, maintenance tracking, and automated returns',
                'price' => 0,
                'categories' => ['Business', 'Inventory', 'Bookings'],
                'comingSoon' => false,
                'pricingType' => 'subscription',
                'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'annual-business'],
                'bgColor' => 'bg-purple-100 dark:bg-purple-900/30',
                'rating' => 4.4
            ],
            [
                'title' => 'Real Estate',
                'route' => '/dashboard?app=real-estate',
                'visible' => false,
                'description' => 'Property management solution with tenant tracking, rent collection, and maintenance request handling',
                'price' => 599,
                'categories' => ['Real Estate', 'Business', 'Bookings'],
                'comingSoon' => false,
                'pricingType' => 'subscription',
                'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'annual-business'],
                'bgColor' => 'bg-indigo-100 dark:bg-indigo-900/30',
                'rating' => 4.3
            ],
            [
                'title' => 'Transportation',
                'route' => '/dashboard?app=transportation',
                'visible' => false,
                'description' => 'Fleet management system with route optimization, vehicle maintenance tracking, and driver scheduling',
                'price' => 599,
                'categories' => ['Transportation', 'Business', 'Logistics'],
                'comingSoon' => false,
                'pricingType' => 'subscription',
                'includedInPlans' => ['business-plan', 'annual-basic', 'annual-pro', 'logistika-basic-plan', 'logistika-pro-plan'],
                'bgColor' => 'bg-yellow-100 dark:bg-yellow-900/30',
                'rating' => 4.2
            ],
            [
                'title' => 'Warehousing',
                'route' => '/dashboard?app=warehousing',
                'visible' => false,
                'description' => 'Advanced warehouse management with inventory tracking, order fulfillment, and space optimization tools',
                'price' => 599,
                'categories' => ['Logistics', 'Inventory', 'Business'],
                'comingSoon' => false,
                'pricingType' => 'subscription',
                'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'annual-business', 'logistika-pro-plan', 'logistika-basic-plan'],
                'bgColor' => 'bg-gray-100 dark:bg-gray-900/30',
                'rating' => 4.1
            ],
            [
                'title' => 'Payroll',
                'route' => '/dashboard?app=payroll',
                'visible' => false,
                'description' => 'Employee payroll system with tax calculation, attendance tracking, and automated salary disbursement',
                'price' => 0,
                'categories' => ['HR', 'Finance', 'Business'],
                'comingSoon' => false,
                'pricingType' => 'subscription',
                'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'annual-business', 'logistika-pro-plan', 'logistika-basic-plan'],
                'bgColor' => 'bg-pink-100 dark:bg-pink-900/30',
                'rating' => 4.6
            ],
            [
                'title' => 'Travel',
                'route' => '/dashboard?app=travel',
                'visible' => false,
                'description' => 'Travel agency management with package booking, itinerary planning, and customer relationship tools',
                'price' => 0,
                'categories' => ['Travel', 'Bookings', 'Business'],
                'comingSoon' => true,
                'pricingType' => 'subscription',
                'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'annual-business'],
                'bgColor' => 'bg-cyan-100 dark:bg-cyan-900/30',
                'rating' => 4
            ],
            [
                'title' => 'SMS',
                'route' => '/dashboard?app=sms',
                'visible' => false,
                'description' => 'Send SMS to your customers and clients. Supports Twilio and Semaphore. Easily integrate with your existing apps.',
                'price' => 149,
                'categories' => ['Communication', 'Marketing', 'Business'],
                'comingSoon' => false,
                'pricingType' => 'subscription',
                'includedInPlans' => ['pro-plan', 'business-plan', 'annual-pro', 'annual-business', 'logistika-pro-plan', 'logistika-basic-plan'],
                'bgColor' => 'bg-emerald-100 dark:bg-emerald-900/30',
                'rating' => 4.7
            ],
            [
                'title' => 'Email',
                'route' => '/dashboard?app=email',
                'visible' => false,
                'description' => 'Send emails to your customers and clients. Supports multiple email providers and templates. Easy to integrate with your existing apps.',
                'price' => 149,
                'categories' => ['Communication', 'Marketing', 'Business'],
                'comingSoon' => false,
                'pricingType' => 'subscription',
                'includedInPlans' => ['pro-plan', 'business-plan', 'annual-pro', 'annual-business', 'logistika-pro-plan', 'logistika-basic-plan'],
                'bgColor' => 'bg-blue-100 dark:bg-blue-900/30',
                'rating' => 4.5
            ],
            [
                'title' => 'Contacts',
                'route' => '/dashboard?app=contacts',
                'visible' => false,
                'description' => 'Manage your contacts and address book. Keep track of customer information, leads, and business relationships all in one place.',
                'price' => 0,
                'categories' => ['Business', 'Communication', 'CRM'],
                'comingSoon' => false,
                'pricingType' => 'subscription',
                'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'logistika-pro-plan', 'logistika-basic-plan', 'medical-business-plan'],
                'bgColor' => 'bg-teal-100 dark:bg-teal-900/30',
                'rating' => 4.8
            ],
            [
                'title' => 'Genealogy',
                'route' => '/dashboard?app=genealogy',
                'visible' => false,
                'description' => 'Create and manage family trees with an interactive viewer, relationship mapping, and genealogy tracking features.',
                'price' => 149,
                'categories' => ['Family', 'Genealogy', 'Personal'],
                'comingSoon' => false,
                'pricingType' => 'subscription',
                'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'annual-business'],
                'bgColor' => 'bg-amber-100 dark:bg-amber-900/30',
                'rating' => 4.4
            ],
            [
                'title' => 'Events',
                'route' => '/dashboard?app=events',
                'visible' => false,
                'description' => 'Manage and track events, including registration, check-in, and analytics.',
                'price' => 149,
                'categories' => ['Events', 'Community', 'Business'],
                'comingSoon' => false,
                'pricingType' => 'subscription',
                'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'annual-business'],
                'bgColor' => 'bg-violet-100 dark:bg-violet-900/30',
                'rating' => 4.6
            ],
            [
                'title' => 'Challenges',
                'route' => '/dashboard?app=challenges',
                'visible' => false,
                'description' => 'Create and manage challenges, including participants, progress, and rewards.',
                'price' => 149,
                'categories' => ['Challenges', 'Community', 'Business'],
                'comingSoon' => false,
                'pricingType' => 'subscription',
                'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'annual-business'],
                'bgColor' => 'bg-rose-100 dark:bg-rose-900/30',
                'rating' => 4.5
            ],
            [
                'title' => 'Content Creator',
                'route' => '/dashboard?app=content-creator',
                'visible' => false,
                'description' => 'Create and manage content, including articles, pages, and posts.',
                'price' => 149,
                'categories' => ['Content', 'Business', 'Marketing'],
                'comingSoon' => false,
                'pricingType' => 'subscription',
                'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'annual-business'],
                'bgColor' => 'bg-sky-100 dark:bg-sky-900/30',
                'rating' => 4.3
            ],
            [
                'title' => 'Products',
                'route' => '/dashboard?app=products',
                'visible' => false,
                'description' => 'Create and manage products.',
                'price' => 149,
                'categories' => ['Products', 'Business'],
                'comingSoon' => false,
                'pricingType' => 'subscription',
                'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'annual-business'],
                'bgColor' => 'bg-lime-100 dark:bg-lime-900/30',
                'rating' => 4.4
            ],
            [
                'title' => 'Pages',
                'route' => '/dashboard?app=pages',
                'visible' => false,
                'description' => 'Create and manage pages, including articles, pages, and posts.',
                'price' => 149,
                'categories' => ['Pages', 'Business'],
                'comingSoon' => false,
                'pricingType' => 'subscription',
                'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'annual-business'],
                'bgColor' => 'bg-slate-100 dark:bg-slate-900/30',
                'rating' => 4.2
            ],
            [
                'title' => 'Healthcare',
                'route' => '/dashboard?app=healthcare',
                'visible' => false,
                'description' => 'Manage and track healthcare, including members, contributions, and claims.',
                'price' => 149,
                'categories' => ['Health', 'Insurance', 'Business'],
                'comingSoon' => false,
                'pricingType' => 'subscription',
                'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'annual-business'],
                'bgColor' => 'bg-red-100 dark:bg-red-900/30',
                'rating' => 4.7
            ],
            [
                'title' => 'Mortuary',
                'route' => '/dashboard?app=mortuary',
                'visible' => false,
                'description' => 'Manage and track mortuary, including members, contributions, and claims.',
                'price' => 149,
                'categories' => ['Mortuary', 'Funeral'],
                'comingSoon' => false,
                'pricingType' => 'subscription',
                'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'annual-business'],
                'bgColor' => 'bg-gray-100 dark:bg-gray-900/30',
                'rating' => 4.1
            ],
            [
                'title' => 'Bill Payments',
                'route' => '/bill-payments',
                'visible' => false,
                'description' => 'Comprehensive bill payment management system with recurring payments, reminders, and payment tracking.',
                'price' => 99,
                'categories' => ['Finance', 'Payments', 'Business'],
                'comingSoon' => false,
                'pricingType' => 'subscription',
                'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'annual-business'],
                'bgColor' => 'bg-emerald-100 dark:bg-emerald-900/30',
                'rating' => 4.8
            ],
            [
                'title' => 'Billers',
                'route' => '/billers',
                'visible' => false,
                'description' => 'Manage your billers and service providers with complete contact information, categories, and account tracking.',
                'price' => 0,
                'categories' => ['Finance', 'Business', 'Contacts'],
                'comingSoon' => false,
                'pricingType' => 'subscription',
                'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'annual-business'],
                'bgColor' => 'bg-indigo-100 dark:bg-indigo-900/30',
                'rating' => 4.6
            ],
            [
                'title' => 'Courses',
                'route' => '/courses',
                'visible' => false,
                'description' => 'Create and manage online courses with lessons, student enrollments, progress tracking, and certificates.',
                'price' => 199,
                'categories' => ['Education', 'Training', 'Business'],
                'comingSoon' => false,
                'pricingType' => 'subscription',
                'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'annual-business'],
                'bgColor' => 'bg-purple-100 dark:bg-purple-900/30',
                'rating' => 4.9
            ],
        ];
    }
}
