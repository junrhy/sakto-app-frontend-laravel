import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link } from '@inertiajs/react';

interface PageProps extends Record<string, any> {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
}

export default function Welcome({
    auth,
}: PageProps) {
    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Navigation */}
                <nav className="bg-white dark:bg-gray-800 shadow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Sakto</span>
                            </div>
                            <div className="flex items-center">
                                {auth.user ? (
                                    <Link
                                        href={route('home')}
                                        className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('login')}
                                        className="group inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 hover:shadow-md"
                                    >
                                        <span>Log in</span>
                                        <svg className="ml-2 -mr-1 w-4 h-4 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="relative bg-gradient-to-b from-indigo-100 to-white dark:from-gray-800 dark:to-gray-900 py-32">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                                <span className="block">All Your Business Apps</span>
                                <span className="block text-indigo-600">In One Powerful Platform</span>
                            </h1>
                            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-400 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                                Start with our free essential apps and upgrade to premium features as your business grows. Access multiple business applications in a single, unified platform.
                            </p>
                            {!auth.user && (
                                <div className="mt-8 flex justify-center space-x-4">
                                    <Link
                                        href={route('register')}
                                        className="group relative inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transform transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
                                    >
                                        <span>Get Started Free</span>
                                        <svg className="ml-2 -mr-1 w-5 h-5 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-white dark:bg-gray-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                                Why Choose Sakto?
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            {[
                                {
                                    title: 'Easy to Use',
                                    description: 'Intuitive interface that requires no technical expertise.',
                                    icon: '🎯',
                                },
                                {
                                    title: 'Powerful Features',
                                    description: 'Advanced tools to handle complex workflows with ease.',
                                    icon: '⚡',
                                },
                                {
                                    title: 'Reliable Support',
                                    description: '24/7 customer support to help you succeed.',
                                    icon: '🛟',
                                },
                            ].map((feature) => (
                                <div key={feature.title} className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="text-4xl mb-4">{feature.icon}</div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Social Proof Section */}
                <section className="py-20 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                                Trusted by Industry Leaders
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                            {/* Add company logos here */}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-indigo-600 dark:bg-indigo-800">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                Ready to get started?
                            </h2>
                            <p className="mt-4 text-lg leading-6 text-indigo-100">
                                Join thousands of satisfied users today.
                            </p>
                            {!auth.user && (
                                <div className="mt-8">
                                    <Link
                                        href={route('register')}
                                        className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-10"
                                    >
                                        Get Started Now
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
