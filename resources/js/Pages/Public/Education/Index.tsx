import { getPricingForService } from '@/config/pricing';
import { formatCurrency, getHost } from '@/lib/utils';
import {
    faBookOpen,
    faChartLine,
    faCheckCircle,
    faGraduationCap,
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

export default function EducationIndex({ auth }: PageProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const hostname = getHost();

    // Get currency and symbol from URL params, default to USD and $
    const urlParams = useMemo(
        () => new URLSearchParams(window.location.search),
        [],
    );
    const currency = urlParams.get('currency') || 'usd';
    const symbol = urlParams.get('symbol') || '$';

    const pricing = getPricingForService('education', currency, symbol);
    const starterPlan = pricing?.plans.find((plan) => plan.id === 'starter');
    const basicPlan = pricing?.plans.find((plan) => plan.id === 'basic');
    const proPlan = pricing?.plans.find((plan) => plan.id === 'pro');
    const businessPlan = pricing?.plans.find((plan) => plan.id === 'business');

    return (
        <>
            <Head
                title={`${hostname} Education - Learning Management Platform`}
            />
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
                {/* Header */}
                <div className="border-b border-indigo-700 bg-gradient-to-r from-indigo-700 to-purple-700 shadow-lg">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="rounded-lg bg-white p-2">
                                    <FontAwesomeIcon
                                        icon={faGraduationCap}
                                        className="h-8 w-8 text-indigo-700"
                                    />
                                </div>
                                <span className="ml-3 text-2xl font-bold text-white">
                                    {hostname} Education
                                </span>
                            </div>

                            {/* Desktop Navigation */}
                            <div className="hidden md:flex md:items-center md:space-x-6">
                                <Link
                                    href="#features"
                                    className="text-indigo-100 transition-colors hover:text-white"
                                >
                                    Features
                                </Link>
                                <Link
                                    href="#pricing"
                                    className="text-indigo-100 transition-colors hover:text-white"
                                >
                                    Pricing
                                </Link>
                                {auth?.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-md transition-all hover:bg-indigo-50"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login', {
                                                project: 'education',
                                            })}
                                            className="text-indigo-100 transition-colors hover:text-white"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register', {
                                                project: 'education',
                                            })}
                                            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-md transition-all hover:bg-indigo-50"
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
                                className="rounded-lg p-2 text-white hover:bg-indigo-600 md:hidden"
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
                            <div className="mt-4 border-t border-indigo-600 pt-4 md:hidden">
                                <div className="flex flex-col space-y-3">
                                    <Link
                                        href="#features"
                                        className="text-indigo-100 transition-colors hover:text-white"
                                    >
                                        Features
                                    </Link>
                                    <Link
                                        href="#pricing"
                                        className="text-indigo-100 transition-colors hover:text-white"
                                    >
                                        Pricing
                                    </Link>
                                    {auth?.user ? (
                                        <Link
                                            href={route('dashboard')}
                                            className="rounded-lg bg-white px-4 py-2 text-center text-sm font-semibold text-indigo-700 shadow-md transition-all hover:bg-indigo-50"
                                        >
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <>
                                            <Link
                                                href={route('login', {
                                                    project: 'education',
                                                })}
                                                className="text-indigo-100 transition-colors hover:text-white"
                                            >
                                                Log in
                                            </Link>
                                            <Link
                                                href={route('register', {
                                                    project: 'education',
                                                })}
                                                className="rounded-lg bg-white px-4 py-2 text-center text-sm font-semibold text-indigo-700 shadow-md transition-all hover:bg-indigo-50"
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
                <div className="relative overflow-hidden bg-gradient-to-r from-indigo-700 to-purple-700 py-12 sm:py-16 lg:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-3xl font-extrabold text-white sm:text-4xl md:text-5xl lg:text-6xl">
                                Transform Learning with Technology
                            </h1>
                            <p className="mx-auto mt-4 max-w-2xl text-base text-indigo-100 sm:mt-6 sm:text-lg md:text-xl">
                                Empower educators and engage students with our
                                comprehensive learning management platform.
                                Create, deliver, and track educational content
                                seamlessly.
                            </p>
                            <div className="mt-8 flex flex-col justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
                                <Link
                                    href={route('register', {
                                        project: 'education',
                                    })}
                                    className="rounded-lg bg-white px-6 py-3 text-base font-semibold text-indigo-700 shadow-lg transition-all hover:bg-indigo-50 hover:shadow-xl sm:px-8 sm:text-lg"
                                >
                                    Start Free Trial
                                </Link>
                                <Link
                                    href="#features"
                                    className="rounded-lg border-2 border-white px-6 py-3 text-base font-semibold text-white transition-all hover:bg-white hover:text-indigo-700 sm:px-8 sm:text-lg"
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
                                <div className="text-3xl font-bold text-indigo-700 sm:text-4xl">
                                    10K+
                                </div>
                                <div className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Active Students
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-indigo-700 sm:text-4xl">
                                    500+
                                </div>
                                <div className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Educators
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-indigo-700 sm:text-4xl">
                                    1000+
                                </div>
                                <div className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Courses Created
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
                                Powerful Features for Modern Education
                            </h2>
                            <p className="mt-3 text-base text-gray-600 sm:mt-4 sm:text-lg lg:text-xl">
                                Everything you need to create engaging learning
                                experiences
                            </p>
                        </div>

                        <div className="mt-8 grid gap-6 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
                            {/* Feature 1 */}
                            <div className="rounded-lg bg-white p-5 shadow-md transition-all hover:shadow-lg sm:p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 sm:h-12 sm:w-12">
                                    <FontAwesomeIcon
                                        icon={faBookOpen}
                                        className="h-5 w-5 text-indigo-700 sm:h-6 sm:w-6"
                                    />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">
                                    Course Creation
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Build comprehensive courses with multimedia
                                    content, quizzes, and assessments.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="rounded-lg bg-white p-5 shadow-md transition-all hover:shadow-lg sm:p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 sm:h-12 sm:w-12">
                                    <FontAwesomeIcon
                                        icon={faGraduationCap}
                                        className="h-5 w-5 text-indigo-700 sm:h-6 sm:w-6"
                                    />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">
                                    Student Management
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Track student progress, grades, and
                                    engagement with powerful analytics.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="rounded-lg bg-white p-5 shadow-md transition-all hover:shadow-lg sm:p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 sm:h-12 sm:w-12">
                                    <FontAwesomeIcon
                                        icon={faChartLine}
                                        className="h-5 w-5 text-indigo-700 sm:h-6 sm:w-6"
                                    />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">
                                    Analytics & Reporting
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Gain insights with detailed reports on
                                    student performance and engagement.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="rounded-lg bg-white p-5 shadow-md transition-all hover:shadow-lg sm:p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 sm:h-12 sm:w-12">
                                    <FontAwesomeIcon
                                        icon={faCheckCircle}
                                        className="h-5 w-5 text-indigo-700 sm:h-6 sm:w-6"
                                    />
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">
                                    Assessment Tools
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Create quizzes, assignments, and exams with
                                    automated grading.
                                </p>
                            </div>

                            {/* Feature 5 */}
                            <div className="rounded-lg bg-white p-5 shadow-md transition-all hover:shadow-lg sm:p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 sm:h-12 sm:w-12">
                                    <svg
                                        className="h-5 w-5 text-indigo-700 sm:h-6 sm:w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">
                                    Discussion Forums
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Foster collaboration with integrated
                                    discussion boards and chat.
                                </p>
                            </div>

                            {/* Feature 6 */}
                            <div className="rounded-lg bg-white p-5 shadow-md transition-all hover:shadow-lg sm:p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 sm:h-12 sm:w-12">
                                    <svg
                                        className="h-5 w-5 text-indigo-700 sm:h-6 sm:w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">
                                    Virtual Classrooms
                                </h3>
                                <p className="mt-2 text-sm text-gray-600 sm:text-base">
                                    Host live classes with video conferencing
                                    and screen sharing.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Free Trial Section */}
                <div className="mb-16 mt-16 px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl">
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-1 shadow-2xl">
                            <div className="rounded-xl bg-white p-8 md:p-12">
                                <div className="text-center">
                                    <div className="mb-4 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800">
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
                                        Try Our Education Platform Risk-Free
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
                                        <div className="mb-2 text-5xl font-extrabold text-blue-600">
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
                                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl"
                                        >
                                            Go to My Account
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('register', {
                                                project: 'education',
                                                plan:
                                                    starterPlan?.id ||
                                                    'starter',
                                            })}
                                            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl"
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
                                                    className="mr-2 h-5 w-5 text-blue-500"
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
                <div id="pricing" className="bg-white py-12 sm:py-16 lg:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-extrabold text-gray-900 sm:text-3xl lg:text-4xl">
                                Choose Your Paid Plan
                            </h2>
                            <p className="mt-3 text-base text-gray-600 sm:mt-4 sm:text-lg lg:text-xl">
                                After your free trial, choose the plan that's
                                right for your institution
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
                                    {basicPlan.tagline && (
                                        <p className="mt-2 text-xs italic text-gray-500">
                                            {basicPlan.tagline}
                                        </p>
                                    )}
                                    <div className="mt-4 sm:mt-6">
                                        <span className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                            {formatCurrency(
                                                basicPlan.price || 0,
                                                basicPlan.currency || symbol,
                                            )}
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
                                                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600 sm:mt-1 sm:h-5 sm:w-5"
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
                                            project: 'education',
                                        })}
                                        className="mt-6 block rounded-lg border-2 border-indigo-600 bg-white px-6 py-2.5 text-center text-sm font-semibold text-indigo-600 transition-all hover:bg-indigo-50 sm:mt-8 sm:py-3 sm:text-base"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            )}

                            {/* Pro Plan */}
                            {proPlan && (
                                <div className="flex flex-col rounded-lg border-2 border-indigo-600 bg-white p-6 shadow-lg sm:p-8 md:col-span-2 lg:col-span-1">
                                    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                            {proPlan.name}
                                        </h3>
                                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 sm:text-sm">
                                            Popular
                                        </span>
                                    </div>
                                    <p className="mt-3 text-sm text-gray-600 sm:mt-4 sm:text-base">
                                        {proPlan.description}
                                    </p>
                                    {proPlan.tagline && (
                                        <p className="mt-2 text-xs italic text-indigo-600">
                                            {proPlan.tagline}
                                        </p>
                                    )}
                                    <div className="mt-4 sm:mt-6">
                                        <span className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                            {formatCurrency(
                                                proPlan.price || 0,
                                                proPlan.currency || symbol,
                                            )}
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
                                                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600 sm:mt-1 sm:h-5 sm:w-5"
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
                                            project: 'education',
                                        })}
                                        className="mt-6 block rounded-lg bg-indigo-600 px-6 py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-indigo-700 sm:mt-8 sm:py-3 sm:text-base"
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
                                    {businessPlan.tagline && (
                                        <p className="mt-2 text-xs italic text-gray-500">
                                            {businessPlan.tagline}
                                        </p>
                                    )}
                                    <div className="mt-4 sm:mt-6">
                                        <span className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                                            {formatCurrency(
                                                businessPlan.price || 0,
                                                businessPlan.currency || symbol,
                                            )}
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
                                                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600 sm:mt-1 sm:h-5 sm:w-5"
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
                                            project: 'education',
                                        })}
                                        className="mt-6 block rounded-lg border-2 border-indigo-600 bg-white px-6 py-2.5 text-center text-sm font-semibold text-indigo-600 transition-all hover:bg-indigo-50 sm:mt-8 sm:py-3 sm:text-base"
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
                                        Can I try before purchasing?
                                    </dt>
                                    <dd className="text-sm text-gray-600 sm:text-base">
                                        Yes! We offer a 14-day free trial with
                                        full access to all features. No credit
                                        card required to get started.
                                    </dd>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
                                    <dt className="mb-2 text-base font-medium text-gray-900 sm:text-lg">
                                        How many students can I have?
                                    </dt>
                                    <dd className="text-sm text-gray-600 sm:text-base">
                                        Our plans scale with your needs. Basic
                                        supports up to 50 students, Pro up to
                                        500, and Business offers unlimited
                                        students.
                                    </dd>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
                                    <dt className="mb-2 text-base font-medium text-gray-900 sm:text-lg">
                                        Is technical support included?
                                    </dt>
                                    <dd className="text-sm text-gray-600 sm:text-base">
                                        All plans include email support. Pro and
                                        Business plans get priority support with
                                        faster response times.
                                    </dd>
                                </div>
                                <div className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
                                    <dt className="mb-2 text-base font-medium text-gray-900 sm:text-lg">
                                        Can I integrate with other tools?
                                    </dt>
                                    <dd className="text-sm text-gray-600 sm:text-base">
                                        Yes, our platform integrates with
                                        popular tools like Zoom, Google
                                        Classroom, and many more through our API
                                        and webhooks.
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
                                    <div className="mr-3 rounded-lg bg-indigo-800 p-2">
                                        <FontAwesomeIcon
                                            icon={faGraduationCap}
                                            className="h-6 w-6 text-white"
                                        />
                                    </div>
                                    <span className="text-xl font-bold">
                                        Education
                                    </span>
                                </div>
                                <p className="mb-4 max-w-md text-slate-300">
                                    Transform learning with our comprehensive
                                    education management platform. Empower
                                    educators and engage students with modern
                                    tools and technology.
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
                                    Education. All rights reserved.
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
