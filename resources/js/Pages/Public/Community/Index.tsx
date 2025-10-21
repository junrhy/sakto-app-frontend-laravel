import ApplicationLogo from '@/Components/ApplicationLogo';
import { getPricingForService } from '@/config/pricing';
import { getHost } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';

interface PageProps {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
    communityUsers: {
        id: number;
        name: string;
        email: string;
        created_at: string;
    }[];
    totalContacts: number;
}

export default function Community({
    auth,
    communityUsers,
    totalContacts,
}: PageProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const hostname = getHost();

    // Get currency and symbol from URL params, default to USD and $
    const urlParams = useMemo(
        () => new URLSearchParams(window.location.search),
        [],
    );
    const currency = urlParams.get('currency') || 'usd';
    const symbol = urlParams.get('symbol') || '$';

    const pricing = getPricingForService('community', currency, symbol);
    const basicPlan = pricing?.plans.find((plan) => plan.id === 'basic');
    const proPlan = pricing?.plans.find((plan) => plan.id === 'pro');
    const businessPlan = pricing?.plans.find((plan) => plan.id === 'business');

    // Use totalContacts from backend instead of calculating from communityUsers
    const totalMembers = totalContacts;
    const totalCommunities = communityUsers.length;

    return (
        <>
            <Head title="Community - Connect and Share" />
            <div className="relative min-h-screen overflow-hidden scroll-smooth bg-blue-100">
                {/* Curved Wave Background */}
                <div className="absolute inset-0">
                    <svg
                        className="h-full w-full"
                        viewBox="0 0 1200 800"
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <linearGradient
                                id="wave1"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                            >
                                <stop
                                    offset="0%"
                                    style={{
                                        stopColor: '#3B82F6',
                                        stopOpacity: 0.1,
                                    }}
                                />
                                <stop
                                    offset="100%"
                                    style={{
                                        stopColor: '#8B5CF6',
                                        stopOpacity: 0.1,
                                    }}
                                />
                            </linearGradient>
                            <linearGradient
                                id="wave2"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                            >
                                <stop
                                    offset="0%"
                                    style={{
                                        stopColor: '#10B981',
                                        stopOpacity: 0.08,
                                    }}
                                />
                                <stop
                                    offset="100%"
                                    style={{
                                        stopColor: '#06B6D4',
                                        stopOpacity: 0.08,
                                    }}
                                />
                            </linearGradient>
                        </defs>
                        {/* Top wave */}
                        <path
                            d="M0,200 Q300,100 600,200 T1200,200 L1200,0 L0,0 Z"
                            fill="url(#wave1)"
                        />
                        {/* Middle wave */}
                        <path
                            d="M0,400 Q400,300 800,400 T1200,400 L1200,200 L0,200 Z"
                            fill="url(#wave2)"
                        />
                        {/* Bottom wave */}
                        <path
                            d="M0,600 Q200,500 600,600 T1200,600 L1200,400 L0,400 Z"
                            fill="url(#wave1)"
                        />
                    </svg>
                </div>
                {/* Header */}
                <div className="relative border-b border-blue-700 bg-blue-600 shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <div className="relative flex items-center justify-center lg:justify-between">
                            {/* Mobile menu button */}
                            <div className="absolute left-0 lg:hidden">
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center rounded-md p-2 text-white transition-colors duration-200 hover:bg-blue-700 hover:text-blue-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
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
                            <div className="flex items-center">
                                <ApplicationLogo className="block h-8 w-auto fill-current text-white" />
                                <div className="ml-3">
                                    <div className="text-2xl font-bold leading-tight text-white">
                                        {hostname} Community
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Navigation Menu */}
                            <div className="hidden items-center space-x-8 lg:flex">
                                <Link
                                    href={route('community.search')}
                                    className="text-sm font-medium text-white transition-colors duration-200 hover:text-blue-100"
                                >
                                    Search
                                </Link>
                                <Link
                                    href="#features"
                                    className="text-sm font-medium text-white transition-colors duration-200 hover:text-blue-100"
                                >
                                    How it works
                                </Link>
                                <Link
                                    href="#pricing"
                                    className="text-sm font-medium text-white transition-colors duration-200 hover:text-blue-100"
                                >
                                    Pricing
                                </Link>
                            </div>

                            {/* Desktop Auth Buttons */}
                            <div className="hidden items-center space-x-4 lg:flex">
                                {auth.user ? (
                                    <Link
                                        href={route('home')}
                                        className="inline-flex items-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-colors duration-200 hover:bg-slate-50"
                                    >
                                        Go to My Account
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login', {
                                                project: 'community',
                                            })}
                                            className="inline-flex items-center rounded-md border border-white px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-white hover:text-blue-600"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href={route('register', {
                                                project: 'community',
                                            })}
                                            className="inline-flex items-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-colors duration-200 hover:bg-slate-50"
                                        >
                                            Get Started
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
                            className={`fixed left-0 top-0 z-50 h-full w-full transform bg-blue-600 shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                            id="mobile-menu"
                        >
                            {/* Header with close button */}
                            <div className="flex items-center justify-between border-b border-blue-700 p-6">
                                <div className="flex items-center">
                                    <ApplicationLogo className="block h-6 w-auto fill-current text-white" />
                                    <span className="ml-2 text-lg font-bold text-white">
                                        {hostname} Community
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="rounded-md p-2 text-white transition-colors duration-200 hover:bg-blue-700 hover:text-blue-100"
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
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-200">
                                        Navigation
                                    </h3>
                                    <Link
                                        href={route('community.search')}
                                        className="block rounded-lg px-3 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-blue-700 hover:text-blue-100"
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        Search
                                    </Link>
                                    <Link
                                        href="#features"
                                        className="block rounded-lg px-3 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-blue-700 hover:text-blue-100"
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        How it works
                                    </Link>
                                    <Link
                                        href="#pricing"
                                        className="block rounded-lg px-3 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-blue-700 hover:text-blue-100"
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        Pricing
                                    </Link>
                                </div>

                                <div className="space-y-4 border-t border-blue-700 pt-6">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-200">
                                        Account
                                    </h3>
                                    {auth.user ? (
                                        <Link
                                            href={route('home')}
                                            className="block w-full rounded-lg bg-white px-4 py-3 text-center text-base font-medium text-blue-600 transition-colors duration-200 hover:bg-slate-50"
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
                                                    project: 'community',
                                                })}
                                                className="block w-full rounded-lg border border-white/20 px-4 py-3 text-center text-base font-medium text-white transition-colors duration-200 hover:bg-blue-700 hover:text-blue-100"
                                                onClick={() =>
                                                    setIsMobileMenuOpen(false)
                                                }
                                            >
                                                Login
                                            </Link>
                                            <Link
                                                href={route('register', {
                                                    project: 'community',
                                                })}
                                                className="block w-full rounded-lg bg-white px-4 py-3 text-center text-base font-medium text-blue-600 transition-colors duration-200 hover:bg-slate-50"
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
                <div className="relative z-10">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        {/* Hero Banner */}
                        <div className="relative mb-12 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700">
                            <div className="absolute inset-0 bg-black/20"></div>
                            <div className="relative px-8 py-12 sm:px-12 sm:py-16">
                                <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
                                    <div>
                                        <h1 className="mb-4 text-4xl font-bold text-white">
                                            Join Our Thriving Community
                                        </h1>
                                        <p className="mb-6 text-xl text-blue-100">
                                            Connect with{' '}
                                            {totalMembers.toLocaleString()}+
                                            members, share experiences, and grow
                                            together in our vibrant community
                                            platform.
                                        </p>
                                        <div className="flex flex-wrap gap-4">
                                            <div className="flex items-center text-white">
                                                <svg
                                                    className="mr-2 h-5 w-5"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <span className="text-sm">
                                                    Verified Members
                                                </span>
                                            </div>

                                            <div className="flex items-center text-white">
                                                <svg
                                                    className="mr-2 h-5 w-5"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <span className="text-sm">
                                                    Secure Platform
                                                </span>
                                            </div>
                                            <div className="flex items-center text-white">
                                                <svg
                                                    className="mr-2 h-5 w-5"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                <span className="text-sm">
                                                    Rewards
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden lg:block">
                                        <div className="relative">
                                            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-30 blur-2xl"></div>
                                            <div className="relative rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-sm">
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="rounded-lg bg-white/20 p-4 text-center">
                                                        <div className="text-2xl font-bold text-white">
                                                            {totalMembers.toLocaleString()}
                                                        </div>
                                                        <div className="text-xs text-blue-100">
                                                            Members
                                                        </div>
                                                    </div>
                                                    <div className="rounded-lg bg-white/20 p-4 text-center">
                                                        <div className="text-2xl font-bold text-white">
                                                            {totalCommunities}
                                                        </div>
                                                        <div className="text-xs text-blue-100">
                                                            Communities
                                                        </div>
                                                    </div>
                                                    <div className="rounded-lg bg-white/20 p-4 text-center">
                                                        <div className="text-2xl font-bold text-white">
                                                            ★
                                                        </div>
                                                        <div className="text-xs text-blue-100">
                                                            Earn Rewards
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* How It Works Section */}
                        <div id="features" className="mb-16">
                            <div className="rounded-2xl border border-white/20 bg-white/80 p-8 shadow-lg backdrop-blur-sm">
                                <div className="mb-12 text-center">
                                    <h2 className="mb-4 text-3xl font-bold text-slate-900">
                                        How It Works
                                    </h2>
                                    <p className="mx-auto max-w-3xl text-lg text-slate-600">
                                        Get started with our community platform
                                        in just a few simple steps. Build, grow,
                                        and manage your community with ease.
                                    </p>
                                </div>

                                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                                    {/* Step 1 */}
                                    <div className="text-center">
                                        <div className="relative mb-6">
                                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                                <span className="text-2xl font-bold text-blue-600">
                                                    1
                                                </span>
                                            </div>
                                            <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                                                <svg
                                                    className="h-4 w-4 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                        <h3 className="mb-3 text-xl font-semibold text-slate-900">
                                            Sign Up
                                        </h3>
                                        <p className="text-slate-600">
                                            Create your account and choose your
                                            community plan. Get started in
                                            minutes with our simple registration
                                            process.
                                        </p>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="text-center">
                                        <div className="relative mb-6">
                                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                                                <span className="text-2xl font-bold text-emerald-600">
                                                    2
                                                </span>
                                            </div>
                                            <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
                                                <svg
                                                    className="h-4 w-4 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                        <h3 className="mb-3 text-xl font-semibold text-slate-900">
                                            Set Up Your Community
                                        </h3>
                                        <p className="text-slate-600">
                                            Customize your community profile,
                                            add members, and configure your
                                            settings to match your needs.
                                        </p>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="text-center">
                                        <div className="relative mb-6">
                                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                                                <span className="text-2xl font-bold text-purple-600">
                                                    3
                                                </span>
                                            </div>
                                            <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-purple-500">
                                                <svg
                                                    className="h-4 w-4 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                        <h3 className="mb-3 text-xl font-semibold text-slate-900">
                                            Start Engaging
                                        </h3>
                                        <p className="text-slate-600">
                                            Launch events, share content, and
                                            connect with your members. Use our
                                            tools to foster meaningful
                                            interactions.
                                        </p>
                                    </div>

                                    {/* Step 4 */}
                                    <div className="text-center">
                                        <div className="relative mb-6">
                                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                                                <span className="text-2xl font-bold text-orange-600">
                                                    4
                                                </span>
                                            </div>
                                            <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500">
                                                <svg
                                                    className="h-4 w-4 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                        <h3 className="mb-3 text-xl font-semibold text-slate-900">
                                            Grow & Scale
                                        </h3>
                                        <p className="text-slate-600">
                                            Watch your community thrive! Monitor
                                            growth, analyze engagement, and
                                            scale your success with advanced
                                            features.
                                        </p>
                                    </div>
                                </div>

                                {/* Call to Action */}
                                <div className="mt-12 text-center">
                                    {auth.user ? (
                                        <Link
                                            href={route('home')}
                                            className="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-8 py-4 text-lg font-medium text-white shadow-sm transition-colors duration-200 hover:bg-blue-700"
                                        >
                                            Go to My Account
                                            <svg
                                                className="ml-2 h-5 w-5"
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
                                        <Link
                                            href={route('register', {
                                                project: 'community',
                                            })}
                                            className="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-8 py-4 text-lg font-medium text-white shadow-sm transition-colors duration-200 hover:bg-blue-700"
                                        >
                                            Get Started Today
                                            <svg
                                                className="ml-2 h-5 w-5"
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
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Pricing Section */}
                        <div
                            id="pricing"
                            className="mb-16 mt-16 px-4 sm:px-6 lg:px-8"
                        >
                            <div className="mb-12 text-center">
                                <h2 className="mb-4 text-3xl font-bold text-slate-900">
                                    Choose Your Community Plan
                                </h2>
                                <p className="mx-auto max-w-2xl text-lg text-slate-600">
                                    Select the perfect plan for your community
                                    needs. All plans include our core community
                                    features with different levels of support
                                    and integrations.
                                </p>
                                <div className="mx-auto mt-8 max-w-2xl rounded-lg border border-blue-500/20 bg-blue-500/5 px-6 py-4">
                                    <p className="text-center text-base font-medium text-slate-700">
                                        ✅ Access is granted instantly after
                                        purchase — no manual setup required.
                                    </p>
                                </div>
                            </div>

                            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
                                {/* Basic Plan */}
                                <div className="group relative">
                                    <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 transition duration-200 group-hover:opacity-10"></div>
                                    <div className="relative flex h-full flex-col rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition duration-200 hover:shadow-lg">
                                        <div>
                                            <h3 className="mb-2 text-xl font-bold text-slate-900">
                                                {basicPlan?.name || 'Basic'}
                                            </h3>
                                            <p className="mb-6 text-sm text-slate-600">
                                                {basicPlan?.description ||
                                                    'Perfect for small communities and organizations'}
                                            </p>
                                            <p className="mb-6">
                                                <span className="text-3xl font-extrabold text-slate-900">
                                                    {basicPlan?.currency || '₱'}
                                                    {basicPlan?.price || 99}
                                                </span>
                                                <span className="text-sm text-slate-600">
                                                    {basicPlan?.period ||
                                                        '/month'}
                                                </span>
                                            </p>
                                            {auth.user ? (
                                                <Link
                                                    href={route('home')}
                                                    className="block w-full rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-blue-700"
                                                >
                                                    Go to My Account
                                                </Link>
                                            ) : (
                                                <Link
                                                    href={route('register', {
                                                        project: 'community',
                                                        plan:
                                                            basicPlan?.id ||
                                                            'basic',
                                                    })}
                                                    className="block w-full rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-blue-700"
                                                >
                                                    {basicPlan?.buttonText ||
                                                        'Get Started'}
                                                </Link>
                                            )}
                                        </div>
                                        <div className="mt-6 flex-grow">
                                            <ul className="space-y-3">
                                                <li className="flex items-center text-sm">
                                                    <svg
                                                        className="mr-3 h-4 w-4 flex-shrink-0 text-blue-500"
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
                                                    <span className="text-slate-600">
                                                        {basicPlan
                                                            ?.features?.[0] ||
                                                            'All Community Apps'}
                                                    </span>
                                                </li>
                                                <li className="flex items-center text-sm">
                                                    <svg
                                                        className="mr-3 h-4 w-4 flex-shrink-0 text-blue-500"
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
                                                    <span className="text-slate-600">
                                                        {basicPlan
                                                            ?.features?.[1] ||
                                                            'Basic Support'}
                                                    </span>
                                                </li>
                                                <li className="flex items-center text-sm">
                                                    <svg
                                                        className="mr-3 h-4 w-4 flex-shrink-0 text-blue-500"
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
                                                    <span className="text-slate-600">
                                                        {basicPlan
                                                            ?.features?.[2] ||
                                                            'Email Support'}
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Pro Plan */}
                                <div className="group relative lg:-mt-4 lg:mb-4">
                                    <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 transition duration-200"></div>
                                    <div className="relative flex h-full flex-col rounded-xl border-2 border-indigo-500 bg-white p-8 shadow-lg">
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                                            <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800">
                                                Most Popular
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="mb-2 text-xl font-bold text-slate-900">
                                                {proPlan?.name || 'Pro'}
                                            </h3>
                                            <p className="mb-6 text-sm text-slate-600">
                                                {proPlan?.description ||
                                                    'Ideal for growing communities'}
                                            </p>
                                            <p className="mb-6">
                                                <span className="text-3xl font-extrabold text-slate-900">
                                                    {proPlan?.currency || '₱'}
                                                    {proPlan?.price || 199}
                                                </span>
                                                <span className="text-sm text-slate-600">
                                                    {proPlan?.period ||
                                                        '/month'}
                                                </span>
                                            </p>
                                            {auth.user ? (
                                                <Link
                                                    href={route('home')}
                                                    className="block w-full rounded-lg border border-transparent bg-indigo-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-indigo-700"
                                                >
                                                    Go to My Account
                                                </Link>
                                            ) : (
                                                <Link
                                                    href={route('register', {
                                                        project: 'community',
                                                        plan:
                                                            proPlan?.id ||
                                                            'pro',
                                                    })}
                                                    className="block w-full rounded-lg border border-transparent bg-indigo-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-indigo-700"
                                                >
                                                    {proPlan?.buttonText ||
                                                        'Get Started'}
                                                </Link>
                                            )}
                                        </div>
                                        <div className="mt-6 flex-grow">
                                            <ul className="space-y-3">
                                                <li className="flex items-center text-sm">
                                                    <svg
                                                        className="mr-3 h-4 w-4 flex-shrink-0 text-indigo-500"
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
                                                    <span className="text-slate-600">
                                                        All Community Apps
                                                    </span>
                                                </li>
                                                <li className="flex items-center text-sm">
                                                    <svg
                                                        className="mr-3 h-4 w-4 flex-shrink-0 text-indigo-500"
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
                                                    <span className="text-slate-600">
                                                        Email Integration
                                                    </span>
                                                </li>
                                                <li className="flex items-center text-sm">
                                                    <svg
                                                        className="mr-3 h-4 w-4 flex-shrink-0 text-indigo-500"
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
                                                    <span className="text-slate-600">
                                                        SMS Integration
                                                    </span>
                                                </li>
                                                <li className="flex items-center text-sm">
                                                    <svg
                                                        className="mr-3 h-4 w-4 flex-shrink-0 text-indigo-500"
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
                                                    <span className="text-slate-600">
                                                        Priority Support
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Business Plan */}
                                <div className="group relative">
                                    <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 opacity-0 transition duration-200 group-hover:opacity-10"></div>
                                    <div className="relative flex h-full flex-col rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition duration-200 hover:shadow-lg">
                                        <div>
                                            <h3 className="mb-2 text-xl font-bold text-slate-900">
                                                {businessPlan?.name ||
                                                    'Business'}
                                            </h3>
                                            <p className="mb-6 text-sm text-slate-600">
                                                {businessPlan?.description ||
                                                    'Perfect for established communities with advanced needs'}
                                            </p>
                                            <p className="mb-6">
                                                <span className="text-3xl font-extrabold text-slate-900">
                                                    {businessPlan?.currency ||
                                                        '₱'}
                                                    {businessPlan?.price || 299}
                                                </span>
                                                <span className="text-sm text-slate-600">
                                                    {businessPlan?.period ||
                                                        '/month'}
                                                </span>
                                            </p>
                                            {auth.user ? (
                                                <Link
                                                    href={route('home')}
                                                    className="block w-full rounded-lg border border-transparent bg-purple-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-purple-700"
                                                >
                                                    Go to My Account
                                                </Link>
                                            ) : (
                                                <Link
                                                    href={route('register', {
                                                        project: 'community',
                                                        plan:
                                                            businessPlan?.id ||
                                                            'business',
                                                    })}
                                                    className="block w-full rounded-lg border border-transparent bg-purple-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-purple-700"
                                                >
                                                    {businessPlan?.buttonText ||
                                                        'Get Started'}
                                                </Link>
                                            )}
                                        </div>
                                        <div className="mt-6 flex-grow">
                                            <ul className="space-y-3">
                                                <li className="flex items-center text-sm">
                                                    <svg
                                                        className="mr-3 h-4 w-4 flex-shrink-0 text-purple-500"
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
                                                    <span className="text-slate-600">
                                                        All Community Apps
                                                    </span>
                                                </li>
                                                <li className="flex items-center text-sm">
                                                    <svg
                                                        className="mr-3 h-4 w-4 flex-shrink-0 text-purple-500"
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
                                                    <span className="text-slate-600">
                                                        Email Integration
                                                    </span>
                                                </li>
                                                <li className="flex items-center text-sm">
                                                    <svg
                                                        className="mr-3 h-4 w-4 flex-shrink-0 text-purple-500"
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
                                                    <span className="text-slate-600">
                                                        SMS Integration
                                                    </span>
                                                </li>
                                                <li className="flex items-center text-sm">
                                                    <svg
                                                        className="mr-3 h-4 w-4 flex-shrink-0 text-purple-500"
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
                                                    <span className="text-slate-600">
                                                        Priority Support
                                                    </span>
                                                </li>

                                                <li className="flex items-center text-sm">
                                                    <svg
                                                        className="mr-3 h-4 w-4 flex-shrink-0 text-purple-500"
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
                                                    <span className="text-slate-600">
                                                        AI-Powered Automation
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* FAQ Section */}
                            <div className="mt-16">
                                <div className="rounded-2xl border border-white/20 bg-white/80 p-8 shadow-lg backdrop-blur-sm">
                                    <h3 className="mb-8 text-center text-2xl font-bold text-slate-900">
                                        Frequently Asked Questions
                                    </h3>
                                    <div className="w-full">
                                        <dl className="space-y-6">
                                            <div className="rounded-lg border border-slate-200 bg-white p-6">
                                                <dt className="mb-2 text-lg font-medium text-slate-900">
                                                    Can I change plans later?
                                                </dt>
                                                <dd className="text-slate-600">
                                                    Yes, you can upgrade or
                                                    downgrade your plan at any
                                                    time. Changes will be
                                                    reflected in your next
                                                    billing cycle.
                                                </dd>
                                            </div>
                                            <div className="rounded-lg border border-slate-200 bg-white p-6">
                                                <dt className="mb-2 text-lg font-medium text-slate-900">
                                                    What payment methods do you
                                                    accept?
                                                </dt>
                                                <dd className="text-slate-600">
                                                    We accept Visa, Mastercard,
                                                    JCB, or AMEX credit or debit
                                                    card. You can also use
                                                    e-Wallets such as Maya,
                                                    GCash, WeChat Pay,
                                                    ShopeePay, and more via QR
                                                    Ph.
                                                </dd>
                                            </div>
                                            <div className="rounded-lg border border-slate-200 bg-white p-6">
                                                <dt className="mb-2 text-lg font-medium text-slate-900">
                                                    Do you offer refunds?
                                                </dt>
                                                <dd className="text-slate-600">
                                                    Yes, we offer a 30-day
                                                    money-back guarantee for all
                                                    paid plans.
                                                </dd>
                                            </div>
                                            <div className="rounded-lg border border-slate-200 bg-white p-6">
                                                <dt className="mb-2 text-lg font-medium text-slate-900">
                                                    What kind of support do you
                                                    provide?
                                                </dt>
                                                <dd className="text-slate-600">
                                                    All support is provided via
                                                    our online helpdesk and
                                                    email channels. All plans
                                                    include email support. Pro
                                                    and Business plans include
                                                    priority support with faster
                                                    response times.
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>
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
                                        <ApplicationLogo className="block h-8 w-auto fill-current text-white" />
                                        <span className="ml-2 text-xl font-bold">
                                            {hostname} Community
                                        </span>
                                    </div>
                                    <p className="mb-4 max-w-md text-slate-300">
                                        Connecting communities and fostering
                                        meaningful relationships through our
                                        secure and trusted platform.
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
                                                href={route('community.about')}
                                                className="text-sm text-slate-300 transition-colors hover:text-white"
                                            >
                                                About Us
                                            </Link>
                                        </li>
                                        <li>
                                            <Link
                                                href={route('community.help')}
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
                                                href={route(
                                                    'terms-and-conditions',
                                                )}
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
                                        Community. All rights reserved.
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
            </div>
        </>
    );
}
