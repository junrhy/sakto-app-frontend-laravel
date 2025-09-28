import {
    faShoppingBag,
    faShieldAlt,
    faTruck,
    faStar,
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

export default function ShopIndex({ auth }: PageProps) {
    return (
        <>
            <Head title="Shop - Discover Amazing Products" />
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
                {/* Header */}
                <div className="border-b border-slate-700 bg-gradient-to-r from-green-800 to-emerald-900 shadow-lg">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="rounded-lg bg-green-800 p-2">
                                        <FontAwesomeIcon
                                            icon={faShoppingBag}
                                            className="h-6 w-6 text-white"
                                        />
                                    </div>
                                </div>
                                <h1 className="text-xl font-bold text-white">
                                    Shop
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
                                                project: 'shop',
                                            })}
                                            className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href={route('register', {
                                                project: 'shop',
                                            })}
                                            className="inline-flex items-center rounded-lg border border-transparent bg-green-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-green-800"
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
                                <div className="mb-6 inline-flex items-center rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
                                    <FontAwesomeIcon
                                        icon={faStar}
                                        className="mr-2 h-4 w-4 text-yellow-500"
                                    />
                                    Trusted by 50,000+ Shoppers
                                </div>
                            </div>
                            <h2 className="mb-6 text-4xl font-bold leading-tight text-slate-900 lg:text-6xl">
                                Discover Amazing
                                <span className="block text-green-600">
                                    Products
                                </span>
                            </h2>
                            <p className="mx-auto mb-8 max-w-4xl text-xl leading-relaxed text-slate-600 lg:text-2xl">
                                Shop from thousands of verified sellers and discover unique products 
                                at great prices. Enjoy secure payments, fast shipping, and excellent 
                                customer service.
                            </p>
                            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                                <Link
                                    href={route('shop.show', { identifier: 'shop' })}
                                    className="inline-flex items-center rounded-lg border border-transparent bg-green-600 px-8 py-3 text-base font-medium text-white shadow-sm transition-colors duration-200 hover:bg-green-700"
                                >
                                    Start Shopping
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
                                            project: 'shop',
                                        })}
                                        className="inline-flex items-center rounded-lg border border-green-600 bg-white px-8 py-3 text-base font-medium text-green-600 shadow-sm transition-colors duration-200 hover:bg-green-50"
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
                                    Why Shop With Us
                                </h3>
                                <p className="mx-auto max-w-3xl text-lg text-slate-600">
                                    We provide the best shopping experience with secure payments, 
                                    fast delivery, and quality products from trusted sellers.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                                <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                    <div className="mb-6 flex items-center">
                                        <div className="rounded-xl bg-green-100 p-3">
                                            <FontAwesomeIcon
                                                icon={faShieldAlt}
                                                className="h-8 w-8 text-green-600"
                                            />
                                        </div>
                                    </div>
                                    <h4 className="mb-3 text-xl font-bold text-slate-900">
                                        Secure Shopping
                                    </h4>
                                    <p className="leading-relaxed text-slate-600">
                                        Your payments are protected with industry-standard encryption. 
                                        Shop with confidence knowing your financial information is safe.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                    <div className="mb-6 flex items-center">
                                        <div className="rounded-xl bg-blue-100 p-3">
                                            <FontAwesomeIcon
                                                icon={faTruck}
                                                className="h-8 w-8 text-blue-600"
                                            />
                                        </div>
                                    </div>
                                    <h4 className="mb-3 text-xl font-bold text-slate-900">
                                        Fast Delivery
                                    </h4>
                                    <p className="leading-relaxed text-slate-600">
                                        Get your orders delivered quickly with our reliable shipping 
                                        partners. Track your packages in real-time.
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg transition-shadow duration-300 hover:shadow-xl">
                                    <div className="mb-6 flex items-center">
                                        <div className="rounded-xl bg-purple-100 p-3">
                                            <FontAwesomeIcon
                                                icon={faStar}
                                                className="h-8 w-8 text-purple-600"
                                            />
                                        </div>
                                    </div>
                                    <h4 className="mb-3 text-xl font-bold text-slate-900">
                                        Quality Products
                                    </h4>
                                    <p className="leading-relaxed text-slate-600">
                                        All products are verified for quality and authenticity. 
                                        Read reviews from other customers before making a purchase.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Trust Indicators */}
                        <div className="mt-20 rounded-2xl border border-slate-200 bg-gradient-to-r from-green-50 to-emerald-50 p-8 shadow-lg lg:mt-24 lg:p-12">
                            <h3 className="mb-8 text-center text-2xl font-bold text-slate-900 lg:text-3xl">
                                Trusted by Shoppers Worldwide
                            </h3>
                            <div className="grid grid-cols-2 items-center gap-8 md:grid-cols-4">
                                <div className="text-center">
                                    <div className="mb-2 text-3xl font-bold text-slate-800">
                                        50K+
                                    </div>
                                    <div className="text-slate-600">
                                        Happy Customers
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="mb-2 text-3xl font-bold text-slate-800">
                                        10K+
                                    </div>
                                    <div className="text-slate-600">
                                        Products
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="mb-2 text-3xl font-bold text-slate-800">
                                        4.9★
                                    </div>
                                    <div className="text-slate-600">
                                        Rating
                                    </div>
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
                            Choose Your Shopping Plan
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-slate-600">
                            Select the perfect plan for your shopping needs. All plans include 
                            our core shopping features with different levels of benefits.
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Basic Plan */}
                        <div className="group relative">
                            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-slate-500 to-slate-600 opacity-0 transition duration-200 group-hover:opacity-10"></div>
                            <div className="relative flex h-full flex-col rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition duration-200 hover:shadow-lg">
                                <div>
                                    <h3 className="mb-2 text-xl font-bold text-slate-900">
                                        Shopper
                                    </h3>
                                    <p className="mb-6 text-sm text-slate-600">
                                        Perfect for casual shopping
                                    </p>
                                    <p className="mb-6">
                                        <span className="text-3xl font-extrabold text-slate-900">
                                            Free
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
                                                project: 'shop',
                                                plan: 'shopper',
                                            })}
                                            className="block w-full rounded-lg border border-transparent bg-slate-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-slate-700"
                                        >
                                            Get Started
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
                                                Browse & purchase products
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
                                                Order tracking
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
                                                Basic support
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Pro Plan */}
                        <div className="group relative lg:-mt-4 lg:mb-4">
                            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 opacity-20 transition duration-200"></div>
                            <div className="relative flex h-full flex-col rounded-xl border-2 border-green-500 bg-white p-8 shadow-lg">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 transform">
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                        Most Popular
                                    </span>
                                </div>
                                <div>
                                    <h3 className="mb-2 text-xl font-bold text-slate-900">
                                        Premium
                                    </h3>
                                    <p className="mb-6 text-sm text-slate-600">
                                        Ideal for frequent shoppers
                                    </p>
                                    <p className="mb-6">
                                        <span className="text-3xl font-extrabold text-slate-900">
                                            ₱299
                                        </span>
                                        <span className="text-sm text-slate-600">
                                            /month
                                        </span>
                                    </p>
                                    {auth.user ? (
                                        <Link
                                            href={route('home')}
                                            className="block w-full rounded-lg border border-transparent bg-green-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-green-700"
                                        >
                                            Go to My Account
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('register', {
                                                project: 'shop',
                                                plan: 'premium',
                                            })}
                                            className="block w-full rounded-lg border border-transparent bg-green-600 px-4 py-3 text-center text-sm font-medium text-white shadow transition-colors duration-200 hover:bg-green-700"
                                        >
                                            Get Started
                                        </Link>
                                    )}
                                </div>
                                <div className="mt-6 flex-grow">
                                    <ul className="space-y-3">
                                        <li className="flex items-center text-sm">
                                            <svg
                                                className="mr-3 h-4 w-4 flex-shrink-0 text-green-500"
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
                                                Everything in Shopper
                                            </span>
                                        </li>
                                        <li className="flex items-center text-sm">
                                            <svg
                                                className="mr-3 h-4 w-4 flex-shrink-0 text-green-500"
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
                                                Free shipping
                                            </span>
                                        </li>
                                        <li className="flex items-center text-sm">
                                            <svg
                                                className="mr-3 h-4 w-4 flex-shrink-0 text-green-500"
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
                                                Exclusive deals
                                            </span>
                                        </li>
                                        <li className="flex items-center text-sm">
                                            <svg
                                                className="mr-3 h-4 w-4 flex-shrink-0 text-green-500"
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
                                                Priority support
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Enterprise Plan */}
                        <div className="group relative">
                            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 opacity-0 transition duration-200 group-hover:opacity-10"></div>
                            <div className="relative flex h-full flex-col rounded-xl border border-slate-200 bg-white p-8 shadow-sm transition duration-200 hover:shadow-lg">
                                <div>
                                    <h3 className="mb-2 text-xl font-bold text-slate-900">
                                        VIP
                                    </h3>
                                    <p className="mb-6 text-sm text-slate-600">
                                        Perfect for shopping enthusiasts
                                    </p>
                                    <p className="mb-6">
                                        <span className="text-3xl font-extrabold text-slate-900">
                                            ₱599
                                        </span>
                                        <span className="text-sm text-slate-600">
                                            /month
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
                                                project: 'shop',
                                                plan: 'vip',
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
                                            <span className="text-slate-600">
                                                Everything in Premium
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
                                            <span className="text-slate-600">
                                                Early access to sales
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
                                            <span className="text-slate-600">
                                                Personal shopping assistant
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
                                            How do I place an order?
                                        </dt>
                                        <dd className="text-slate-600">
                                            Simply browse our products, add items to your cart, and 
                                            proceed to checkout. You can pay securely with various 
                                            payment methods.
                                        </dd>
                                    </div>
                                    <div className="rounded-lg border border-slate-200 bg-white p-6">
                                        <dt className="mb-2 text-lg font-medium text-slate-900">
                                            What is your return policy?
                                        </dt>
                                        <dd className="text-slate-600">
                                            We offer a 30-day return policy for most items. If you're 
                                            not satisfied with your purchase, you can return it for 
                                            a full refund or exchange.
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
                                    <div className="mr-3 rounded-lg bg-green-800 p-2">
                                        <FontAwesomeIcon
                                            icon={faShoppingBag}
                                            className="h-6 w-6 text-white"
                                        />
                                    </div>
                                    <span className="text-xl font-bold">
                                        Shop
                                    </span>
                                </div>
                                <p className="mb-4 max-w-md text-slate-300">
                                    Discover amazing products from thousands of verified sellers. 
                                    Shop with confidence knowing you're getting quality products 
                                    at great prices with excellent customer service.
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
                                            Instagram
                                        </span>
                                        <svg
                                            className="h-6 w-6"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.405c-.49 0-.875-.385-.875-.875s.385-.875.875-.875.875.385.875.875-.385.875-.875.875z"
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
                                    © {new Date().getFullYear()} Shop. All
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
                                        A subsidiary of Sakto Technologies
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
