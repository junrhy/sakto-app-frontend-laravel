import { getPricingForService } from '@/config/pricing';
import { getHost, formatCurrency } from '@/lib/utils';
import {
    faChartLine,
    faCheckCircle,
    faCoins,
    faWallet,
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

export default function FinanceIndex({ auth }: PageProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const hostname = getHost();

    // Get currency and symbol from URL params, default to USD and $
    const urlParams = useMemo(
        () => new URLSearchParams(window.location.search),
        [],
    );
    const currency = urlParams.get('currency') || 'usd';
    const symbol = urlParams.get('symbol') || '$';

    const pricing = getPricingForService('finance', currency, symbol);
    const basicPlan = pricing?.plans.find((plan) => plan.id === 'basic');
    const proPlan = pricing?.plans.find((plan) => plan.id === 'pro');
    const businessPlan = pricing?.plans.find((plan) => plan.id === 'business');

    return (
        <>
            <Head
                title={`${hostname} Finance - Financial Management Platform`}
            />
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50">
                {/* Header */}
                <div className="border-b border-emerald-700 bg-gradient-to-r from-emerald-700 to-teal-700 shadow-lg">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="rounded-lg bg-white p-2">
                                    <FontAwesomeIcon
                                        icon={faCoins}
                                        className="h-8 w-8 text-emerald-700"
                                    />
                                </div>
                                <span className="ml-3 text-2xl font-bold text-white">
                                    {hostname} Finance
                                </span>
                            </div>

                            {/* Desktop Navigation */}
                            <div className="hidden md:flex md:items-center md:space-x-6">
                                <Link
                                    href="#features"
                                    className="text-emerald-100 transition-colors hover:text-white"
                                >
                                    Features
                                </Link>
                                <Link
                                    href="#pricing"
                                    className="text-emerald-100 transition-colors hover:text-white"
                                >
                                    Pricing
                                </Link>
                                {auth?.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-md transition-all hover:bg-emerald-50"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login', {
                                                project: 'finance',
                                            })}
                                            className="text-emerald-100 transition-colors hover:text-white"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register', {
                                                project: 'finance',
                                            })}
                                            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-md transition-all hover:bg-emerald-50"
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
                                className="rounded-lg p-2 text-white hover:bg-emerald-600 md:hidden"
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
                            <div className="mt-4 border-t border-emerald-600 pt-4 md:hidden">
                                <div className="flex flex-col space-y-3">
                                    <Link
                                        href="#features"
                                        className="text-emerald-100 transition-colors hover:text-white"
                                    >
                                        Features
                                    </Link>
                                    <Link
                                        href="#pricing"
                                        className="text-emerald-100 transition-colors hover:text-white"
                                    >
                                        Pricing
                                    </Link>
                                    {auth?.user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="rounded-lg bg-white px-4 py-2 text-center text-sm font-semibold text-emerald-700 shadow-md transition-all hover:bg-emerald-50"
                                        >
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={route('login')}
                                                className="text-emerald-100 transition-colors hover:text-white"
                                            >
                                                Log in
                                            </Link>
                                            <Link
                                                href={route('register')}
                                                className="rounded-lg bg-white px-4 py-2 text-center text-sm font-semibold text-emerald-700 shadow-md transition-all hover:bg-emerald-50"
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
                <div className="relative overflow-hidden bg-gradient-to-r from-emerald-700 to-teal-700 py-12 sm:py-16 lg:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-3xl font-extrabold text-white sm:text-4xl md:text-5xl lg:text-6xl">
                                Smart Financial Management
                            </h1>
                            <p className="mx-auto mt-4 max-w-2xl text-base text-emerald-100 sm:mt-6 sm:text-lg md:text-xl">
                                Take control of your finances with our
                                comprehensive financial management platform.
                                Track expenses, manage budgets, and make
                                informed financial decisions.
                            </p>
                            <div className="mt-8 flex flex-col justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
                                <Link
                                    href={route('register', {
                                        project: 'finance',
                                    })}
                                    className="rounded-lg bg-white px-6 py-3 text-base font-semibold text-emerald-700 shadow-lg transition-all hover:bg-emerald-50 hover:shadow-xl sm:px-8 sm:text-lg"
                                >
                                    Start Free Trial
                                </Link>
                                <Link
                                    href="#features"
                                    className="rounded-lg border-2 border-white px-6 py-3 text-base font-semibold text-white transition-all hover:bg-white hover:text-emerald-700 sm:px-8 sm:text-lg"
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
                                <div className="text-3xl font-bold text-emerald-700 sm:text-4xl">
                                    $50M+
                                </div>
                                <div className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Transactions Processed
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-emerald-700 sm:text-4xl">
                                    5K+
                                </div>
                                <div className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Active Users
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-emerald-700 sm:text-4xl">
                                    99.9%
                                </div>
                                <div className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Uptime Guarantee
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
                                Complete Financial Control
                            </h2>
                            <p className="mt-3 text-base text-gray-600 sm:mt-4 sm:text-lg lg:text-xl">
                                Everything you need to manage your finances
                                effectively
                            </p>
                        </div>

                        <div className="mt-8 grid gap-6 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                            {/* Feature 1 */}
                            <div className="rounded-lg bg-white p-5 shadow-md transition-all hover:shadow-lg sm:p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 sm:h-12 sm:w-12">
                                    <FontAwesomeIcon
                                        icon={faWallet}
                                        className="h-5 w-5 text-emerald-700 sm:h-6 sm:w-6"
                                    />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">
                                    Expense Tracking
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Track all your expenses in one place with
                                    automatic categorization and insights.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="rounded-lg bg-white p-5 shadow-md transition-all hover:shadow-lg sm:p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 sm:h-12 sm:w-12">
                                    <svg
                                        className="h-5 w-5 text-emerald-700 sm:h-6 sm:w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">
                                    Budget Planning
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Create and manage budgets with real-time
                                    tracking and alerts.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="rounded-lg bg-white p-5 shadow-md transition-all hover:shadow-lg sm:p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 sm:h-12 sm:w-12">
                                    <FontAwesomeIcon
                                        icon={faChartLine}
                                        className="h-5 w-5 text-emerald-700 sm:h-6 sm:w-6"
                                    />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">
                                    Financial Reports
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Generate detailed financial reports and
                                    analytics with customizable dashboards.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="rounded-lg bg-white p-5 shadow-md transition-all hover:shadow-lg sm:p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 sm:h-12 sm:w-12">
                                    <svg
                                        className="h-5 w-5 text-emerald-700 sm:h-6 sm:w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">
                                    Payment Processing
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Accept payments securely with multiple
                                    payment gateway integrations.
                                </p>
                            </div>

                            {/* Feature 5 */}
                            <div className="rounded-lg bg-white p-5 shadow-md transition-all hover:shadow-lg sm:p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 sm:h-12 sm:w-12">
                                    <svg
                                        className="h-5 w-5 text-emerald-700 sm:h-6 sm:w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">
                                    Invoice Management
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Create, send, and track invoices with
                                    automated payment reminders.
                                </p>
                            </div>

                            {/* Feature 6 */}
                            <div className="rounded-lg bg-white p-5 shadow-md transition-all hover:shadow-lg sm:p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 sm:h-12 sm:w-12">
                                    <svg
                                        className="h-5 w-5 text-emerald-700 sm:h-6 sm:w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">
                                    Bank-Level Security
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Your data is protected with enterprise-grade
                                    encryption and security.
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
                                Choose the plan that fits your financial needs
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
                                            {formatCurrency(basicPlan.price, basicPlan.currency)}
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
                                                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600 sm:mt-1 sm:h-5 sm:w-5"
                                                    />
                                                    <span className="ml-3 text-sm text-gray-700 sm:text-base">
                                                        {feature}
                                                    </span>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                    <Link
                                        href={route('register')}
                                        className="mt-6 block rounded-lg border-2 border-emerald-600 bg-white px-6 py-2.5 text-center text-sm font-semibold text-emerald-600 transition-all hover:bg-emerald-50 sm:mt-8 sm:py-3 sm:text-base"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}

                            {/* Pro Plan */}
                            {proPlan && (
                                <div className="flex flex-col rounded-lg border-2 border-emerald-600 bg-white p-6 shadow-lg sm:p-8 md:col-span-2 lg:col-span-1">
                                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                            {proPlan.name}
                                        </h3>
                                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 sm:text-sm">
                                            Popular
                                        </span>
                                    </div>
                                    <p className="mt-3 text-sm text-gray-600 sm:mt-4 sm:text-base">
                                        {proPlan.description}
                                    </p>
                                    <div className="mt-4 sm:mt-6">
                                        <span className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                            {formatCurrency(proPlan.price, proPlan.currency)}
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
                                                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600 sm:mt-1 sm:h-5 sm:w-5"
                                                    />
                                                    <span className="ml-3 text-sm text-gray-700 sm:text-base">
                                                        {feature}
                                                    </span>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                    <Link
                                        href={route('register')}
                                        className="mt-6 block rounded-lg bg-emerald-600 px-6 py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-emerald-700 sm:mt-8 sm:py-3 sm:text-base"
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
                                            {formatCurrency(businessPlan.price, businessPlan.currency)}
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
                                                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600 sm:mt-1 sm:h-5 sm:w-5"
                                                    />
                                                    <span className="ml-3 text-sm text-gray-700 sm:text-base">
                                                        {feature}
                                                    </span>
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                    <Link
                                        href={route('register')}
                                        className="mt-6 block rounded-lg border-2 border-emerald-600 bg-white px-6 py-2.5 text-center text-sm font-semibold text-emerald-600 transition-all hover:bg-emerald-50 sm:mt-8 sm:py-3 sm:text-base"
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
                                        Is my financial data secure?
                                    </dt>
                                    <dd className="text-sm text-gray-600 sm:text-base">
                                        Absolutely! We use bank-level encryption
                                        and security protocols. Your data is
                                        encrypted both in transit and at rest,
                                        and we never share your information with
                                        third parties.
                                    </dd>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
                                    <dt className="mb-2 text-base font-medium text-gray-900 sm:text-lg">
                                        Can I connect my bank accounts?
                                    </dt>
                                    <dd className="text-sm text-gray-600 sm:text-base">
                                        Yes, our platform supports integration
                                        with major banks for automatic
                                        transaction syncing. This feature is
                                        available on Pro and Business plans.
                                    </dd>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
                                    <dt className="mb-2 text-base font-medium text-gray-900 sm:text-lg">
                                        What payment methods do you accept?
                                    </dt>
                                    <dd className="text-sm text-gray-600 sm:text-base">
                                        We accept all major credit cards, debit
                                        cards, and digital payment methods.
                                        Business plans can also set up invoice
                                        billing.
                                    </dd>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
                                    <dt className="mb-2 text-base font-medium text-gray-900 sm:text-lg">
                                        Can I export my financial data?
                                    </dt>
                                    <dd className="text-sm text-gray-600 sm:text-base">
                                        Yes, you can export your financial data
                                        in multiple formats including CSV,
                                        Excel, and PDF. All plans include data
                                        export capabilities.
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
                                    <div className="mr-3 rounded-lg bg-emerald-800 p-2">
                                        <FontAwesomeIcon
                                            icon={faCoins}
                                            className="h-6 w-6 text-white"
                                        />
                                    </div>
                                    <span className="text-xl font-bold">
                                        Finance
                                    </span>
                                </div>
                                <p className="mb-4 max-w-md text-slate-300">
                                    Comprehensive financial management platform
                                    designed for businesses of all sizes. Track
                                    expenses, manage budgets, and make
                                    data-driven financial decisions.
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
                                    Finance. All rights reserved.
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
