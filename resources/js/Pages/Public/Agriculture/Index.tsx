import { getPricingForService } from '@/config/pricing';
import { getHost } from '@/lib/utils';
import {
    faChartLine,
    faCheckCircle,
    faSeedling,
    faTractor,
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

export default function AgricultureIndex({ auth }: PageProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const hostname = getHost();

    // Get currency and symbol from URL params, default to USD and $
    const urlParams = useMemo(
        () => new URLSearchParams(window.location.search),
        [],
    );
    const currency = urlParams.get('currency') || 'usd';
    const symbol = urlParams.get('symbol') || '$';

    const pricing = getPricingForService('agriculture', currency, symbol);
    const basicPlan = pricing?.plans.find((plan) => plan.id === 'basic');
    const proPlan = pricing?.plans.find((plan) => plan.id === 'pro');
    const businessPlan = pricing?.plans.find((plan) => plan.id === 'business');

    return (
        <>
            <Head
                title={`${hostname} Agriculture - Farm Management Platform`}
            />
            <div className="min-h-screen bg-gradient-to-br from-lime-50 via-green-50 to-emerald-50">
                {/* Header */}
                <div className="border-b border-green-700 bg-gradient-to-r from-green-700 to-lime-700 shadow-lg">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="rounded-lg bg-white p-2">
                                    <FontAwesomeIcon
                                        icon={faSeedling}
                                        className="h-8 w-8 text-green-700"
                                    />
                                </div>
                                <span className="ml-3 text-2xl font-bold text-white">
                                    {hostname} Agriculture
                                </span>
                            </div>

                            {/* Desktop Navigation */}
                            <div className="hidden md:flex md:items-center md:space-x-6">
                                <Link
                                    href="#features"
                                    className="text-green-100 transition-colors hover:text-white"
                                >
                                    Features
                                </Link>
                                <Link
                                    href="#pricing"
                                    className="text-green-100 transition-colors hover:text-white"
                                >
                                    Pricing
                                </Link>
                                {auth?.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-green-700 shadow-md transition-all hover:bg-green-50"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login', {
                                                project: 'agriculture',
                                            })}
                                            className="text-green-100 transition-colors hover:text-white"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register', {
                                                project: 'agriculture',
                                            })}
                                            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-green-700 shadow-md transition-all hover:bg-green-50"
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </div>

                            {/* Mobile menu button */}
                            <button
                                onClick={() =>
                                    setIsMobileMenuOpen(!isMobileMenuOpen)
                                }
                                className="rounded-lg p-2 text-white hover:bg-green-600 md:hidden"
                            >
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    {isMobileMenuOpen ? (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    ) : (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    )}
                                </svg>
                            </button>
                        </div>

                        {/* Mobile Navigation */}
                        {isMobileMenuOpen && (
                            <div className="mt-4 border-t border-green-600 pt-4 md:hidden">
                                <div className="flex flex-col space-y-3">
                                    <Link
                                        href="#features"
                                        className="text-green-100 transition-colors hover:text-white"
                                    >
                                        Features
                                    </Link>
                                    <Link
                                        href="#pricing"
                                        className="text-green-100 transition-colors hover:text-white"
                                    >
                                        Pricing
                                    </Link>
                                    {auth?.user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="rounded-lg bg-white px-4 py-2 text-center text-sm font-semibold text-green-700 shadow-md transition-all hover:bg-green-50"
                                        >
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={route('login', {
                                                    project: 'agriculture',
                                                })}
                                                className="text-green-100 transition-colors hover:text-white"
                                            >
                                                Log in
                                            </Link>
                                            <Link
                                                href={route('register', {
                                                    project: 'agriculture',
                                                })}
                                                className="rounded-lg bg-white px-4 py-2 text-center text-sm font-semibold text-green-700 shadow-md transition-all hover:bg-green-50"
                                            >
                                                Get Started
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Hero Section */}
                <div className="relative overflow-hidden bg-gradient-to-r from-green-700 to-lime-700 py-12 sm:py-16 lg:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-3xl font-extrabold text-white sm:text-4xl md:text-5xl lg:text-6xl">
                                Smart Agriculture Management
                            </h1>
                            <p className="mx-auto mt-4 max-w-2xl text-base text-green-100 sm:mt-6 sm:text-lg md:text-xl">
                                Modernize your farming operations with our
                                comprehensive agriculture management platform.
                                Track crops, manage inventory, and optimize
                                yields with data-driven insights.
                            </p>
                            <div className="mt-8 flex flex-col justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
                                <Link
                                    href={route('register', {
                                        project: 'agriculture',
                                    })}
                                    className="rounded-lg bg-white px-6 py-3 text-base font-semibold text-green-700 shadow-lg transition-all hover:bg-green-50 hover:shadow-xl sm:px-8 sm:text-lg"
                                >
                                    Start Free Trial
                                </Link>
                                <Link
                                    href="#features"
                                    className="rounded-lg border-2 border-white px-6 py-3 text-base font-semibold text-white transition-all hover:bg-white hover:text-green-700 sm:px-8 sm:text-lg"
                                >
                                    Learn More
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="bg-white py-8 sm:py-12">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-700 sm:text-4xl">
                                    10K+
                                </div>
                                <div className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Farms Managed
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-700 sm:text-4xl">
                                    50K+
                                </div>
                                <div className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Hectares Monitored
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-700 sm:text-4xl">
                                    30%+
                                </div>
                                <div className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Yield Increase
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div
                    id="features"
                    className="bg-gray-50 py-12 sm:py-16 lg:py-24"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl lg:text-4xl">
                                Modern Farm Management Tools
                            </h2>
                            <p className="mt-3 text-base text-gray-600 sm:mt-4 sm:text-lg lg:text-xl">
                                Everything you need to run a successful
                                agricultural operation
                            </p>
                        </div>

                        <div className="mt-8 grid gap-6 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                            {/* Feature 1 */}
                            <div className="rounded-lg bg-white p-5 shadow-md transition-all hover:shadow-lg sm:p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 sm:h-12 sm:w-12">
                                    <FontAwesomeIcon
                                        icon={faSeedling}
                                        className="h-5 w-5 text-green-700 sm:h-6 sm:w-6"
                                    />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">
                                    Crop Management
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Track crop growth, planting schedules, and
                                    harvest times with precision.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="rounded-lg bg-white p-5 shadow-md transition-all hover:shadow-lg sm:p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 sm:h-12 sm:w-12">
                                    <FontAwesomeIcon
                                        icon={faTractor}
                                        className="h-5 w-5 text-green-700 sm:h-6 sm:w-6"
                                    />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">
                                    Equipment Tracking
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Manage farm equipment, maintenance
                                    schedules, and usage logs efficiently.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="rounded-lg bg-white p-5 shadow-md transition-all hover:shadow-lg sm:p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 sm:h-12 sm:w-12">
                                    <svg
                                        className="h-5 w-5 text-green-700 sm:h-6 sm:w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">
                                    Weather Monitoring
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Get real-time weather updates and forecasts
                                    to plan your farming activities.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="rounded-lg bg-white p-5 shadow-md transition-all hover:shadow-lg sm:p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 sm:h-12 sm:w-12">
                                    <svg
                                        className="h-5 w-5 text-green-700 sm:h-6 sm:w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">
                                    Inventory Management
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Track seeds, fertilizers, and supplies with
                                    automated stock alerts.
                                </p>
                            </div>

                            {/* Feature 5 */}
                            <div className="rounded-lg bg-white p-5 shadow-md transition-all hover:shadow-lg sm:p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 sm:h-12 sm:w-12">
                                    <FontAwesomeIcon
                                        icon={faChartLine}
                                        className="h-5 w-5 text-green-700 sm:h-6 sm:w-6"
                                    />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">
                                    Yield Analytics
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Analyze crop yields and identify
                                    optimization opportunities with AI-powered
                                    insights.
                                </p>
                            </div>

                            {/* Feature 6 */}
                            <div className="rounded-lg bg-white p-5 shadow-md transition-all hover:shadow-lg sm:p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 sm:h-12 sm:w-12">
                                    <svg
                                        className="h-5 w-5 text-green-700 sm:h-6 sm:w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">
                                    Financial Tracking
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Monitor farm expenses, revenues, and
                                    profitability with detailed reports.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing Section */}
                <div id="pricing" className="bg-white py-12 sm:py-16 lg:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl lg:text-4xl">
                                Simple, Transparent Pricing
                            </h2>
                            <p className="mt-3 text-base text-gray-600 sm:mt-4 sm:text-lg lg:text-xl">
                                Choose the plan that fits your farm size
                            </p>
                        </div>

                        <div className="mt-8 grid gap-6 sm:mt-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                            {/* Basic Plan */}
                            {basicPlan && (
                                <div className="flex flex-col rounded-lg border-2 border-gray-200 bg-white p-6 shadow-sm sm:p-8 md:col-span-2 lg:col-span-1">
                                    <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                        {basicPlan.name}
                                    </h3>
                                    <p className="mt-3 text-sm text-gray-600 sm:mt-4 sm:text-base">
                                        {basicPlan.description}
                                    </p>
                                    <div className="mt-4 sm:mt-6">
                                        <span className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                            {basicPlan.currency}
                                            {basicPlan.price}
                                        </span>
                                        <span className="text-sm text-gray-600 sm:text-base">
                                            /month
                                        </span>
                                    </div>
                                    <ul className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
                                        {basicPlan.features.map(
                                            (feature, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-start"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faCheckCircle}
                                                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 sm:mt-1 sm:h-5 sm:w-5"
                                                    />
                                                    <span className="ml-3 text-sm text-gray-700 sm:text-base">
                                                        {feature}
                                                    </span>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                    <Link
                                        href={route('register', {
                                            project: 'agriculture',
                                        })}
                                        className="mt-6 block rounded-lg border-2 border-green-600 bg-white px-6 py-2.5 text-center text-sm font-semibold text-green-600 transition-all hover:bg-green-50 sm:mt-8 sm:py-3 sm:text-base"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}

                            {/* Pro Plan */}
                            {proPlan && (
                                <div className="flex flex-col rounded-lg border-2 border-green-600 bg-white p-6 shadow-lg sm:p-8 md:col-span-2 lg:col-span-1">
                                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                            {proPlan.name}
                                        </h3>
                                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 sm:text-sm">
                                            Popular
                                        </span>
                                    </div>
                                    <p className="mt-3 text-sm text-gray-600 sm:mt-4 sm:text-base">
                                        {proPlan.description}
                                    </p>
                                    <div className="mt-4 sm:mt-6">
                                        <span className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                            {proPlan.currency}
                                            {proPlan.price}
                                        </span>
                                        <span className="text-sm text-gray-600 sm:text-base">
                                            /month
                                        </span>
                                    </div>
                                    <ul className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
                                        {proPlan.features.map(
                                            (feature, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-start"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faCheckCircle}
                                                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 sm:mt-1 sm:h-5 sm:w-5"
                                                    />
                                                    <span className="ml-3 text-sm text-gray-700 sm:text-base">
                                                        {feature}
                                                    </span>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                    <Link
                                        href={route('register', {
                                            project: 'agriculture',
                                        })}
                                        className="mt-6 block rounded-lg bg-green-600 px-6 py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-green-700 sm:mt-8 sm:py-3 sm:text-base"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}

                            {/* Business Plan */}
                            {businessPlan && (
                                <div className="flex flex-col rounded-lg border-2 border-gray-200 bg-white p-6 shadow-sm sm:p-8 md:col-span-2 lg:col-span-1">
                                    <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                        {businessPlan.name}
                                    </h3>
                                    <p className="mt-3 text-sm text-gray-600 sm:mt-4 sm:text-base">
                                        {businessPlan.description}
                                    </p>
                                    <div className="mt-4 sm:mt-6">
                                        <span className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                            {businessPlan.currency}
                                            {businessPlan.price}
                                        </span>
                                        <span className="text-sm text-gray-600 sm:text-base">
                                            /month
                                        </span>
                                    </div>
                                    <ul className="mt-4 space-y-3 sm:mt-6 sm:space-y-4">
                                        {businessPlan.features.map(
                                            (feature, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-start"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faCheckCircle}
                                                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 sm:mt-1 sm:h-5 sm:w-5"
                                                    />
                                                    <span className="ml-3 text-sm text-gray-700 sm:text-base">
                                                        {feature}
                                                    </span>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                    <Link
                                        href={route('register', {
                                            project: 'agriculture',
                                        })}
                                        className="mt-6 block rounded-lg border-2 border-green-600 bg-white px-6 py-2.5 text-center text-sm font-semibold text-green-600 transition-all hover:bg-green-50 sm:mt-8 sm:py-3 sm:text-base"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-gray-50 py-12 sm:py-16 lg:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl lg:text-4xl">
                                Frequently Asked Questions
                            </h2>
                        </div>
                        <div className="mx-auto mt-8 max-w-3xl sm:mt-12">
                            <dl className="space-y-4 sm:space-y-6">
                                <div className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
                                    <dt className="mb-2 text-base font-medium text-gray-900 sm:text-lg">
                                        What size farms can use this platform?
                                    </dt>
                                    <dd className="text-sm text-gray-600 sm:text-base">
                                        Our platform scales from small family
                                        farms to large commercial operations.
                                        Choose the plan that matches your farm
                                        size and needs.
                                    </dd>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
                                    <dt className="mb-2 text-base font-medium text-gray-900 sm:text-lg">
                                        Does it work offline?
                                    </dt>
                                    <dd className="text-sm text-gray-600 sm:text-base">
                                        Yes! Our mobile app includes offline
                                        mode for field work. Data syncs
                                        automatically when you're back online.
                                    </dd>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
                                    <dt className="mb-2 text-base font-medium text-gray-900 sm:text-lg">
                                        Can I track multiple farms?
                                    </dt>
                                    <dd className="text-sm text-gray-600 sm:text-base">
                                        Yes, Pro and Business plans support
                                        multiple farm locations with centralized
                                        management and reporting.
                                    </dd>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
                                    <dt className="mb-2 text-base font-medium text-gray-900 sm:text-lg">
                                        What support resources are available?
                                    </dt>
                                    <dd className="text-sm text-gray-600 sm:text-base">
                                        All plans include comprehensive
                                        documentation, video tutorials, and
                                        automated help center. Pro and Business
                                        plans get priority technical support
                                        with faster response times.
                                    </dd>
                                </div>
                            </dl>
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
                                    <div className="mr-3 rounded-lg bg-green-800 p-2">
                                        <FontAwesomeIcon
                                            icon={faSeedling}
                                            className="h-6 w-6 text-white"
                                        />
                                    </div>
                                    <span className="text-xl font-bold">
                                        Agriculture
                                    </span>
                                </div>
                                <p className="mb-4 max-w-md text-slate-300">
                                    Modern farm management platform designed to
                                    help farmers increase productivity and
                                    profitability. Track crops, equipment, and
                                    finances all in one place.
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
                                    Agriculture. All rights reserved.
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
