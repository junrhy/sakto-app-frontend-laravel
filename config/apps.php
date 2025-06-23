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
        'includedInPlans' => ['basic-plan', 'pro-plan', 'annual-basic', 'annual-pro']
    ],
    [
        'title' => 'F&B',
        'route' => '/dashboard?app=fnb',
        'visible' => true,
        'description' => 'Restaurant management system with table ordering, kitchen display, and menu customization features',
        'price' => 0,
        'categories' => ['Food', 'Business', 'Inventory'],
        'comingSoon' => false,
        'pricingType' => 'subscription',
        'includedInPlans' => ['basic-plan', 'pro-plan', 'annual-basic', 'annual-pro']
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
        'includedInPlans' => []
    ],
    [
        'title' => 'Lending',
        'route' => '/dashboard?app=lending',
        'visible' => true,
        'description' => 'Loan management system with payment tracking, interest calculation, and automated billing features',
        'price' => 0,
        'categories' => ['Finance', 'Business', 'Payments'],
        'comingSoon' => false,
        'pricingType' => 'subscription',
        'includedInPlans' => ['basic-plan', 'pro-plan', 'annual-basic', 'annual-pro']
    ],
    [
        'title' => 'Rental',
        'route' => '/dashboard?app=rental-item',
        'visible' => true,
        'description' => 'Equipment and item rental system with booking calendar, maintenance tracking, and automated returns',
        'price' => 0,
        'categories' => ['Business', 'Inventory', 'Bookings'],
        'comingSoon' => false,
        'pricingType' => 'subscription',
        'includedInPlans' => ['basic-plan', 'pro-plan', 'annual-basic', 'annual-pro']
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
        'includedInPlans' => []
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
        'includedInPlans' => []
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
        'includedInPlans' => []
    ],
    [
        'title' => 'Payroll',
        'route' => '/dashboard?app=payroll',
        'visible' => true,
        'description' => 'Employee payroll system with tax calculation, attendance tracking, and automated salary disbursement',
        'price' => 0,
        'categories' => ['HR', 'Finance', 'Business'],
        'comingSoon' => false,
        'pricingType' => 'subscription',
        'includedInPlans' => ['basic-plan', 'pro-plan', 'annual-basic', 'annual-pro']
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
        'includedInPlans' => []
    ],
    [
        'title' => 'SMS',
        'route' => '/dashboard?app=sms',
        'visible' => true,
        'description' => 'Send SMS to your customers and clients. Supports Twilio and Semaphore. Easily integrate with your existing apps.',
        'price' => 149,
        'categories' => ['Communication', 'Marketing', 'Business'],
        'comingSoon' => false,
        'pricingType' => 'subscription',
        'includedInPlans' => ['pro-plan', 'annual-pro']
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
        'includedInPlans' => ['pro-plan', 'annual-pro']
    ],
    [
        'title' => 'Contacts',
        'route' => '/dashboard?app=contacts',
        'visible' => true,
        'description' => 'Manage your contacts and address book. Keep track of customer information, leads, and business relationships all in one place.',
        'price' => 0,
        'categories' => ['Business', 'Communication', 'CRM'],
        'comingSoon' => false,
        'pricingType' => 'subscription',
        'includedInPlans' => ['basic-plan', 'pro-plan', 'annual-basic', 'annual-pro']
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
        'includedInPlans' => ['basic-plan', 'pro-plan', 'annual-basic', 'annual-pro']
    ],
    [
        'title' => 'Events',
        'route' => '/dashboard?app=events',
        'visible' => true,
        'description' => 'Manage and track events, including registration, check-in, and analytics.',
        'price' => 149,
        'categories' => ['Events', 'Community', 'Business'],
        'comingSoon' => false,
        'pricingType' => 'subscription',
        'includedInPlans' => ['basic-plan', 'pro-plan', 'annual-basic', 'annual-pro']
    ],
    [
        'title' => 'Challenges',
        'route' => '/dashboard?app=challenges',
        'visible' => true,
        'description' => 'Create and manage challenges, including participants, progress, and rewards.',
        'price' => 149,
        'categories' => ['Challenges', 'Community', 'Business'],
        'comingSoon' => false,
        'pricingType' => 'subscription',
        'includedInPlans' => ['basic-plan', 'pro-plan', 'annual-basic', 'annual-pro']
    ],
    [
        'title' => 'Content Creator',
        'route' => '/dashboard?app=content-creator',
        'visible' => true,
        'description' => 'Create and manage content, including articles, pages, and posts.',
        'price' => 149,
        'categories' => ['Content', 'Business', 'Marketing'],
        'comingSoon' => false,
        'pricingType' => 'subscription',
        'includedInPlans' => ['basic-plan', 'pro-plan', 'annual-basic', 'annual-pro']
    ],
    [
        'title' => 'Products',
        'route' => '/dashboard?app=products',
        'visible' => true,
        'description' => 'Create and manage products.',
        'price' => 149,
        'categories' => ['Digital', 'Products', 'Business'],
        'comingSoon' => false,
        'pricingType' => 'subscription',
        'includedInPlans' => ['basic-plan', 'pro-plan', 'annual-basic', 'annual-pro']
    ],
    [
        'title' => 'Pages',
        'route' => '/dashboard?app=pages',
        'visible' => true,
        'description' => 'Create and manage pages, including articles, pages, and posts.',
        'price' => 149,
        'categories' => ['Digital', 'Products', 'Business'],
        'comingSoon' => false,
        'pricingType' => 'subscription',
        'includedInPlans' => ['basic-plan', 'pro-plan', 'annual-basic', 'annual-pro']
    ],
    [
        'title' => 'Healthcare',
        'route' => '/dashboard?app=healthcare',
        'visible' => true,
        'description' => 'Manage and track healthcare, including members, contributions, and claims.',
        'price' => 149,
        'categories' => ['Health', 'Insurance', 'Business'],
        'comingSoon' => false,
        'pricingType' => 'subscription',
        'includedInPlans' => ['basic-plan', 'pro-plan', 'annual-basic', 'annual-pro']
    ],
    [
        'title' => 'Mortuary',
        'route' => '/dashboard?app=mortuary',
        'visible' => true,
        'description' => 'Manage and track mortuary, including members, contributions, and claims.',
        'price' => 149,
        'categories' => ['Mortuary', 'Funeral'],
        'comingSoon' => false,
        'pricingType' => 'subscription',
        'includedInPlans' => ['basic-plan', 'pro-plan', 'annual-basic', 'annual-pro']
    ]
]; 