import { getPricingForService } from '@/config/pricing';
import { formatCurrency, getHost } from '@/lib/utils';
import {
    faBolt,
    faChartLine,
    faCheckCircle,
    faUserMd,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link } from '@inertiajs/react';
import React, { useMemo, useState } from 'react';

interface PageProps {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
}

export default function Medical({ auth }: PageProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const hostname = getHost();

    // Get currency and symbol from URL params, default to USD and $
    const urlParams = useMemo(
        () => new URLSearchParams(window.location.search),
        [],
    );
    const currency = urlParams.get('currency') || 'usd';
    const symbol = urlParams.get('symbol') || '$';

    const pricing = getPricingForService('medical', currency, symbol);
    const starterPlan = pricing?.plans.find((plan) => plan.id === 'starter');
    const basicPlan = pricing?.plans.find((plan) => plan.id === 'basic');
    const proPlan = pricing?.plans.find((plan) => plan.id === 'pro');
    const businessPlan = pricing?.plans.find((plan) => plan.id === 'business');

    return (
        <React.Fragment>
            <Head
                title={`${hostname} Medical - Professional Healthcare Management`}
            />
            <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-100">
                {/* Header */}
                <div className="border-b border-teal-700 bg-gradient-to-r from-teal-800 to-emerald-900 shadow-lg">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        <div className="relative flex items-center justify-center lg:justify-between">
                            {/* Mobile menu button */}
                            <div className="absolute left-0 lg:hidden">
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center rounded-md p-2 text-white transition-colors duration-200 hover:bg-teal-700 hover:text-teal-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
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
                                    <div className="rounded-lg bg-teal-800 p-2">
                                        <FontAwesomeIcon
                                            icon={faUserMd}
                                            className="h-6 w-6 text-white"
                                        />
                                    </div>
                                </div>
                                <h1 className="text-xl font-bold text-white">
                                    {hostname} Medical
                                </h1>
                            </div>

                            {/* Desktop Navigation Menu */}
                            <div className="hidden items-center space-x-8 lg:flex">
                                <Link
                                    href="#features"
                                    className="text-sm font-medium text-white transition-colors duration-200 hover:text-teal-100"
                                >
                                    Features
                                </Link>
                                <Link
                                    href="#pricing"
                                    className="text-sm font-medium text-white transition-colors duration-200 hover:text-teal-100"
                                >
                                    Pricing
                                </Link>
                            </div>

                            {/* Desktop Auth Buttons */}
                            <div className="hidden items-center space-x-4 lg:flex">
                                {auth.user ? (
                                    <Link
                                        href={route('home')}
                                        className="inline-flex items-center rounded-lg border border-teal-300 bg-white px-4 py-2 text-sm font-medium text-teal-800 shadow-sm transition-colors duration-200 hover:bg-teal-50"
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
                                    <React.Fragment>
                                        <Link
                                            href={route('login', {
                                                project: 'medical',
                                            })}
                                            className="text-sm font-medium text-teal-300 transition-colors hover:text-white"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href={route('register', {
                                                project: 'medical',
                                            })}
                                            className="inline-flex items-center rounded-lg border border-transparent bg-teal-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-teal-800"
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
                                    </React.Fragment>
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
                            className={`fixed left-0 top-0 z-50 h-full w-full transform bg-gradient-to-r from-teal-800 to-emerald-900 shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                            id="mobile-menu"
                        >
                            {/* Header with close button */}
                            <div className="flex items-center justify-between border-b border-teal-700 p-6">
                                <div className="flex items-center space-x-3">
                                    <div className="rounded-lg bg-teal-800 p-2">
                                        <FontAwesomeIcon
                                            icon={faUserMd}
                                            className="h-6 w-6 text-white"
                                        />
                                    </div>
                                    <span className="text-lg font-bold text-white">
                                        {hostname} Medical
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="rounded-md p-2 text-white transition-colors duration-200 hover:bg-teal-700 hover:text-teal-100"
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
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-200">
                                        Navigation
                                    </h3>
                                    <Link
                                        href="#features"
                                        className="block rounded-lg px-3 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-teal-700 hover:text-teal-100"
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        Features
                                    </Link>
                                    <Link
                                        href="#pricing"
                                        className="block rounded-lg px-3 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-teal-700 hover:text-teal-100"
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        Pricing
                                    </Link>
                                </div>

                                <div className="space-y-4 border-t border-teal-700 pt-6">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-teal-200">
                                        Account
                                    </h3>
                                    {auth.user ? (
                                        <Link
                                            href={route('home')}
                                            className="block w-full rounded-lg bg-white px-4 py-3 text-center text-base font-medium text-teal-800 transition-colors duration-200 hover:bg-teal-50"
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
                                                    project: 'medical',
                                                })}
                                                className="block w-full rounded-lg border border-white/20 px-4 py-3 text-center text-base font-medium text-white transition-colors duration-200 hover:bg-teal-700 hover:text-teal-100"
                                                onClick={() =>
                                                    setIsMobileMenuOpen(false)
                                                }
                                            >
                                                Login
                                            </Link>
                                            <Link
                                                href={route('register', {
                                                    project: 'medical',
                                                })}
                                                className="block w-full rounded-lg bg-white px-4 py-3 text-center text-base font-medium text-teal-800 transition-colors duration-200 hover:bg-teal-50"
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
                                <div className="mb-6 inline-flex items-center rounded-full bg-teal-100 px-4 py-2 text-sm font-medium text-teal-700">
                                    <FontAwesomeIcon
                                        icon={faCheckCircle}
                                        className="mr-2 h-4 w-4 text-emerald-600"
                                    />
                                    Trusted by 200+ Clinics
                                </div>
                            </div>
                            <h2 className="mb-6 text-4xl font-bold leading-tight text-teal-900 lg:text-6xl">
                                Professional
                                <span className="block text-teal-600">
                                    Healthcare Management
                                </span>
                            </h2>
                            <p className="mx-auto mb-8 max-w-4xl text-xl leading-relaxed text-teal-600 lg:text-2xl">
                                Streamline your clinic operations with our
                                comprehensive healthcare management platform.
                                Manage patients, appointments, and medical
                                records with precision and reliability.
                            </p>
                            <div className="mx-auto mb-8 max-w-3xl rounded-lg border border-teal-200 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
                                <p className="text-center text-sm text-teal-700">
                                    <span className="font-semibold">
                                        Fully Automated SaaS Platform
                                    </span>{' '}
                                    — Subscribe and start managing operations
                                    instantly after purchase. No manual setup
                                    required.
                                </p>
                            </div>
                        </div>

                        {/* Features Section */}
                        <div className="mt-20 lg:mt-24">
                            <div className="mb-12">
                                <h3 className="mb-4 text-3xl font-bold text-teal-900 lg:text-4xl">
                                    Comprehensive Healthcare Solutions
                                </h3>
                                <p className="mx-auto max-w-3xl text-lg text-teal-600">
                                    Our platform provides everything you need to
                                    manage your clinic operations efficiently
                                    and professionally.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                                <div className="rounded-xl border border-teal-200 bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                    <div className="mb-6 flex items-center">
                                        <div className="rounded-xl bg-emerald-100 p-3">
                                            <FontAwesomeIcon
                                                icon={faUserMd}
                                                className="h-8 w-8 text-emerald-600"
                                            />
                                        </div>
                                    </div>
                                    <h4 className="mb-3 text-xl font-bold text-teal-900">
                                        Patient Management
                                    </h4>
                                    <p className="leading-relaxed text-teal-600">
                                        Comprehensive patient records, medical
                                        history tracking, and appointment
                                        scheduling for seamless healthcare
                                        delivery.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-teal-200 bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                    <div className="mb-6 flex items-center">
                                        <div className="rounded-xl bg-cyan-100 p-3">
                                            <FontAwesomeIcon
                                                icon={faChartLine}
                                                className="h-8 w-8 text-cyan-700"
                                            />
                                        </div>
                                    </div>
                                    <h4 className="mb-3 text-xl font-bold text-teal-900">
                                        Medical Analytics
                                    </h4>
                                    <p className="leading-relaxed text-teal-600">
                                        Advanced reporting and analytics to
                                        track patient outcomes, clinic
                                        performance, and optimize healthcare
                                        delivery.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-teal-200 bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                    <div className="mb-6 flex items-center">
                                        <div className="rounded-xl bg-teal-100 p-3">
                                            <FontAwesomeIcon
                                                icon={faBolt}
                                                className="h-8 w-8 text-teal-600"
                                            />
                                        </div>
                                    </div>
                                    <h4 className="mb-3 text-xl font-bold text-teal-900">
                                        Smart Automation
                                    </h4>
                                    <p className="leading-relaxed text-teal-600">
                                        Automated appointment reminders,
                                        prescription management, and intelligent
                                        scheduling to streamline operations.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Trust Indicators */}
                        <div className="mt-20 rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50 p-8 shadow-lg lg:mt-24 lg:p-12">
                            <h3 className="mb-8 text-center text-2xl font-bold text-teal-900 lg:text-3xl">
                                Trusted by Healthcare Professionals
                            </h3>
                            <div className="grid grid-cols-2 items-center gap-8 md:grid-cols-4">
                                <div className="text-center">
                                    <div className="mb-2 text-3xl font-bold text-teal-800">
                                        200+
                                    </div>
                                    <div className="text-teal-600">
                                        Active Clinics
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="mb-2 text-3xl font-bold text-teal-800">
                                        50K+
                                    </div>
                                    <div className="text-teal-600">
                                        Patients Managed
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="mb-2 text-3xl font-bold text-teal-800">
                                        99.9%
                                    </div>
                                    <div className="text-teal-600">Uptime</div>
                                </div>
                                <div className="text-center">
                                    <div className="mb-2 text-3xl font-bold text-teal-800">
                                        24/7
                                    </div>
                                    <div className="text-teal-600">Support</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Free Trial Section */}
                <div className="mb-16 mt-16 px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 p-1 shadow-2xl">
                            <div className="rounded-xl bg-white p-8 md:p-12">
                                <div className="text-center">
                                    <div className="mb-4 inline-flex items-center rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-800">
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
                                        14-Day Free Trial
                                    </div>
                                    <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                                        Try Our Medical Platform Risk-Free
                                    </h2>
                                    <p className="mb-6 text-lg text-gray-600">
                                        {starterPlan?.description ||
                                            'Test drive all features with zero commitment and zero cost'}
                                    </p>
                                    {starterPlan?.tagline && (
                                        <p className="mb-8 text-base italic text-gray-500">
                                            {starterPlan.tagline}
                                        </p>
                                    )}
                                    <div className="mb-8">
                                        <div className="mb-2 text-5xl font-extrabold text-teal-600">
                                            {formatCurrency(
                                                starterPlan?.price || 0,
                                                starterPlan?.currency || '$',
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            No credit card required • Cancel
                                            anytime
                                        </p>
                                    </div>
                                    {auth.user ? (
                                        <Link
                                            href={route('home')}
                                            className="inline-flex items-center justify-center rounded-lg bg-teal-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-teal-700 hover:shadow-xl"
                                        >
                                            Go to My Account
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('register', {
                                                project: 'medical',
                                                plan:
                                                    starterPlan?.id ||
                                                    'starter',
                                            })}
                                            className="inline-flex items-center justify-center rounded-lg bg-teal-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-teal-700 hover:shadow-xl"
                                        >
                                            {starterPlan?.buttonText ||
                                                'Start Free Trial'}
                                            <svg
                                                className="ml-2 h-5 w-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                                />
                                            </svg>
                                        </Link>
                                    )}
                                    <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                                        {(
                                            starterPlan?.features || [
                                                'Explore all core features before committing',
                                            ]
                                        ).map((feature, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center"
                                            >
                                                <svg
                                                    className="mr-2 h-5 w-5 text-teal-500"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                {feature}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing Section */}
                <div id="pricing" className="mb-16 mt-16 px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-teal-900">
                            Choose Your Paid Plan
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-teal-600">
                            After your free trial, select the perfect plan for
                            your clinic operations. All plans include our core
                            healthcare management features with different levels
                            of support and integrations.
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Basic Plan */}
                        <div className="group relative">
                            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 opacity-0 transition duration-200 group-hover:opacity-10"></div>
                            <div className="relative flex h-full flex-col rounded-xl border border-teal-200 bg-white p-8 shadow-sm transition duration-200 hover:shadow-lg">
                                <div>
                                    <h3 className="mb-2 text-xl font-bold text-teal-900">
                                        {basicPlan?.name || 'Basic'}
                                    </h3>
                                    <p className="mb-3 text-sm text-teal-600">
                                        {basicPlan?.description ||
                                            'Perfect for small clinics and startups'}
                                    </p>
                                    {basicPlan?.tagline && (
                                        <p className="mb-4 text-xs italic text-teal-500">
                                            {basicPlan.tagline}
                                        </p>
                                    )}
                                    <p className="mb-6">
                                        <span className="text-3xl font-extrabold text-teal-900">
                                            {formatCurrency(
                                                basicPlan?.price || 0,
                                                basicPlan?.currency || '$',
                                            )}
                                        </span>
                                        <span className="text-sm text-teal-600">
                                            {basicPlan?.period || '/month'}
                                        </span>
                                    </p>
                                    {auth.user ? (
                                        <Link
                                            href={route('home')}
                                            className="block w-full rounded-lg border border-transparent bg-teal-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-teal-700"
                                        >
                                            Go to My Account
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('register', {
                                                project: 'medical',
                                                plan: 'basic',
                                            })}
                                            className="block w-full rounded-lg border border-transparent bg-teal-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-teal-700"
                                        >
                                            Get Started
                                        </Link>
                                    )}
                                </div>
                                <div className="mt-6 flex-grow">
                                    <ul className="space-y-3">
                                        <li className="flex items-center text-sm">
                                            <svg
                                                className="mr-3 h-4 w-4 flex-shrink-0 text-teal-500"
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
                                            <span className="text-teal-600">
                                                Up to 5 doctors
                                            </span>
                                        </li>
                                        <li className="flex items-center text-sm">
                                            <svg
                                                className="mr-3 h-4 w-4 flex-shrink-0 text-teal-500"
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
                                            <span className="text-teal-600">
                                                Patient management
                                            </span>
                                        </li>
                                        <li className="flex items-center text-sm">
                                            <svg
                                                className="mr-3 h-4 w-4 flex-shrink-0 text-teal-500"
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
                                            <span className="text-teal-600">
                                                Email support
                                            </span>
                                        </li>
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
                                    <h3 className="mb-2 text-xl font-bold text-teal-900">
                                        {proPlan?.name || 'Pro'}
                                    </h3>
                                    <p className="mb-3 text-sm text-teal-600">
                                        {proPlan?.description ||
                                            'Ideal for growing medical practices'}
                                    </p>
                                    {proPlan?.tagline && (
                                        <p className="mb-4 text-xs italic text-emerald-600">
                                            {proPlan.tagline}
                                        </p>
                                    )}
                                    <p className="mb-6">
                                        <span className="text-3xl font-extrabold text-teal-900">
                                            {formatCurrency(
                                                proPlan?.price || 0,
                                                proPlan?.currency || '$',
                                            )}
                                        </span>
                                        <span className="text-sm text-teal-600">
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
                                                project: 'medical',
                                                plan: 'professional',
                                            })}
                                            className="block w-full rounded-lg border border-transparent bg-emerald-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-emerald-700"
                                        >
                                            Get Started
                                        </Link>
                                    )}
                                </div>
                                <div className="mt-6 flex-grow">
                                    <ul className="space-y-3">
                                        <li className="flex items-center text-sm">
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
                                            <span className="text-teal-600">
                                                Up to 20 doctors
                                            </span>
                                        </li>
                                        <li className="flex items-center text-sm">
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
                                            <span className="text-teal-600">
                                                Advanced analytics
                                            </span>
                                        </li>
                                        <li className="flex items-center text-sm">
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
                                            <span className="text-teal-600">
                                                Priority support
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Enterprise Plan */}
                        <div className="group relative">
                            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 opacity-0 transition duration-200 group-hover:opacity-10"></div>
                            <div className="relative flex h-full flex-col rounded-xl border border-teal-200 bg-white p-8 shadow-sm transition duration-200 hover:shadow-lg">
                                <div>
                                    <h3 className="mb-2 text-xl font-bold text-teal-900">
                                        {businessPlan?.name || 'Business'}
                                    </h3>
                                    <p className="mb-3 text-sm text-teal-600">
                                        {businessPlan?.description ||
                                            'Perfect for large medical centers'}
                                    </p>
                                    {businessPlan?.tagline && (
                                        <p className="mb-4 text-xs italic text-cyan-600">
                                            {businessPlan.tagline}
                                        </p>
                                    )}
                                    <p className="mb-6">
                                        <span className="text-3xl font-extrabold text-teal-900">
                                            {formatCurrency(
                                                businessPlan?.price || 0,
                                                businessPlan?.currency || '$',
                                            )}
                                        </span>
                                        <span className="text-sm text-teal-600">
                                            {businessPlan?.period || '/month'}
                                        </span>
                                    </p>
                                    {auth.user ? (
                                        <Link
                                            href={route('home')}
                                            className="block w-full rounded-lg border border-transparent bg-cyan-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-cyan-700"
                                        >
                                            Go to My Account
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('register', {
                                                project: 'medical',
                                                plan: 'business',
                                            })}
                                            className="block w-full rounded-lg border border-transparent bg-cyan-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-cyan-700"
                                        >
                                            Get Started
                                        </Link>
                                    )}
                                </div>
                                <div className="mt-6 flex-grow">
                                    <ul className="space-y-3">
                                        <li className="flex items-center text-sm">
                                            <svg
                                                className="mr-3 h-4 w-4 flex-shrink-0 text-cyan-500"
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
                                            <span className="text-teal-600">
                                                Unlimited doctors
                                            </span>
                                        </li>
                                        <li className="flex items-center text-sm">
                                            <svg
                                                className="mr-3 h-4 w-4 flex-shrink-0 text-cyan-500"
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
                                            <span className="text-teal-600">
                                                Custom integrations
                                            </span>
                                        </li>
                                        <li className="flex items-center text-sm">
                                            <svg
                                                className="mr-3 h-4 w-4 flex-shrink-0 text-cyan-500"
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
                                            <span className="text-teal-600">
                                                Priority technical support via
                                                chat and email
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="mt-16">
                        <div className="mx-auto max-w-4xl rounded-2xl border border-teal-200 bg-white/80 p-8 shadow-lg backdrop-blur-sm">
                            <h3 className="mb-8 text-center text-2xl font-bold text-teal-900">
                                Frequently Asked Questions
                            </h3>
                            <div className="w-full">
                                <dl className="space-y-6">
                                    <div className="rounded-lg border border-teal-200 bg-white p-6">
                                        <dt className="mb-2 text-lg font-medium text-teal-900">
                                            What happens if I exceed my doctor
                                            limit?
                                        </dt>
                                        <dd className="text-teal-600">
                                            You can upgrade your plan at any
                                            time. You'll automatically receive a
                                            notification when you're approaching
                                            your limit, with options to upgrade
                                            directly through your dashboard.
                                        </dd>
                                    </div>
                                    <div className="rounded-lg border border-teal-200 bg-white p-6">
                                        <dt className="mb-2 text-lg font-medium text-teal-900">
                                            What training resources are
                                            available for my medical staff?
                                        </dt>
                                        <dd className="text-teal-600">
                                            Yes, we provide comprehensive
                                            self-service training materials,
                                            interactive video tutorials, and
                                            step-by-step onboarding guides.
                                            Business customers can access
                                            optional live onboarding support;
                                            all core training is self-paced and
                                            available immediately.
                                        </dd>
                                    </div>
                                    <div className="rounded-lg border border-teal-200 bg-white p-6">
                                        <dt className="mb-2 text-lg font-medium text-teal-900">
                                            Is my patient data secure and HIPAA
                                            compliant?
                                        </dt>
                                        <dd className="text-teal-600">
                                            Absolutely. We use industry-leading
                                            security measures and are fully
                                            HIPAA compliant to ensure your
                                            patient data is protected at all
                                            times.
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
                    className="mt-8 bg-teal-900 text-white sm:mt-12 lg:mt-16"
                >
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
                        {/* Main Footer Content */}
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                            {/* Company Info - Spans 2 columns on large screens */}
                            <div className="lg:col-span-2">
                                <div className="mb-4 flex items-center">
                                    <div className="mr-3 rounded-lg bg-teal-800 p-2">
                                        <FontAwesomeIcon
                                            icon={faUserMd}
                                            className="h-6 w-6 text-white"
                                        />
                                    </div>
                                    <span className="text-xl font-bold">
                                        Medical
                                    </span>
                                </div>
                                <p className="mb-4 max-w-md text-teal-300">
                                    Streamline your clinic operations with our
                                    comprehensive healthcare management
                                    platform. Manage patients, appointments, and
                                    medical records with precision and
                                    reliability.
                                </p>
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-teal-400">
                                    Quick Links
                                </h3>
                                <ul className="space-y-3">
                                    <li>
                                        <Link
                                            href="#features"
                                            className="text-sm text-teal-300 transition-colors hover:text-white"
                                        >
                                            Features
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#pricing"
                                            className="text-sm text-teal-300 transition-colors hover:text-white"
                                        >
                                            Pricing
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#"
                                            className="text-sm text-teal-300 transition-colors hover:text-white"
                                        >
                                            Help Center
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Legal Links */}
                            <div>
                                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-teal-400">
                                    Legal
                                </h3>
                                <ul className="space-y-3">
                                    <li>
                                        <Link
                                            href={route('privacy-policy')}
                                            className="text-sm text-teal-300 transition-colors hover:text-white"
                                        >
                                            Privacy Policy
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={route('terms-and-conditions')}
                                            className="text-sm text-teal-300 transition-colors hover:text-white"
                                        >
                                            Terms of Service
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={route('cookie-policy')}
                                            className="text-sm text-teal-300 transition-colors hover:text-white"
                                        >
                                            Cookie Policy
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={route('faq')}
                                            className="text-sm text-teal-300 transition-colors hover:text-white"
                                        >
                                            FAQ
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Bottom Footer */}
                        <div className="mt-8 border-t border-teal-800 pt-6 sm:mt-10 sm:pt-8 lg:mt-12">
                            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                                <div className="text-center text-sm text-teal-400 md:text-left">
                                    © {new Date().getFullYear()} {hostname}{' '}
                                    Medical. All rights reserved.
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                                    <div className="flex items-center text-sm text-teal-400">
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
                                        HIPAA Compliant
                                    </div>
                                    <div className="flex items-center text-sm text-teal-400">
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
        </React.Fragment>
    );
}
