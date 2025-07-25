<?php

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
        'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'annual-business'],
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
        'comingSoon' => true,
        'pricingType' => 'subscription',
        'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'annual-business'],
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
        'comingSoon' => true,
        'pricingType' => 'subscription',
        'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'annual-business'],
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
        'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'annual-business'],
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
        'rating' => 4.0
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
        'includedInPlans' => ['pro-plan', 'business-plan', 'annual-pro', 'annual-business'],
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
        'includedInPlans' => ['pro-plan', 'business-plan', 'annual-pro', 'annual-business'],
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
        'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan', 'annual-basic', 'annual-pro', 'annual-business'],
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
    ]
]; 