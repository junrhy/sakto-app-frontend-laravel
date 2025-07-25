import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

interface PageProps {
    auth?: {
        user: {
            name: string;
            email: string;
        };
    };
}

export default function HelpCenter({ auth }: PageProps) {
    return (
        <>
            <Head title="Help Center - Sakto Technologies" />
            <div className="min-h-screen bg-blue-100 scroll-smooth relative overflow-hidden">
                {/* Curved Wave Background */}
                <div className="absolute inset-0">
                    <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="wave1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style={{stopColor: '#3B82F6', stopOpacity: 0.1}} />
                                <stop offset="100%" style={{stopColor: '#8B5CF6', stopOpacity: 0.1}} />
                            </linearGradient>
                            <linearGradient id="wave2" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style={{stopColor: '#10B981', stopOpacity: 0.08}} />
                                <stop offset="100%" style={{stopColor: '#06B6D4', stopOpacity: 0.08}} />
                            </linearGradient>
                        </defs>
                        {/* Top wave */}
                        <path d="M0,200 Q300,100 600,200 T1200,200 L1200,0 L0,0 Z" fill="url(#wave1)" />
                        {/* Middle wave */}
                        <path d="M0,400 Q400,300 800,400 T1200,400 L1200,200 L0,200 Z" fill="url(#wave2)" />
                        {/* Bottom wave */}
                        <path d="M0,600 Q200,500 600,600 T1200,600 L1200,400 L0,400 Z" fill="url(#wave1)" />
                    </svg>
                </div>

                {/* Header */}
                <div className="bg-blue-600 shadow-sm border-b border-blue-700 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <ApplicationLogo className="block h-8 w-auto fill-current text-white" />
                                <div className="ml-3">
                                    <div className="text-2xl font-bold text-white leading-tight">Komunidad</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        {/* Hero Section */}
                        <div className="text-center mb-16">
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                                Help <span className="text-blue-600">Center</span>
                            </h1>
                            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                                Find answers to your questions, learn how to use our platform, and get the support you need to succeed with Komunidad.
                            </p>
                        </div>

                        {/* Quick Help Categories */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 text-center hover:shadow-xl transition-shadow duration-200">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">Getting Started</h3>
                                <p className="text-slate-600 text-sm">
                                    Learn the basics and set up your community
                                </p>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 text-center hover:shadow-xl transition-shadow duration-200">
                                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">User Guide</h3>
                                <p className="text-slate-600 text-sm">
                                    Detailed guides for all features
                                </p>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 text-center hover:shadow-xl transition-shadow duration-200">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">Troubleshooting</h3>
                                <p className="text-slate-600 text-sm">
                                    Solve common issues and problems
                                </p>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 text-center hover:shadow-xl transition-shadow duration-200">
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">Contact Support</h3>
                                <p className="text-slate-600 text-sm">
                                    Get help from our support team
                                </p>
                            </div>
                        </div>

                        {/* FAQ Section */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Frequently Asked Questions</h2>
                            <div className="max-w-4xl mx-auto space-y-6">
                                <div className="bg-white rounded-lg p-6 border border-slate-200">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                                        How do I create my first community?
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        After signing up, you can create your community by clicking the "Get Started" button in your dashboard. 
                                        You'll be guided through a simple setup process where you can customize your community name, description, 
                                        and initial settings. The process takes just a few minutes to complete.
                                    </p>
                                </div>

                                <div className="bg-white rounded-lg p-6 border border-slate-200">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                                        How can I invite members to my community?
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        You can invite members in several ways: by sending email invitations directly from the platform, 
                                        by sharing a unique invitation link, or by allowing public registration if you prefer an open community. 
                                        All invitations can be customized with your own message and include specific permissions.
                                    </p>
                                </div>

                                <div className="bg-white rounded-lg p-6 border border-slate-200">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                                        What payment methods do you accept?
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        We accept all major credit cards (Visa, Mastercard, JCB, AMEX) and popular e-wallets including Maya, 
                                        GCash, WeChat Pay, and ShopeePay via QR Ph. All payments are processed securely through our trusted 
                                        payment partners to ensure your financial information is protected.
                                    </p>
                                </div>

                                <div className="bg-white rounded-lg p-6 border border-slate-200">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                                        Can I change my subscription plan?
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        Yes, you can upgrade or downgrade your subscription plan at any time from your account settings. 
                                        Changes will be reflected in your next billing cycle. If you upgrade, you'll get immediate access 
                                        to new features. If you downgrade, the changes will take effect at the start of your next billing period.
                                    </p>
                                </div>

                                <div className="bg-white rounded-lg p-6 border border-slate-200">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                                        How secure is my community data?
                                    </h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        We take security seriously. All data is encrypted in transit and at rest using industry-standard protocols. 
                                        We regularly perform security audits and maintain compliance with data protection regulations. 
                                        Your community information is backed up regularly and stored securely in our cloud infrastructure.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Getting Started Guide */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20 mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Getting Started Guide</h2>
                            <div className="max-w-4xl mx-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-xl font-semibold text-slate-900 mb-4">Step 1: Sign Up</h3>
                                        <p className="text-slate-600 leading-relaxed mb-4">
                                            Create your account by providing your basic information. Choose a strong password and verify your email address to get started.
                                        </p>
                                        <ul className="text-slate-600 space-y-2 text-sm">
                                            <li>• Fill in your name and email address</li>
                                            <li>• Choose a secure password</li>
                                            <li>• Verify your email address</li>
                                            <li>• Complete your profile setup</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold text-slate-900 mb-4">Step 2: Choose Your Plan</h3>
                                        <p className="text-slate-600 leading-relaxed mb-4">
                                            Select the plan that best fits your community needs. You can always upgrade or downgrade later.
                                        </p>
                                        <ul className="text-slate-600 space-y-2 text-sm">
                                            <li>• Basic: Perfect for small communities</li>
                                            <li>• Pro: Ideal for growing communities</li>
                                            <li>• Business: For established organizations</li>
                                            <li>• All plans include core features</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold text-slate-900 mb-4">Step 3: Create Your Community</h3>
                                        <p className="text-slate-600 leading-relaxed mb-4">
                                            Set up your community with a name, description, and initial configuration.
                                        </p>
                                        <ul className="text-slate-600 space-y-2 text-sm">
                                            <li>• Choose a community name</li>
                                            <li>• Write a compelling description</li>
                                            <li>• Upload a profile picture</li>
                                            <li>• Configure privacy settings</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-semibold text-slate-900 mb-4">Step 4: Invite Members</h3>
                                        <p className="text-slate-600 leading-relaxed mb-4">
                                            Start building your community by inviting members and setting up communication channels.
                                        </p>
                                        <ul className="text-slate-600 space-y-2 text-sm">
                                            <li>• Send email invitations</li>
                                            <li>• Share invitation links</li>
                                            <li>• Set member permissions</li>
                                            <li>• Welcome new members</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Support */}
                        <div className="text-center">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
                                <h2 className="text-3xl font-bold mb-4">Need More Help?</h2>
                                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                                    Can't find what you're looking for? Our support team is here to help you succeed with Komunidad.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <a
                                        href="mailto:support@sakto.com"
                                        className="inline-flex items-center px-8 py-4 border border-white text-lg font-medium rounded-lg text-white hover:bg-white hover:text-blue-600 transition-colors duration-200"
                                    >
                                        Email Support
                                    </a>
                                    <Link
                                        href={route('register', { project: 'community' })}
                                        className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-blue-600 bg-white hover:bg-slate-50 transition-colors duration-200"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-slate-900 text-white mt-16 relative z-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {/* Company Info */}
                            <div className="col-span-1 md:col-span-2">
                                <div className="flex items-center mb-4">
                                    <ApplicationLogo className="block h-8 w-auto fill-current text-white" />
                                    <span className="ml-2 text-xl font-bold">Komunidad</span>
                                </div>
                                <p className="text-slate-300 mb-4 max-w-md">
                                    Connecting communities and fostering meaningful relationships through our secure and trusted platform.
                                </p>
                                <div className="flex space-x-4">
                                    <a href="#" className="text-slate-400 hover:text-white transition-colors">
                                        <span className="sr-only">Facebook</span>
                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                        </svg>
                                    </a>
                                    <a href="#" className="text-slate-400 hover:text-white transition-colors">
                                        <span className="sr-only">LinkedIn</span>
                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                                        </svg>
                                    </a>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase mb-4">Quick Links</h3>
                                <ul className="space-y-3">
                                    <li>
                                        <Link href={route('community.about')} className="text-slate-300 hover:text-white transition-colors text-sm">
                                            About Us
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('community')} className="text-slate-300 hover:text-white transition-colors text-sm">
                                            Home
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Legal Links */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase mb-4">Legal</h3>
                                <ul className="space-y-3">
                                    <li>
                                        <Link href={route('privacy-policy')} className="text-slate-300 hover:text-white transition-colors text-sm">
                                            Privacy Policy
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('terms-and-conditions')} className="text-slate-300 hover:text-white transition-colors text-sm">
                                            Terms of Service
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('cookie-policy')} className="text-slate-300 hover:text-white transition-colors text-sm">
                                            Cookie Policy
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('faq')} className="text-slate-300 hover:text-white transition-colors text-sm">
                                            FAQ
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Bottom Footer */}
                        <div className="border-t border-slate-800 mt-12 pt-8">
                            <div className="flex flex-col md:flex-row justify-between items-center">
                                <div className="text-slate-400 text-sm">
                                    © {new Date().getFullYear()} Komunidad. All rights reserved.
                                </div>
                                <div className="flex items-center space-x-6 mt-4 md:mt-0">
                                    <div className="flex items-center text-slate-400 text-sm">
                                        <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                        Secure Platform
                                    </div>
                                    <div className="flex items-center text-slate-400 text-sm">
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
        </>
    );
} 