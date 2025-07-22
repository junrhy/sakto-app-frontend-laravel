import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { 
    UserGroupIcon, 
    TruckIcon, 
    HeartIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState, useRef } from 'react';
import { getHost } from '@/lib/utils';

interface PageProps {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
}

export default function Pricing({ auth }: PageProps) {
    const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
    const [isLegalDropdownOpen, setIsLegalDropdownOpen] = useState(false);
    const productsDropdownRef = useRef<HTMLDivElement>(null);
    const legalDropdownRef = useRef<HTMLDivElement>(null);
    const hostname = getHost();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (productsDropdownRef.current && !productsDropdownRef.current.contains(event.target as Node)) {
                setIsProductsDropdownOpen(false);
            }
            if (legalDropdownRef.current && !legalDropdownRef.current.contains(event.target as Node)) {
                setIsLegalDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const productsMenuItems = [
        { name: 'Komunidad', href: route('community') },
        { name: 'Logistika', href: route('logistics') },
        { name: 'Medikal', href: route('medical') },
        { name: 'Lakbay', href: route('travel.landing') },
        { name: 'Hatid', href: route('delivery') },
        { name: 'Taohan', href: route('jobs') },
        { name: 'Merkado', href: route('shop') },
    ];

    const legalMenuItems = [
        { name: 'Privacy Policy', href: route('privacy-policy') },
        { name: 'Terms & Conditions', href: route('terms-and-conditions') },
        { name: 'Cookie Policy', href: route('cookie-policy') },
        { name: 'FAQ', href: route('faq') },
    ];
    const projectPlans = {
        Komunidad: {
            name: 'Komunidad',
            icon: UserGroupIcon,
            plans: [
                {
                    name: 'Basic',
                    price: 99,
                    description: 'Perfect for small communities and organizations',
                    features: [
                        'All Community Apps',
                        'Basic Support',
                        'Email Support'
                    ]
                },
                {
                    name: 'Pro',
                    price: 199,
                    description: 'Ideal for growing communities',
                    features: [
                        'All Community Apps',
                        'Email Integration',
                        'SMS Integration',
                        'Priority Support',
                        '24/7 Support'
                    ]
                },
                {
                    name: 'Business',
                    price: 299,
                    description: 'Perfect for established communities with advanced needs',
                    features: [
                        'All Community Apps',
                        'Email Integration',
                        'SMS Integration',
                        'Priority Support',
                        '24/7 Support',
                        'Virtual Assistant'
                    ]
                }
            ]
        },
        Logistika: {
            name: 'Logistika',
            icon: TruckIcon,
            plans: [
                {
                    name: 'Basic',
                    price: 299,
                    description: 'Perfect for small logistics operations',
                    features: [
                        'All Logistics Apps',
                        'Basic Support',
                        'Email Support'
                    ]
                },
                {
                    name: 'Pro',
                    price: 499,
                    description: 'Ideal for growing logistics companies',
                    features: [
                        'All Logistics Apps',
                        'Email Integration',
                        'SMS Integration',
                        'Priority Support',
                        '24/7 Support'
                    ]
                },
                {
                    name: 'Business',
                    price: 699,
                    description: 'Perfect for established logistics companies with advanced needs',
                    features: [
                        'All Logistics Apps',
                        'Email Integration',
                        'SMS Integration',
                        'Priority Support',
                        '24/7 Support',
                        'Virtual Assistant'
                    ]
                }
            ]
        },
        Medikal: {
            name: 'Medikal',
            icon: HeartIcon,
            plans: [
                {
                    name: 'Basic',
                    price: 299,
                    description: 'Perfect for small clinics',
                    features: [
                        'All Medical Apps',
                        'Basic Support',
                        'Email Support'
                    ]
                },
                {
                    name: 'Pro',
                    price: 499,
                    description: 'Ideal for growing medical practices',
                    features: [
                        'All Medical Apps',
                        'Email Integration',
                        'SMS Integration',
                        'Priority Support',
                        '24/7 Support'
                    ]
                },
                {
                    name: 'Business',
                    price: 699,
                    description: 'Perfect for established medical practices with advanced needs',
                    features: [
                        'All Medical Apps',
                        'Email Integration',
                        'SMS Integration',
                        'Priority Support',
                        '24/7 Support',
                        'Virtual Assistant'
                    ]
                }
            ]
        }
    };

    return (
        <>
            <Head title={`Pricing - ${hostname}`} />
            <div className="min-h-screen from-white via-indigo-50/30 to-white dark:bg-gray-900">
                {/* Navigation */}
                <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 dark:bg-gray-900/90 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <Link href="/" className="flex items-center">
                                    <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent dark:text-gray-100">{hostname}</span>
                                </Link>
                            </div>
                            <div className="flex items-center">
                                {auth.user ? (
                                    <>
                                        <Link
                                            href={route('features')}
                                            className="text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                        >
                                            Features
                                        </Link>
                                        <Link
                                            href={route('home')}
                                            className="text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                        >
                                            Home
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        {/* Solutions Dropdown */}
                                        <div className="relative" ref={productsDropdownRef}>
                                            <button
                                                onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
                                                className="text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
                                            >
                                                Solutions
                                                <svg
                                                    className={`ml-1 h-4 w-4 transition-transform duration-200 ${isProductsDropdownOpen ? 'rotate-180' : ''}`}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            {isProductsDropdownOpen && (
                                                <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                                                    {productsMenuItems.map((item) => (
                                                        <Link
                                                            key={item.name}
                                                            href={item.href}
                                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-white transition-colors duration-200"
                                                            onClick={() => setIsProductsDropdownOpen(false)}
                                                        >
                                                            {item.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <Link
                                            href={route('features')}
                                            className="text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                        >
                                            Features
                                        </Link>
                                        <Link
                                            href={route('pricing')}
                                            className="text-indigo-600 dark:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 bg-indigo-50 dark:bg-indigo-900/30"
                                        >
                                            Pricing
                                        </Link>
                                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
                                        {/* Legal Dropdown */}
                                        <div className="relative" ref={legalDropdownRef}>
                                            <button
                                                onClick={() => setIsLegalDropdownOpen(!isLegalDropdownOpen)}
                                                className="text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
                                            >
                                                Legal
                                                <svg
                                                    className={`ml-1 h-4 w-4 transition-transform duration-200 ${isLegalDropdownOpen ? 'rotate-180' : ''}`}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            {isLegalDropdownOpen && (
                                                <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                                                    {legalMenuItems.map((item) => (
                                                        <Link
                                                            key={item.name}
                                                            href={item.href}
                                                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-white transition-colors duration-200"
                                                            onClick={() => setIsLegalDropdownOpen(false)}
                                                        >
                                                            {item.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
                                        <Link
                                            href={route('login')}
                                            className="group inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                                        >
                                            <span>Log in</span>
                                            <svg className="ml-2 -mr-1 w-4 h-4 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Pricing Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 bg-clip-text dark:text-white sm:text-5xl">
                            Project-Specific Pricing
                        </h1>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                            Choose the perfect plan for your specific needs
                        </p>
                    </div>

                    {Object.entries(projectPlans).map(([key, project]) => (
                        <div key={key} className="mt-16">
                            <div className="flex items-center gap-3 mb-6">
                                <project.icon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                                <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text dark:from-indigo-400 dark:to-purple-400">
                                    {project.name}
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                                {project.plans.map((plan) => (
                                    <div key={plan.name} className={`relative group h-full ${plan.name === 'Pro' || plan.name === 'Enterprise' ? 'lg:-mt-4 lg:mb-4' : ''}`}>
                                        <div className={`absolute -inset-0.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 ${plan.name === 'Pro' || plan.name === 'Enterprise' ? 'opacity-20 dark:opacity-30' : 'opacity-0 group-hover:opacity-10 dark:group-hover:opacity-30'} transition duration-200`}></div>
                                        <div className={`relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 transition duration-200 h-full flex flex-col ${plan.name === 'Pro' || plan.name === 'Enterprise' ? 'border-2 border-indigo-500 dark:border-indigo-400' : ''}`}>
                                            {(plan.name === 'Pro' || plan.name === 'Enterprise') && (
                                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200">
                                                        {plan.name === 'Pro' ? 'Most Popular' : 'Premium'}
                                                    </span>
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{plan.description}</p>
                                                <p className="mt-4">
                                                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white">₱{plan.price}</span>
                                                    <span className="text-sm text-gray-600 dark:text-gray-300">/month</span>
                                                </p>
                                                {!auth.user && (
                                                    <Link
                                                        href={`/register?project=${project.name.toLowerCase()}&plan=${plan.name.toLowerCase()}`}
                                                        className="mt-4 block w-full py-2 px-4 border border-transparent rounded-md shadow text-center text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                                                    >
                                                        Get Started
                                                    </Link>
                                                )}
                                            </div>
                                            <div className="flex-grow mt-4">
                                                <ul className="space-y-2">
                                                    {plan.features.map((feature) => (
                                                        <li key={feature} className="flex items-center text-sm">
                                                            <svg className="h-4 w-4 text-indigo-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                            <span className="ml-2 text-gray-600 dark:text-gray-300">{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* FAQ Section */}
                    <div className="mt-24">
                        <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white">
                            Frequently Asked Questions
                        </h2>
                        <div className="mt-12 max-w-3xl mx-auto">
                            <dl className="space-y-6">
                                <div>
                                    <dt className="text-lg font-medium text-gray-900 dark:text-white">
                                        Can I change plans later?
                                    </dt>
                                    <dd className="mt-2 text-gray-600 dark:text-gray-300">
                                        Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-lg font-medium text-gray-900 dark:text-white">
                                        What payment methods do you accept?
                                    </dt>
                                    <dd className="mt-2 text-gray-600 dark:text-gray-300">
                                        We accept Visa, Mastercard, JCB, or AMEX credit or debit card. You can also use e-Wallets such as Maya, GCash, WeChat Pay, ShopeePay, and more via QR Ph.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-lg font-medium text-gray-900 dark:text-white">
                                        Do you offer refunds?
                                    </dt>
                                    <dd className="mt-2 text-gray-600 dark:text-gray-300">
                                        Yes, we offer a 30-day money-back guarantee for all paid plans.
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-lg font-medium text-gray-900 dark:text-white">
                                        What kind of support do you provide?
                                    </dt>
                                    <dd className="mt-2 text-gray-600 dark:text-gray-300">
                                        All plans include email support. Pro and Enterprise plans include 24/7 support with priority response times.
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-white/80 backdrop-blur-sm dark:bg-gray-900/90 border-t border-gray-100 dark:border-gray-800">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                © {new Date().getFullYear()} {hostname}. All rights reserved.
                            </p>
                            <div className="flex items-center space-x-6">
                                <Link
                                    href={route('privacy-policy')}
                                    className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors duration-200"
                                >
                                    Privacy Policy
                                </Link>
                                <Link
                                    href={route('terms-and-conditions')}
                                    className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors duration-200"
                                >
                                    Terms
                                </Link>
                                <Link
                                    href={route('cookie-policy')}
                                    className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors duration-200"
                                >
                                    Cookies
                                </Link>
                                <Link
                                    href={route('faq')}
                                    className="text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors duration-200"
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