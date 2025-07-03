import ApplicationLogo from '@/Components/ApplicationLogo';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState, useRef } from 'react';

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
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
        };

        const handleScroll = () => {
            if (containerRef.current) {
                setScrollX(containerRef.current.scrollLeft);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        if (containerRef.current) {
            containerRef.current.addEventListener('scroll', handleScroll);
        }

        return () => {
            window.removeEventListener('resize', checkMobile);
            if (containerRef.current) {
                containerRef.current.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    return (
        <>
            <Head title="Your all-in-one solution" />
            <div className="h-screen overflow-hidden bg-gradient-to-b from-white via-indigo-50/30 to-white dark:bg-gray-950">
                {/* Navigation */}
                <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl mx-auto bg-white/90 backdrop-blur-sm border border-gray-100 dark:border-gray-800 dark:bg-gray-900/80 rounded-2xl shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 z-50">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-100" />
                                <span className="ml-2 text-xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent dark:text-gray-100">Sakto</span>
                            </div>
                            <div className="flex items-center">
                                {auth.user ? (
                                    <Link
                                        href={route('home')}
                                        className="text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                    >
                                        Home
                                    </Link>
                                ) : (
                                    <>
                                        {/* Desktop Navigation */}
                                        <div className="hidden md:flex items-center space-x-1">
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
                                            <Link
                                                href={route('privacy-policy')}
                                                className="text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                            >
                                                Privacy
                                            </Link>
                                            <Link
                                                href={route('terms-and-conditions')}
                                                className="text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                            >
                                                Terms
                                            </Link>
                                            <Link
                                                href={route('cookie-policy')}
                                                className="text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                            >
                                                Cookies
                                            </Link>
                                            <Link
                                                href={route('faq')}
                                                className="text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                            >
                                                FAQ
                                            </Link>
                                            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
                                            <Link
                                                href={route(isMobile ? 'login.mobile' : 'login')}
                                                className="group inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                            >
                                                <span>Log in</span>
                                                <svg className="ml-2 -mr-1 w-4 h-4 group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </Link>
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
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Mobile Menu */}
                        {isMenuOpen && (
                            <div className="md:hidden">
                                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
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
                                    <Link
                                        href={route('privacy-policy')}
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white"
                                    >
                                        Privacy
                                    </Link>
                                    <Link
                                        href={route('terms-and-conditions')}
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white"
                                    >
                                        Terms
                                    </Link>
                                    <Link
                                        href={route('cookie-policy')}
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white"
                                    >
                                        Cookies
                                    </Link>
                                    <Link
                                        href={route('faq')}
                                        className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-indigo-600 dark:text-gray-200 dark:hover:text-white"
                                    >
                                        FAQ
                                    </Link>
                                    <Link
                                        href={route(isMobile ? 'login.mobile' : 'login')}
                                        className="block w-full text-center px-4 py-2 mt-4 rounded-md text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600"
                                    >
                                        Log in
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Horizontal Scroll Container */}
                <div 
                    ref={containerRef}
                    className="h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    <div className="flex h-full">
                        {/* Hero Section */}
                        <section className="relative min-w-full h-full flex items-center justify-center overflow-hidden snap-start">
                            <div 
                                className="absolute inset-0 bg-gradient-to-b from-indigo-50 via-white to-transparent dark:from-gray-900 dark:to-gray-950"
                                style={{ transform: `translateX(${scrollX * 0.5}px)` }}
                            ></div>
                            <div 
                                className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-100/70 via-transparent to-transparent dark:from-indigo-900/10"
                                style={{ transform: `translateX(${scrollX * 0.3}px)` }}
                            ></div>
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
                                        Select from our specialized platforms designed for Community, Logistics, Medical, and Enterprise sectors. Each solution comes with industry-specific features and tools to meet your unique needs.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Community Information Section */}
                        <section className="relative min-w-full h-full hidden md:flex items-center justify-center overflow-hidden snap-start">
                            <div 
                                className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/20 to-transparent dark:via-indigo-500/5"
                                style={{ transform: `translateX(${scrollX * 0.4}px)` }}
                            ></div>
                            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="text-center mb-12">
                                    <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">
                                        Community Platform
                                    </h2>
                                    <p className="mt-2 text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 bg-clip-text text-transparent dark:text-gray-100 sm:text-4xl">
                                        Build and Grow Your Community
                                    </p>
                                    <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                        Create meaningful connections and foster engagement within your community
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                                    {[
                                        {
                                            title: 'Member Management',
                                            description: 'Easily manage member profiles, roles, and permissions with our intuitive interface.',
                                            icon: (
                                                <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                                </svg>
                                            ),
                                        },
                                        {
                                            title: 'Event Organization',
                                            description: 'Plan and host events, manage registrations, and track attendance seamlessly.',
                                            icon: (
                                                <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                                </svg>
                                            ),
                                        },
                                        {
                                            title: 'Content Sharing',
                                            description: 'Share and organize content with built-in tools for discussions, blogs, and resources.',
                                            icon: (
                                                <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                                                </svg>
                                            ),
                                        },
                                    ].map((feature) => (
                                        <div key={feature.title} className="relative group">
                                            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-30 transition duration-200"></div>
                                            <div className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 transition duration-200">
                                                <div className="inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-white dark:bg-gray-900 p-2 mb-4 shadow-sm">
                                                    {feature.icon}
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                    {feature.title}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-300">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Logistics Platform Section */}
                        <section className="relative min-w-full h-full hidden md:flex items-center justify-center overflow-hidden snap-start">
                            <div 
                                className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/80 via-transparent to-transparent dark:from-indigo-500/10 dark:via-transparent dark:to-transparent"
                                style={{ transform: `translateX(${scrollX * 0.3}px)` }}
                            ></div>
                            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="text-center mb-16">
                                    <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">
                                        Logistics Platform
                                    </h2>
                                    <p className="mt-2 text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 bg-clip-text text-transparent dark:text-gray-100 sm:text-4xl">
                                        Optimize Your Supply Chain
                                    </p>
                                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                        Streamline your logistics operations with our comprehensive delivery and fleet management solutions
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                                    {[
                                        {
                                            title: 'Route Optimization',
                                            description: 'Intelligent route planning and real-time tracking to minimize delivery time and fuel costs.',
                                            icon: (
                                                <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                                                </svg>
                                            ),
                                        },
                                        {
                                            title: 'Fleet Management',
                                            description: 'Comprehensive tools for vehicle tracking, maintenance scheduling, and driver management.',
                                            icon: (
                                                <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                                </svg>
                                            ),
                                        },
                                    ].map((feature) => (
                                        <div key={feature.title} className="relative group">
                                            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-30 transition duration-200"></div>
                                            <div className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 transition duration-200">
                                                <div className="inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-white dark:bg-gray-900 p-2 mb-4 shadow-sm">
                                                    {feature.icon}
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                    {feature.title}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-300">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Medical Information Section */}
                        <section className="relative min-w-full h-full hidden md:flex items-center justify-center overflow-hidden snap-start">
                            <div 
                                className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/20 to-transparent dark:via-indigo-500/5"
                                style={{ transform: `translateX(${scrollX * 0.2}px)` }}
                            ></div>
                            <div 
                                className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/80 via-transparent to-transparent dark:from-indigo-500/10 dark:via-transparent dark:to-transparent"
                                style={{ transform: `translateX(${scrollX * 0.1}px)` }}
                            ></div>
                            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="text-center mb-12">
                                    <h2 className="text-base font-semibold leading-7 text-indigo-600 dark:text-indigo-400">
                                        Medical Platform
                                    </h2>
                                    <p className="mt-2 text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 bg-clip-text text-transparent dark:text-gray-100 sm:text-4xl">
                                        Healthcare Solutions
                                    </p>
                                    <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
                                        Streamline healthcare delivery with our comprehensive medical platform
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                                    {[
                                        {
                                            title: 'Patient Management',
                                            description: 'Efficiently manage patient records, appointments, and medical history with our secure system.',
                                            icon: (
                                                <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                                                </svg>
                                            ),
                                        },
                                        {
                                            title: 'Medical Records',
                                            description: 'Secure and organized storage of medical records with easy access and sharing capabilities.',
                                            icon: (
                                                <svg className="h-8 w-8 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                                </svg>
                                            ),
                                        },
                                    ].map((feature) => (
                                        <div key={feature.title} className="relative group">
                                            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-30 transition duration-200"></div>
                                            <div className="relative p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 transition duration-200">
                                                <div className="inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-white dark:bg-gray-900 p-2 mb-4 shadow-sm">
                                                    {feature.icon}
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                                    {feature.title}
                                                </h3>
                                                <p className="text-gray-600 dark:text-gray-300">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* CTA Section */}
                        <section className="relative min-w-full h-full flex items-center justify-center overflow-hidden snap-start">
                            <div 
                                className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"
                                style={{ transform: `translateX(${scrollX * 0.1}px)` }}
                            ></div>
                            <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="text-center">
                                    <h2 className="text-4xl font-extrabold tracking-tight text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 bg-clip-text dark:text-gray-100 sm:text-5xl md:text-6xl">
                                        Ready to Transform Your Industry?
                                    </h2>
                                    <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                                        Choose your specialized platform and start your journey today
                                    </p>
                                    {!auth.user && (
                                        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
                                            {[
                                                { 
                                                    name: 'Community Apps', 
                                                    color: 'from-pink-500 to-rose-500',
                                                    description: 'Build and manage vibrant communities',
                                                    icon: (
                                                        <svg className="w-6 h-6 sm:w-8 sm:h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                                                        </svg>
                                                    ),
                                                    link: route('community')
                                                },
                                                { 
                                                    name: 'Logistics Apps', 
                                                    color: 'from-cyan-500 to-blue-500',
                                                    description: 'Optimize your supply chain',
                                                    icon: (
                                                        <svg className="w-6 h-6 sm:w-8 sm:h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                                                        </svg>
                                                    ),
                                                    link: route('logistics')
                                                },
                                                { 
                                                    name: 'Medical Apps', 
                                                    color: 'from-emerald-500 to-teal-500',
                                                    description: 'Enhance healthcare delivery',
                                                    icon: (
                                                        <svg className="w-6 h-6 sm:w-8 sm:h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                                                        </svg>
                                                    ),
                                                    link: route('register', { project: 'medical' })
                                                },
                                                { 
                                                    name: 'Enterprise Apps', 
                                                    color: 'from-orange-500 to-amber-500',
                                                    description: 'All apps in one place. Scale your business.',
                                                    icon: (
                                                        <svg className="w-6 h-6 sm:w-8 sm:h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                                                        </svg>
                                                    ),
                                                    link: route('register', { project: 'enterprise' })
                                                },
                                            ].map((project) => (
                                                <div
                                                    key={project.name}
                                                    className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300"
                                                >
                                                    <div className="relative p-6">
                                                        <div className="flex flex-col items-center">
                                                            <div className={`inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${project.color} p-3 mb-4 shadow-sm`}>
                                                                <div className="text-white">
                                                                    {project.icon}
                                                                </div>
                                                            </div>
                                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 text-center">
                                                                {project.name}
                                                            </h3>
                                                            <p className="hidden sm:block text-sm text-gray-600 dark:text-gray-300 mt-2 mb-6 text-center">
                                                                {project.description}
                                                            </p>
                                                            <Link
                                                                href={project.link}
                                                                className={`w-full px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r ${project.color} rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${project.color.split('-')[1]}-500 transition-all duration-200`}
                                                            >
                                                                Get Started
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Scroll Indicators */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 z-50">
                    {isMobile ? (
                        // Mobile: Show only 2 indicators for Hero and CTA sections
                        [0, 4].map((index) => (
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
                        ))
                    ) : (
                        // Desktop: Show all 5 indicators
                        [0, 1, 2, 3, 4].map((index) => (
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
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
