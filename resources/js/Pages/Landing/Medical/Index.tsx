import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserMd, faChartLine, faBolt, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

interface PageProps {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
}

export default function Medical({ auth }: PageProps) {
    return (
        <React.Fragment>
            <Head title="Medikal - Professional Healthcare Management" />
            <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-800 to-emerald-900 shadow-lg border-b border-teal-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <div className="bg-teal-800 rounded-lg p-2">
                                        <FontAwesomeIcon icon={faUserMd} className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                                <h1 className="text-xl font-bold text-white">Medikal</h1>
                            </div>
                            <div className="flex items-center space-x-6">
                                {auth.user ? (
                                    <Link
                                        href={route('home')}
                                        className="inline-flex items-center px-4 py-2 border border-teal-300 text-sm font-medium rounded-lg shadow-sm text-teal-800 bg-white hover:bg-teal-50 transition-colors duration-200"
                                    >
                                        My Account
                                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                ) : (
                                    <React.Fragment>
                                        <Link
                                            href={route('login', { project: 'medical' })}
                                            className="text-teal-300 hover:text-white text-sm font-medium transition-colors"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href={route('register', { project: 'medical' })}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-teal-700 hover:bg-teal-800 transition-colors duration-200"
                                        >
                                            Get Started
                                            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </Link>
                                    </React.Fragment>
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
                                <div className="inline-flex items-center px-4 py-2 bg-teal-100 rounded-full text-sm font-medium text-teal-700 mb-6">
                                    <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-2 text-emerald-600" />
                                    Trusted by 200+ Clinics
                                </div>
                            </div>
                            <h2 className="text-4xl lg:text-6xl font-bold text-teal-900 mb-6 leading-tight">
                                Professional
                                <span className="text-teal-600 block">Healthcare Management</span>
                            </h2>
                            <p className="text-xl lg:text-2xl text-teal-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                                Streamline your clinic operations with our comprehensive healthcare management platform. 
                                Manage patients, appointments, and medical records with precision and reliability.
                            </p>
                        </div>

                        {/* Features Section */}
                        <div className="mt-20 lg:mt-24">
                            <div className="mb-12">
                                <h3 className="text-3xl lg:text-4xl font-bold text-teal-900 mb-4">
                                    Comprehensive Healthcare Solutions
                                </h3>
                                <p className="text-lg text-teal-600 max-w-3xl mx-auto">
                                    Our platform provides everything you need to manage your clinic operations efficiently and professionally.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="bg-white rounded-xl p-8 shadow-lg border border-teal-200 hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex items-center mb-6">
                                        <div className="bg-emerald-100 rounded-xl p-3">
                                            <FontAwesomeIcon icon={faUserMd} className="h-8 w-8 text-emerald-600" />
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-bold text-teal-900 mb-3">Patient Management</h4>
                                    <p className="text-teal-600 leading-relaxed">Comprehensive patient records, medical history tracking, and appointment scheduling for seamless healthcare delivery.</p>
                                </div>

                                <div className="bg-white rounded-xl p-8 shadow-lg border border-teal-200 hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex items-center mb-6">
                                        <div className="bg-cyan-100 rounded-xl p-3">
                                            <FontAwesomeIcon icon={faChartLine} className="h-8 w-8 text-cyan-700" />
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-bold text-teal-900 mb-3">Medical Analytics</h4>
                                    <p className="text-teal-600 leading-relaxed">Advanced reporting and analytics to track patient outcomes, clinic performance, and optimize healthcare delivery.</p>
                                </div>

                                <div className="bg-white rounded-xl p-8 shadow-lg border border-teal-200 hover:shadow-xl transition-shadow duration-300">
                                    <div className="flex items-center mb-6">
                                        <div className="bg-teal-100 rounded-xl p-3">
                                            <FontAwesomeIcon icon={faBolt} className="h-8 w-8 text-teal-600" />
                                        </div>
                                    </div>
                                    <h4 className="text-xl font-bold text-teal-900 mb-3">Smart Automation</h4>
                                    <p className="text-teal-600 leading-relaxed">Automated appointment reminders, prescription management, and intelligent scheduling to streamline operations.</p>
                                </div>
                            </div>
                        </div>

                        {/* Trust Indicators */}
                        <div className="mt-20 lg:mt-24 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-8 lg:p-12 shadow-lg border border-teal-200">
                            <h3 className="text-2xl lg:text-3xl font-bold text-teal-900 mb-8 text-center">
                                Trusted by Healthcare Professionals
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-teal-800 mb-2">200+</div>
                                    <div className="text-teal-600">Active Clinics</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-teal-800 mb-2">50K+</div>
                                    <div className="text-teal-600">Patients Managed</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-teal-800 mb-2">99.9%</div>
                                    <div className="text-teal-600">Uptime</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-teal-800 mb-2">24/7</div>
                                    <div className="text-teal-600">Support</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing Section */}
                <div id="pricing" className="mt-16 mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-teal-900 mb-4">Choose Your Healthcare Management Plan</h2>
                        <p className="text-lg text-teal-600 max-w-2xl mx-auto">
                            Select the perfect plan for your clinic operations. All plans include our core healthcare management features with different levels of support and integrations.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Basic Plan */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 opacity-0 group-hover:opacity-10 transition duration-200"></div>
                            <div className="relative p-8 bg-white rounded-xl border border-teal-200 shadow-sm hover:shadow-lg transition duration-200 h-full flex flex-col">
                                <div>
                                    <h3 className="text-xl font-bold text-teal-900 mb-2">Basic</h3>
                                    <p className="text-sm text-teal-600 mb-6">Perfect for small clinics and startups</p>
                                    <p className="mb-6">
                                        <span className="text-3xl font-extrabold text-teal-900">₱299</span>
                                        <span className="text-sm text-teal-600">/month</span>
                                    </p>
                                    {auth.user ? (
                                        <Link
                                            href={route('home')}
                                            className="block w-full py-3 px-4 border border-transparent rounded-lg shadow text-center text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors duration-200"
                                        >
                                            Go to My Account
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('register', { project: 'medical', plan: 'basic' })}
                                            className="block w-full py-3 px-4 border border-transparent rounded-lg shadow text-center text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors duration-200"
                                        >
                                            Get Started
                                        </Link>
                                    )}
                                </div>
                                <div className="flex-grow mt-6">
                                    <ul className="space-y-3">
                                        <li className="flex items-center text-sm">
                                            <svg className="h-4 w-4 text-teal-500 flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-teal-600">Up to 5 doctors</span>
                                        </li>
                                        <li className="flex items-center text-sm">
                                            <svg className="h-4 w-4 text-teal-500 flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-teal-600">Patient management</span>
                                        </li>
                                        <li className="flex items-center text-sm">
                                            <svg className="h-4 w-4 text-teal-500 flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-teal-600">Email support</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Pro Plan */}
                        <div className="relative group lg:-mt-4 lg:mb-4">
                            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 opacity-20 transition duration-200"></div>
                            <div className="relative p-8 bg-white rounded-xl border-2 border-emerald-500 shadow-lg h-full flex flex-col">
                                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                        Most Popular
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-teal-900 mb-2">Pro</h3>
                                    <p className="text-sm text-teal-600 mb-6">Ideal for growing medical practices</p>
                                    <p className="mb-6">
                                        <span className="text-3xl font-extrabold text-teal-900">₱499</span>
                                        <span className="text-sm text-teal-600">/month</span>
                                    </p>
                                    {auth.user ? (
                                        <Link
                                            href={route('home')}
                                            className="block w-full py-3 px-4 border border-transparent rounded-lg shadow text-center text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200"
                                        >
                                            Go to My Account
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('register', { project: 'medical', plan: 'professional' })}
                                            className="block w-full py-3 px-4 border border-transparent rounded-lg shadow text-center text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200"
                                        >
                                            Get Started
                                        </Link>
                                    )}
                                </div>
                                <div className="flex-grow mt-6">
                                    <ul className="space-y-3">
                                        <li className="flex items-center text-sm">
                                            <svg className="h-4 w-4 text-emerald-500 flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-teal-600">Up to 20 doctors</span>
                                        </li>
                                        <li className="flex items-center text-sm">
                                            <svg className="h-4 w-4 text-emerald-500 flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-teal-600">Advanced analytics</span>
                                        </li>
                                        <li className="flex items-center text-sm">
                                            <svg className="h-4 w-4 text-emerald-500 flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-teal-600">Priority support</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Enterprise Plan */}
                        <div className="relative group">
                            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 opacity-0 group-hover:opacity-10 transition duration-200"></div>
                            <div className="relative p-8 bg-white rounded-xl border border-teal-200 shadow-sm hover:shadow-lg transition duration-200 h-full flex flex-col">
                                <div>
                                    <h3 className="text-xl font-bold text-teal-900 mb-2">Business</h3>
                                    <p className="text-sm text-teal-600 mb-6">Perfect for large medical centers</p>
                                    <p className="mb-6">
                                        <span className="text-3xl font-extrabold text-teal-900">₱699</span>
                                        <span className="text-sm text-teal-600">/month</span>
                                    </p>
                                    {auth.user ? (
                                        <Link
                                            href={route('home')}
                                            className="block w-full py-3 px-4 border border-transparent rounded-lg shadow text-center text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 transition-colors duration-200"
                                        >
                                            Go to My Account
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('register', { project: 'medical', plan: 'business' })}
                                            className="block w-full py-3 px-4 border border-transparent rounded-lg shadow text-center text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 transition-colors duration-200"
                                        >
                                            Get Started
                                        </Link>
                                    )}
                                </div>
                                <div className="flex-grow mt-6">
                                    <ul className="space-y-3">
                                        <li className="flex items-center text-sm">
                                            <svg className="h-4 w-4 text-cyan-500 flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-teal-600">Unlimited doctors</span>
                                        </li>
                                        <li className="flex items-center text-sm">
                                            <svg className="h-4 w-4 text-cyan-500 flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-teal-600">Custom integrations</span>
                                        </li>
                                        <li className="flex items-center text-sm">
                                            <svg className="h-4 w-4 text-cyan-500 flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-teal-600">Dedicated support</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="mt-16">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-teal-200 max-w-4xl mx-auto">
                            <h3 className="text-2xl font-bold text-teal-900 mb-8 text-center">Frequently Asked Questions</h3>
                            <div className="w-full">
                                <dl className="space-y-6">
                                    <div className="bg-white rounded-lg p-6 border border-teal-200">
                                        <dt className="text-lg font-medium text-teal-900 mb-2">
                                            What happens if I exceed my doctor limit?
                                        </dt>
                                        <dd className="text-teal-600">
                                            You can upgrade your plan at any time. We'll notify you when you're approaching your limit and help you choose the right plan for your growing practice.
                                        </dd>
                                    </div>
                                    <div className="bg-white rounded-lg p-6 border border-teal-200">
                                        <dt className="text-lg font-medium text-teal-900 mb-2">
                                            Do you offer training for my medical staff?
                                        </dt>
                                        <dd className="text-teal-600">
                                            Yes, we provide comprehensive training materials, video tutorials, and live training sessions. Enterprise customers receive dedicated onboarding support.
                                        </dd>
                                    </div>
                                    <div className="bg-white rounded-lg p-6 border border-teal-200">
                                        <dt className="text-lg font-medium text-teal-900 mb-2">
                                            Is my patient data secure and HIPAA compliant?
                                        </dt>
                                        <dd className="text-teal-600">
                                            Absolutely. We use industry-leading security measures and are fully HIPAA compliant to ensure your patient data is protected at all times.
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer id="contact" className="bg-teal-900 text-white mt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {/* Company Info */}
                            <div className="col-span-1 md:col-span-2">
                                <div className="flex items-center mb-4">
                                    <div className="bg-teal-800 rounded-lg p-2 mr-3">
                                        <FontAwesomeIcon icon={faUserMd} className="h-6 w-6 text-white" />
                                    </div>
                                    <span className="text-xl font-bold">Medikal</span>
                                </div>
                                <p className="text-teal-300 mb-4 max-w-md">
                                    Streamline your clinic operations with our comprehensive healthcare management platform. Manage patients, appointments, and medical records with precision and reliability.
                                </p>
                                <div className="flex space-x-4">
                                    <a href="#" className="text-teal-400 hover:text-white transition-colors">
                                        <span className="sr-only">Facebook</span>
                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                        </svg>
                                    </a>
                                    <a href="#" className="text-teal-400 hover:text-white transition-colors">
                                        <span className="sr-only">LinkedIn</span>
                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h3 className="text-sm font-semibold text-teal-400 tracking-wider uppercase mb-4">Quick Links</h3>
                                <ul className="space-y-3">
                                    <li>
                                        <Link href="#features" className="text-teal-300 hover:text-white transition-colors text-sm">
                                            Features
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#pricing" className="text-teal-300 hover:text-white transition-colors text-sm">
                                            Pricing
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="text-teal-300 hover:text-white transition-colors text-sm">
                                            Help Center
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Legal Links */}
                            <div>
                                <h3 className="text-sm font-semibold text-teal-400 tracking-wider uppercase mb-4">Legal</h3>
                                <ul className="space-y-3">
                                    <li>
                                        <Link href={route('privacy-policy')} className="text-teal-300 hover:text-white transition-colors text-sm">
                                            Privacy Policy
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('terms-and-conditions')} className="text-teal-300 hover:text-white transition-colors text-sm">
                                            Terms of Service
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('cookie-policy')} className="text-teal-300 hover:text-white transition-colors text-sm">
                                            Cookie Policy
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('faq')} className="text-teal-300 hover:text-white transition-colors text-sm">
                                            FAQ
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Bottom Footer */}
                        <div className="border-t border-teal-800 mt-12 pt-8">
                            <div className="flex flex-col md:flex-row justify-between items-center">
                                <div className="text-teal-400 text-sm">
                                    © {new Date().getFullYear()} Medikal. All rights reserved.
                                </div>
                                <div className="flex items-center space-x-6 mt-4 md:mt-0">
                                    <div className="flex items-center text-teal-400 text-sm">
                                        <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                        HIPAA Compliant
                                    </div>
                                    <div className="flex items-center text-teal-400 text-sm">
                                        <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        A subsidiary of Sakto Technologies
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