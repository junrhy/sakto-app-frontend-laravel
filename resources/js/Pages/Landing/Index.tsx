import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState, useRef } from 'react';
import { getHost } from '@/lib/utils';

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
    const [isMobile, setIsMobile] = useState(false);
    const [scrollX, setScrollX] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
    const [isLegalDropdownOpen, setIsLegalDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const productsDropdownRef = useRef<HTMLDivElement>(null);
    const legalDropdownRef = useRef<HTMLDivElement>(null);
    const hostname = getHost();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
        };

        const handleScroll = () => {
            if (containerRef.current) {
                setScrollX(containerRef.current.scrollLeft);
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (productsDropdownRef.current && !productsDropdownRef.current.contains(event.target as Node)) {
                setIsProductsDropdownOpen(false);
            }
            if (legalDropdownRef.current && !legalDropdownRef.current.contains(event.target as Node)) {
                setIsLegalDropdownOpen(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        if (containerRef.current) {
            containerRef.current.addEventListener('scroll', handleScroll);
        }
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('resize', checkMobile);
            if (containerRef.current) {
                containerRef.current.removeEventListener('scroll', handleScroll);
            }
            document.removeEventListener('mousedown', handleClickOutside);
        };
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

    return (
        <>
            <Head title="Your all-in-one solution" />
            <div className="h-screen overflow-hidden relative">
                {/* Centralized Background */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-white to-transparent dark:from-gray-900 dark:to-gray-950"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-100/70 via-transparent to-transparent dark:from-indigo-900/10"></div>
                </div>
                {/* Navigation */}
                <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl mx-auto bg-white/90 backdrop-blur-sm border border-gray-100 dark:border-gray-800 dark:bg-gray-900/80 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 z-50">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-100" />
                                <span className="ml-2 text-xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent dark:text-gray-100">{hostname}</span>
                            </div>
                            <div className="flex items-center">
                                {/* Desktop Navigation */}
                                <div className="hidden md:flex items-center space-x-1">
                                            {/* Products Dropdown */}
                                            <div className="relative" ref={productsDropdownRef}>
                                                <button
                                                    onClick={() => setIsProductsDropdownOpen(!isProductsDropdownOpen)}
                                                    className="text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
                                                >
                                                    Apps
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
                                                className="text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
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

                                        </div>

                                        {/* Mobile Menu Button */}
                                        <div className="md:hidden">
                                            <button
                                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white focus:outline-none"
                                            >
                                                <svg
                                                    className="h-6 w-6"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    {isMenuOpen ? (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    ) : (
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                                    )}
                                                </svg>
                                            </button>
                                        </div>
                            </div>
                        </div>

                        {/* Mobile Menu */}
                        {isMenuOpen && (
                            <div className="md:hidden">
                                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                                    {/* Products Section */}
                                    <div className="px-3 py-2">
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Products
                                        </div>
                                        <div className="mt-2 space-y-1">
                                            {productsMenuItems.map((item) => (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                                        <Link
                                            href={route('features')}
                                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white"
                                        >
                                            Features
                                        </Link>
                                        <Link
                                            href={route('pricing')}
                                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white"
                                        >
                                            Pricing
                                        </Link>
                                        {/* Legal Section */}
                                        <div className="px-3 py-2">
                                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Legal
                                            </div>
                                            <div className="mt-2 space-y-1">
                                                {legalMenuItems.map((item) => (
                                                    <Link
                                                        key={item.name}
                                                        href={item.href}
                                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white"
                                                        onClick={() => setIsMenuOpen(false)}
                                                    >
                                                        {item.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Horizontal Scroll Container */}
                <div 
                    ref={containerRef}
                    className="h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-10"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    <div className="flex h-full">
                        {/* Hero Section */}
                        <section className="relative w-screen flex-shrink-0 h-full flex items-center justify-center overflow-hidden snap-start">
                            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
                                <div className="text-center">
                                    <h1 
                                        className="text-4xl tracking-tight font-extrabold text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 bg-clip-text dark:text-gray-100 sm:text-5xl md:text-6xl"
                                    >
                                        <span className="block">Choose Your Solution</span>
                                        <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:text-indigo-400">Tailored for Your Industry</span>
                                    </h1>
                                    <p 
                                        className="mt-3 max-w-md mx-auto text-base text-gray-600 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl"
                                    >
                                        Select from our specialized platforms designed for multiple sectors. Each solution comes with industry-specific features and tools to meet your unique needs.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* How It Works Section */}
                        <section className="relative w-screen flex-shrink-0 h-full flex items-center justify-center overflow-hidden snap-start">
                            <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
                                <div className="text-center mb-12">
                                    <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 bg-clip-text dark:text-gray-100 sm:text-4xl md:text-5xl mb-4">How It Works</h2>
                                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                                        Get started with our platform in just a few simple steps. Choose your solution and transform your business operations with ease.
                                    </p>
                                </div>
                                <div className="rounded-2xl p-8 shadow-lg border border-white/20 dark:bg-gray-800/80 dark:border-gray-700/20">

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                                        {/* Step 1 */}
                                        <div className="text-center">
                                            <div className="relative mb-6">
                                                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">1</span>
                                                </div>
                                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Choose Your Solution</h3>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                Select from our specialized platforms designed for your industry. Each solution comes with tailored features and tools.
                                            </p>
                                        </div>

                                        {/* Step 2 */}
                                        <div className="text-center">
                                            <div className="relative mb-6">
                                                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">2</span>
                                                </div>
                                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Set Up Your Platform</h3>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                Configure your settings, customize your dashboard, and integrate with your existing tools and workflows.
                                            </p>
                                        </div>

                                        {/* Step 3 */}
                                        <div className="text-center">
                                            <div className="relative mb-6">
                                                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
                                                </div>
                                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Start Operating</h3>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                Begin using your specialized platform. Manage operations, track performance, and optimize your business processes.
                                            </p>
                                        </div>

                                        {/* Step 4 */}
                                        <div className="text-center">
                                            <div className="relative mb-6">
                                                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">4</span>
                                                </div>
                                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Scale & Grow</h3>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                Monitor your success, analyze data, and scale your operations with advanced features and analytics.
                                            </p>
                                        </div>
                                    </div>


                                </div>
                            </div>
                        </section>



                        {/* CTA Section */}
                        <section className="relative w-screen flex-shrink-0 h-full flex items-center justify-center overflow-hidden snap-start">
                            <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
                                <div className="text-center">
                                    <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 bg-clip-text dark:text-gray-100 sm:text-4xl md:text-5xl">
                                        Ready to Transform Your Industry?
                                    </h2>
                                    <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                                        Choose your specialized solution and start your journey today
                                    </p>
                                    {!auth.user && (
                                        <div className="mt-12 max-w-6xl mx-auto">
                                                                                         {/* Tab Navigation */}
                                             <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-6 sm:mb-8">
                                                {[
                                                    { 
                                                        name: 'Komunidad', 
                                                        color: 'from-pink-500 to-rose-500',
                                                        description: 'Create and manage thriving communities with member engagement tools, event organization, content sharing, and real-time communication features. Perfect for organizations, clubs, and online communities.',
                                                        icon: (
                                                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                                            </svg>
                                                        ),
                                                        link: route('community')
                                                    },
                                                    { 
                                                        name: 'Logistika', 
                                                        color: 'from-cyan-500 to-blue-500',
                                                        description: 'Streamline your logistics operations with intelligent route optimization, real-time fleet tracking, delivery analytics, and comprehensive supply chain management tools. Ideal for delivery companies and transportation businesses.',
                                                        icon: (
                                                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                                            </svg>
                                                        ),
                                                        link: route('logistics')
                                                    },
                                                                                                            { 
                                                            name: 'Medikal', 
                                                            color: 'from-emerald-500 to-teal-500',
                                                            description: 'Transform healthcare delivery with comprehensive patient management, secure medical records, appointment scheduling, and health analytics. Designed for clinics, hospitals, and healthcare providers.',
                                                        icon: (
                                                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                                                            </svg>
                                                        ),
                                                        link: route('medical')
                                                    },
                                                                                                            { 
                                                            name: 'Lakbay', 
                                                            color: 'from-blue-500 to-indigo-600',
                                                            description: 'Revolutionize travel planning with comprehensive flight booking, hotel reservations, travel packages, and insurance services. Complete solution for travel agencies and tour operators.',
                                                        icon: (
                                                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                                            </svg>
                                                        ),
                                                        link: route('travel.landing')
                                                    },
                                                                                                            { 
                                                            name: 'Hatid', 
                                                            color: 'from-purple-500 to-violet-500',
                                                            description: 'Optimize retail operations with advanced order management, inventory tracking, delivery scheduling, and customer analytics. Perfect for retail stores and e-commerce businesses.',
                                                        icon: (
                                                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                                            </svg>
                                                        ),
                                                        link: route('delivery')
                                                    },
                                                                                                            { 
                                                            name: 'Taohan', 
                                                            color: 'from-indigo-500 to-blue-600',
                                                            description: 'Streamline HR operations with comprehensive employee management, recruitment tools, performance tracking, and payroll integration. Essential for businesses of all sizes.',
                                                        icon: (
                                                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                                            </svg>
                                                        ),
                                                        link: route('jobs')
                                                    },
                                                                                                            { 
                                                            name: 'Merkado', 
                                                            color: 'from-green-500 to-emerald-600',
                                                            description: 'Launch and scale your online business with powerful product management, order processing, payment integration, and customer support tools. Complete e-commerce solution.',
                                                        icon: (
                                                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.5c.513 0 1.024.195 1.414.586L9 9.414V18a1 1 0 001 1h2a1 1 0 001-1v-4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1V9.414l3.836-3.828A2.25 2.25 0 0021.75 3h-1.5a2.25 2.25 0 00-2.25 2.25v.75a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-.75A2.25 2.25 0 004.5 3z" />
                                                            </svg>
                                                        ),
                                                        link: route('shop')
                                                    },
                                                ].map((project, index) => (
                                                    <button
                                                        key={project.name}
                                                        onClick={() => setActiveTab(index)}
                                                                                                                 className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                                                             activeTab === index
                                                                 ? `bg-gradient-to-r ${project.color} text-white shadow-lg`
                                                                 : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                         }`}
                                                    >
                                                                                                                 <div className={`${activeTab === index ? 'text-white' : `text-${project.color.split('-')[1]}-500`}`}>
                                                             {project.icon}
                                                         </div>
                                                         <span className="hidden sm:inline">{project.name}</span>
                                                    </button>
                                                ))}
                                            </div>

                                                                                         {/* Tab Content */}
                                             <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
                                                {(() => {
                                                    const projects = [
                                                        { 
                                                            name: 'Community', 
                                                            color: 'from-pink-500 to-rose-500',
                                                            description: 'Create and manage thriving communities with member engagement tools, event organization, content sharing, and real-time communication features. Perfect for organizations, clubs, and online communities.',
                                                            icon: (
                                                                <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                                                </svg>
                                                            ),
                                                            link: route('register', { project: 'community' })
                                                        },
                                                        { 
                                                            name: 'Logistics', 
                                                            color: 'from-cyan-500 to-blue-500',
                                                            description: 'Streamline your logistics operations with intelligent route optimization, real-time fleet tracking, delivery analytics, and comprehensive supply chain management tools. Ideal for delivery companies and transportation businesses.',
                                                            icon: (
                                                                <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                                                </svg>
                                                            ),
                                                            link: route('register', { project: 'logistics' })
                                                        },
                                                        { 
                                                            name: 'Medical', 
                                                            color: 'from-emerald-500 to-teal-500',
                                                            description: 'Transform healthcare delivery with comprehensive patient management, secure medical records, appointment scheduling, and health analytics. Designed for clinics, hospitals, and healthcare providers.',
                                                            icon: (
                                                                <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                                                                </svg>
                                                            ),
                                                                                                                         link: route('register', { project: 'medical' })
                                                        },
                                                        { 
                                                            name: 'Travel', 
                                                            color: 'from-blue-500 to-indigo-600',
                                                            description: 'Revolutionize travel planning with comprehensive flight booking, hotel reservations, travel packages, and insurance services. Complete solution for travel agencies and tour operators.',
                                                            icon: (
                                                                <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                                                </svg>
                                                            ),
                                                            link: route('register', { project: 'travel' })
                                                        },
                                                        { 
                                                            name: 'Retail Delivery', 
                                                            color: 'from-purple-500 to-violet-500',
                                                            description: 'Optimize retail operations with advanced order management, inventory tracking, delivery scheduling, and customer analytics. Perfect for retail stores and e-commerce businesses.',
                                                            icon: (
                                                                <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                                                </svg>
                                                            ),
                                                            link: route('register', { project: 'retail-delivery' })
                                                        },
                                                        { 
                                                            name: 'Human Resources', 
                                                            color: 'from-indigo-500 to-blue-600',
                                                            description: 'Streamline HR operations with comprehensive employee management, recruitment tools, performance tracking, and payroll integration. Essential for businesses of all sizes.',
                                                            icon: (
                                                                <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                                                </svg>
                                                            ),
                                                            link: route('register', { project: 'human-resources' })
                                                        },
                                                        { 
                                                            name: 'E-Commerce', 
                                                            color: 'from-green-500 to-emerald-600',
                                                            description: 'Launch and scale your online business with powerful product management, order processing, payment integration, and customer support tools. Complete e-commerce solution.',
                                                            icon: (
                                                                <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.5c.513 0 1.024.195 1.414.586L9 9.414V18a1 1 0 001 1h2a1 1 0 001-1v-4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1V9.414l3.836-3.828A2.25 2.25 0 0021.75 3h-1.5a2.25 2.25 0 00-2.25 2.25v.75a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-.75A2.25 2.25 0 004.5 3z" />
                                                                </svg>
                                                            ),
                                                            link: route('register', { project: 'ecommerce' })
                                                        },
                                                        { 
                                                            name: 'Enterprise', 
                                                            color: 'from-orange-500 to-amber-500',
                                                            description: 'Unified platform combining all solutions with advanced analytics, custom integrations, and enterprise-grade security. Perfect for large organizations and growing businesses.',
                                                            icon: (
                                                                <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                                                                </svg>
                                                            ),
                                                            link: route('register', { project: 'enterprise' })
                                                        },
                                                    ];
                                                    
                                                    const project = projects[activeTab];
                                                    
                                                                                                         return (
                                                         <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-8">
                                                             <div className={`flex-shrink-0 inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${project.color} p-4 sm:p-6 shadow-lg`}>
                                                                                                                              <div className="text-white">
                                                                 <svg className="w-8 h-8 sm:w-12 sm:h-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                     {(() => {
                                                                         switch(project.name) {
                                                                             case 'Community':
                                                                                 return <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />;
                                                                             case 'Logistics':
                                                                                 return <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />;
                                                                             case 'Medical':
                                                                                 return <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />;
                                                                             case 'Travel':
                                                                                 return <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />;
                                                                             case 'Retail Delivery':
                                                                                 return <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />;
                                                                             case 'Human Resources':
                                                                                 return <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />;
                                                                             case 'E-Commerce':
                                                                                 return <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.5c.513 0 1.024.195 1.414.586L9 9.414V18a1 1 0 001 1h2a1 1 0 001-1v-4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1V9.414l3.836-3.828A2.25 2.25 0 0021.75 3h-1.5a2.25 2.25 0 00-2.25 2.25v.75a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-.75A2.25 2.25 0 004.5 3z" />;
                                                                             case 'Enterprise':
                                                                                 return <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />;
                                                                             default:
                                                                                 return <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />;
                                                                         }
                                                                     })()}
                                                                 </svg>
                                                             </div>
                                                             </div>
                                                             <div className="flex-1 text-center lg:text-left">
                                                                 <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                                                     {project.name}
                                                                 </h3>
                                                                 <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
                                                                     {project.description}
                                                                 </p>
                                                             </div>
                                                             <div className="flex-shrink-0 flex items-center">
                                                                 <Link
                                                                     href={project.link}
                                                                     className={`inline-flex items-center px-4 sm:px-6 py-2 sm:py-2.5 text-sm font-medium text-white bg-gradient-to-r ${project.color} rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200`}
                                                                 >
                                                                     Get Started
                                                                 </Link>
                                                             </div>
                                                         </div>
                                                     );
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Scroll Indicators */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-50">
                    {/* Show 3 indicators for Hero, How It Works, and CTA sections */}
                    {[0, 1, 2].map((index) => (
                        <button
                            key={index}
                            onClick={() => {
                                if (containerRef.current) {
                                    containerRef.current.scrollTo({
                                        left: window.innerWidth * index,
                                        behavior: 'smooth'
                                    });
                                }
                            }}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                Math.round(scrollX / window.innerWidth) === index
                                    ? 'bg-indigo-600 w-8'
                                    : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
