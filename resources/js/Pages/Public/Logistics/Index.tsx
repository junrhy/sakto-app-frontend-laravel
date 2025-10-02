import { getPricingForService } from '@/config/pricing';
import {
    faBolt,
    faChartLine,
    faCheckCircle,
    faTruck,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link } from '@inertiajs/react';

interface PageProps {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
}

export default function LogisticsIndex({ auth }: PageProps) {
    const pricing = getPricingForService('logistics');
    const basicPlan = pricing?.plans.find((plan) => plan.id === 'basic');
    const proPlan = pricing?.plans.find((plan) => plan.id === 'pro');
    const businessPlan = pricing?.plans.find((plan) => plan.id === 'business');

    return (
        <>
            <Head title="Logistics - Professional Fleet Management" />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100">
                {/* Header */}
                <div className="border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="rounded-lg bg-slate-800 p-2">
                                        <FontAwesomeIcon
                                            icon={faTruck}
                                            className="h-6 w-6 text-white"
                                        />
                                    </div>
                                </div>
                                <h1 className="text-xl font-bold text-white">
                                    Logistics
                                </h1>
                            </div>
                            <div className="flex items-center space-x-6">
                                {auth.user ? (
                                    <Link
                                        href={route('home')}
                                        className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition-colors duration-200 hover:bg-slate-50"
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
                                                project: 'logistics',
                                            })}
                                            className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href={route('register', {
                                                project: 'logistics',
                                            })}
                                            className="inline-flex items-center rounded-lg border border-transparent bg-slate-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-slate-800"
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
                    </div>
                </div>

                {/* Main Content */}
                <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                    <div className="text-center">
                        {/* Hero Section */}
                        <div className="mb-16 lg:mb-20">
                            <div className="mb-8">
                                <div className="mb-6 inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                                    <FontAwesomeIcon
                                        icon={faCheckCircle}
                                        className="mr-2 h-4 w-4 text-emerald-600"
                                    />
                                    Trusted by 500+ Companies
                                </div>
                            </div>
                            <h2 className="mb-6 text-4xl font-bold leading-tight text-slate-900 lg:text-6xl">
                                Professional
                                <span className="block text-slate-600">
                                    Fleet Management
                                </span>
                            </h2>
                            <p className="mx-auto mb-8 max-w-4xl text-xl leading-relaxed text-slate-600 lg:text-2xl">
                                Streamline your logistics operations with our
                                comprehensive fleet management platform. Track,
                                optimize, and manage your transportation network
                                with precision and reliability.
                            </p>
                        </div>

                        {/* Features Section */}
                        <div className="mt-20 lg:mt-24">
                            <div className="mb-12">
                                <h3 className="mb-4 text-3xl font-bold text-slate-900 lg:text-4xl">
                                    Comprehensive Fleet Solutions
                                </h3>
                                <p className="mx-auto max-w-3xl text-lg text-slate-600">
                                    Our platform provides everything you need to
                                    manage your logistics operations efficiently
                                    and professionally.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                                <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                    <div className="mb-6 flex items-center">
                                        <div className="rounded-xl bg-emerald-100 p-3">
                                            <FontAwesomeIcon
                                                icon={faTruck}
                                                className="h-8 w-8 text-emerald-600"
                                            />
                                        </div>
                                    </div>
                                    <h4 className="mb-3 text-xl font-bold text-slate-900">
                                        Real-time GPS Tracking
                                    </h4>
                                    <p className="leading-relaxed text-slate-600">
                                        Monitor your entire fleet with precise
                                        GPS tracking, route optimization, and
                                        live status updates for maximum
                                        operational efficiency.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                    <div className="mb-6 flex items-center">
                                        <div className="rounded-xl bg-slate-100 p-3">
                                            <FontAwesomeIcon
                                                icon={faChartLine}
                                                className="h-8 w-8 text-slate-700"
                                            />
                                        </div>
                                    </div>
                                    <h4 className="mb-3 text-xl font-bold text-slate-900">
                                        Advanced Analytics
                                    </h4>
                                    <p className="leading-relaxed text-slate-600">
                                        Comprehensive reporting and analytics to
                                        optimize fuel consumption, maintenance
                                        schedules, and overall fleet
                                        performance.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                    <div className="mb-6 flex items-center">
                                        <div className="rounded-xl bg-blue-100 p-3">
                                            <FontAwesomeIcon
                                                icon={faBolt}
                                                className="h-8 w-8 text-blue-600"
                                            />
                                        </div>
                                    </div>
                                    <h4 className="mb-3 text-xl font-bold text-slate-900">
                                        Smart Automation
                                    </h4>
                                    <p className="leading-relaxed text-slate-600">
                                        Intelligent route planning, automated
                                        dispatching, and predictive maintenance
                                        to streamline your operations.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Trust Indicators */}
                        <div className="mt-20 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 p-8 shadow-lg lg:mt-24 lg:p-12">
                            <h3 className="mb-8 text-center text-2xl font-bold text-slate-900 lg:text-3xl">
                                Trusted by Industry Leaders
                            </h3>
                            <div className="grid grid-cols-2 items-center gap-8 md:grid-cols-4">
                                <div className="text-center">
                                    <div className="mb-2 text-3xl font-bold text-slate-800">
                                        500+
                                    </div>
                                    <div className="text-slate-600">
                                        Active Fleets
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="mb-2 text-3xl font-bold text-slate-800">
                                        10K+
                                    </div>
                                    <div className="text-slate-600">
                                        Vehicles Tracked
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="mb-2 text-3xl font-bold text-slate-800">
                                        99.9%
                                    </div>
                                    <div className="text-slate-600">Uptime</div>
                                </div>
                                <div className="text-center">
                                    <div className="mb-2 text-3xl font-bold text-slate-800">
                                        24/7
                                    </div>
                                    <div className="text-slate-600">
                                        Support
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing Section */}
                <div id="pricing" className="mb-16 mt-16">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-slate-900">
                            Choose Your Fleet Management Plan
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-slate-600">
                            Select the perfect plan for your logistics
                            operations. All plans include our core fleet
                            management features with different levels of support
                            and integrations.
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Basic Plan */}
                        <div className="group relative">
                            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-slate-500 to-slate-600 opacity-0 transition duration-200 group-hover:opacity-10"></div>
                            <div className="relative flex h-full flex-col rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition duration-200 hover:shadow-lg">
                                <div>
                                    <h3 className="mb-2 text-xl font-bold text-slate-900">
                                        {basicPlan?.name || 'Basic'}
                                    </h3>
                                    <p className="mb-6 text-sm text-slate-600">
                                        {basicPlan?.description ||
                                            'Perfect for small fleets and startups'}
                                    </p>
                                    <p className="mb-6">
                                        <span className="text-3xl font-extrabold text-slate-900">
                                            {basicPlan?.currency || '₱'}
                                            {basicPlan?.price || 299}
                                        </span>
                                        <span className="text-sm text-slate-600">
                                            {basicPlan?.period || '/month'}
                                        </span>
                                    </p>
                                    {auth.user ? (
                                        <Link
                                            href={route('home')}
                                            className="block w-full rounded-lg border border-transparent bg-slate-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-slate-700"
                                        >
                                            Go to My Account
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('register', {
                                                project: 'logistics',
                                                plan:
                                                    basicPlan?.id || 'starter',
                                            })}
                                            className="block w-full rounded-lg border border-transparent bg-slate-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-slate-700"
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
                                                'Up to 10 vehicles',
                                                'GPS tracking',
                                                'Email support',
                                            ]
                                        ).map((feature, index) => (
                                            <li
                                                key={index}
                                                className="flex items-center text-sm"
                                            >
                                                <svg
                                                    className="mr-3 h-4 w-4 flex-shrink-0 text-slate-500"
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
                            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 opacity-20 transition duration-200"></div>
                            <div className="relative flex h-full flex-col rounded-xl border-2 border-emerald-500 bg-white p-8 shadow-lg">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                                        Most Popular
                                    </span>
                                </div>
                                <div>
                                    <h3 className="mb-2 text-xl font-bold text-slate-900">
                                        {proPlan?.name || 'Pro'}
                                    </h3>
                                    <p className="mb-6 text-sm text-slate-600">
                                        {proPlan?.description ||
                                            'Ideal for growing logistics companies'}
                                    </p>
                                    <p className="mb-6">
                                        <span className="text-3xl font-extrabold text-slate-900">
                                            {proPlan?.currency || '₱'}
                                            {proPlan?.price || 499}
                                        </span>
                                        <span className="text-sm text-slate-600">
                                            {proPlan?.period || '/month'}
                                        </span>
                                    </p>
                                    {auth.user ? (
                                        <Link
                                            href={route('home')}
                                            className="block w-full rounded-lg border border-transparent bg-emerald-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-emerald-700"
                                        >
                                            Go to My Account
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('register', {
                                                project: 'logistics',
                                                plan:
                                                    proPlan?.id ||
                                                    'professional',
                                            })}
                                            className="block w-full rounded-lg border border-transparent bg-emerald-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-emerald-700"
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
                                                'Up to 50 vehicles',
                                                'GPS tracking',
                                                'Analytics dashboard',
                                                'Priority support',
                                            ]
                                        ).map((feature, index) => (
                                            <li
                                                key={index}
                                                className="flex items-center text-sm"
                                            >
                                                <svg
                                                    className="mr-3 h-4 w-4 flex-shrink-0 text-emerald-500"
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
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Enterprise Plan */}
                        <div className="group relative">
                            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 transition duration-200 group-hover:opacity-10"></div>
                            <div className="relative flex h-full flex-col rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition duration-200 hover:shadow-lg">
                                <div>
                                    <h3 className="mb-2 text-xl font-bold text-slate-900">
                                        {businessPlan?.name || 'Business'}
                                    </h3>
                                    <p className="mb-6 text-sm text-slate-600">
                                        {businessPlan?.description ||
                                            'Perfect for large-scale operations'}
                                    </p>
                                    <p className="mb-6">
                                        <span className="text-3xl font-extrabold text-slate-900">
                                            {businessPlan?.currency || '₱'}
                                            {businessPlan?.price || 699}
                                        </span>
                                        <span className="text-sm text-slate-600">
                                            {businessPlan?.period || '/month'}
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
                                                project: 'logistics',
                                                plan:
                                                    businessPlan?.id ||
                                                    'enterprise',
                                            })}
                                            className="block w-full rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-blue-700"
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
                                                'Unlimited vehicles',
                                                'GPS tracking',
                                                'Advanced analytics',
                                            ]
                                        ).map((feature, index) => (
                                            <li
                                                key={index}
                                                className="flex items-center text-sm"
                                            >
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
                        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-lg backdrop-blur-sm">
                            <h3 className="mb-8 text-center text-2xl font-bold text-slate-900">
                                Frequently Asked Questions
                            </h3>
                            <div className="w-full">
                                <dl className="space-y-6">
                                    <div className="rounded-lg border border-slate-200 bg-white p-6">
                                        <dt className="mb-2 text-lg font-medium text-slate-900">
                                            What happens if I exceed my vehicle
                                            limit?
                                        </dt>
                                        <dd className="text-slate-600">
                                            You can upgrade your plan at any
                                            time. We'll notify you when you're
                                            approaching your limit and help you
                                            choose the right plan for your
                                            growing fleet.
                                        </dd>
                                    </div>
                                    <div className="rounded-lg border border-slate-200 bg-white p-6">
                                        <dt className="mb-2 text-lg font-medium text-slate-900">
                                            Do you offer training for my team?
                                        </dt>
                                        <dd className="text-slate-600">
                                            Yes, we provide comprehensive
                                            training materials, video tutorials,
                                            and live training sessions.
                                            Enterprise customers receive
                                            dedicated onboarding support.
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer id="contact" className="mt-16 bg-slate-900 text-white">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                            {/* Company Info */}
                            <div className="col-span-1 md:col-span-2">
                                <div className="mb-4 flex items-center">
                                    <div className="mr-3 rounded-lg bg-slate-800 p-2">
                                        <FontAwesomeIcon
                                            icon={faTruck}
                                            className="h-6 w-6 text-white"
                                        />
                                    </div>
                                    <span className="text-xl font-bold">
                                        Logistika
                                    </span>
                                </div>
                                <p className="mb-4 max-w-md text-slate-300">
                                    Streamline your logistics operations with
                                    our comprehensive fleet management platform.
                                    Track, optimize, and manage your
                                    transportation network with precision and
                                    reliability.
                                </p>
                                <div className="flex space-x-4">
                                    <a
                                        href="#"
                                        className="text-slate-400 transition-colors hover:text-white"
                                    >
                                        <span className="sr-only">
                                            Facebook
                                        </span>
                                        <svg
                                            className="h-6 w-6"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </a>
                                    <a
                                        href="#"
                                        className="text-slate-400 transition-colors hover:text-white"
                                    >
                                        <span className="sr-only">
                                            LinkedIn
                                        </span>
                                        <svg
                                            className="h-6 w-6"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </a>
                                </div>
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
                        <div className="mt-12 border-t border-slate-800 pt-8">
                            <div className="flex flex-col items-center justify-between md:flex-row">
                                <div className="text-sm text-slate-400">
                                    © {new Date().getFullYear()} Logistika. All
                                    rights reserved.
                                </div>
                                <div className="mt-4 flex items-center space-x-6 md:mt-0">
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
