import ApplicationLogo from '@/Components/ApplicationLogo';
import SolutionsDialog from '@/Components/SolutionsDialog';
import { getHost } from '@/lib/utils';
import {
    HeartIcon,
    TruckIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';
import { Head, Link } from '@inertiajs/react';
import {
    Briefcase,
    GraduationCap,
    HardHat,
    Landmark,
    Package,
    Plane,
    Rocket,
    ShoppingBag,
    Sprout,
    Stethoscope,
    Truck,
    Users,
    UtensilsCrossed,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface PageProps {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
}

export default function Features({ auth }: PageProps) {
    const hostname = getHost();
    const [isLegalDropdownOpen, setIsLegalDropdownOpen] = useState(false);
    const [isSolutionsDialogOpen, setIsSolutionsDialogOpen] = useState(false);
    const [userCountry, setUserCountry] = useState<string | null>(null);
    const legalDropdownRef = useRef<HTMLDivElement>(null);

    // Country-specific currency configuration
    const countryCurrencyMap: Record<
        string,
        { currency: string; symbol: string }
    > = {
        PH: { currency: 'php', symbol: '₱' },
        // Add more countries as needed:
        // 'US': { currency: 'usd', symbol: '$' },
        // 'GB': { currency: 'gbp', symbol: '£' },
        // 'EU': { currency: 'eur', symbol: '€' },
    };

    // Detect user's country on component mount
    useEffect(() => {
        const detectCountry = async () => {
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                if (data.country_code) {
                    setUserCountry(data.country_code);
                }
            } catch (error) {
                console.log('Could not detect country:', error);
            }
        };
        detectCountry();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                legalDropdownRef.current &&
                !legalDropdownRef.current.contains(event.target as Node)
            ) {
                setIsLegalDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Function to get URL with currency parameters if applicable
    const getUrlWithCurrency = (
        baseUrl: string,
        additionalParams: Record<string, string> = {},
    ): string => {
        const params = new URLSearchParams();

        // Add currency params if applicable
        if (userCountry && countryCurrencyMap[userCountry]) {
            const { currency, symbol } = countryCurrencyMap[userCountry];
            params.append('currency', currency);
            params.append('symbol', symbol);
        }

        // Add any additional params
        Object.entries(additionalParams).forEach(([key, value]) => {
            params.append(key, value);
        });

        const queryString = params.toString();
        return queryString ? `${baseUrl}?${queryString}` : baseUrl;
    };

    // Solutions data
    const solutions = [
        {
            name: 'Community',
            description:
                'Enterprise community management platform for organizations to connect teams, manage events, and streamline communications',
            icon: Users,
            href: '/community',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            comingSoon: false,
        },
        {
            name: 'Medical',
            description:
                'B2B healthcare management system for medical facilities to streamline appointments, patient records, and clinic operations',
            icon: Stethoscope,
            href: '/medical',
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            comingSoon: false,
        },
        {
            name: 'Logistics',
            description:
                'Business logistics platform for companies to manage shipments, optimize delivery routes, and track fleet operations',
            icon: Truck,
            href: '/logistics',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
            comingSoon: false,
        },
        {
            name: 'Shop',
            description:
                'B2B e-commerce platform for businesses to manage wholesale operations, inventory, and corporate purchasing',
            icon: ShoppingBag,
            href: '/shop',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            comingSoon: true,
        },
        {
            name: 'Delivery',
            description:
                'Enterprise delivery management solution for businesses to coordinate food service, catering, and supply chain operations',
            icon: Package,
            href: '/delivery',
            color: 'text-red-600',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            comingSoon: true,
        },
        {
            name: 'Jobs',
            description:
                'Corporate recruitment platform for businesses to manage hiring, employee onboarding, and workforce planning',
            icon: Briefcase,
            href: '/jobs',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
            comingSoon: true,
        },
        {
            name: 'Travel',
            description:
                'Business travel management system for corporate bookings, expense tracking, and employee travel coordination',
            icon: Plane,
            href: '/travel',
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
            comingSoon: true,
        },
        {
            name: 'F&B',
            description:
                'Restaurant and hospitality management platform for food service businesses to handle operations, inventory, and orders',
            icon: UtensilsCrossed,
            href: '/fnb',
            color: 'text-amber-600',
            bgColor: 'bg-amber-50 dark:bg-amber-900/20',
            comingSoon: true,
        },
        {
            name: 'Education',
            description:
                'Educational institution management system for schools and training centers to manage courses, students, and administration',
            icon: GraduationCap,
            href: '/education',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
            comingSoon: true,
        },
        {
            name: 'Finance',
            description:
                'Business financial management platform for enterprises to handle accounting, budgeting, and financial reporting',
            icon: Landmark,
            href: '/finance',
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
            comingSoon: true,
        },
        {
            name: 'Agriculture',
            description:
                'Agribusiness management system for farms and agricultural enterprises to optimize operations, yields, and supply chains',
            icon: Sprout,
            href: '/agriculture',
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            comingSoon: true,
        },
        {
            name: 'Construction',
            description:
                'Construction project management platform for contractors and builders to manage projects, teams, and resources',
            icon: HardHat,
            href: '/construction',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
            comingSoon: true,
        },
    ];

    const legalMenuItems = [
        { name: 'Privacy Policy', href: route('privacy-policy') },
        { name: 'Terms & Conditions', href: route('terms-and-conditions') },
        { name: 'Cookie Policy', href: route('cookie-policy') },
        { name: 'FAQ', href: route('faq') },
    ];

    const projectFeatures = {
        [hostname !== 'Neulify' ? `${hostname} Community` : 'Community']: {
            name:
                hostname !== 'Neulify' ? `${hostname} Community` : 'Community',
            project: 'community',
            icon: UserGroupIcon,
            features: [
                {
                    title: 'Genealogy',
                    description:
                        'Create and manage family trees with an interactive viewer, relationship mapping, and genealogy tracking features.',
                },
                {
                    title: 'Email Integration',
                    description:
                        'Send emails to your customers and clients. Supports multiple email providers and templates. Easy to integrate with your existing apps.',
                },
                {
                    title: 'SMS Integration',
                    description:
                        'Send SMS to your customers and clients. Supports Twilio and Semaphore. Easily integrate with your existing apps.',
                },
                {
                    title: 'Contacts Management',
                    description:
                        'Manage your contacts and address book. Keep track of customer information, leads, and business relationships all in one place.',
                },
                {
                    title: 'Pages',
                    description:
                        'Create and manage pages, including articles, pages, and posts.',
                },
                {
                    title: 'Challenges',
                    description:
                        'Create and manage challenges, including participants, progress, and rewards.',
                },
                {
                    title: 'Content Creator',
                    description:
                        'Create and manage content, including articles, pages, and posts.',
                },
                {
                    title: 'Digital Products',
                    description:
                        'Create and manage digital products, including ebooks, courses, and memberships.',
                },
                {
                    title: 'Healthcare',
                    description:
                        'Manage healthcare services, patient records, and medical appointments.',
                },
            ],
        },
        [hostname !== 'Neulify' ? `${hostname} Logistics` : 'Logistics']: {
            name:
                hostname !== 'Neulify' ? `${hostname} Logistics` : 'Logistics',
            project: 'logistics',
            icon: TruckIcon,
            features: [
                {
                    title: 'Payroll System',
                    description:
                        'Employee payroll system with tax calculation, attendance tracking, and automated salary disbursement.',
                },
                {
                    title: 'Contacts Management',
                    description:
                        'Manage your contacts and address book. Keep track of customer information, leads, and business relationships all in one place.',
                },
                {
                    title: 'Email Integration',
                    description:
                        'Send emails to your customers and clients. Supports multiple email providers and templates. Easy to integrate with your existing apps.',
                },
                {
                    title: 'SMS Integration',
                    description:
                        'Send SMS to your customers and clients. Supports Twilio and Semaphore. Easily integrate with your existing apps.',
                },
                {
                    title: 'Warehousing System',
                    description:
                        'Advanced warehouse management with inventory tracking, order fulfillment, and space optimization tools.',
                },
                {
                    title: 'Transportation System',
                    description:
                        'Fleet management system with route optimization, vehicle maintenance tracking, and driver scheduling.',
                },
            ],
        },
        [hostname !== 'Neulify' ? `${hostname} Medical` : 'Medical']: {
            name: hostname !== 'Neulify' ? `${hostname} Medical` : 'Medical',
            project: 'medical',
            icon: HeartIcon,
            features: [
                {
                    title: 'Clinical Management',
                    description:
                        'Medical practice management with patient records, appointment scheduling, and billing system.',
                },
                {
                    title: 'Payroll System',
                    description:
                        'Employee payroll system with tax calculation, attendance tracking, and automated salary disbursement.',
                },
                {
                    title: 'Contacts Management',
                    description:
                        'Manage your contacts and address book. Keep track of customer information, leads, and business relationships all in one place.',
                },
                {
                    title: 'Email Integration',
                    description:
                        'Send emails to your customers and clients. Supports multiple email providers and templates. Easy to integrate with your existing apps.',
                },
                {
                    title: 'SMS Integration',
                    description:
                        'Send SMS to your customers and clients. Supports Twilio and Semaphore. Easily integrate with your existing apps.',
                },
            ],
        },
        [hostname !== 'Neulify' ? `${hostname} Travel` : 'Travel']: {
            name: hostname !== 'Neulify' ? `${hostname} Travel` : 'Travel',
            project: 'travel',
            icon: TruckIcon,
            features: [
                {
                    title: 'Travel Booking',
                    description:
                        'Complete travel booking system with flight, hotel, and car rental reservations. Real-time availability and pricing.',
                },
                {
                    title: 'Itinerary Management',
                    description:
                        'Create and manage travel itineraries with detailed schedules, bookings, and travel documents.',
                },
                {
                    title: 'Customer Management',
                    description:
                        'Manage travel customers with booking history, preferences, and loyalty programs.',
                },
                {
                    title: 'Email Integration',
                    description:
                        'Send travel confirmations and updates to customers. Supports multiple email providers and templates.',
                },
                {
                    title: 'SMS Integration',
                    description:
                        'Send travel notifications and updates via SMS. Supports Twilio and Semaphore integration.',
                },
                {
                    title: 'Payment Processing',
                    description:
                        'Secure payment processing for travel bookings with multiple payment methods and currency support.',
                },
            ],
        },
        [hostname !== 'Neulify' ? `${hostname} Delivery` : 'Delivery']: {
            name: hostname !== 'Neulify' ? `${hostname} Delivery` : 'Delivery',
            project: 'delivery',
            icon: TruckIcon,
            features: [
                {
                    title: 'Delivery Management',
                    description:
                        'Complete delivery management system with order tracking, route optimization, and delivery scheduling.',
                },
                {
                    title: 'Driver Management',
                    description:
                        'Manage delivery drivers with scheduling, performance tracking, and route assignments.',
                },
                {
                    title: 'Customer Management',
                    description:
                        'Manage delivery customers with order history, preferences, and delivery addresses.',
                },
                {
                    title: 'Email Integration',
                    description:
                        'Send delivery notifications and updates to customers. Supports multiple email providers and templates.',
                },
                {
                    title: 'SMS Integration',
                    description:
                        'Send delivery notifications and tracking updates via SMS. Supports Twilio and Semaphore integration.',
                },
                {
                    title: 'Real-time Tracking',
                    description:
                        'Real-time delivery tracking with GPS location updates and estimated delivery times.',
                },
            ],
        },
        [hostname !== 'Neulify' ? `${hostname} Job Board` : 'Jobs']: {
            name: hostname !== 'Neulify' ? `${hostname} Job Board` : 'Jobs',
            project: 'jobs',
            icon: UserGroupIcon,
            features: [
                {
                    title: 'Job Posting',
                    description:
                        'Create and manage job postings with detailed descriptions, requirements, and application tracking.',
                },
                {
                    title: 'Candidate Management',
                    description:
                        'Manage job candidates with applications, resumes, and interview scheduling.',
                },
                {
                    title: 'Employer Management',
                    description:
                        'Manage employers with company profiles, job postings, and candidate matching.',
                },
                {
                    title: 'Email Integration',
                    description:
                        'Send job notifications and updates to candidates and employers. Supports multiple email providers and templates.',
                },
                {
                    title: 'SMS Integration',
                    description:
                        'Send job alerts and notifications via SMS. Supports Twilio and Semaphore integration.',
                },
                {
                    title: 'Application Tracking',
                    description:
                        'Track job applications with status updates, interview scheduling, and hiring pipeline management.',
                },
            ],
        },
        [hostname !== 'Neulify' ? `${hostname} Marketplace` : 'Shop']: {
            name: hostname !== 'Neulify' ? `${hostname} Marketplace` : 'Shop',
            project: 'shop',
            icon: TruckIcon,
            features: [
                {
                    title: 'Product Management',
                    description:
                        'Complete product management system with inventory tracking, pricing, and product variations.',
                },
                {
                    title: 'Order Management',
                    description:
                        'Manage orders with processing, fulfillment, and shipping tracking. Complete order lifecycle management.',
                },
                {
                    title: 'Customer Management',
                    description:
                        'Manage shop customers with purchase history, preferences, and loyalty programs.',
                },
                {
                    title: 'Email Integration',
                    description:
                        'Send order confirmations and updates to customers. Supports multiple email providers and templates.',
                },
                {
                    title: 'SMS Integration',
                    description:
                        'Send order notifications and updates via SMS. Supports Twilio and Semaphore integration.',
                },
                {
                    title: 'Payment Processing',
                    description:
                        'Secure payment processing for online orders with multiple payment methods and currency support.',
                },
            ],
        },
        [hostname !== 'Neulify' ? `${hostname} F&B` : 'F&B']: {
            name: hostname !== 'Neulify' ? `${hostname} F&B` : 'F&B',
            project: 'fnb',
            icon: TruckIcon,
            features: [
                {
                    title: 'Restaurant Management',
                    description:
                        'Complete restaurant management system with table reservations, menu management, and order tracking.',
                },
                {
                    title: 'Point of Sale',
                    description:
                        'Modern POS system with order processing, payment integration, and kitchen display system.',
                },
                {
                    title: 'Inventory Management',
                    description:
                        'Track ingredients, manage stock levels, and automate reordering for optimal inventory control.',
                },
                {
                    title: 'Kitchen Management',
                    description:
                        'Kitchen display system with order tracking, preparation times, and staff coordination.',
                },
                {
                    title: 'Customer Management',
                    description:
                        'Manage customer preferences, order history, and loyalty programs for repeat business.',
                },
                {
                    title: 'Delivery Integration',
                    description:
                        'Integrate with delivery services and manage online orders with real-time tracking.',
                },
            ],
        },
        [hostname !== 'Neulify' ? `${hostname} Education` : 'Education']: {
            name:
                hostname !== 'Neulify' ? `${hostname} Education` : 'Education',
            project: 'education',
            icon: UserGroupIcon,
            features: [
                {
                    title: 'Student Management',
                    description:
                        'Comprehensive student information system with enrollment, grades, and attendance tracking.',
                },
                {
                    title: 'Course Management',
                    description:
                        'Create and manage courses, curriculum, syllabi, and learning materials for students.',
                },
                {
                    title: 'Online Learning',
                    description:
                        'Virtual classroom with video conferencing, assignments, and interactive learning tools.',
                },
                {
                    title: 'Grading System',
                    description:
                        'Automated grading system with gradebook, report cards, and academic performance tracking.',
                },
                {
                    title: 'Parent Portal',
                    description:
                        'Parent communication portal with student progress, attendance, and school announcements.',
                },
                {
                    title: 'Staff Management',
                    description:
                        'Manage teachers, staff schedules, payroll, and professional development tracking.',
                },
            ],
        },
        [hostname !== 'Neulify' ? `${hostname} Finance` : 'Finance']: {
            name: hostname !== 'Neulify' ? `${hostname} Finance` : 'Finance',
            project: 'finance',
            icon: TruckIcon,
            features: [
                {
                    title: 'Lending Management',
                    description:
                        'Complete loan management system with applications, approvals, and repayment tracking.',
                },
                {
                    title: 'Accounting System',
                    description:
                        'Double-entry accounting with general ledger, accounts payable/receivable, and financial reports.',
                },
                {
                    title: 'Investment Tracking',
                    description:
                        'Track investments, portfolios, and returns with real-time market data integration.',
                },
                {
                    title: 'Payment Processing',
                    description:
                        'Secure payment processing with multiple payment methods and automated reconciliation.',
                },
                {
                    title: 'Financial Reporting',
                    description:
                        'Generate financial statements, balance sheets, income statements, and cash flow reports.',
                },
                {
                    title: 'Client Management',
                    description:
                        'Manage client accounts, financial profiles, and transaction history securely.',
                },
            ],
        },
        [hostname !== 'Neulify' ? `${hostname} Agriculture` : 'Agriculture']: {
            name:
                hostname !== 'Neulify'
                    ? `${hostname} Agriculture`
                    : 'Agriculture',
            project: 'agriculture',
            icon: TruckIcon,
            features: [
                {
                    title: 'Farm Management',
                    description:
                        'Comprehensive farm management with crop planning, field mapping, and resource allocation.',
                },
                {
                    title: 'Crop Monitoring',
                    description:
                        'Monitor crop health, growth stages, and yield predictions with data analytics.',
                },
                {
                    title: 'Inventory Management',
                    description:
                        'Track seeds, fertilizers, equipment, and harvest inventory with automated alerts.',
                },
                {
                    title: 'Weather Integration',
                    description:
                        'Real-time weather data integration for planning irrigation, planting, and harvesting.',
                },
                {
                    title: 'Financial Tracking',
                    description:
                        'Track expenses, income, and profitability by crop, field, or season.',
                },
                {
                    title: 'Supply Chain',
                    description:
                        'Manage distribution, sales channels, and buyer relationships for agricultural products.',
                },
            ],
        },
        [hostname !== 'Neulify' ? `${hostname} Construction` : 'Construction']:
            {
                name:
                    hostname !== 'Neulify'
                        ? `${hostname} Construction`
                        : 'Construction',
                project: 'construction',
                icon: TruckIcon,
                features: [
                    {
                        title: 'Project Management',
                        description:
                            'Comprehensive project management with timelines, milestones, and resource allocation.',
                    },
                    {
                        title: 'Bid Management',
                        description:
                            'Create and manage bids, proposals, and quotations for construction projects.',
                    },
                    {
                        title: 'Subcontractor Management',
                        description:
                            'Manage subcontractors, contracts, work orders, and payment tracking.',
                    },
                    {
                        title: 'Equipment Tracking',
                        description:
                            'Track equipment, maintenance schedules, and utilization across job sites.',
                    },
                    {
                        title: 'Document Management',
                        description:
                            'Store and manage blueprints, permits, contracts, and project documentation.',
                    },
                    {
                        title: 'Financial Tracking',
                        description:
                            'Track project costs, budgets, expenses, and profitability in real-time.',
                    },
                ],
            },
    };

    return (
        <>
            <Head title={`Features - ${hostname}`} />
            <div className="relative min-h-screen overflow-hidden">
                {/* Centralized Background */}
                <div className="pointer-events-none fixed inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#F9FAFB] via-white to-transparent dark:from-gray-900 dark:to-gray-950"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#14B8A6]/20 via-transparent to-transparent dark:from-[#14B8A6]/10"></div>
                </div>
                {/* Navigation */}
                <nav className="fixed left-0 right-0 top-0 z-50 border-b border-[#E2E8F0]/50 bg-white/95 shadow-sm backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-900/95">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex items-center">
                                <Link href="/" className="flex items-center">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-100" />
                                    <span className="ml-2 bg-gradient-to-r from-[#1E3A8A] to-[#14B8A6] bg-clip-text text-xl font-bold text-transparent dark:text-gray-100">
                                        {hostname === 'sakto'
                                            ? 'Sakto Solutions'
                                            : hostname}
                                    </span>
                                </Link>
                            </div>
                            <div className="flex items-center">
                                {/* Our Solutions Button */}
                                <button
                                    onClick={() =>
                                        setIsSolutionsDialogOpen(true)
                                    }
                                    className="rounded-md px-3 py-2 text-sm font-medium text-[#334155] transition-colors duration-200 hover:text-[#14B8A6] dark:text-gray-200 dark:hover:text-white"
                                >
                                    Our Solutions
                                </button>
                                {hostname === 'neulify' && (
                                    <Link
                                        href={route('neulify')}
                                        className="rounded-md px-3 py-2 text-sm font-medium text-[#334155] transition-colors duration-200 hover:text-[#14B8A6] dark:text-gray-200 dark:hover:text-white"
                                    >
                                        Our Company
                                    </Link>
                                )}
                                <Link
                                    href={route('features')}
                                    className="rounded-md bg-[#14B8A6]/10 px-3 py-2 text-sm font-medium text-[#14B8A6] transition-colors duration-200 dark:bg-[#14B8A6]/20 dark:text-[#14B8A6]"
                                >
                                    Features
                                </Link>
                                <Link
                                    href={route('pricing')}
                                    className="rounded-md px-3 py-2 text-sm font-medium text-[#334155] transition-colors duration-200 hover:text-[#14B8A6] dark:text-gray-200 dark:hover:text-white"
                                >
                                    Pricing
                                </Link>
                                <div className="mx-2 h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
                                {/* Legal Dropdown */}
                                <div
                                    className="relative"
                                    ref={legalDropdownRef}
                                >
                                    <button
                                        onClick={() =>
                                            setIsLegalDropdownOpen(
                                                !isLegalDropdownOpen,
                                            )
                                        }
                                        className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-[#334155] transition-colors duration-200 hover:text-[#14B8A6] dark:text-gray-200 dark:hover:text-white"
                                    >
                                        Legal
                                        <svg
                                            className={`ml-1 h-4 w-4 transition-transform duration-200 ${isLegalDropdownOpen ? 'rotate-180' : ''}`}
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </button>
                                    {isLegalDropdownOpen && (
                                        <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                            {legalMenuItems.map((item) => (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    className="block px-4 py-2 text-sm text-[#334155] transition-colors duration-200 hover:bg-[#14B8A6]/10 hover:text-[#14B8A6] dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white"
                                                    onClick={() =>
                                                        setIsLegalDropdownOpen(
                                                            false,
                                                        )
                                                    }
                                                >
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Features Section */}
                <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="bg-gradient-to-r from-[#1E3A8A] via-[#334155] to-[#1E3A8A] bg-clip-text text-4xl font-extrabold tracking-tight text-transparent dark:text-white sm:text-5xl">
                            Powerful Features for Every Industry
                        </h1>
                        <p className="mx-auto mt-6 max-w-3xl text-xl text-gray-600 dark:text-gray-300">
                            Each solution comes with industry-specific features
                            designed to meet your unique needs. Select a
                            solution below to explore its complete feature set.
                        </p>
                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={() => setIsSolutionsDialogOpen(true)}
                                className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#14B8A6] px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#14B8A6]/50"
                            >
                                <Rocket className="h-6 w-6 transition-transform duration-300 group-hover:translate-y-[-4px]" />
                                <span>Explore Solution Features</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="relative z-10 border-t border-gray-100 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/90">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                © {new Date().getFullYear()} {hostname}. All
                                rights reserved.
                            </p>
                            <div className="flex items-center space-x-6">
                                <Link
                                    href={route('privacy-policy')}
                                    className="text-sm text-[#334155] transition-colors duration-200 hover:text-[#14B8A6] dark:text-gray-400 dark:hover:text-indigo-400"
                                >
                                    Privacy Policy
                                </Link>
                                <Link
                                    href={route('terms-and-conditions')}
                                    className="text-sm text-[#334155] transition-colors duration-200 hover:text-[#14B8A6] dark:text-gray-400 dark:hover:text-indigo-400"
                                >
                                    Terms
                                </Link>
                                <Link
                                    href={route('cookie-policy')}
                                    className="text-sm text-[#334155] transition-colors duration-200 hover:text-[#14B8A6] dark:text-gray-400 dark:hover:text-indigo-400"
                                >
                                    Cookies
                                </Link>
                                <Link
                                    href={route('faq')}
                                    className="text-sm text-[#334155] transition-colors duration-200 hover:text-[#14B8A6] dark:text-gray-400 dark:hover:text-indigo-400"
                                >
                                    FAQ
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            {/* Solutions Dialog */}
            <SolutionsDialog
                isOpen={isSolutionsDialogOpen}
                onOpenChange={setIsSolutionsDialogOpen}
                solutions={solutions}
                getUrlWithCurrency={getUrlWithCurrency}
            />
        </>
    );
}
