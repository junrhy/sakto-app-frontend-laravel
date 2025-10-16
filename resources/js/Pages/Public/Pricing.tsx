import ApplicationLogo from '@/Components/ApplicationLogo';
import SolutionsDialog from '@/Components/SolutionsDialog';
import { getPricingForService } from '@/config/pricing';
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
import { useEffect, useMemo, useRef, useState } from 'react';

interface PageProps {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
}

export default function Pricing({ auth }: PageProps) {
    const hostname = getHost();
    const [isLegalDropdownOpen, setIsLegalDropdownOpen] = useState(false);
    const [isSolutionsDialogOpen, setIsSolutionsDialogOpen] = useState(false);
    const [userCountry, setUserCountry] = useState<string | null>(null);
    const legalDropdownRef = useRef<HTMLDivElement>(null);

    // Get currency and symbol from URL params, default to USD and $
    const urlParams = useMemo(
        () => new URLSearchParams(window.location.search),
        [],
    );
    const urlCurrency = urlParams.get('currency') || 'usd';
    const urlSymbol = urlParams.get('symbol') || '$';

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
            description: 'Business travel management system for corporate bookings, expense tracking, and employee travel coordination',
            icon: Plane,
            href: '/travel',
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
            comingSoon: true,
        },
        {
            name: 'F&B',
            description: 'Restaurant and hospitality management platform for food service businesses to handle operations, inventory, and orders',
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

    // Use pricing config to get dynamic pricing based on URL currency
    const communityPricing = getPricingForService(
        'community',
        urlCurrency,
        urlSymbol,
    );
    const logisticsPricing = getPricingForService(
        'logistics',
        urlCurrency,
        urlSymbol,
    );
    const medicalPricing = getPricingForService(
        'medical',
        urlCurrency,
        urlSymbol,
    );
    const travelPricing = getPricingForService(
        'travel',
        urlCurrency,
        urlSymbol,
    );
    const deliveryPricing = getPricingForService(
        'delivery',
        urlCurrency,
        urlSymbol,
    );
    const jobsPricing = getPricingForService('jobs', urlCurrency, urlSymbol);
    const shopPricing = getPricingForService('shop', urlCurrency, urlSymbol);
    const fnbPricing = getPricingForService('fnb', urlCurrency, urlSymbol);
    const educationPricing = getPricingForService(
        'education',
        urlCurrency,
        urlSymbol,
    );
    const financePricing = getPricingForService(
        'finance',
        urlCurrency,
        urlSymbol,
    );
    const agriculturePricing = getPricingForService(
        'agriculture',
        urlCurrency,
        urlSymbol,
    );
    const constructionPricing = getPricingForService(
        'construction',
        urlCurrency,
        urlSymbol,
    );

    const projectPlans = {
        [hostname !== 'Neulify' ? `${hostname} Community` : 'Community']: {
            name:
                hostname !== 'Neulify' ? `${hostname} Community` : 'Community',
            icon: UserGroupIcon,
            plans:
                communityPricing?.plans.map((plan) => ({
                    name: plan.name,
                    price: plan.price,
                    project: 'community',
                    description: plan.description,
                    features: plan.features,
                })) || [],
        },
        [hostname !== 'Neulify' ? `${hostname} Logistics` : 'Logistics']: {
            name:
                hostname !== 'Neulify' ? `${hostname} Logistics` : 'Logistics',
            icon: TruckIcon,
            plans:
                logisticsPricing?.plans.map((plan) => ({
                    name: plan.name,
                    price: plan.price,
                    project: 'logistics',
                    description: plan.description,
                    features: plan.features,
                })) || [],
        },
        [hostname !== 'Neulify' ? `${hostname} Medical` : 'Medical']: {
            name: hostname !== 'Neulify' ? `${hostname} Medical` : 'Medical',
            icon: HeartIcon,
            plans:
                medicalPricing?.plans.map((plan) => ({
                    name: plan.name,
                    price: plan.price,
                    project: 'medical',
                    description: plan.description,
                    features: plan.features,
                })) || [],
        },
        [hostname !== 'Neulify' ? `${hostname} Travel` : 'Travel']: {
            name: hostname !== 'Neulify' ? `${hostname} Travel` : 'Travel',
            icon: TruckIcon,
            plans:
                travelPricing?.plans.map((plan) => ({
                    name: plan.name,
                    price: plan.price,
                    project: 'travel',
                    description: plan.description,
                    features: plan.features,
                })) || [],
        },
        [hostname !== 'Neulify' ? `${hostname} Delivery` : 'Delivery']: {
            name: hostname !== 'Neulify' ? `${hostname} Delivery` : 'Delivery',
            icon: TruckIcon,
            plans:
                deliveryPricing?.plans.map((plan) => ({
                    name: plan.name,
                    price: plan.price,
                    project: 'delivery',
                    description: plan.description,
                    features: plan.features,
                })) || [],
        },
        [hostname !== 'Neulify' ? `${hostname} Job Board` : 'Jobs']: {
            name: hostname !== 'Neulify' ? `${hostname} Job Board` : 'Jobs',
            icon: UserGroupIcon,
            plans:
                jobsPricing?.plans.map((plan) => ({
                    name: plan.name,
                    price: plan.price,
                    project: 'jobs',
                    description: plan.description,
                    features: plan.features,
                })) || [],
        },
        [hostname !== 'Neulify' ? `${hostname} Marketplace` : 'Shop']: {
            name: hostname !== 'Neulify' ? `${hostname} Marketplace` : 'Shop',
            icon: TruckIcon,
            plans:
                shopPricing?.plans.map((plan) => ({
                    name: plan.name,
                    price: plan.price,
                    project: 'shop',
                    description: plan.description,
                    features: plan.features,
                })) || [],
        },
        [hostname !== 'Neulify' ? `${hostname} F&B` : 'F&B']: {
            name: hostname !== 'Neulify' ? `${hostname} F&B` : 'F&B',
            icon: TruckIcon,
            plans:
                fnbPricing?.plans.map((plan) => ({
                    name: plan.name,
                    price: plan.price,
                    project: 'fnb',
                    description: plan.description,
                    features: plan.features,
                })) || [],
        },
        [hostname !== 'Neulify' ? `${hostname} Education` : 'Education']: {
            name:
                hostname !== 'Neulify' ? `${hostname} Education` : 'Education',
            icon: UserGroupIcon,
            plans:
                educationPricing?.plans.map((plan) => ({
                    name: plan.name,
                    price: plan.price,
                    project: 'education',
                    description: plan.description,
                    features: plan.features,
                })) || [],
        },
        [hostname !== 'Neulify' ? `${hostname} Finance` : 'Finance']: {
            name: hostname !== 'Neulify' ? `${hostname} Finance` : 'Finance',
            icon: TruckIcon,
            plans:
                financePricing?.plans.map((plan) => ({
                    name: plan.name,
                    price: plan.price,
                    project: 'finance',
                    description: plan.description,
                    features: plan.features,
                })) || [],
        },
        [hostname !== 'Neulify' ? `${hostname} Agriculture` : 'Agriculture']: {
            name:
                hostname !== 'Neulify'
                    ? `${hostname} Agriculture`
                    : 'Agriculture',
            icon: TruckIcon,
            plans:
                agriculturePricing?.plans.map((plan) => ({
                    name: plan.name,
                    price: plan.price,
                    project: 'agriculture',
                    description: plan.description,
                    features: plan.features,
                })) || [],
        },
        [hostname !== 'Neulify' ? `${hostname} Construction` : 'Construction']:
            {
                name:
                    hostname !== 'Neulify'
                        ? `${hostname} Construction`
                        : 'Construction',
                icon: TruckIcon,
                plans:
                    constructionPricing?.plans.map((plan) => ({
                        name: plan.name,
                        price: plan.price,
                        project: 'construction',
                        description: plan.description,
                        features: plan.features,
                    })) || [],
            },
    };

    return (
        <>
            <Head title={`Pricing - ${hostname}`} />
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
                                        {hostname}
                                    </span>
                                </Link>
                            </div>
                            <div className="flex items-center">
                                {/* Our Solutions Button */}
                                <button
                                    onClick={() => setIsSolutionsDialogOpen(true)}
                                    className="rounded-md px-3 py-2 text-sm font-medium text-[#334155] transition-colors duration-200 hover:text-[#14B8A6] dark:text-gray-200 dark:hover:text-white"
                                >
                                    Our Solutions
                                </button>
                                {hostname === 'Neulify' && (
                                    <Link
                                        href={route('neulify')}
                                        className="rounded-md px-3 py-2 text-sm font-medium text-[#334155] transition-colors duration-200 hover:text-[#14B8A6] dark:text-gray-200 dark:hover:text-white"
                                    >
                                        Our Company
                                    </Link>
                                )}
                                <Link
                                    href={route('features')}
                                    className="rounded-md px-3 py-2 text-sm font-medium text-[#334155] transition-colors duration-200 hover:text-[#14B8A6] dark:text-gray-200 dark:hover:text-white"
                                >
                                    Features
                                </Link>
                                <Link
                                    href={route('pricing')}
                                    className="rounded-md bg-[#14B8A6]/10 px-3 py-2 text-sm font-medium text-[#14B8A6] transition-colors duration-200 dark:bg-[#14B8A6]/20 dark:text-[#14B8A6]"
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

                {/* Pricing Section */}
                <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="bg-gradient-to-r from-[#1E3A8A] via-[#334155] to-[#1E3A8A] bg-clip-text text-4xl font-extrabold tracking-tight text-transparent dark:text-white sm:text-5xl">
                            Transparent Pricing for Every Solution
                        </h1>
                        <p className="mx-auto mt-6 max-w-3xl text-xl text-gray-600 dark:text-gray-300">
                            Pricing details are available on each solution's dedicated page. Select a solution below to view its specific plans and features.
                        </p>
                        <div className="mx-auto mt-8 max-w-2xl rounded-lg border border-[#14B8A6]/20 bg-[#14B8A6]/5 px-6 py-4 dark:border-[#14B8A6]/30 dark:bg-[#14B8A6]/10">
                            <p className="text-center text-base font-medium text-gray-700 dark:text-gray-200">
                                ✅ Access is granted instantly after purchase — no manual setup required.
                            </p>
                        </div>
                        <div className="mt-12 flex justify-center">
                            <button
                                onClick={() => setIsSolutionsDialogOpen(true)}
                                className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#14B8A6] px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#14B8A6]/50"
                            >
                                <Rocket className="h-6 w-6 transition-transform duration-300 group-hover:translate-y-[-4px]" />
                                <span>View Solution Pricing</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
                    <div className="mt-24">
                        <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                            Frequently Asked Questions
                        </h2>
                        <div className="mx-auto mt-12 max-w-3xl">
                            <dl className="space-y-6">
                                <div>
                                    <dt className="text-lg font-medium text-gray-900 dark:text-white">
                                        Can I change plans later?
                                    </dt>
                                    <dd className="mt-2 text-gray-600 dark:text-gray-300">
                                        Yes, you can upgrade or downgrade your
                                        plan at any time. Changes will be
                                        reflected in your next billing cycle.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-lg font-medium text-gray-900 dark:text-white">
                                        What payment methods do you accept?
                                    </dt>
                                    <dd className="mt-2 text-gray-600 dark:text-gray-300">
                                        We accept Visa, Mastercard, JCB, or AMEX
                                        credit or debit card. You can also use
                                        e-Wallets such as Maya, GCash, WeChat
                                        Pay, ShopeePay, and more via QR Ph.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-lg font-medium text-gray-900 dark:text-white">
                                        Do you offer refunds?
                                    </dt>
                                    <dd className="mt-2 text-gray-600 dark:text-gray-300">
                                        Yes, we offer a 30-day money-back
                                        guarantee for all paid plans.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-lg font-medium text-gray-900 dark:text-white">
                                        What kind of support do you provide?
                                    </dt>
                                    <dd className="mt-2 text-gray-600 dark:text-gray-300">
                                        All support is provided via our online helpdesk and email channels. All plans include email support. Pro and
                                        Business plans include priority support
                                        with faster response times.
                                    </dd>
                                </div>
                            </dl>
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
