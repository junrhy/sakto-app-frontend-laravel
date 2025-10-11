import ApplicationLogo from '@/Components/ApplicationLogo';
import { getHost } from '@/lib/utils';
import {
    HeartIcon,
    TruckIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState, useMemo } from 'react';
import { getPricingForService } from '@/config/pricing';

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
    const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
    const [isLegalDropdownOpen, setIsLegalDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(
        hostname !== 'Neulify' ? `${hostname} Community` : 'Community',
    );
    const [userCountry, setUserCountry] = useState<string | null>(null);
    const productsDropdownRef = useRef<HTMLDivElement>(null);
    const legalDropdownRef = useRef<HTMLDivElement>(null);

    // Get currency and symbol from URL params, default to USD and $
    const urlParams = useMemo(() => new URLSearchParams(window.location.search), []);
    const urlCurrency = urlParams.get('currency') || 'usd';
    const urlSymbol = urlParams.get('symbol') || '$';

    // Country-specific currency configuration
    const countryCurrencyMap: Record<string, { currency: string; symbol: string }> = {
        'PH': { currency: 'php', symbol: '₱' },
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
                productsDropdownRef.current &&
                !productsDropdownRef.current.contains(event.target as Node)
            ) {
                setIsProductsDropdownOpen(false);
            }
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
    const getUrlWithCurrency = (baseUrl: string, additionalParams: Record<string, string> = {}): string => {
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

    const productsMenuItems =
        hostname !== 'Neulify'
            ? [
                  { name: `${hostname} Community`, href: '/community' },
                  { name: `${hostname} Logistics`, href: '/logistics' },
                  { name: `${hostname} Medical`, href: '/medical' },
                  { name: `${hostname} Travel`, href: '/travel' },
                  { name: `${hostname} Delivery`, href: '/delivery' },
                  { name: `${hostname} Job Board`, href: '/jobs' },
                  { name: `${hostname} Marketplace`, href: '/shop' },
                  { name: `${hostname} F&B`, href: '/fnb' },
                  { name: `${hostname} Education`, href: '/education' },
                  { name: `${hostname} Finance`, href: '/finance' },
                  { name: `${hostname} Agriculture`, href: '/agriculture' },
                  { name: `${hostname} Construction`, href: '/construction' },
              ]
            : [
                  { name: 'Community', href: '/community' },
                  { name: 'Logistics', href: '/logistics' },
                  { name: 'Medical', href: '/medical' },
                  { name: 'Travel', href: '/travel' },
                  { name: 'Delivery', href: '/delivery' },
                  { name: 'Jobs', href: '/jobs' },
                  { name: 'Shop', href: '/shop' },
                  { name: 'F&B', href: '/fnb' },
                  { name: 'Education', href: '/education' },
                  { name: 'Finance', href: '/finance' },
                  { name: 'Agriculture', href: '/agriculture' },
                  { name: 'Construction', href: '/construction' },
              ];

    const legalMenuItems = [
        { name: 'Privacy Policy', href: route('privacy-policy') },
        { name: 'Terms & Conditions', href: route('terms-and-conditions') },
        { name: 'Cookie Policy', href: route('cookie-policy') },
        { name: 'FAQ', href: route('faq') },
    ];

    // Use pricing config to get dynamic pricing based on URL currency
    const communityPricing = getPricingForService('community', urlCurrency, urlSymbol);
    const logisticsPricing = getPricingForService('logistics', urlCurrency, urlSymbol);
    const medicalPricing = getPricingForService('medical', urlCurrency, urlSymbol);
    const travelPricing = getPricingForService('travel', urlCurrency, urlSymbol);
    const deliveryPricing = getPricingForService('delivery', urlCurrency, urlSymbol);
    const jobsPricing = getPricingForService('jobs', urlCurrency, urlSymbol);
    const shopPricing = getPricingForService('shop', urlCurrency, urlSymbol);
    const fnbPricing = getPricingForService('fnb', urlCurrency, urlSymbol);
    const educationPricing = getPricingForService('education', urlCurrency, urlSymbol);
    const financePricing = getPricingForService('finance', urlCurrency, urlSymbol);
    const agriculturePricing = getPricingForService('agriculture', urlCurrency, urlSymbol);
    const constructionPricing = getPricingForService('construction', urlCurrency, urlSymbol);

    const projectPlans = {
        [hostname !== 'Neulify' ? `${hostname} Community` : 'Community']: {
            name: hostname !== 'Neulify' ? `${hostname} Community` : 'Community',
            icon: UserGroupIcon,
            plans: communityPricing?.plans.map(plan => ({
                name: plan.name,
                price: plan.price,
                project: 'community',
                description: plan.description,
                features: plan.features,
            })) || [],
        },
        [hostname !== 'Neulify' ? `${hostname} Logistics` : 'Logistics']: {
            name: hostname !== 'Neulify' ? `${hostname} Logistics` : 'Logistics',
            icon: TruckIcon,
            plans: logisticsPricing?.plans.map(plan => ({
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
            plans: medicalPricing?.plans.map(plan => ({
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
            plans: travelPricing?.plans.map(plan => ({
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
            plans: deliveryPricing?.plans.map(plan => ({
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
            plans: jobsPricing?.plans.map(plan => ({
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
            plans: shopPricing?.plans.map(plan => ({
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
            plans: fnbPricing?.plans.map(plan => ({
                name: plan.name,
                price: plan.price,
                project: 'fnb',
                description: plan.description,
                features: plan.features,
            })) || [],
        },
        [hostname !== 'Neulify' ? `${hostname} Education` : 'Education']: {
            name: hostname !== 'Neulify' ? `${hostname} Education` : 'Education',
            icon: UserGroupIcon,
            plans: educationPricing?.plans.map(plan => ({
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
            plans: financePricing?.plans.map(plan => ({
                name: plan.name,
                price: plan.price,
                project: 'finance',
                description: plan.description,
                features: plan.features,
            })) || [],
        },
        [hostname !== 'Neulify' ? `${hostname} Agriculture` : 'Agriculture']: {
            name: hostname !== 'Neulify' ? `${hostname} Agriculture` : 'Agriculture',
            icon: TruckIcon,
            plans: agriculturePricing?.plans.map(plan => ({
                name: plan.name,
                price: plan.price,
                project: 'agriculture',
                description: plan.description,
                features: plan.features,
            })) || [],
        },
        [hostname !== 'Neulify' ? `${hostname} Construction` : 'Construction']: {
            name: hostname !== 'Neulify' ? `${hostname} Construction` : 'Construction',
            icon: TruckIcon,
            plans: constructionPricing?.plans.map(plan => ({
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
                                {/* Solutions Dropdown */}
                                <div
                                    className="relative"
                                    ref={productsDropdownRef}
                                >
                                    <button
                                        onClick={() =>
                                            setIsProductsDropdownOpen(
                                                !isProductsDropdownOpen,
                                            )
                                        }
                                        className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-[#334155] transition-colors duration-200 hover:text-[#14B8A6] dark:text-gray-200 dark:hover:text-white"
                                    >
                                        Our Solutions
                                        <svg
                                            className={`ml-1 h-4 w-4 transition-transform duration-200 ${isProductsDropdownOpen ? 'rotate-180' : ''}`}
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
                                    {isProductsDropdownOpen && (
                                        <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-gray-200 bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                            {productsMenuItems.map((item) => (
                                                <Link
                                                    key={item.name}
                                                    href={getUrlWithCurrency(item.href)}
                                                    className="block px-4 py-2 text-sm text-[#334155] transition-colors duration-200 hover:bg-[#14B8A6]/10 hover:text-[#14B8A6] dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white"
                                                    onClick={() =>
                                                        setIsProductsDropdownOpen(
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
                            Project-Specific Pricing
                        </h1>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                            Choose the perfect plan for your specific needs
                        </p>
                    </div>

                    {/* Solution Selector */}
                    <div className="mt-12 flex justify-center">
                        <div className="w-full max-w-md">
                            <label htmlFor="solution-select" className="mb-2 block text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                Select a Solution
                            </label>
                            <select
                                id="solution-select"
                                value={activeTab}
                                onChange={(e) => setActiveTab(e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base font-medium text-gray-900 shadow-sm transition-colors focus:border-[#14B8A6] focus:outline-none focus:ring-2 focus:ring-[#14B8A6] dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-[#14B8A6]"
                            >
                                {Object.entries(projectPlans).map(([key, project]) => (
                                    <option key={key} value={key}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="mt-12">
                        {Object.entries(projectPlans).map(([key, project]) => (
                            <div
                                key={key}
                                className={
                                    activeTab === key ? 'block' : 'hidden'
                                }
                            >
                                <div className="mb-6 flex items-center gap-3">
                                    <project.icon className="h-7 w-7 text-[#14B8A6] dark:text-[#14B8A6]" />
                                    <h2 className="bg-gradient-to-r from-[#14B8A6] to-[#06B6D4] bg-clip-text text-2xl font-bold text-transparent dark:from-[#14B8A6] dark:to-[#06B6D4]">
                                        {project.name}
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                    {project.plans.map((plan) => (
                                        <div
                                            key={plan.name}
                                            className={`group relative h-full ${plan.name === 'Pro' || plan.name === 'Enterprise' ? 'lg:-mt-4 lg:mb-4' : ''}`}
                                        >
                                            <div
                                                className={`absolute -inset-0.5 rounded-lg bg-gradient-to-r from-[#14B8A6] to-[#06B6D4] ${plan.name === 'Pro' || plan.name === 'Enterprise' ? 'opacity-20 dark:opacity-30' : 'opacity-0 group-hover:opacity-10 dark:group-hover:opacity-30'} transition duration-200`}
                                            ></div>
                                            <div
                                                className={`relative flex h-full flex-col rounded-lg bg-white p-6 shadow-sm transition duration-200 hover:shadow-lg hover:shadow-indigo-500/10 dark:bg-gray-800 ${plan.name === 'Pro' || plan.name === 'Enterprise' ? 'border-2 border-[#14B8A6] dark:border-indigo-400' : ''}`}
                                            >
                                                {(plan.name === 'Pro' ||
                                                    plan.name ===
                                                        'Enterprise') && (
                                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                                                        <span className="inline-flex items-center rounded-full bg-[#14B8A6]/10 px-3 py-1 text-xs font-medium text-[#0D9488] dark:bg-indigo-900/50 dark:text-[#99F6E4]">
                                                            {plan.name === 'Pro'
                                                                ? 'Most Popular'
                                                                : 'Premium'}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                        {plan.name}
                                                    </h3>
                                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                                                        {plan.description}
                                                    </p>
                                                    <p className="mt-4">
                                                        <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                                                            {urlSymbol}{plan.price}
                                                        </span>
                                                        <span className="text-sm text-gray-600 dark:text-gray-300">
                                                            /month
                                                        </span>
                                                    </p>
                                                    {!auth.user && (
                                                        <Link
                                                            href={getUrlWithCurrency(`/${plan.project}`, { plan: plan.name.toLowerCase() })}
                                                            className="mt-4 block w-full rounded-md border border-transparent bg-gradient-to-r from-[#14B8A6] to-[#0D9488] px-4 py-2 text-center text-sm font-medium text-white shadow transition-all duration-200 hover:from-[#0D9488] hover:to-[#14B8A6] hover:shadow-lg hover:shadow-[#14B8A6]/25 dark:bg-[#14B8A6] dark:hover:bg-[#0D9488]"
                                                        >
                                                            Choose Plan
                                                        </Link>
                                                    )}
                                                </div>
                                                <div className="mt-4 flex-grow">
                                                    <ul className="space-y-2">
                                                        {plan.features.map(
                                                            (feature) => (
                                                                <li
                                                                    key={
                                                                        feature
                                                                    }
                                                                    className="flex items-center text-sm"
                                                                >
                                                                    <svg
                                                                        className="h-4 w-4 flex-shrink-0 text-[#14B8A6]"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        viewBox="0 0 20 20"
                                                                        fill="currentColor"
                                                                    >
                                                                        <path
                                                                            fillRule="evenodd"
                                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                            clipRule="evenodd"
                                                                        />
                                                                    </svg>
                                                                    <span className="ml-2 text-gray-600 dark:text-gray-300">
                                                                        {
                                                                            feature
                                                                        }
                                                                    </span>
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* FAQ Section */}
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
                                        All plans include email support. Pro and
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
        </>
    );
}
