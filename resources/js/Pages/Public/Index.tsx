import ApplicationLogo from '@/Components/ApplicationLogo';
import SolutionsDialog from '@/Components/SolutionsDialog';
import { getHost } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import {
    Briefcase,
    GraduationCap,
    HardHat,
    Landmark,
    Package,
    Plane,
    Rocket,
    ShoppingBag,
    Sprout,
    Stethoscope,
    Truck,
    Users,
    UtensilsCrossed,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface PageProps extends Record<string, any> {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
}

export default function Welcome({ auth }: PageProps) {
    const [isMobile, setIsMobile] = useState(false);
    const [scrollX, setScrollX] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLegalDropdownOpen, setIsLegalDropdownOpen] = useState(false);
    const [isSolutionsDialogOpen, setIsSolutionsDialogOpen] = useState(true);
    const [userCountry, setUserCountry] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const legalDropdownRef = useRef<HTMLDivElement>(null);
    const autoSlideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentScrollXRef = useRef(0);
    const resetAutoSlideRef = useRef<(() => void) | null>(null);
    const hostname = getHost();

    // Country-specific currency configuration
    // Easily add more countries here in the future
    const countryCurrencyMap: Record<
        string,
        { currency: string; symbol: string }
    > = {
        PH: { currency: 'php', symbol: '₱' },
        // Add more countries as needed:
        // 'US': { currency: 'usd', symbol: '$' },
        // 'GB': { currency: 'gbp', symbol: '£' },
        // 'EU': { currency: 'eur', symbol: '€' },
    };

    // Detect user's country on component mount
    useEffect(() => {
        const detectCountry = async () => {
            try {
                // Using ipapi.co free API for geolocation
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                if (data.country_code) {
                    setUserCountry(data.country_code);
                }
            } catch (error) {
                console.log('Could not detect country:', error);
                // Fallback: no currency params will be added
            }
        };
        detectCountry();
    }, []);

    // Function to get URL with currency parameters if applicable
    const getUrlWithCurrency = (
        baseUrl: string,
        additionalParams: Record<string, string> = {},
    ): string => {
        const params = new URLSearchParams();

        // Add currency params if applicable
        if (userCountry && countryCurrencyMap[userCountry]) {
            const { currency, symbol } = countryCurrencyMap[userCountry];
            params.append('currency', currency);
            params.append('symbol', symbol);
        }

        // Add any additional params
        Object.entries(additionalParams).forEach(([key, value]) => {
            params.append(key, value);
        });

        const queryString = params.toString();
        return queryString ? `${baseUrl}?${queryString}` : baseUrl;
    };

    // Solutions data
    const solutions = [
        {
            name: 'Community',
            description:
                'Enterprise community management platform for organizations to connect teams, manage events, and streamline communications',
            icon: Users,
            href: '/community',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            comingSoon: false,
        },
        {
            name: 'Medical',
            description:
                'B2B healthcare management system for medical facilities to streamline appointments, patient records, and clinic operations',
            icon: Stethoscope,
            href: '/medical',
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            comingSoon: false,
        },
        {
            name: 'Logistics',
            description:
                'Business logistics platform for companies to manage shipments, optimize delivery routes, and track fleet operations',
            icon: Truck,
            href: '/logistics',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
            comingSoon: false,
        },
        {
            name: 'Shop',
            description:
                'B2B e-commerce platform for businesses to manage wholesale operations, inventory, and corporate purchasing',
            icon: ShoppingBag,
            href: '/shop',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            comingSoon: true,
        },
        {
            name: 'Delivery',
            description:
                'Enterprise delivery management solution for businesses to coordinate food service, catering, and supply chain operations',
            icon: Package,
            href: '/delivery',
            color: 'text-red-600',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
            comingSoon: true,
        },
        {
            name: 'Jobs',
            description:
                'Corporate recruitment platform for businesses to manage hiring, employee onboarding, and workforce planning',
            icon: Briefcase,
            href: '/jobs',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
            comingSoon: true,
        },
        {
            name: 'Travel',
            description:
                'Business travel management system for corporate bookings, expense tracking, and employee travel coordination',
            icon: Plane,
            href: '/travel',
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
            comingSoon: true,
        },
        {
            name: 'F&B',
            description:
                'Restaurant and hospitality management platform for food service businesses to handle operations, inventory, and orders',
            icon: UtensilsCrossed,
            href: '/fnb',
            color: 'text-amber-600',
            bgColor: 'bg-amber-50 dark:bg-amber-900/20',
            comingSoon: false,
        },
        {
            name: 'Education',
            description:
                'Educational institution management system for schools and training centers to manage courses, students, and administration',
            icon: GraduationCap,
            href: '/education',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
            comingSoon: true,
        },
        {
            name: 'Finance',
            description:
                'Business financial management platform for enterprises to handle accounting, budgeting, and financial reporting',
            icon: Landmark,
            href: '/finance',
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
            comingSoon: true,
        },
        {
            name: 'Agriculture',
            description:
                'Agribusiness management system for farms and agricultural enterprises to optimize operations, yields, and supply chains',
            icon: Sprout,
            href: '/agriculture',
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            comingSoon: true,
        },
        {
            name: 'Construction',
            description:
                'Construction project management platform for contractors and builders to manage projects, teams, and resources',
            icon: HardHat,
            href: '/construction',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
            comingSoon: true,
        },
    ];

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
        };

        const handleScroll = () => {
            if (containerRef.current) {
                const scrollLeft = containerRef.current.scrollLeft;
                setScrollX(scrollLeft);
                currentScrollXRef.current = scrollLeft;
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (
                legalDropdownRef.current &&
                !legalDropdownRef.current.contains(event.target as Node)
            ) {
                setIsLegalDropdownOpen(false);
            }
        };

        const handleWheel = (event: WheelEvent) => {
            if (!containerRef.current) return;

            // Only handle wheel events when the container is in view
            const rect = containerRef.current.getBoundingClientRect();
            const isInView = rect.top <= 0 && rect.bottom >= window.innerHeight;

            if (!isInView) return;

            // Prevent default scrolling behavior
            event.preventDefault();

            const currentIndex = Math.round(scrollX / window.innerWidth);
            const maxIndex = 2; // We have 3 slides (0, 1, 2)

            if (event.deltaY > 0) {
                // Scrolling down - go to next slide
                const nextIndex = Math.min(maxIndex, currentIndex + 1);
                if (nextIndex !== currentIndex) {
                    containerRef.current.scrollTo({
                        left: window.innerWidth * nextIndex,
                        behavior: 'smooth',
                    });
                }
            } else {
                // Scrolling up - go to previous slide
                const prevIndex = Math.max(0, currentIndex - 1);
                if (prevIndex !== currentIndex) {
                    containerRef.current.scrollTo({
                        left: window.innerWidth * prevIndex,
                        behavior: 'smooth',
                    });
                }
            }

            // Reset auto-slide timer on user interaction
            resetAutoSlide();
        };

        const startAutoSlide = () => {
            if (autoSlideTimeoutRef.current) {
                clearTimeout(autoSlideTimeoutRef.current);
            }

            autoSlideTimeoutRef.current = setTimeout(() => {
                if (!containerRef.current) return;

                const currentIndex = Math.round(
                    currentScrollXRef.current / window.innerWidth,
                );
                const maxIndex = 2; // We have 3 slides (0, 1, 2)
                const nextIndex =
                    currentIndex >= maxIndex ? 0 : currentIndex + 1; // Loop back to first slide

                containerRef.current.scrollTo({
                    left: window.innerWidth * nextIndex,
                    behavior: 'smooth',
                });

                // Continue auto-sliding
                startAutoSlide();
            }, 12000); // 12 seconds delay
        };

        const resetAutoSlide = () => {
            if (autoSlideTimeoutRef.current) {
                clearTimeout(autoSlideTimeoutRef.current);
            }
            startAutoSlide();
        };

        // Assign the function to the ref so it can be accessed outside useEffect
        resetAutoSlideRef.current = resetAutoSlide;

        const stopAutoSlide = () => {
            if (autoSlideTimeoutRef.current) {
                clearTimeout(autoSlideTimeoutRef.current);
                autoSlideTimeoutRef.current = null;
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        if (containerRef.current) {
            containerRef.current.addEventListener('scroll', handleScroll);
            containerRef.current.addEventListener('wheel', handleWheel, {
                passive: false,
            });
        }
        document.addEventListener('mousedown', handleClickOutside);

        // Add event listeners for user interactions to reset auto-slide
        const handleUserInteraction = () => {
            resetAutoSlide();
        };

        // Listen for various user interactions
        document.addEventListener('mousedown', handleUserInteraction);
        document.addEventListener('mousemove', handleUserInteraction);
        document.addEventListener('keydown', handleUserInteraction);
        document.addEventListener('touchstart', handleUserInteraction);

        // Start auto-slide
        startAutoSlide();

        return () => {
            window.removeEventListener('resize', checkMobile);
            if (containerRef.current) {
                containerRef.current.removeEventListener(
                    'scroll',
                    handleScroll,
                );
                containerRef.current.removeEventListener('wheel', handleWheel);
            }
            document.removeEventListener('mousedown', handleClickOutside);

            // Remove user interaction listeners
            document.removeEventListener('mousedown', handleUserInteraction);
            document.removeEventListener('mousemove', handleUserInteraction);
            document.removeEventListener('keydown', handleUserInteraction);
            document.removeEventListener('touchstart', handleUserInteraction);

            // Stop auto-slide
            stopAutoSlide();
        };
    }, []);

    const legalMenuItems = [
        { name: 'Privacy Policy', href: route('privacy-policy') },
        { name: 'Terms & Conditions', href: route('terms-and-conditions') },
        { name: 'Cookie Policy', href: route('cookie-policy') },
        { name: 'FAQ', href: route('faq') },
    ];

    return (
        <>
            <Head title="Your all-in-one solution" />
            <div className="relative h-screen overflow-hidden">
                {/* Centralized Background */}
                <div className="pointer-events-none fixed inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#F9FAFB] via-white to-transparent dark:from-gray-900 dark:to-gray-950"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#14B8A6]/20 via-transparent to-transparent dark:from-[#14B8A6]/10"></div>
                </div>
                {/* Navigation */}
                <nav className="fixed left-0 right-0 top-0 z-50 border-b border-[#E2E8F0]/50 bg-white/95 shadow-sm backdrop-blur-md dark:border-gray-700/50 dark:bg-gray-900/95">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 justify-between">
                            <div className="flex items-center">
                                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-100" />
                                <span className="ml-2 bg-gradient-to-r from-[#1E3A8A] to-[#14B8A6] bg-clip-text text-xl font-bold text-transparent dark:text-gray-100">
                                    {hostname}
                                </span>
                            </div>
                            <div className="flex items-center">
                                {/* Desktop Navigation */}
                                <div className="hidden items-center space-x-8 md:flex">
                                    {/* Our Solutions Button */}
                                    <button
                                        onClick={() =>
                                            setIsSolutionsDialogOpen(true)
                                        }
                                        className="text-sm font-medium text-[#334155] transition-colors duration-200 hover:text-[#14B8A6] dark:text-gray-200 dark:hover:text-white"
                                    >
                                        Our Solutions
                                    </button>
                                    {hostname === 'Neulify' && (
                                        <Link
                                            href={route('neulify')}
                                            className="text-sm font-medium text-[#334155] transition-colors duration-200 hover:text-[#14B8A6] dark:text-gray-200 dark:hover:text-white"
                                        >
                                            Our Company
                                        </Link>
                                    )}
                                    <Link
                                        href={route('features')}
                                        className="text-sm font-medium text-[#334155] transition-colors duration-200 hover:text-[#14B8A6] dark:text-gray-200 dark:hover:text-white"
                                    >
                                        Features
                                    </Link>
                                    <Link
                                        href={route('pricing')}
                                        className="text-sm font-medium text-[#334155] transition-colors duration-200 hover:text-[#14B8A6] dark:text-gray-200 dark:hover:text-white"
                                    >
                                        Pricing
                                    </Link>
                                    <div className="mx-2 h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
                                    {/* Legal Dropdown */}
                                    <div
                                        className="relative"
                                        ref={legalDropdownRef}
                                    >
                                        <button
                                            onClick={() =>
                                                setIsLegalDropdownOpen(
                                                    !isLegalDropdownOpen,
                                                )
                                            }
                                            className="flex items-center space-x-1 text-sm font-medium text-[#334155] transition-colors duration-200 hover:text-[#14B8A6] dark:text-gray-200 dark:hover:text-white"
                                        >
                                            Legal
                                            <svg
                                                className={`ml-1 h-4 w-4 transition-transform duration-200 ${isLegalDropdownOpen ? 'rotate-180' : ''}`}
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
                                        {isLegalDropdownOpen && (
                                            <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-[#E2E8F0] bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                                {legalMenuItems.map((item) => (
                                                    <Link
                                                        key={item.name}
                                                        href={item.href}
                                                        className="block px-4 py-2 text-sm text-[#334155] transition-colors duration-200 hover:bg-[#14B8A6]/10 hover:text-[#14B8A6] dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white"
                                                        onClick={() =>
                                                            setIsLegalDropdownOpen(
                                                                false,
                                                            )
                                                        }
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
                                    {/* Our Solutions Button */}
                                    <button
                                        onClick={() => {
                                            setIsSolutionsDialogOpen(true);
                                            setIsMenuOpen(false);
                                        }}
                                        className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-[#334155] hover:text-[#14B8A6] dark:text-gray-200 dark:hover:text-white"
                                    >
                                        Our Solutions
                                    </button>
                                    <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                                        {hostname === 'Neulify' && (
                                            <Link
                                                href={route('neulify')}
                                                className="block rounded-md px-3 py-2 text-base font-medium text-[#334155] hover:text-[#14B8A6] dark:text-gray-200 dark:hover:text-white"
                                            >
                                                Our Company
                                            </Link>
                                        )}
                                        <Link
                                            href={route('features')}
                                            className="block rounded-md px-3 py-2 text-base font-medium text-[#334155] hover:text-[#14B8A6] dark:text-gray-200 dark:hover:text-white"
                                        >
                                            Features
                                        </Link>
                                        <Link
                                            href={route('pricing')}
                                            className="block rounded-md px-3 py-2 text-base font-medium text-[#334155] hover:text-[#14B8A6] dark:text-gray-200 dark:hover:text-white"
                                        >
                                            Pricing
                                        </Link>
                                        {/* Legal Section */}
                                        <div className="px-3 py-2">
                                            <div className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Legal
                                            </div>
                                            <div className="mt-2 space-y-1">
                                                {legalMenuItems.map((item) => (
                                                    <Link
                                                        key={item.name}
                                                        href={item.href}
                                                        className="block rounded-md px-3 py-2 text-base font-medium text-[#334155] hover:text-[#14B8A6] dark:text-gray-200 dark:hover:text-white"
                                                        onClick={() =>
                                                            setIsMenuOpen(false)
                                                        }
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
                    className="scrollbar-hide relative z-10 h-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    <div className="flex h-full">
                        {/* Hero Section */}
                        <section className="relative flex h-full w-screen flex-shrink-0 snap-start items-center justify-center overflow-hidden">
                            <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
                                <div className="text-center">
                                    <h1 className="bg-gradient-to-r from-[#1E3A8A] via-[#334155] to-[#1E3A8A] bg-clip-text text-4xl font-extrabold tracking-tight text-transparent dark:text-gray-100 sm:text-5xl md:text-6xl">
                                        <span className="block">
                                            Choose Your Solution
                                        </span>
                                        <span className="block bg-gradient-to-r from-[#14B8A6] to-[#06B6D4] bg-clip-text text-transparent dark:text-[#14B8A6]">
                                            Tailored for Your Industry
                                        </span>
                                    </h1>
                                    {hostname !== 'Neulify' && (
                                        <div className="mt-4 flex items-center justify-center gap-2">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                Powered by
                                            </span>
                                            <Link
                                                href={route('neulify')}
                                                className="bg-gradient-to-r from-[#14B8A6] to-[#06B6D4] bg-clip-text text-lg font-bold text-transparent transition-all duration-200 hover:scale-105 hover:from-[#0D9488] hover:to-[#0891B2]"
                                            >
                                                Neulify
                                            </Link>
                                        </div>
                                    )}
                                    <p className="mx-auto mt-3 max-w-md text-base text-gray-600 dark:text-gray-300 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
                                        Select from our specialized platforms
                                        designed for multiple sectors. Each
                                        solution comes with industry-specific
                                        features and tools to meet your unique
                                        needs.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* How It Works Section */}
                        <section className="relative flex h-full w-screen flex-shrink-0 snap-start items-center justify-center overflow-hidden">
                            <div className="relative mx-auto w-full max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
                                <div className="mb-12 text-center">
                                    <h2 className="mb-4 bg-gradient-to-r from-[#1E3A8A] via-[#334155] to-[#1E3A8A] bg-clip-text text-3xl font-extrabold tracking-tight text-transparent dark:text-gray-100 sm:text-4xl md:text-5xl">
                                        How It Works
                                    </h2>
                                    <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-300">
                                        Get started with our platform in just a
                                        few simple steps. Choose your solution
                                        and transform your business operations
                                        with ease.
                                    </p>
                                    {hostname !== 'Neulify' && (
                                        <div className="mt-4 flex items-center justify-center gap-2">
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                Built by
                                            </span>
                                            <Link
                                                href={route('neulify')}
                                                className="bg-gradient-to-r from-[#14B8A6] to-[#06B6D4] bg-clip-text font-semibold text-transparent transition-all duration-200 hover:scale-105 hover:from-[#0D9488] hover:to-[#0891B2]"
                                            >
                                                Neulify
                                            </Link>
                                        </div>
                                    )}
                                </div>
                                <div className="rounded-2xl border border-white/20 p-8 shadow-lg dark:border-gray-700/20 dark:bg-gray-800/80">
                                    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                                        {/* Step 1 */}
                                        <div className="text-center">
                                            <div className="relative mb-6">
                                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#14B8A6]/10 dark:bg-[#14B8A6]/20">
                                                    <span className="text-2xl font-bold text-[#14B8A6] dark:text-[#14B8A6]">
                                                        1
                                                    </span>
                                                </div>
                                                <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#14B8A6]">
                                                    <svg
                                                        className="h-4 w-4 text-white"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                            <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
                                                Choose Your Solution
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                Select from our specialized
                                                platforms designed for your
                                                industry. Each solution comes
                                                with tailored features and
                                                tools.
                                            </p>
                                        </div>

                                        {/* Step 2 */}
                                        <div className="text-center">
                                            <div className="relative mb-6">
                                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                                        2
                                                    </span>
                                                </div>
                                                <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
                                                    <svg
                                                        className="h-4 w-4 text-white"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                            <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
                                                Set Up Your Platform
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                Configure your settings,
                                                customize your dashboard, and
                                                integrate with your existing
                                                tools and workflows.
                                            </p>
                                        </div>

                                        {/* Step 3 */}
                                        <div className="text-center">
                                            <div className="relative mb-6">
                                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#06B6D4]/10 dark:bg-[#06B6D4]/20">
                                                    <span className="text-2xl font-bold text-[#06B6D4] dark:text-[#06B6D4]">
                                                        3
                                                    </span>
                                                </div>
                                                <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#06B6D4]">
                                                    <svg
                                                        className="h-4 w-4 text-white"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                            <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
                                                Start Operating
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                Begin using your specialized
                                                platform. Manage operations,
                                                track performance, and optimize
                                                your business processes.
                                            </p>
                                        </div>

                                        {/* Step 4 */}
                                        <div className="text-center">
                                            <div className="relative mb-6">
                                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                                                    <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                                        4
                                                    </span>
                                                </div>
                                                <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500">
                                                    <svg
                                                        className="h-4 w-4 text-white"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                            <h3 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
                                                Scale & Grow
                                            </h3>
                                            <p className="text-gray-600 dark:text-gray-300">
                                                Monitor your success, analyze
                                                data, and scale your operations
                                                with advanced features and
                                                analytics.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* CTA Section */}
                        <section className="relative flex h-full w-screen flex-shrink-0 snap-start items-center justify-center overflow-hidden">
                            <div className="relative mx-auto w-full max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
                                <div className="text-center">
                                    <h2 className="bg-gradient-to-r from-[#1E3A8A] via-[#334155] to-[#1E3A8A] bg-clip-text text-3xl font-extrabold tracking-tight text-transparent dark:text-gray-100 sm:text-4xl md:text-5xl">
                                        Ready to Transform Your Industry?
                                    </h2>
                                    <p className="mx-auto mt-6 max-w-3xl text-xl text-gray-600 dark:text-gray-300">
                                        Discover the perfect B2B solution for
                                        your business
                                    </p>
                                    <div className="mt-12 flex justify-center">
                                        <button
                                            onClick={() =>
                                                setIsSolutionsDialogOpen(true)
                                            }
                                            className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#1E3A8A] to-[#14B8A6] px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#14B8A6]/50"
                                        >
                                            <Rocket className="h-6 w-6 transition-transform duration-300 group-hover:translate-y-[-4px]" />
                                            <span>Launch</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* Navigation Controls */}
                <div className="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center space-x-4 sm:bottom-8">
                    {/* Left Arrow */}
                    <button
                        onClick={() => {
                            if (containerRef.current) {
                                const currentIndex = Math.round(
                                    scrollX / window.innerWidth,
                                );
                                const newIndex = Math.max(0, currentIndex - 1);
                                containerRef.current.scrollTo({
                                    left: window.innerWidth * newIndex,
                                    behavior: 'smooth',
                                });
                            }
                            resetAutoSlideRef.current?.();
                        }}
                        className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white hover:shadow-xl dark:bg-gray-800/90 dark:hover:bg-gray-800 ${
                            Math.round(scrollX / window.innerWidth) === 0
                                ? 'cursor-not-allowed opacity-50'
                                : ''
                        }`}
                        disabled={Math.round(scrollX / window.innerWidth) === 0}
                    >
                        <svg
                            className="h-5 w-5 text-gray-600 dark:text-gray-300"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>

                    {/* Scroll Indicators */}
                    <div className="flex space-x-2">
                        {[0, 1, 2].map((index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    if (containerRef.current) {
                                        containerRef.current.scrollTo({
                                            left: window.innerWidth * index,
                                            behavior: 'smooth',
                                        });
                                    }
                                    resetAutoSlideRef.current?.();
                                }}
                                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                                    Math.round(scrollX / window.innerWidth) ===
                                    index
                                        ? 'w-8 bg-[#14B8A6]'
                                        : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={() => {
                            if (containerRef.current) {
                                const currentIndex = Math.round(
                                    scrollX / window.innerWidth,
                                );
                                const newIndex = Math.min(2, currentIndex + 1);
                                containerRef.current.scrollTo({
                                    left: window.innerWidth * newIndex,
                                    behavior: 'smooth',
                                });
                            }
                            resetAutoSlideRef.current?.();
                        }}
                        className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-white hover:shadow-xl dark:bg-gray-800/90 dark:hover:bg-gray-800 ${
                            Math.round(scrollX / window.innerWidth) === 2
                                ? 'cursor-not-allowed opacity-50'
                                : ''
                        }`}
                        disabled={Math.round(scrollX / window.innerWidth) === 2}
                    >
                        <svg
                            className="h-5 w-5 text-gray-600 dark:text-gray-300"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Solutions Dialog */}
            <SolutionsDialog
                isOpen={isSolutionsDialogOpen}
                onOpenChange={setIsSolutionsDialogOpen}
                solutions={solutions}
                getUrlWithCurrency={getUrlWithCurrency}
            />
        </>
    );
}
