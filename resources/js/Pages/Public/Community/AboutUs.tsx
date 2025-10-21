import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link } from '@inertiajs/react';

interface PageProps {
    auth?: {
        user: {
            name: string;
            email: string;
        };
    };
}

export default function AboutUs({ auth }: PageProps) {
    return (
        <>
            <Head title="About Us - Sakto Technologies" />
            <div className="relative min-h-screen overflow-hidden scroll-smooth bg-blue-100">
                {/* Curved Wave Background */}
                <div className="absolute inset-0">
                    <svg
                        className="h-full w-full"
                        viewBox="0 0 1200 800"
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <linearGradient
                                id="wave1"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                            >
                                <stop
                                    offset="0%"
                                    style={{
                                        stopColor: '#3B82F6',
                                        stopOpacity: 0.1,
                                    }}
                                />
                                <stop
                                    offset="100%"
                                    style={{
                                        stopColor: '#8B5CF6',
                                        stopOpacity: 0.1,
                                    }}
                                />
                            </linearGradient>
                            <linearGradient
                                id="wave2"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                            >
                                <stop
                                    offset="0%"
                                    style={{
                                        stopColor: '#10B981',
                                        stopOpacity: 0.08,
                                    }}
                                />
                                <stop
                                    offset="100%"
                                    style={{
                                        stopColor: '#06B6D4',
                                        stopOpacity: 0.08,
                                    }}
                                />
                            </linearGradient>
                        </defs>
                        {/* Top wave */}
                        <path
                            d="M0,200 Q300,100 600,200 T1200,200 L1200,0 L0,0 Z"
                            fill="url(#wave1)"
                        />
                        {/* Middle wave */}
                        <path
                            d="M0,400 Q400,300 800,400 T1200,400 L1200,200 L0,200 Z"
                            fill="url(#wave2)"
                        />
                        {/* Bottom wave */}
                        <path
                            d="M0,600 Q200,500 600,600 T1200,600 L1200,400 L0,400 Z"
                            fill="url(#wave1)"
                        />
                    </svg>
                </div>

                {/* Header */}
                <div className="relative border-b border-blue-700 bg-blue-600 shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <ApplicationLogo className="block h-8 w-auto fill-current text-white" />
                                <div className="ml-3">
                                    <div className="text-2xl font-bold leading-tight text-white">
                                        Community
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative z-10">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        {/* Hero Section */}
                        <div className="mb-16 text-center">
                            <h1 className="mb-6 text-4xl font-bold text-slate-900 md:text-5xl">
                                About{' '}
                                <span className="text-blue-600">Community</span>
                            </h1>
                            <p className="mx-auto max-w-3xl text-xl text-slate-600">
                                Empowering communities and businesses with
                                innovative digital solutions that connect,
                                streamline, and grow your operations.
                            </p>
                        </div>

                        {/* Mission & Vision */}
                        <div className="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-2">
                            <div className="rounded-2xl border border-white/20 bg-white/80 p-8 shadow-lg backdrop-blur-sm">
                                <div className="mb-6 flex items-center">
                                    <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                                        <svg
                                            className="h-6 w-6 text-blue-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                            />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        Our Mission
                                    </h2>
                                </div>
                                <p className="leading-relaxed text-slate-600">
                                    To provide cutting-edge digital solutions
                                    that empower communities and businesses to
                                    thrive in the modern world. We believe in
                                    creating technology that connects people,
                                    streamlines operations, and drives
                                    sustainable growth.
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/20 bg-white/80 p-8 shadow-lg backdrop-blur-sm">
                                <div className="mb-6 flex items-center">
                                    <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                                        <svg
                                            className="h-6 w-6 text-emerald-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">
                                        Our Vision
                                    </h2>
                                </div>
                                <p className="leading-relaxed text-slate-600">
                                    To be the leading platform for community
                                    management and business operations,
                                    fostering meaningful connections and
                                    enabling organizations to reach their full
                                    potential through innovative technology
                                    solutions.
                                </p>
                            </div>
                        </div>

                        {/* Company Story */}
                        <div className="mb-16 rounded-2xl border border-white/20 bg-white/80 p-8 shadow-lg backdrop-blur-sm">
                            <h2 className="mb-8 text-center text-3xl font-bold text-slate-900">
                                Our Story
                            </h2>
                            <div className="mx-auto max-w-4xl">
                                <p className="mb-6 leading-relaxed text-slate-600">
                                    Founded with a passion for technology and
                                    community building, Community emerged from
                                    the recognition that modern organizations
                                    need comprehensive digital solutions to
                                    manage their operations effectively.
                                </p>
                                <p className="mb-6 leading-relaxed text-slate-600">
                                    Our journey began with a simple idea: create
                                    a platform that brings together all the
                                    essential tools that communities and
                                    businesses need in one place. From contact
                                    management to event planning, from financial
                                    tracking to communication tools, we've built
                                    a comprehensive ecosystem that grows with
                                    you.
                                </p>
                                <p className="leading-relaxed text-slate-600">
                                    Today, we serve thousands of organizations
                                    across the Philippines and beyond, helping
                                    them build stronger communities, streamline
                                    their operations, and achieve their goals
                                    through our innovative platform.
                                </p>
                            </div>
                        </div>

                        {/* Core Values */}
                        <div className="mb-16">
                            <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">
                                Our Core Values
                            </h2>
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                                <div className="text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                        <svg
                                            className="h-8 w-8 text-blue-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="mb-3 text-xl font-semibold text-slate-900">
                                        Passion
                                    </h3>
                                    <p className="text-slate-600">
                                        We're passionate about creating
                                        solutions that make a real difference in
                                        people's lives and organizations.
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                                        <svg
                                            className="h-8 w-8 text-emerald-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="mb-3 text-xl font-semibold text-slate-900">
                                        Trust
                                    </h3>
                                    <p className="text-slate-600">
                                        We build trust through transparency,
                                        reliability, and consistent delivery of
                                        high-quality solutions.
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                                        <svg
                                            className="h-8 w-8 text-purple-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M13 10V3L4 14h7v7l9-11h-7z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="mb-3 text-xl font-semibold text-slate-900">
                                        Innovation
                                    </h3>
                                    <p className="text-slate-600">
                                        We continuously innovate and adapt to
                                        meet the evolving needs of our users and
                                        the market.
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                                        <svg
                                            className="h-8 w-8 text-orange-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="mb-3 text-xl font-semibold text-slate-900">
                                        Community
                                    </h3>
                                    <p className="text-slate-600">
                                        We believe in the power of community and
                                        strive to build connections that
                                        strengthen organizations.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Team Section */}
                        <div className="mb-16 rounded-2xl border border-white/20 bg-white/80 p-8 shadow-lg backdrop-blur-sm">
                            <h2 className="mb-8 text-center text-3xl font-bold text-slate-900">
                                Our Team
                            </h2>
                            <div className="mx-auto max-w-4xl text-center">
                                <p className="mb-8 leading-relaxed text-slate-600">
                                    Our team consists of passionate developers,
                                    designers, and business professionals who
                                    are dedicated to creating the best possible
                                    experience for our users. We work together
                                    to ensure that every feature we build serves
                                    a real purpose and adds value to your
                                    organization.
                                </p>
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                                    <div className="text-center">
                                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600">
                                            <svg
                                                className="h-12 w-12 text-white"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="mb-2 text-lg font-semibold text-slate-900">
                                            Development
                                        </h3>
                                        <p className="text-sm text-slate-600">
                                            Expert developers crafting robust
                                            and scalable solutions
                                        </p>
                                    </div>

                                    <div className="text-center">
                                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600">
                                            <svg
                                                className="h-12 w-12 text-white"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="mb-2 text-lg font-semibold text-slate-900">
                                            Design
                                        </h3>
                                        <p className="text-sm text-slate-600">
                                            Creative designers focused on user
                                            experience and aesthetics
                                        </p>
                                    </div>

                                    <div className="text-center">
                                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-purple-600">
                                            <svg
                                                className="h-12 w-12 text-white"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="mb-2 text-lg font-semibold text-slate-900">
                                            Support
                                        </h3>
                                        <p className="text-sm text-slate-600">
                                            Comprehensive automated support
                                            system ensuring your success with
                                            our platform
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact CTA */}
                        <div className="text-center">
                            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
                                <h2 className="mb-4 text-3xl font-bold">
                                    Ready to Get Started?
                                </h2>
                                <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100">
                                    Join thousands of organizations that trust
                                    Community to manage their communities and
                                    streamline their operations.
                                </p>
                                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                                    <Link
                                        href={route('register', {
                                            project: 'community',
                                        })}
                                        className="inline-flex items-center rounded-lg border border-white px-8 py-4 text-lg font-medium text-white transition-colors duration-200 hover:bg-white hover:text-blue-600"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="relative z-20 mt-16 bg-slate-900 text-white">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                            {/* Company Info */}
                            <div className="col-span-1 md:col-span-2">
                                <div className="mb-4 flex items-center">
                                    <ApplicationLogo className="block h-8 w-auto fill-current text-white" />
                                    <span className="ml-2 text-xl font-bold">
                                        Community
                                    </span>
                                </div>
                                <p className="mb-4 max-w-md text-slate-300">
                                    Connecting communities and fostering
                                    meaningful relationships through our secure
                                    and trusted platform.
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
                                            href={route('community')}
                                            className="text-sm text-slate-300 transition-colors hover:text-white"
                                        >
                                            Home
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href={route('community.help')}
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
                                    © {new Date().getFullYear()} Community. All
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
