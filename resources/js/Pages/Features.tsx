import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

interface PageProps {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
}

export default function Features({ auth }: PageProps) {
    const apps = [
        {
            title: 'Retail',
            description: 'Complete POS system with inventory tracking, sales analytics, and customer management for retail stores',
            categories: ['Business', 'Sales', 'Inventory'],
            rating: 4.5,
            features: [
                'POS System',
                'Inventory Tracking',
                'Sales Analytics',
                'Customer Management',
                'Barcode Scanning',
                'Receipt Printing',
                'Sales Reports'
            ],
            pricingType: 'free',
            includedInPlans: ['basic-plan', 'pro-plan', 'business-plan'],
            comingSoon: true
        },
        {
            title: 'F&B Management',
            description: 'Restaurant management system with table ordering, kitchen display, and menu customization features',
            categories: ['Food', 'Business', 'Inventory'],
            rating: 4.8,
            features: [
                'Table Management',
                'Menu Customization',
                'Kitchen Display System',
                'Order Processing',
                'Inventory Tracking',
                'Reservation System',
                'Sales Analytics'
            ],
            pricingType: 'free',
            includedInPlans: ['basic-plan', 'pro-plan', 'business-plan']
        },
        {
            title: 'Clinic Management',
            description: 'Medical practice management with patient records, appointment scheduling, and billing system',
            categories: ['Medical', 'Healthcare', 'Appointments'],
            rating: 4.7,
            features: [
                'Patient Records',
                'Appointment Scheduling',
                'Billing System',
                'Medical History',
                'Prescription Management',
                'Insurance Claims',
                'Reports'
            ],
            pricingType: 'subscription',
            includedInPlans: ['business-plan']
        },
        {
            title: 'Lending System',
            description: 'Loan management system with payment tracking, interest calculation, and automated billing features',
            categories: ['Finance', 'Business', 'Payments'],
            rating: 4.6,
            features: [
                'Loan Processing',
                'Payment Tracking',
                'Interest Calculation',
                'Automated Billing',
                'Default Management',
                'Loan Reports',
                'Customer Portal'
            ],
            pricingType: 'free',
            includedInPlans: ['pro-plan', 'business-plan']
        },
        {
            title: 'Rental System',
            description: 'Equipment and item rental system with booking calendar, maintenance tracking, and automated returns',
            categories: ['Business', 'Inventory', 'Bookings'],
            rating: 4.5,
            features: [
                'Item Management',
                'Booking Calendar',
                'Maintenance Tracking',
                'Automated Returns',
                'Payment Processing',
                'Customer Management',
                'Rental History'
            ],
            pricingType: 'free',
            includedInPlans: ['basic-plan', 'pro-plan', 'business-plan']
        },
        {
            title: 'Real Estate Management',
            description: 'Property management solution with tenant tracking, rent collection, and maintenance request handling',
            categories: ['Real Estate', 'Business', 'Bookings'],
            rating: 4.4,
            features: [
                'Property Listing',
                'Tenant Management',
                'Rent Collection',
                'Maintenance Requests',
                'Lease Management',
                'Financial Reports',
                'Document Storage'
            ],
            pricingType: 'subscription',
            includedInPlans: ['business-plan']
        },
        {
            title: 'Transportation System',
            description: 'Fleet management system with route optimization, vehicle maintenance tracking, and driver scheduling',
            categories: ['Transportation', 'Business', 'Logistics'],
            rating: 4.5,
            features: [
                'Fleet Management',
                'Route Optimization',
                'Maintenance Tracking',
                'Driver Scheduling',
                'GPS Tracking',
                'Fuel Management',
                'Reports'
            ],
            pricingType: 'subscription',
            includedInPlans: ['business-plan'],
            comingSoon: true
        },
        {
            title: 'Warehousing System',
            description: 'Advanced warehouse management with inventory tracking, order fulfillment, and space optimization tools',
            categories: ['Logistics', 'Inventory', 'Business'],
            rating: 4.3,
            features: [
                'Inventory Management',
                'Order Fulfillment',
                'Space Optimization',
                'Stock Tracking',
                'Barcode System',
                'Shipping Integration',
                'Analytics'
            ],
            pricingType: 'one-time',
            includedInPlans: ['business-plan'],
            comingSoon: true
        },
        {
            title: 'Payroll System',
            description: 'Employee payroll system with tax calculation, attendance tracking, and automated salary disbursement',
            categories: ['HR', 'Finance', 'Business'],
            rating: 4.6,
            features: [
                'Tax Calculation',
                'Attendance Tracking',
                'Salary Disbursement',
                'Leave Management',
                'Deductions & Benefits',
                'Payroll Reports',
                'Employee Records'
            ],
            pricingType: 'free',
            includedInPlans: ['basic-plan', 'pro-plan', 'business-plan']
        },
        {
            title: 'Travel Management',
            description: 'Travel agency management with package booking, itinerary planning, and customer relationship tools',
            categories: ['Travel', 'Bookings', 'Business'],
            rating: 4.2,
            features: [
                'Package Booking',
                'Itinerary Planning',
                'Customer Management',
                'Payment Processing',
                'Travel Documents',
                'Booking Reports',
                'Customer Portal'
            ],
            pricingType: 'free',
            includedInPlans: ['business-plan'],
            comingSoon: true
        },
        {
            title: 'SMS Integration',
            description: 'Send SMS to your customers and clients. Supports Twilio and Semaphore. Easily integrate with your existing apps.',
            categories: ['Communication', 'Marketing', 'Business'],
            rating: 4.4,
            features: [
                'Bulk SMS',
                'SMS Templates',
                'Delivery Reports',
                'Contact Integration',
                'Scheduled Messages',
                'API Access',
                'Analytics'
            ],
            pricingType: 'subscription',
            includedInPlans: ['pro-plan', 'business-plan'],
            comingSoon: true
        },
        {
            title: 'Email Integration',
            description: 'Send emails to your customers and clients. Supports multiple email providers and templates. Easy to integrate with your existing apps.',
            categories: ['Communication', 'Marketing', 'Business'],
            rating: 4.3,
            features: [
                'Email Templates',
                'Bulk Emails',
                'Email Tracking',
                'Contact Lists',
                'Scheduled Emails',
                'API Integration',
                'Analytics'
            ],
            pricingType: 'subscription',
            includedInPlans: ['pro-plan', 'business-plan']
        },
        {
            title: 'Contacts Management',
            description: 'Manage your contacts and address book. Keep track of customer information, leads, and business relationships all in one place.',
            categories: ['Business', 'Communication', 'CRM'],
            rating: 4.4,
            features: [
                'Contact Organization',
                'Lead Tracking',
                'Business Relationships',
                'Communication History',
                'Contact Groups',
                'Import/Export',
                'Contact Analytics'
            ],
            pricingType: 'free',
            includedInPlans: ['basic-plan', 'pro-plan', 'business-plan']
        },
        {
            title: 'Family Tree',
            description: 'Create and manage family trees with an interactive viewer, relationship mapping, and genealogy tracking features.',
            categories: ['Family', 'Genealogy', 'Personal'],
            rating: 4.0,
            features: [
                'Interactive Viewer',
                'Relationship Mapping',
                'Genealogy Tracking',
                'Family History',
                'Document Storage',
                'Family Reports',
                'Privacy Controls'
            ],
            pricingType: 'subscription',
            includedInPlans: ['basic-plan', 'pro-plan', 'business-plan']
        },
        {
            title: 'Events Management',
            description: 'Manage and track events, including registration, check-in, and analytics.',
            categories: ['Events', 'Community', 'Business'],
            rating: 4.0,
            features: [
                'Event Registration',
                'Check-in System',
                'Event Analytics',
                'Attendee Management',
                'Schedule Planning',
                'Marketing Tools',
                'Reports'
            ],
            pricingType: 'subscription',
            includedInPlans: ['basic-plan', 'pro-plan', 'business-plan']
        },
        {
            title: 'Challenges',
            description: 'Create and manage challenges, including participants, progress, and rewards.',
            categories: ['Challenges', 'Community', 'Business'],
            rating: 4.0,
            features: [
                'Challenge Creation',
                'Participant Management',
                'Progress Tracking',
                'Reward System',
                'Leaderboards',
                'Analytics',
                'Reports'
            ],
            pricingType: 'subscription',
            includedInPlans: ['basic-plan', 'pro-plan', 'business-plan']
        },
        {
            title: 'Content Creator',
            description: 'Create and manage content, including articles, pages, and posts.',
            categories: ['Content', 'Business', 'Marketing'],
            rating: 4.0,
            features: [
                'Content Creation',
                'Page Management',
                'Post Scheduling',
                'Media Library',
                'SEO Tools',
                'Analytics',
                'Content Calendar'
            ],
            pricingType: 'subscription',
            includedInPlans: ['basic-plan', 'pro-plan', 'business-plan']
        },
        {
            title: 'Digital Products',
            description: 'Create and manage digital products, including ebooks, courses, and memberships.',
            categories: ['Digital', 'Products', 'Business'],
            rating: 4.0,
            features: [
                'Product Creation',
                'Course Management',
                'Membership System',
                'Payment Processing',
                'Content Delivery',
                'Analytics',
                'Reports'
            ],
            pricingType: 'subscription',
            includedInPlans: ['basic-plan', 'pro-plan', 'business-plan']
        },
        {
            title: 'Pages',
            description: 'Create and manage pages, including articles, pages, and posts.',
            categories: ['Digital', 'Products', 'Business'],
            rating: 4.0,
            features: [
                'Page Creation',
                'Content Management',
                'SEO Optimization',
                'Media Library',
                'Analytics',
                'Custom Templates',
                'Version Control'
            ],
            pricingType: 'subscription',
            includedInPlans: ['basic-plan', 'pro-plan', 'business-plan']
        }
    ];

    return (
        <>
            <Head title="Features - Sakto" />
            <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50/30 to-white dark:bg-gray-950">
                {/* Navigation */}
                <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 dark:bg-gray-900/80 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <Link href="/" className="flex items-center">
                                    <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent dark:text-gray-100">Sakto</span>
                                </Link>
                            </div>
                            <div className="flex items-center">
                                {auth.user ? (
                                    <Link
                                        href={route('home')}
                                        className="text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                    >
                                        Home
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('pricing')}
                                            className="text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                        >
                                            Pricing
                                        </Link>
                                        <Link
                                            href={route('login')}
                                            className="group inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                        >
                                            <span>Log in</span>
                                            <svg className="ml-2 -mr-1 w-4 h-4 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Features Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 bg-clip-text dark:text-white sm:text-5xl">
                            Powerful Features for Every Business
                        </h1>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                            Discover our comprehensive suite of business applications
                        </p>
                    </div>

                    <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {apps.map((app) => (
                            <div key={app.title} className="relative group">
                                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-30 transition duration-200"></div>
                                <div className="relative p-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 transition duration-200">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{app.title}</h3>
                                        <div className="flex items-center">
                                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="ml-1 text-sm text-gray-600 dark:text-gray-300">{app.rating}</span>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-gray-600 dark:text-gray-300">{app.description}</p>
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            {app.categories.map((category) => (
                                                <span
                                                    key={category}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                                                >
                                                    {category}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Key Features:</h4>
                                        <ul className="mt-4 space-y-2">
                                            {app.features.map((feature) => (
                                                <li key={feature} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                    <svg className="h-4 w-4 text-indigo-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                app.pricingType === 'free' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                            }`}>
                                                {app.pricingType === 'free' ? 'Free' : 
                                                 app.includedInPlans.includes('business-plan') ? 'Business Plan' : 
                                                 app.includedInPlans.includes('pro-plan') ? 'Pro Plan' : 
                                                 app.includedInPlans.includes('basic-plan') ? 'Basic Plan' : 'Premium'}
                                            </span>
                                        </div>
                                        {!auth.user && (
                                            <Link
                                                href={route('register')}
                                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                            >
                                                Get Started →
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-800">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                © {new Date().getFullYear()} Sakto. All rights reserved.
                            </p>
                            <div className="flex items-center space-x-6">
                                <Link
                                    href={route('privacy-policy')}
                                    className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors duration-200"
                                >
                                    Privacy Policy
                                </Link>
                                <Link
                                    href={route('terms-and-conditions')}
                                    className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors duration-200"
                                >
                                    Terms
                                </Link>
                                <Link
                                    href={route('cookie-policy')}
                                    className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors duration-200"
                                >
                                    Cookies
                                </Link>
                                <Link
                                    href={route('faq')}
                                    className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors duration-200"
                                >
                                    FAQ
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
} 