import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

interface PageProps {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
}

export default function Pricing({ auth }: PageProps) {
    const plans = [
        {
            name: 'Basic Plan',
            price: 149,
            description: 'Perfect for small businesses getting started',
            features: [
                'F&B Management',
                'Rental System',
                'Payroll System',
                'Contacts Management',
                'Family Tree',
                'Events Management',
                'Challenges',
                'Content Creator',
                'Digital Products',
                'Pages',
                'Basic Support',
                'Email Support'
            ],
            includedApps: [
                'F&B',
                'Rental',
                'Payroll',
                'Contacts',
                'Family Tree',
                'Events',
                'Challenges',
                'Content Creator',
                'Digital Products',
                'Pages'
            ]
        },
        {
            name: 'Pro Plan',
            price: 299,
            description: 'Ideal for growing businesses',
            features: [
                'Everything in Basic Plan',
                'Lending System',
                'SMS Integration',
                'Email Integration',
                'Priority Support',
                '24/7 Support',
                'Advanced Analytics'
            ],
            includedApps: [
                'Everything in Basic Plan',
                'Lending',
                'SMS',
                'Email'
            ]
        },
        {
            name: 'Business Plan',
            price: 599,
            description: 'For large enterprises',
            features: [
                'Everything in Pro Plan',
                'Clinic Management',
                'Real Estate Management',
                'Transportation System',
                'Warehousing System',
                'Travel Management',
                'Dedicated Support',
                'Custom Integration Support'
            ],
            includedApps: [
                'Everything in Pro Plan',
                'Clinic',
                'Real Estate',
                'Transportation',
                'Warehousing',
                'Travel'
            ]
        }
    ];

    return (
        <>
            <Head title="Pricing - Sakto" />
            <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50/30 to-white dark:bg-gray-950">
                {/* Navigation */}
                <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 dark:bg-gray-900/80 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <Link href="/" className="flex items-center">
                                    <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent dark:text-gray-100">Sakto</span>
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
                                        <Link
                                            href={route('features')}
                                            className="text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                        >
                                            Features
                                        </Link>
                                        <Link
                                            href={route('login')}
                                            className="group inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 dark:bg-indigo-500 dark:hover:bg-indigo-600"
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
                            Simple, transparent pricing
                        </h1>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                            Choose the perfect plan for your business needs
                        </p>
                    </div>

                    <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {plans.map((plan) => (
                            <div key={plan.name} className="relative group h-full">
                                <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-30 transition duration-200"></div>
                                <div className="relative p-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 transition duration-200 h-full flex flex-col">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                                        <p className="mt-4 text-gray-600 dark:text-gray-300">{plan.description}</p>
                                        <p className="mt-8">
                                            <span className="text-4xl font-extrabold text-gray-900 dark:text-white">₱{plan.price}</span>
                                            <span className="text-gray-600 dark:text-gray-300">/month</span>
                                        </p>
                                        {!auth.user && (
                                            <Link
                                                href={route('register')}
                                                className="mt-8 block w-full py-3 px-4 border border-transparent rounded-md shadow text-center text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                            >
                                                Get Started
                                            </Link>
                                        )}
                                    </div>
                                    <div className="flex-grow mt-8">
                                        <ul className="space-y-4">
                                            {plan.features.map((feature) => (
                                                <li key={feature} className="flex items-center">
                                                    <svg className="h-5 w-5 text-indigo-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="ml-3 text-gray-600 dark:text-gray-300">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <div className="mt-8">
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Included Apps:</h4>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {plan.includedApps.map((app) => (
                                                    <span
                                                        key={app}
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                                                    >
                                                        {app}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

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
                                        Basic plan includes email support, Pro plan includes 24/7 support, and Business plan includes dedicated support with priority response times.
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-800">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                © {new Date().getFullYear()} Sakto. All rights reserved.
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