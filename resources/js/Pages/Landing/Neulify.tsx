import NeulifyLogo from '@/Components/NeulifyLogo';
import { getHost } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

interface PageProps extends Record<string, any> {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
}

export default function Neulify({ auth }: PageProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isPartnersDropdownOpen, setIsPartnersDropdownOpen] = useState(false);
    const partnersDropdownRef = useRef<HTMLDivElement>(null);
    const hostname = getHost();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (
                partnersDropdownRef.current &&
                !partnersDropdownRef.current.contains(event.target as Node)
            ) {
                setIsPartnersDropdownOpen(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('resize', checkMobile);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const partnersMenuItems = [
        { name: 'Sakto Solutions', href: route('landing'), description: 'Philippine Market Partner' },
        // Future partners can be added here
    ];

    return (
        <>
            <Head title="Neulify - Empowering Digital Innovation" />
            <div className="relative min-h-screen">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#F9FAFB] via-white to-transparent dark:from-gray-900 dark:to-gray-950"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#14B8A6]/20 via-transparent to-transparent dark:from-[#14B8A6]/10"></div>
                {/* Navigation */}
                <nav className="fixed left-1/2 top-4 z-50 mx-auto w-[95%] max-w-7xl -translate-x-1/2 rounded-2xl border border-[#E2E8F0] bg-white/90 shadow-lg shadow-[#334155]/10 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80 dark:shadow-gray-900/50">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex items-center">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="flex items-center hover:opacity-80 transition-opacity duration-200"
                                >
                                    <NeulifyLogo className="block h-9 w-auto" />
                                </button>
                            </div>
                            <div className="flex items-center">
                                {/* Desktop Navigation */}
                                <div className="hidden items-center space-x-1 md:flex">
                                    <a
                                        href="#about"
                                        className="rounded-md px-3 py-2 text-sm font-medium text-[#334155] transition-colors duration-200 hover:text-[#14B8A6] dark:text-gray-200 dark:hover:text-white"
                                    >
                                        About Us
                                    </a>
                                    <a
                                        href="#values"
                                        className="rounded-md px-3 py-2 text-sm font-medium text-[#334155] transition-colors duration-200 hover:text-[#14B8A6] dark:text-gray-200 dark:hover:text-white"
                                    >
                                        Core Values
                                    </a>
                                    <div className="mx-2 h-6 w-px bg-[#E2E8F0] dark:bg-gray-700"></div>
                                    {/* Partners Dropdown */}
                                    <div
                                        className="relative"
                                        ref={partnersDropdownRef}
                                    >
                                        <button
                                            onClick={() =>
                                                setIsPartnersDropdownOpen(
                                                    !isPartnersDropdownOpen,
                                                )
                                            }
                                            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-[#334155] transition-colors duration-200 hover:text-[#14B8A6] dark:text-gray-200 dark:hover:text-white"
                                        >
                                            Partners
                                            <svg
                                                className={`ml-1 h-4 w-4 transition-transform duration-200 ${isPartnersDropdownOpen ? 'rotate-180' : ''}`}
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </button>
                                        {isPartnersDropdownOpen && (
                                            <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-[#E2E8F0] bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                                {partnersMenuItems.map((partner) => (
                                                    <Link
                                                        key={partner.name}
                                                        href={partner.href}
                                                        className="block px-4 py-3 text-sm text-[#334155] transition-colors duration-200 hover:bg-[#14B8A6]/10 hover:text-[#14B8A6] dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white"
                                                        onClick={() =>
                                                            setIsPartnersDropdownOpen(
                                                                false,
                                                            )
                                                        }
                                                    >
                                                        <div className="font-medium">{partner.name}</div>
                                                        <div className="text-xs text-[#334155]/70 dark:text-gray-400">{partner.description}</div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Mobile Menu Button */}
                                <div className="md:hidden">
                                    <button
                                        onClick={() =>
                                            setIsMenuOpen(!isMenuOpen)
                                        }
                                        className="inline-flex items-center justify-center rounded-md p-2 text-[#334155] hover:text-[#14B8A6] focus:outline-none dark:text-gray-200 dark:hover:text-white"
                                    >
                                        <svg
                                            className="h-6 w-6"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            {isMenuOpen ? (
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            ) : (
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 6h16M4 12h16M4 18h16"
                                                />
                                            )}
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Menu */}
                        {isMenuOpen && (
                            <div className="md:hidden">
                                <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                                    <div className="border-t border-[#E2E8F0] pt-2 dark:border-gray-700">
                                        <a
                                            href="#about"
                                            className="block rounded-md px-3 py-2 text-base font-medium text-[#334155] hover:text-[#14B8A6] dark:text-gray-200 dark:hover:text-white"
                                        >
                                            About Us
                                        </a>
                                        <a
                                            href="#values"
                                            className="block rounded-md px-3 py-2 text-base font-medium text-[#334155] hover:text-[#14B8A6] dark:text-gray-200 dark:hover:text-white"
                                        >
                                            Core Values
                                        </a>
                                        {/* Partners Section */}
                                        <div className="px-3 py-2">
                                            <div className="text-sm font-medium uppercase tracking-wider text-[#334155]/70 dark:text-gray-400">
                                                Partners
                                            </div>
                                            <div className="mt-2 space-y-1">
                                                {partnersMenuItems.map((partner) => (
                                                    <Link
                                                        key={partner.name}
                                                        href={partner.href}
                                                        className="block rounded-md px-3 py-2 text-base font-medium text-[#334155] hover:text-[#14B8A6] dark:text-gray-200 dark:hover:text-white"
                                                        onClick={() =>
                                                            setIsMenuOpen(false)
                                                        }
                                                    >
                                                        <div className="font-medium">{partner.name}</div>
                                                        <div className="text-xs text-[#334155]/70 dark:text-gray-400">{partner.description}</div>
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

                {/* Content */}
                <div className="relative z-10">
                    {/* Hero Section */}
                    <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
                        <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
                            <div className="text-center">
                                <h1 className="bg-gradient-to-r from-[#1E3A8A] via-[#334155] to-[#1E3A8A] bg-clip-text text-4xl font-extrabold tracking-tight text-transparent dark:text-gray-100 sm:text-5xl md:text-6xl">
                                    <span className="block">
                                        Neulify
                                    </span>
                                    <span className="block bg-gradient-to-r from-[#14B8A6] to-[#06B6D4] bg-clip-text text-transparent dark:text-[#14B8A6]">
                                        Empowering Digital Innovation
                                    </span>
                                </h1>
                                <p className="mx-auto mt-3 max-w-md text-base text-[#334155] dark:text-gray-300 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
                                    We are a technology company dedicated to creating innovative digital solutions that transform industries and empower businesses to thrive in the digital age.
                                </p>
                                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    <Link
                                        href={route('landing')}
                                        className="inline-flex items-center rounded-lg bg-gradient-to-r from-[#1E3A8A] to-[#14B8A6] px-6 py-3 text-base font-medium text-white shadow-lg transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                    >
                                        Explore Our Solutions
                                    </Link>
                                    <a
                                        href="#about"
                                        className="inline-flex items-center rounded-lg border border-[#E2E8F0] bg-white px-6 py-3 text-base font-medium text-[#334155] shadow-sm transition-all duration-200 hover:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                                    >
                                        Learn More
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* About Section */}
                    <section id="about" className="relative flex min-h-screen items-center justify-center overflow-hidden">
                        <div className="relative mx-auto w-full max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
                                <div className="mb-12 text-center">
                                    <h2 className="mb-4 bg-gradient-to-r from-[#1E3A8A] via-[#334155] to-[#1E3A8A] bg-clip-text text-3xl font-extrabold tracking-tight text-transparent dark:text-gray-100 sm:text-4xl md:text-5xl">
                                        About Neulify
                                    </h2>
                                    <p className="mx-auto max-w-3xl text-xl text-[#334155] dark:text-gray-300">
                                        We believe in the power of technology to solve real-world problems and create meaningful impact across various industries.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-[#E2E8F0] p-8 shadow-lg dark:border-gray-700/20 dark:bg-gray-800/80">
                                    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                        {/* Mission */}
                                        <div className="text-center">
                                            <div className="relative mb-6">
                                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#14B8A6]/10 dark:bg-[#14B8A6]/20">
                                                    <svg
                                                        className="h-8 w-8 text-[#14B8A6] dark:text-[#14B8A6]"
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
                                            </div>
                                            <h3 className="mb-3 text-xl font-semibold text-[#334155] dark:text-gray-100">
                                                Our Mission
                                            </h3>
                                            <p className="text-[#334155]/80 dark:text-gray-300">
                                                To empower businesses and organizations with cutting-edge digital solutions that drive innovation, efficiency, and growth.
                                            </p>
                                        </div>

                                        {/* Vision */}
                                        <div className="text-center">
                                            <div className="relative mb-6">
                                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#06B6D4]/10 dark:bg-[#06B6D4]/20">
                                                    <svg
                                                        className="h-8 w-8 text-[#06B6D4] dark:text-[#06B6D4]"
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
                                            </div>
                                            <h3 className="mb-3 text-xl font-semibold text-[#334155] dark:text-gray-100">
                                                Our Vision
                                            </h3>
                                            <p className="text-[#334155]/80 dark:text-gray-300">
                                                To be the leading force in digital transformation, creating a world where technology seamlessly integrates with human potential.
                                            </p>
                                        </div>

                                        {/* Values */}
                                        <div className="text-center">
                                            <div className="relative mb-6">
                                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#1E3A8A]/10 dark:bg-[#1E3A8A]/20">
                                                    <svg
                                                        className="h-8 w-8 text-[#1E3A8A] dark:text-[#1E3A8A]"
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
                                            </div>
                                            <h3 className="mb-3 text-xl font-semibold text-[#334155] dark:text-gray-100">
                                                Our Values
                                            </h3>
                                            <p className="text-[#334155]/80 dark:text-gray-300">
                                                Innovation, integrity, and excellence guide everything we do. We believe in building lasting partnerships and delivering exceptional value.
                                            </p>
                                        </div>
                                    </div>
                            </div>
                        </div>
                    </section>

                    {/* Company Values Section */}
                    <section id="values" className="relative flex min-h-screen items-center justify-center overflow-hidden">
                        <div className="relative mx-auto w-full max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
                            <div className="text-center">
                                <h2 className="bg-gradient-to-r from-[#1E3A8A] via-[#334155] to-[#1E3A8A] bg-clip-text text-3xl font-extrabold tracking-tight text-transparent dark:text-gray-100 sm:text-4xl md:text-5xl">
                                    Our Core Values
                                </h2>
                                <p className="mx-auto mt-6 max-w-3xl text-xl text-[#334155] dark:text-gray-300">
                                    The principles that guide everything we do and shape our company culture.
                                </p>
                                <div className="mx-auto mt-12 max-w-6xl">
                                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                        {[
                                            {
                                                title: 'Innovation',
                                                description: 'We constantly push boundaries and embrace new technologies to create cutting-edge solutions that drive progress.',
                                                icon: (
                                                    <svg
                                                        className="h-12 w-12"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                                                        />
                                                    </svg>
                                                ),
                                                color: 'from-[#14B8A6] to-[#06B6D4]',
                                            },
                                            {
                                                title: 'Integrity',
                                                description: 'We operate with honesty, transparency, and ethical practices in all our business relationships and decisions.',
                                                icon: (
                                                    <svg
                                                        className="h-12 w-12"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                                                        />
                                                    </svg>
                                                ),
                                                color: 'from-[#1E3A8A] to-[#14B8A6]',
                                            },
                                            {
                                                title: 'Excellence',
                                                description: 'We strive for the highest quality in everything we do, from our products to our customer service.',
                                                icon: (
                                                    <svg
                                                        className="h-12 w-12"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                                                        />
                                                    </svg>
                                                ),
                                                color: 'from-[#06B6D4] to-[#14B8A6]',
                                            },
                                            {
                                                title: 'Collaboration',
                                                description: 'We believe in the power of teamwork and building strong partnerships with our clients and stakeholders.',
                                                icon: (
                                                    <svg
                                                        className="h-12 w-12"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                                                        />
                                                    </svg>
                                                ),
                                                color: 'from-[#14B8A6] to-[#1E3A8A]',
                                            },
                                            {
                                                title: 'Growth',
                                                description: 'We are committed to continuous learning, improvement, and helping our clients achieve their full potential.',
                                                icon: (
                                                    <svg
                                                        className="h-12 w-12"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
                                                        />
                                                    </svg>
                                                ),
                                                color: 'from-[#06B6D4] to-[#1E3A8A]',
                                            },
                                            {
                                                title: 'Impact',
                                                description: 'We measure our success by the positive impact we create for our clients, communities, and the world.',
                                                icon: (
                                                    <svg
                                                        className="h-12 w-12"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 00-1.5-.189M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                                                        />
                                                    </svg>
                                                ),
                                                color: 'from-[#1E3A8A] to-[#06B6D4]',
                                            },
                                        ].map((value) => (
                                            <div
                                                key={value.title}
                                                className="group rounded-xl border border-[#E2E8F0] bg-white p-8 shadow-sm transition-all duration-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                                            >
                                                <div className={`inline-flex items-center justify-center rounded-lg bg-gradient-to-r ${value.color} p-4 text-white shadow-lg`}>
                                                    {value.icon}
                                                </div>
                                                <h3 className="mt-6 text-xl font-semibold text-[#334155] dark:text-gray-100">
                                                    {value.title}
                                                </h3>
                                                <p className="mt-4 text-[#334155]/80 dark:text-gray-300">
                                                    {value.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <footer className="relative z-10 border-t border-[#E2E8F0] bg-white/90 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/90">
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
                            <div className="flex items-center gap-4 text-sm text-[#334155] dark:text-gray-400">
                                <span>© {new Date().getFullYear()}</span>
                                <span className="bg-gradient-to-r from-[#1E3A8A] to-[#14B8A6] bg-clip-text font-semibold text-transparent">
                                    Neulify
                                </span>
                                <span>All rights reserved.</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-[#334155]/70 dark:text-gray-500">
                                <span>Empowering the next generation of digital innovation.</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
