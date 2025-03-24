<?php

return [
    [
        'title' => 'Retail',
        'route' => '/dashboard?app=retail',
        'visible' => false,
        'description' => 'Complete POS system with inventory tracking, sales analytics, and customer management for retail stores',
        'price' => 0,
        'rating' => 4.5,
        'categories' => ['Business', 'Sales', 'Inventory'],
        'comingSoon' => true,
        'pricingType' => 'free',
        'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan']
    ],
    [
        'title' => 'F&B',
        'route' => '/dashboard?app=fnb',
        'visible' => true,
        'description' => 'Restaurant management system with table ordering, kitchen display, and menu customization features',
        'price' => 0,
        'rating' => 4.8,
        'categories' => ['Food', 'Business', 'Inventory'],
        'comingSoon' => false,
        'pricingType' => 'free',
        'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan']
    ],
    [
        'title' => 'Clinic',
        'route' => '/dashboard?app=clinic',
        'visible' => false,
        'description' => 'Medical practice management with patient records, appointment scheduling, and billing system',
        'price' => 149,
        'rating' => 4.7,
        'categories' => ['Medical', 'Healthcare', 'Appointments'],
        'comingSoon' => false,
        'pricingType' => 'subscription',
        'includedInPlans' => ['business-plan']
    ],
    [
        'title' => 'Lending',
        'route' => '/dashboard?app=lending',
        'visible' => true,
        'description' => 'Loan management system with payment tracking, interest calculation, and automated billing features',
        'price' => 0,
        'rating' => 4.6,
        'categories' => ['Finance', 'Business', 'Payments'],
        'comingSoon' => false,
        'pricingType' => 'free',
        'includedInPlans' => ['pro-plan', 'business-plan']
    ],
    [
        'title' => 'Rental',
        'route' => '/dashboard?app=rental-item',
        'visible' => true,
        'description' => 'Equipment and item rental system with booking calendar, maintenance tracking, and automated returns',
        'price' => 0,
        'rating' => 4.5,
        'categories' => ['Business', 'Inventory', 'Bookings'],
        'comingSoon' => false,
        'pricingType' => 'free',
        'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan']
    ],
    [
        'title' => 'Real Estate',
        'route' => '/dashboard?app=real-estate',
        'visible' => false,
        'description' => 'Property management solution with tenant tracking, rent collection, and maintenance request handling',
        'price' => 599,
        'rating' => 4.4,
        'categories' => ['Real Estate', 'Business', 'Bookings'],
        'comingSoon' => false,
        'pricingType' => 'subscription',
        'includedInPlans' => ['business-plan']
    ],
    [
        'title' => 'Transportation',
        'route' => '/dashboard?app=transportation',
        'visible' => false,
        'description' => 'Fleet management system with route optimization, vehicle maintenance tracking, and driver scheduling',
        'price' => 599,
        'rating' => 4.5,
        'categories' => ['Transportation', 'Business', 'Logistics'],
        'comingSoon' => true,
        'pricingType' => 'subscription',
        'includedInPlans' => ['business-plan']
    ],
    [
        'title' => 'Warehousing',
        'route' => '/dashboard?app=warehousing',
        'visible' => false,
        'description' => 'Advanced warehouse management with inventory tracking, order fulfillment, and space optimization tools',
        'price' => 599,
        'rating' => 4.3,
        'categories' => ['Logistics', 'Inventory', 'Business'],
        'comingSoon' => true,
        'pricingType' => 'one-time',
        'includedInPlans' => ['business-plan']
    ],
    [
        'title' => 'Payroll',
        'route' => '/dashboard?app=payroll',
        'visible' => true,
        'description' => 'Employee payroll system with tax calculation, attendance tracking, and automated salary disbursement',
        'price' => 0,
        'rating' => 4.6,
        'categories' => ['HR', 'Finance', 'Business'],
        'comingSoon' => false,
        'pricingType' => 'free',
        'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan']
    ],
    [
        'title' => 'Travel',
        'route' => '/dashboard?app=travel',
        'visible' => false,
        'description' => 'Travel agency management with package booking, itinerary planning, and customer relationship tools',
        'price' => 0,
        'rating' => 4.2,
        'categories' => ['Travel', 'Bookings', 'Business'],
        'comingSoon' => true,
        'pricingType' => 'free',
        'includedInPlans' => ['business-plan']
    ],
    [
        'title' => 'SMS',
        'route' => '/dashboard?app=sms',
        'visible' => false,
        'description' => 'Send SMS to your customers and clients. Supports Twilio and Semaphore. Easily integrate with your existing apps.',
        'price' => 149,
        'rating' => 4.4,
        'categories' => ['Communication', 'Marketing', 'Business'],
        'comingSoon' => true,
        'pricingType' => 'subscription',
        'includedInPlans' => ['pro-plan', 'business-plan']
    ],
    [
        'title' => 'Email',
        'route' => '/dashboard?app=email',
        'visible' => false,
        'description' => 'Send emails to your customers and clients. Supports multiple email providers and templates. Easy to integrate with your existing apps.',
        'price' => 149,
        'rating' => 4.3,
        'categories' => ['Communication', 'Marketing', 'Business'],
        'comingSoon' => false,
        'pricingType' => 'subscription',
        'includedInPlans' => ['pro-plan', 'business-plan']
    ],
    [
        'title' => 'Contacts',
        'route' => '/dashboard?app=contacts',
        'visible' => true,
        'description' => 'Manage your contacts and address book. Keep track of customer information, leads, and business relationships all in one place.',
        'price' => 0,
        'rating' => 4.4,
        'categories' => ['Business', 'Communication', 'CRM'],
        'comingSoon' => false,
        'pricingType' => 'free',
        'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan']
    ],
    [
        'title' => 'Family Tree',
        'route' => '/dashboard?app=family-tree',
        'visible' => false,
        'description' => 'Create and manage family trees with an interactive viewer, relationship mapping, and genealogy tracking features.',
        'price' => 149,
        'rating' => 4.0,
        'categories' => ['Family', 'Genealogy', 'Personal'],
        'comingSoon' => false,
        'pricingType' => 'subscription',
        'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan']
    ],
    [
        'title' => 'Events',
        'route' => '/dashboard?app=events',
        'visible' => true,
        'description' => 'Manage and track events, including registration, check-in, and analytics.',
        'price' => 149,
        'rating' => 4.0,
        'categories' => ['Events', 'Community', 'Business'],
        'comingSoon' => false,
        'pricingType' => 'subscription',
        'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan']
    ],
    [
        'title' => 'Challenges',
        'route' => '/dashboard?app=challenges',
        'visible' => true,
        'description' => 'Create and manage challenges, including participants, progress, and rewards.',
        'price' => 149,
        'rating' => 4.0,
        'categories' => ['Challenges', 'Community', 'Business'],
        'comingSoon' => false,
        'pricingType' => 'subscription',
        'includedInPlans' => ['basic-plan', 'pro-plan', 'business-plan']
    ]
    
    
]; 