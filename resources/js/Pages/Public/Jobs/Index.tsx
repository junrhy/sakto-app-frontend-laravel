import { getPricingForService } from '@/config/pricing';
import {
    faBriefcase,
    faChartLine,
    faHandshake,
    faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

interface PageProps {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
}

export default function JobsIndex({ auth }: PageProps) {
    const pricing = getPricingForService('jobs');
    const basicPlan = pricing?.plans.find((plan) => plan.id === 'basic');
    const proPlan = pricing?.plans.find((plan) => plan.id === 'pro');
    const businessPlan = pricing?.plans.find((plan) => plan.id === 'business');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
            <Head title="Jobs - Find Your Dream Career" />
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
                {/* Header */}
                <div className="border-b border-slate-700 bg-gradient-to-r from-purple-800 to-blue-900 shadow-lg">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        <div className="relative flex items-center justify-center lg:justify-between">
                            {/* Mobile menu button */}
                            <div className="absolute left-0 lg:hidden">
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center rounded-md p-2 text-white transition-colors duration-200 hover:bg-purple-700 hover:text-purple-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
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
                                    <div className="rounded-lg bg-purple-800 p-2">
                                        <FontAwesomeIcon
                                            icon={faBriefcase}
                                            className="h-6 w-6 text-white"
                                        />
                                    </div>
                                </div>
                                <h1 className="text-xl font-bold text-white">
                                    Jobs
                                </h1>
                            </div>

                            {/* Desktop Navigation Menu */}
                            <div className="hidden items-center space-x-8 lg:flex">
                                <Link
                                    href="#features"
                                    className="text-sm font-medium text-white transition-colors duration-200 hover:text-purple-100"
                                >
                                    Features
                                </Link>
                                <Link
                                    href="#pricing"
                                    className="text-sm font-medium text-white transition-colors duration-200 hover:text-purple-100"
                                >
                                    Pricing
                                </Link>
                            </div>

                            {/* Desktop Auth Buttons */}
                            <div className="hidden items-center space-x-4 lg:flex">
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
                                                project: 'jobs',
                                            })}
                                            className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href={route('register', {
                                                project: 'jobs',
                                            })}
                                            className="inline-flex items-center rounded-lg border border-transparent bg-purple-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-purple-800"
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
                            className={`fixed left-0 top-0 z-50 h-full w-full transform bg-gradient-to-r from-purple-800 to-blue-900 shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                            id="mobile-menu"
                        >
                            {/* Header with close button */}
                            <div className="flex items-center justify-between border-b border-purple-700 p-6">
                                <div className="flex items-center space-x-3">
                                    <div className="rounded-lg bg-purple-800 p-2">
                                        <FontAwesomeIcon
                                            icon={faBriefcase}
                                            className="h-6 w-6 text-white"
                                        />
                                    </div>
                                    <span className="text-lg font-bold text-white">
                                        Jobs
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="rounded-md p-2 text-white transition-colors duration-200 hover:bg-purple-700 hover:text-purple-100"
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
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-200">
                                        Navigation
                                    </h3>
                                    <Link
                                        href="#features"
                                        className="block rounded-lg px-3 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-purple-700 hover:text-purple-100"
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        Features
                                    </Link>
                                    <Link
                                        href="#pricing"
                                        className="block rounded-lg px-3 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-purple-700 hover:text-purple-100"
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        Pricing
                                    </Link>
                                </div>

                                <div className="space-y-4 border-t border-purple-700 pt-6">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-purple-200">
                                        Account
                                    </h3>
                                    {auth.user ? (
                                        <Link
                                            href={route('home')}
                                            className="block w-full rounded-lg bg-white px-4 py-3 text-center text-base font-medium text-purple-800 transition-colors duration-200 hover:bg-slate-50"
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
                                                    project: 'jobs',
                                                })}
                                                className="block w-full rounded-lg border border-white/20 px-4 py-3 text-center text-base font-medium text-white transition-colors duration-200 hover:bg-purple-700 hover:text-purple-100"
                                                onClick={() =>
                                                    setIsMobileMenuOpen(false)
                                                }
                                            >
                                                Login
                                            </Link>
                                            <Link
                                                href={route('register', {
                                                    project: 'jobs',
                                                })}
                                                className="block w-full rounded-lg bg-white px-4 py-3 text-center text-base font-medium text-purple-800 transition-colors duration-200 hover:bg-slate-50"
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
                                <div className="mb-6 inline-flex items-center rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700">
                                    <FontAwesomeIcon
                                        icon={faUsers}
                                        className="mr-2 h-4 w-4 text-purple-600"
                                    />
                                    Trusted by 10,000+ Job Seekers
                                </div>
                            </div>
                            <h2 className="mb-6 text-4xl font-bold leading-tight text-slate-900 lg:text-6xl">
                                Find Your Dream
                                <span className="block text-purple-600">
                                    Career
                                </span>
                            </h2>
                            <p className="mx-auto mb-8 max-w-4xl text-xl leading-relaxed text-slate-600 lg:text-2xl">
                                Connect with top employers and discover
                                opportunities that match your skills and
                                aspirations. Build your career with our
                                comprehensive job platform.
                            </p>
                            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                                <Link
                                    href={route('jobs.show', {
                                        identifier: 'browse',
                                    })}
                                    className="inline-flex items-center rounded-lg border border-transparent bg-purple-600 px-8 py-3 text-base font-medium text-white shadow-sm transition-colors duration-200 hover:bg-purple-700"
                                >
                                    Browse Jobs
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
                                {!auth.user && (
                                    <Link
                                        href={route('register', {
                                            project: 'jobs',
                                        })}
                                        className="inline-flex items-center rounded-lg border border-purple-600 bg-white px-8 py-3 text-base font-medium text-purple-600 shadow-sm transition-colors duration-200 hover:bg-purple-50"
                                    >
                                        Get Started Free
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Features Section */}
                        <div className="mt-20 lg:mt-24">
                            <div className="mb-12">
                                <h3 className="mb-4 text-3xl font-bold text-slate-900 lg:text-4xl">
                                    Everything You Need for Your Career
                                </h3>
                                <p className="mx-auto max-w-3xl text-lg text-slate-600">
                                    Our platform provides comprehensive tools
                                    and resources to help you find the perfect
                                    job and advance your career.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                                <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                    <div className="mb-6 flex items-center">
                                        <div className="rounded-xl bg-purple-100 p-3">
                                            <FontAwesomeIcon
                                                icon={faBriefcase}
                                                className="h-8 w-8 text-purple-600"
                                            />
                                        </div>
                                    </div>
                                    <h4 className="mb-3 text-xl font-bold text-slate-900">
                                        Job Matching
                                    </h4>
                                    <p className="leading-relaxed text-slate-600">
                                        Our smart algorithm matches you with
                                        relevant job opportunities based on your
                                        skills, experience, and career
                                        preferences.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                    <div className="mb-6 flex items-center">
                                        <div className="rounded-xl bg-blue-100 p-3">
                                            <FontAwesomeIcon
                                                icon={faChartLine}
                                                className="h-8 w-8 text-blue-600"
                                            />
                                        </div>
                                    </div>
                                    <h4 className="mb-3 text-xl font-bold text-slate-900">
                                        Career Analytics
                                    </h4>
                                    <p className="leading-relaxed text-slate-600">
                                        Track your job search progress, analyze
                                        market trends, and get insights to
                                        improve your career prospects.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                    <div className="mb-6 flex items-center">
                                        <div className="rounded-xl bg-green-100 p-3">
                                            <FontAwesomeIcon
                                                icon={faHandshake}
                                                className="h-8 w-8 text-green-600"
                                            />
                                        </div>
                                    </div>
                                    <h4 className="mb-3 text-xl font-bold text-slate-900">
                                        Professional Network
                                    </h4>
                                    <p className="leading-relaxed text-slate-600">
                                        Connect with industry professionals,
                                        mentors, and potential employers to
                                        expand your professional network.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Trust Indicators */}
                        <div className="mt-20 rounded-2xl border border-slate-200 bg-gradient-to-r from-purple-50 to-blue-50 p-8 shadow-lg lg:mt-24 lg:p-12">
                            <h3 className="mb-8 text-center text-2xl font-bold text-slate-900 lg:text-3xl">
                                Trusted by Job Seekers & Employers
                            </h3>
                            <div className="grid grid-cols-2 items-center gap-8 md:grid-cols-4">
                                <div className="text-center">
                                    <div className="mb-2 text-3xl font-bold text-slate-800">
                                        10K+
                                    </div>
                                    <div className="text-slate-600">
                                        Job Seekers
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="mb-2 text-3xl font-bold text-slate-800">
                                        5K+
                                    </div>
                                    <div className="text-slate-600">
                                        Companies
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="mb-2 text-3xl font-bold text-slate-800">
                                        15K+
                                    </div>
                                    <div className="text-slate-600">
                                        Jobs Posted
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="mb-2 text-3xl font-bold text-slate-800">
                                        85%
                                    </div>
                                    <div className="text-slate-600">
                                        Success Rate
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing Section */}
                <div id="pricing" className="mb-16 mt-16 px-4 sm:px-6 lg:px-8">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-slate-900">
                            Choose Your Career Plan
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-slate-600">
                            Select the perfect plan for your job search needs.
                            All plans include our core job search features with
                            different levels of support.
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Basic Plan */}
                        <div className="group relative">
                            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-slate-500 to-slate-600 opacity-0 transition duration-200 group-hover:opacity-10"></div>
                            <div className="relative flex h-full flex-col rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition duration-200 hover:shadow-lg">
                                <div>
                                    <h3 className="mb-2 text-xl font-bold text-slate-900">
                                        {basicPlan?.name || 'Job Seeker'}
                                    </h3>
                                    <p className="mb-6 text-sm text-slate-600">
                                        {basicPlan?.description ||
                                            'Perfect for finding your next opportunity'}
                                    </p>
                                    <p className="mb-6">
                                        <span className="text-3xl font-extrabold text-slate-900">
                                            {basicPlan?.currency || ''}
                                            {basicPlan?.price === 0
                                                ? 'Free'
                                                : `${basicPlan?.currency || '₱'}${basicPlan?.price || 0}`}
                                        </span>
                                        {basicPlan?.period && (
                                            <span className="text-sm text-slate-600">
                                                {basicPlan.period}
                                            </span>
                                        )}
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
                                                project: 'jobs',
                                                plan: basicPlan?.id || 'seeker',
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
                                        <li className="flex items-center text-sm">
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
                                                {basicPlan?.features?.[0] ||
                                                    'Job search & applications'}
                                            </span>
                                        </li>
                                        <li className="flex items-center text-sm">
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
                                                {basicPlan?.features?.[1] ||
                                                    'Basic profile'}
                                            </span>
                                        </li>
                                        <li className="flex items-center text-sm">
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
                                                {basicPlan?.features?.[2] ||
                                                    'Email support'}
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Pro Plan */}
                        <div className="group relative lg:-mt-4 lg:mb-4">
                            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 opacity-20 transition duration-200"></div>
                            <div className="relative flex h-full flex-col rounded-xl border-2 border-purple-500 bg-white p-8 shadow-lg">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                                    <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                                        Most Popular
                                    </span>
                                </div>
                                <div>
                                    <h3 className="mb-2 text-xl font-bold text-slate-900">
                                        {proPlan?.name || 'Professional'}
                                    </h3>
                                    <p className="mb-6 text-sm text-slate-600">
                                        {proPlan?.description ||
                                            'Ideal for serious job seekers'}
                                    </p>
                                    <p className="mb-6">
                                        <span className="text-3xl font-extrabold text-slate-900">
                                            {proPlan?.currency || '₱'}
                                            {proPlan?.price || 199}
                                        </span>
                                        <span className="text-sm text-slate-600">
                                            {proPlan?.period || '/month'}
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
                                                project: 'jobs',
                                                plan:
                                                    proPlan?.id ||
                                                    'professional',
                                            })}
                                            className="block w-full rounded-lg border border-transparent bg-purple-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-purple-700"
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
                                                Everything in Job Seeker
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
                                                Advanced profile features
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
                                                Priority applications
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
                                                Career coaching
                                            </span>
                                        </li>
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
                                        {businessPlan?.name || 'Executive'}
                                    </h3>
                                    <p className="mb-6 text-sm text-slate-600">
                                        {businessPlan?.description ||
                                            'Perfect for senior professionals'}
                                    </p>
                                    <p className="mb-6">
                                        <span className="text-3xl font-extrabold text-slate-900">
                                            {businessPlan?.currency || '₱'}
                                            {businessPlan?.price || 399}
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
                                                project: 'jobs',
                                                plan:
                                                    businessPlan?.id ||
                                                    'executive',
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
                                                Everything in Professional
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
                                                Executive search
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
                                                Personal recruiter
                                            </span>
                                        </li>
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
                                            How do I apply for jobs?
                                        </dt>
                                        <dd className="text-slate-600">
                                            Simply browse our job listings, find
                                            positions that match your skills,
                                            and click "Apply Now". You can track
                                            your applications in your dashboard.
                                        </dd>
                                    </div>
                                    <div className="rounded-lg border border-slate-200 bg-white p-6">
                                        <dt className="mb-2 text-lg font-medium text-slate-900">
                                            Is my personal information secure?
                                        </dt>
                                        <dd className="text-slate-600">
                                            Yes, we take data security
                                            seriously. Your personal information
                                            is encrypted and protected. We never
                                            share your data without your
                                            consent.
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer id="contact" className="mt-8 bg-slate-900 text-white sm:mt-12 lg:mt-16">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
                        <div className="space-y-8">
                            {/* Company Info */}
                            <div className="md:col-span-2">
                                <div className="mb-4 flex items-center">
                                    <div className="mr-3 rounded-lg bg-purple-800 p-2">
                                        <FontAwesomeIcon
                                            icon={faBriefcase}
                                            className="h-6 w-6 text-white"
                                        />
                                    </div>
                                    <span className="text-xl font-bold">
                                        Jobs
                                    </span>
                                </div>
                                <p className="mb-4 max-w-md text-slate-300">
                                    Connect with top employers and discover
                                    opportunities that match your skills and
                                    aspirations. Build your career with our
                                    comprehensive job platform.
                                </p>
                                <div className="flex space-x-4">
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
                                    <a
                                        href="#"
                                        className="text-slate-400 transition-colors hover:text-white"
                                    >
                                        <span className="sr-only">Twitter</span>
                                        <svg
                                            className="h-6 w-6"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            {/* Quick Links and Legal Links in one row */}
                            <div className="mx-auto grid max-w-xl grid-cols-2 gap-6 md:max-w-2xl md:grid-cols-4 md:gap-8">
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
                        </div>

                        {/* Bottom Footer */}
                        <div className="mt-8 border-t border-slate-800 pt-6 sm:mt-10 sm:pt-8 lg:mt-12">
                            <div className="flex flex-col items-center justify-between md:flex-row">
                                <div className="text-sm text-slate-400">
                                    © {new Date().getFullYear()} Jobs. All
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
