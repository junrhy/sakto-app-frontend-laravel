import { getPricingForService } from '@/config/pricing';
import { getHost } from '@/lib/utils';
import {
    faChartLine,
    faCheckCircle,
    faCoffee,
    faUtensils,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';

interface PageProps {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
}

export default function FnbIndex({ auth }: PageProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const hostname = getHost();

    // Get currency and symbol from URL params, default to USD and $
    const urlParams = useMemo(
        () => new URLSearchParams(window.location.search),
        [],
    );
    const currency = urlParams.get('currency') || 'usd';
    const symbol = urlParams.get('symbol') || '$';

    const pricing = getPricingForService('fnb', currency, symbol);
    const basicPlan = pricing?.plans.find((plan) => plan.id === 'basic');
    const proPlan = pricing?.plans.find((plan) => plan.id === 'pro');
    const businessPlan = pricing?.plans.find((plan) => plan.id === 'business');

    return (
        <>
            <Head title={`${hostname} F&B - Restaurant Management System`} />
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-orange-50 to-red-50">
                {/* Header */}
                <div className="border-b border-red-700 bg-gradient-to-r from-red-700 to-orange-700 shadow-lg">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        <div className="relative flex items-center justify-center lg:justify-between">
                            {/* Mobile menu button */}
                            <div className="absolute left-0 lg:hidden">
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center rounded-md p-2 text-white transition-colors duration-200 hover:bg-red-600 hover:text-red-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                    aria-controls="mobile-menu"
                                    aria-expanded={isMobileMenuOpen}
                                    onClick={() =>
                                        setIsMobileMenuOpen(!isMobileMenuOpen)
                                    }
                                >
                                    <span className="sr-only">
                                        Open main menu
                                    </span>
                                    {isMobileMenuOpen ? (
                                        <svg
                                            className="block h-6 w-6"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            className="block h-6 w-6"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M4 6h16M4 12h16M4 18h16"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            {/* Centered Title */}
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="rounded-lg bg-red-800 p-2">
                                        <FontAwesomeIcon
                                            icon={faUtensils}
                                            className="h-6 w-6 text-white"
                                        />
                                    </div>
                                </div>
                                <h1 className="text-xl font-bold text-white">
                                    {hostname} F&B
                                </h1>
                            </div>

                            {/* Desktop Navigation Menu */}
                            <div className="hidden items-center space-x-8 lg:flex">
                                <Link
                                    href="#features"
                                    className="text-sm font-medium text-white transition-colors duration-200 hover:text-red-100"
                                >
                                    Features
                                </Link>
                                <Link
                                    href="#pricing"
                                    className="text-sm font-medium text-white transition-colors duration-200 hover:text-red-100"
                                >
                                    Pricing
                                </Link>
                            </div>

                            {/* Desktop Auth Buttons */}
                            <div className="hidden items-center space-x-4 lg:flex">
                                {auth.user ? (
                                    <Link
                                        href={route('home')}
                                        className="inline-flex items-center rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-800 shadow-sm transition-colors duration-200 hover:bg-red-50"
                                    >
                                        My Account
                                        <svg
                                            className="ml-2 h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                                            />
                                        </svg>
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login', {
                                                project: 'fnb',
                                            })}
                                            className="text-sm font-medium text-red-200 transition-colors hover:text-white"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href={route('register', {
                                                project: 'fnb',
                                            })}
                                            className="inline-flex items-center rounded-lg border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-red-700"
                                        >
                                            Get Started
                                            <svg
                                                className="ml-2 h-4 w-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                />
                                            </svg>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Mobile menu overlay */}
                        {isMobileMenuOpen && (
                            <div
                                className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden"
                                onClick={() => setIsMobileMenuOpen(false)}
                            ></div>
                        )}

                        {/* Mobile menu sidebar */}
                        <div
                            className={`fixed left-0 top-0 z-50 h-full w-full transform bg-gradient-to-r from-red-700 to-orange-700 shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                            id="mobile-menu"
                        >
                            {/* Header with close button */}
                            <div className="flex items-center justify-between border-b border-red-600 p-6">
                                <div className="flex items-center space-x-3">
                                    <div className="rounded-lg bg-red-800 p-2">
                                        <FontAwesomeIcon
                                            icon={faUtensils}
                                            className="h-6 w-6 text-white"
                                        />
                                    </div>
                                    <span className="text-lg font-bold text-white">
                                        {hostname} F&B
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="rounded-md p-2 text-white transition-colors duration-200 hover:bg-red-600 hover:text-red-100"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {/* Menu items */}
                            <div className="space-y-6 p-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-red-200">
                                        Navigation
                                    </h3>
                                    <Link
                                        href="#features"
                                        className="block rounded-lg px-3 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-red-600 hover:text-red-100"
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        Features
                                    </Link>
                                    <Link
                                        href="#pricing"
                                        className="block rounded-lg px-3 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-red-600 hover:text-red-100"
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        Pricing
                                    </Link>
                                </div>

                                <div className="space-y-4 border-t border-red-600 pt-6">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-red-200">
                                        Account
                                    </h3>
                                    {auth.user ? (
                                        <Link
                                            href={route('home')}
                                            className="block w-full rounded-lg bg-white px-4 py-3 text-center text-base font-medium text-red-800 transition-colors duration-200 hover:bg-red-50"
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                        >
                                            Go to My Account
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={route('login', {
                                                    project: 'fnb',
                                                })}
                                                className="block w-full rounded-lg border border-white/20 px-4 py-3 text-center text-base font-medium text-white transition-colors duration-200 hover:bg-red-600 hover:text-red-100"
                                                onClick={() =>
                                                    setIsMobileMenuOpen(false)
                                                }
                                            >
                                                Login
                                            </Link>
                                            <Link
                                                href={route('register', {
                                                    project: 'fnb',
                                                })}
                                                className="block w-full rounded-lg bg-white px-4 py-3 text-center text-base font-medium text-red-800 transition-colors duration-200 hover:bg-red-50"
                                                onClick={() =>
                                                    setIsMobileMenuOpen(false)
                                                }
                                            >
                                                Get Started
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                    <div className="text-center">
                        {/* Hero Section */}
                        <div className="mb-16 lg:mb-20">
                            <div className="mb-8">
                                <div className="mb-6 inline-flex items-center rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-700">
                                    <FontAwesomeIcon
                                        icon={faCheckCircle}
                                        className="mr-2 h-4 w-4 text-emerald-600"
                                    />
                                    Trusted by 1,000+ Restaurants
                                </div>
                            </div>
                            <h2 className="mb-6 text-4xl font-bold leading-tight text-red-900 lg:text-6xl">
                                Modern
                                <span className="block text-orange-600">
                                    Restaurant Management
                                </span>
                            </h2>
                            <p className="mx-auto mb-8 max-w-4xl text-xl leading-relaxed text-red-700 lg:text-2xl">
                                Transform your restaurant operations with our
                                comprehensive F&B management platform. Manage
                                orders, inventory, reservations, and analytics
                                with precision and efficiency.
                            </p>
                        </div>

                        {/* Features Section */}
                        <div id="features" className="mt-20 lg:mt-24">
                            <div className="mb-12">
                                <h3 className="mb-4 text-3xl font-bold text-red-900 lg:text-4xl">
                                    Complete Restaurant Solutions
                                </h3>
                                <p className="mx-auto max-w-3xl text-lg text-red-700">
                                    Our platform provides everything you need to
                                    manage your restaurant efficiently and
                                    profitably.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                                <div className="rounded-xl border border-red-200 bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                    <div className="mb-6 flex items-center">
                                        <div className="rounded-xl bg-red-100 p-3">
                                            <FontAwesomeIcon
                                                icon={faUtensils}
                                                className="h-8 w-8 text-red-600"
                                            />
                                        </div>
                                    </div>
                                    <h4 className="mb-3 text-xl font-bold text-red-900">
                                        Order Management
                                    </h4>
                                    <p className="leading-relaxed text-red-700">
                                        Streamline orders from dine-in, takeout,
                                        and delivery. Real-time kitchen display
                                        system ensures smooth operations.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-red-200 bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                    <div className="mb-6 flex items-center">
                                        <div className="rounded-xl bg-orange-100 p-3">
                                            <FontAwesomeIcon
                                                icon={faChartLine}
                                                className="h-8 w-8 text-orange-600"
                                            />
                                        </div>
                                    </div>
                                    <h4 className="mb-3 text-xl font-bold text-red-900">
                                        Business Analytics
                                    </h4>
                                    <p className="leading-relaxed text-red-700">
                                        Track sales, popular items, peak hours,
                                        and customer preferences with powerful
                                        analytics and insights.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-red-200 bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                    <div className="mb-6 flex items-center">
                                        <div className="rounded-xl bg-amber-100 p-3">
                                            <FontAwesomeIcon
                                                icon={faCoffee}
                                                className="h-8 w-8 text-amber-600"
                                            />
                                        </div>
                                    </div>
                                    <h4 className="mb-3 text-xl font-bold text-red-900">
                                        Table & Reservations
                                    </h4>
                                    <p className="leading-relaxed text-red-700">
                                        Manage table assignments, reservations,
                                        and guest flow seamlessly with our
                                        intuitive system.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Trust Indicators */}
                        <div className="mt-20 rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-orange-50 p-8 shadow-lg lg:mt-24 lg:p-12">
                            <h3 className="mb-8 text-center text-2xl font-bold text-red-900 lg:text-3xl">
                                Trusted by Restaurant Owners
                            </h3>
                            <div className="grid grid-cols-2 items-center gap-8 md:grid-cols-4">
                                <div className="text-center">
                                    <div className="mb-2 text-3xl font-bold text-red-800">
                                        1,000+
                                    </div>
                                    <div className="text-red-600">
                                        Active Restaurants
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="mb-2 text-3xl font-bold text-red-800">
                                        100K+
                                    </div>
                                    <div className="text-red-600">
                                        Orders Processed
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="mb-2 text-3xl font-bold text-red-800">
                                        99.9%
                                    </div>
                                    <div className="text-red-600">Uptime</div>
                                </div>
                                <div className="text-center">
                                    <div className="mb-2 text-3xl font-bold text-red-800">
                                        24/7
                                    </div>
                                    <div className="text-red-600">Support</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing Section */}
                <div id="pricing" className="mb-16 mt-16 px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-red-900">
                            Choose Your Restaurant Plan
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-red-700">
                            Select the perfect plan for your restaurant
                            operations. All plans include our core F&B
                            management features with different levels of support
                            and integrations.
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Basic Plan */}
                        <div className="group relative">
                            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 opacity-0 transition duration-200 group-hover:opacity-10"></div>
                            <div className="relative flex h-full flex-col rounded-xl border border-red-200 bg-white p-8 shadow-sm transition duration-200 hover:shadow-lg">
                                <div>
                                    <h3 className="mb-2 text-xl font-bold text-red-900">
                                        {basicPlan?.name || 'Basic'}
                                    </h3>
                                    <p className="mb-6 text-sm text-red-700">
                                        {basicPlan?.description ||
                                            'Perfect for small cafes and food stalls'}
                                    </p>
                                    <p className="mb-6">
                                        <span className="text-3xl font-extrabold text-red-900">
                                            {basicPlan?.currency || '₱'}
                                            {basicPlan?.price || 299}
                                        </span>
                                        <span className="text-sm text-red-700">
                                            {basicPlan?.period || '/month'}
                                        </span>
                                    </p>
                                    {auth.user ? (
                                        <Link
                                            href={route('home')}
                                            className="block w-full rounded-lg border border-transparent bg-red-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-red-700"
                                        >
                                            Go to My Account
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('register', {
                                                project: 'fnb',
                                                plan: basicPlan?.id || 'basic',
                                            })}
                                            className="block w-full rounded-lg border border-transparent bg-red-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-red-700"
                                        >
                                            {basicPlan?.buttonText ||
                                                'Get Started'}
                                        </Link>
                                    )}
                                </div>
                                <div className="mt-6 flex-grow">
                                    <ul className="space-y-3">
                                        {(
                                            basicPlan?.features || [
                                                'Up to 5 tables',
                                                'Basic menu management',
                                                'Order tracking',
                                                'Email support',
                                            ]
                                        ).map((feature, index) => (
                                            <li
                                                key={index}
                                                className="flex items-center text-sm"
                                            >
                                                <svg
                                                    className="mr-3 h-4 w-4 flex-shrink-0 text-red-500"
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
                                                <span className="text-red-700">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Pro Plan */}
                        <div className="group relative lg:-mt-4 lg:mb-4">
                            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 opacity-20 transition duration-200"></div>
                            <div className="relative flex h-full flex-col rounded-xl border-2 border-orange-500 bg-white p-8 shadow-lg">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                                    <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-medium text-orange-800">
                                        Most Popular
                                    </span>
                                </div>
                                <div>
                                    <h3 className="mb-2 text-xl font-bold text-red-900">
                                        {proPlan?.name || 'Pro'}
                                    </h3>
                                    <p className="mb-6 text-sm text-red-700">
                                        {proPlan?.description ||
                                            'Ideal for growing restaurants'}
                                    </p>
                                    <p className="mb-6">
                                        <span className="text-3xl font-extrabold text-red-900">
                                            {proPlan?.currency || '₱'}
                                            {proPlan?.price || 599}
                                        </span>
                                        <span className="text-sm text-red-700">
                                            {proPlan?.period || '/month'}
                                        </span>
                                    </p>
                                    {auth.user ? (
                                        <Link
                                            href={route('home')}
                                            className="block w-full rounded-lg border border-transparent bg-orange-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-orange-700"
                                        >
                                            Go to My Account
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('register', {
                                                project: 'fnb',
                                                plan: proPlan?.id || 'pro',
                                            })}
                                            className="block w-full rounded-lg border border-transparent bg-orange-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-orange-700"
                                        >
                                            {proPlan?.buttonText ||
                                                'Get Started'}
                                        </Link>
                                    )}
                                </div>
                                <div className="mt-6 flex-grow">
                                    <ul className="space-y-3">
                                        {(
                                            proPlan?.features || [
                                                'Up to 20 tables',
                                                'Advanced menu management',
                                                'Kitchen display system',
                                                'Reservations',
                                                'Priority support',
                                            ]
                                        ).map((feature, index) => (
                                            <li
                                                key={index}
                                                className="flex items-center text-sm"
                                            >
                                                <svg
                                                    className="mr-3 h-4 w-4 flex-shrink-0 text-orange-500"
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
                                                <span className="text-amber-600">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Business Plan */}
                        <div className="group relative">
                            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 transition duration-200 group-hover:opacity-10"></div>
                            <div className="relative flex h-full flex-col rounded-xl border border-red-200 bg-white p-8 shadow-sm transition duration-200 hover:shadow-lg">
                                <div>
                                    <h3 className="mb-2 text-xl font-bold text-red-900">
                                        {businessPlan?.name || 'Business'}
                                    </h3>
                                    <p className="mb-6 text-sm text-red-700">
                                        {businessPlan?.description ||
                                            'For large restaurants and chains'}
                                    </p>
                                    <p className="mb-6">
                                        <span className="text-3xl font-extrabold text-red-900">
                                            {businessPlan?.currency || '₱'}
                                            {businessPlan?.price || 999}
                                        </span>
                                        <span className="text-sm text-red-700">
                                            {businessPlan?.period || '/month'}
                                        </span>
                                    </p>
                                    {auth.user ? (
                                        <Link
                                            href={route('home')}
                                            className="block w-full rounded-lg border border-transparent bg-orange-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-orange-700"
                                        >
                                            Go to My Account
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('register', {
                                                project: 'fnb',
                                                plan:
                                                    businessPlan?.id ||
                                                    'business',
                                            })}
                                            className="block w-full rounded-lg border border-transparent bg-orange-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-orange-700"
                                        >
                                            {businessPlan?.buttonText ||
                                                'Get Started'}
                                        </Link>
                                    )}
                                </div>
                                <div className="mt-6 flex-grow">
                                    <ul className="space-y-3">
                                        {(
                                            businessPlan?.features || [
                                                'Unlimited tables',
                                                'Multi-branch support',
                                                'Custom integrations',
                                                'Analytics & reporting',
                                                '24/7 automated support',
                                            ]
                                        ).map((feature, index) => (
                                            <li
                                                key={index}
                                                className="flex items-center text-sm"
                                            >
                                                <svg
                                                    className="mr-3 h-4 w-4 flex-shrink-0 text-orange-500"
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
                                                <span className="text-red-700">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="mt-16">
                        <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-white/80 p-8 shadow-lg backdrop-blur-sm">
                            <h3 className="mb-8 text-center text-2xl font-bold text-red-900">
                                Frequently Asked Questions
                            </h3>
                            <div className="w-full">
                                <dl className="space-y-6">
                                    <div className="rounded-lg border border-red-200 bg-white p-6">
                                        <dt className="mb-2 text-lg font-medium text-red-900">
                                            Can I integrate with my existing POS
                                            system?
                                        </dt>
                                        <dd className="text-red-700">
                                            Yes, our platform supports
                                            integration with most major POS
                                            systems. Check our integration
                                            documentation for specific setup
                                            instructions.
                                        </dd>
                                    </div>
                                    <div className="rounded-lg border border-red-200 bg-white p-6">
                                        <dt className="mb-2 text-lg font-medium text-red-900">
                                            What training resources are
                                            available?
                                        </dt>
                                        <dd className="text-red-700">
                                            Yes, we provide comprehensive
                                            training materials, interactive
                                            video tutorials, and step-by-step
                                            guides. Business customers get
                                            access to advanced training modules
                                            and priority documentation.
                                        </dd>
                                    </div>
                                    <div className="rounded-lg border border-red-200 bg-white p-6">
                                        <dt className="mb-2 text-lg font-medium text-red-900">
                                            Is there a setup fee?
                                        </dt>
                                        <dd className="text-red-700">
                                            No, all our plans include free setup
                                            and onboarding. You only pay the
                                            monthly subscription fee.
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer
                    id="contact"
                    className="mt-8 bg-slate-900 text-white sm:mt-12 lg:mt-16"
                >
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
                        {/* Main Footer Content */}
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                            {/* Company Info - Spans 2 columns on large screens */}
                            <div className="lg:col-span-2">
                                <div className="mb-4 flex items-center">
                                    <div className="mr-3 rounded-lg bg-red-700 p-2">
                                        <FontAwesomeIcon
                                            icon={faUtensils}
                                            className="h-6 w-6 text-white"
                                        />
                                    </div>
                                    <span className="text-xl font-bold">
                                        {hostname} F&B
                                    </span>
                                </div>
                                <p className="mb-4 max-w-md text-slate-300">
                                    Transform your restaurant operations with
                                    our comprehensive F&B management platform.
                                    Manage orders, inventory, reservations, and
                                    analytics with precision and efficiency.
                                </p>
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                                    Quick Links
                                </h3>
                                <ul className="space-y-3">
                                    <li>
                                        <Link
                                            href="#features"
                                            className="text-sm text-slate-300 transition-colors hover:text-white"
                                        >
                                            Features
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#pricing"
                                            className="text-sm text-slate-300 transition-colors hover:text-white"
                                        >
                                            Pricing
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#"
                                            className="text-sm text-slate-300 transition-colors hover:text-white"
                                        >
                                            Help Center
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Legal Links */}
                            <div>
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                                    Legal
                                </h3>
                                <ul className="space-y-3">
                                    <li>
                                        <Link
                                            href={route('privacy-policy')}
                                            className="text-sm text-slate-300 transition-colors hover:text-white"
                                        >
                                            Privacy Policy
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={route('terms-and-conditions')}
                                            className="text-sm text-slate-300 transition-colors hover:text-white"
                                        >
                                            Terms of Service
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={route('cookie-policy')}
                                            className="text-sm text-slate-300 transition-colors hover:text-white"
                                        >
                                            Cookie Policy
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={route('faq')}
                                            className="text-sm text-slate-300 transition-colors hover:text-white"
                                        >
                                            FAQ
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Bottom Footer */}
                        <div className="mt-8 border-t border-slate-800 pt-6 sm:mt-10 sm:pt-8 lg:mt-12">
                            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                                <div className="text-center text-sm text-slate-400 md:text-left">
                                    © {new Date().getFullYear()} {hostname}{' '}
                                    F&B. All rights reserved.
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                                    <div className="flex items-center text-sm text-slate-400">
                                        <svg
                                            className="mr-1 h-4 w-4"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Secure Platform
                                    </div>
                                    <div className="flex items-center text-sm text-slate-400">
                                        <svg
                                            className="mr-1 h-4 w-4"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <Link
                                            href={route('neulify')}
                                            className="transition-colors duration-200 hover:text-[#14B8A6]"
                                        >
                                            Powered by Neulify
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
