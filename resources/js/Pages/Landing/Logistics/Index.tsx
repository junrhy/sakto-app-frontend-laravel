import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faShieldAlt, faChartLine, faBolt, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

interface PageProps {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
}

export default function LogisticsIndex({ auth }: PageProps) {

    return (
        <>
            <Head title="Logistics - Professional Fleet Management" />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 shadow-lg border-b border-slate-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="bg-slate-800 rounded-lg p-2">
                                        <FontAwesomeIcon icon={faTruck} className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <h1 className="text-xl font-bold text-white">Logistika</h1>
                            </div>
                            <div className="flex items-center space-x-6">
                                <Link
                                    href="/logistics"
                                    className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
                                >
                                    Home
                                </Link>
                                {auth.user ? (
                                    <Link
                                        href={route('home')}
                                        className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg shadow-sm text-slate-800 bg-white hover:bg-slate-50 transition-colors duration-200"
                                    >
                                        My Account
                                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('register', { project: 'logistics' })}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-slate-700 hover:bg-slate-800 transition-colors duration-200"
                                    >
                                        Get Started
                                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                    <div className="text-center">
                        {/* Hero Section */}
                        <div className="mb-16 lg:mb-20">
                            <div className="mb-8">
                                <div className="inline-flex items-center px-4 py-2 bg-slate-100 rounded-full text-sm font-medium text-slate-700 mb-6">
                                    <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-2 text-emerald-600" />
                                    Trusted by 500+ Companies
                                </div>
                            </div>
                            <h2 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                                Professional
                                <span className="text-slate-600 block">Fleet Management</span>
                            </h2>
                            <p className="text-xl lg:text-2xl text-slate-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                                Streamline your logistics operations with our comprehensive fleet management platform. 
                                Track, optimize, and manage your transportation network with precision and reliability.
                            </p>
                        </div>



                        {/* Features Section */}
                        <div className="mt-20 lg:mt-24">
                            <div className="mb-12">
                                <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                                    Comprehensive Fleet Solutions
                                </h3>
                                <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                                    Our platform provides everything you need to manage your logistics operations efficiently and professionally.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex items-center mb-6">
                                        <div className="bg-emerald-100 rounded-xl p-3">
                                            <FontAwesomeIcon icon={faTruck} className="h-8 w-8 text-emerald-600" />
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-3">Real-time GPS Tracking</h4>
                                    <p className="text-slate-600 leading-relaxed">Monitor your entire fleet with precise GPS tracking, route optimization, and live status updates for maximum operational efficiency.</p>
                                </div>

                                <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex items-center mb-6">
                                        <div className="bg-slate-100 rounded-xl p-3">
                                            <FontAwesomeIcon icon={faChartLine} className="h-8 w-8 text-slate-700" />
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-3">Advanced Analytics</h4>
                                    <p className="text-slate-600 leading-relaxed">Comprehensive reporting and analytics to optimize fuel consumption, maintenance schedules, and overall fleet performance.</p>
                                </div>

                                <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex items-center mb-6">
                                        <div className="bg-blue-100 rounded-xl p-3">
                                            <FontAwesomeIcon icon={faBolt} className="h-8 w-8 text-blue-600" />
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-3">Smart Automation</h4>
                                    <p className="text-slate-600 leading-relaxed">Intelligent route planning, automated dispatching, and predictive maintenance to streamline your operations.</p>
                                </div>
                            </div>
                        </div>

                        {/* Trust Indicators */}
                        <div className="mt-20 lg:mt-24 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-8 lg:p-12 shadow-lg border border-slate-200">
                            <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-8 text-center">
                                Trusted by Industry Leaders
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-slate-800 mb-2">500+</div>
                                    <div className="text-slate-600">Active Fleets</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-slate-800 mb-2">10K+</div>
                                    <div className="text-slate-600">Vehicles Tracked</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-slate-800 mb-2">99.9%</div>
                                    <div className="text-slate-600">Uptime</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-slate-800 mb-2">24/7</div>
                                    <div className="text-slate-600">Support</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
