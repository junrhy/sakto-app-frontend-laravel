import ApplicationLogo from '@/Components/ApplicationLogo';
import { Card, CardContent } from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { getHost } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Briefcase,
    GraduationCap,
    HardHat,
    Landmark,
    Package,
    Plane,
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
    const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
    const [isLegalDropdownOpen, setIsLegalDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [isSolutionsDialogOpen, setIsSolutionsDialogOpen] = useState(true);
    const [userCountry, setUserCountry] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const productsDropdownRef = useRef<HTMLDivElement>(null);
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
                'Connect with your community, manage events, and stay informed',
            icon: Users,
            href: '/community',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
            name: 'Medical',
            description:
                'Book appointments, manage health records, and access healthcare',
            icon: Stethoscope,
            href: '/medical',
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
        },
        {
            name: 'Logistics',
            description:
                'Track shipments, manage deliveries, and optimize transportation',
            icon: Truck,
            href: '/logistics',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        },
        {
            name: 'Shop',
            description:
                'Browse products, place orders, and manage your shopping',
            icon: ShoppingBag,
            href: '/shop',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
        },
        {
            name: 'Delivery',
            description:
                'Order food and groceries with fast delivery to your door',
            icon: Package,
            href: '/delivery',
            color: 'text-red-600',
            bgColor: 'bg-red-50 dark:bg-red-900/20',
        },
        {
            name: 'Jobs',
            description:
                'Find opportunities, post listings, and grow your career',
            icon: Briefcase,
            href: '/jobs',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        },
        {
            name: 'Travel',
            description: 'Book flights, hotels, and plan your perfect trip',
            icon: Plane,
            href: '/travel',
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
        },
        {
            name: 'F&B',
            description: 'Manage your food and beverage business with ease',
            icon: UtensilsCrossed,
            href: '/fnb',
            color: 'text-amber-600',
            bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        },
        {
            name: 'Education',
            description:
                'Transform learning with comprehensive education management',
            icon: GraduationCap,
            href: '/education',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        },
        {
            name: 'Finance',
            description:
                'Manage your finances with powerful budgeting and reporting',
            icon: Landmark,
            href: '/finance',
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        },
        {
            name: 'Agriculture',
            description:
                'Modern farm management for increased productivity and yields',
            icon: Sprout,
            href: '/agriculture',
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
        },
        {
            name: 'Construction',
            description:
                'Manage construction projects with efficiency and precision',
            icon: HardHat,
            href: '/construction',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
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
                productsDropdownRef.current &&
                !productsDropdownRef.current.contains(event.target as Node)
            ) {
                setIsProductsDropdownOpen(false);
            }
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

    const productsMenuItems =
        hostname !== 'Neulify'
            ? [
                  { name: `${hostname} Community`, href: '/community' },
                  { name: `${hostname} Logistics`, href: '/logistics' },
                  { name: `${hostname} Medical`, href: '/medical' },
                  { name: `${hostname} Travel`, href: '/travel' },
                  { name: `${hostname} Delivery`, href: '/delivery' },
                  { name: `${hostname} Job Board`, href: '/jobs' },
                  { name: `${hostname} Marketplace`, href: '/shop' },
                  { name: `${hostname} F&B`, href: '/fnb' },
                  { name: `${hostname} Education`, href: '/education' },
                  { name: `${hostname} Finance`, href: '/finance' },
                  { name: `${hostname} Agriculture`, href: '/agriculture' },
                  { name: `${hostname} Construction`, href: '/construction' },
              ]
            : [
                  { name: 'Community', href: '/community' },
                  { name: 'Logistics', href: '/logistics' },
                  { name: 'Medical', href: '/medical' },
                  { name: 'Travel', href: '/travel' },
                  { name: 'Delivery', href: '/delivery' },
                  { name: 'Jobs', href: '/jobs' },
                  { name: 'Shop', href: '/shop' },
                  { name: 'F&B', href: '/fnb' },
                  { name: 'Education', href: '/education' },
                  { name: 'Finance', href: '/finance' },
                  { name: 'Agriculture', href: '/agriculture' },
                  { name: 'Construction', href: '/construction' },
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
                                    {/* Products Dropdown */}
                                    <div
                                        className="relative"
                                        ref={productsDropdownRef}
                                    >
                                        <button
                                            onClick={() =>
                                                setIsProductsDropdownOpen(
                                                    !isProductsDropdownOpen,
                                                )
                                            }
                                            className="flex items-center space-x-1 text-sm font-medium text-[#334155] transition-colors duration-200 hover:text-[#14B8A6] dark:text-gray-200 dark:hover:text-white"
                                        >
                                            Our Solutions
                                            <svg
                                                className={`ml-1 h-4 w-4 transition-transform duration-200 ${isProductsDropdownOpen ? 'rotate-180' : ''}`}
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
                                        {isProductsDropdownOpen && (
                                            <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-[#E2E8F0] bg-white py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                                {productsMenuItems.map(
                                                    (item) => (
                                                        <Link
                                                            key={item.name}
                                                            href={getUrlWithCurrency(
                                                                item.href,
                                                            )}
                                                            className="block px-4 py-2 text-sm text-[#334155] transition-colors duration-200 hover:bg-[#14B8A6]/10 hover:text-[#14B8A6] dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white"
                                                            onClick={() =>
                                                                setIsProductsDropdownOpen(
                                                                    false,
                                                                )
                                                            }
                                                        >
                                                            {item.name}
                                                        </Link>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>
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
                                    {/* Products Section */}
                                    <div className="px-3 py-2">
                                        <div className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                            Products
                                        </div>
                                        <div className="mt-2 space-y-1">
                                            {productsMenuItems.map((item) => (
                                                <Link
                                                    key={item.name}
                                                    href={getUrlWithCurrency(
                                                        item.href,
                                                    )}
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
                                        Choose your specialized solution and
                                        start your journey today
                                    </p>
                                    {!auth.user && (
                                        <div className="mx-auto mt-12 max-w-6xl">
                                            {/* Tab Navigation */}
                                            <div className="mb-6 flex flex-wrap justify-center gap-1 sm:mb-8 sm:gap-2">
                                                {[
                                                    {
                                                        name:
                                                            hostname !==
                                                            'Neulify'
                                                                ? `${hostname} Community`
                                                                : 'Community',
                                                        color: 'from-pink-500 to-rose-500',
                                                        enabled: true,
                                                        description:
                                                            'Create and manage thriving communities with member engagement tools, event organization, content sharing, and real-time communication features. Perfect for organizations, clubs, and online communities.',
                                                        icon: (
                                                            <svg
                                                                className="h-5 w-5"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                                                                />
                                                            </svg>
                                                        ),
                                                        link: route(
                                                            'community',
                                                        ),
                                                    },
                                                    {
                                                        name:
                                                            hostname !==
                                                            'Neulify'
                                                                ? `${hostname} Logistics`
                                                                : 'Logistics',
                                                        color: 'from-cyan-500 to-blue-500',
                                                        enabled: true,
                                                        description:
                                                            'Streamline your logistics operations with intelligent route optimization, real-time fleet tracking, delivery analytics, and comprehensive supply chain management tools. Ideal for delivery companies and transportation businesses.',
                                                        icon: (
                                                            <svg
                                                                className="h-5 w-5"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                                                                />
                                                            </svg>
                                                        ),
                                                        link: route(
                                                            'logistics',
                                                        ),
                                                    },
                                                    {
                                                        name:
                                                            hostname !==
                                                            'Neulify'
                                                                ? `${hostname} Medical`
                                                                : 'Medical',
                                                        color: 'from-emerald-500 to-teal-500',
                                                        enabled: true,
                                                        description:
                                                            'Transform healthcare delivery with comprehensive patient management, secure medical records, appointment scheduling, and health analytics. Designed for clinics, hospitals, and healthcare providers.',
                                                        icon: (
                                                            <svg
                                                                className="h-5 w-5"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
                                                                />
                                                            </svg>
                                                        ),
                                                        link: route('medical'),
                                                    },
                                                    {
                                                        name:
                                                            hostname !==
                                                            'Neulify'
                                                                ? `${hostname} Travel`
                                                                : 'Travel',
                                                        color: 'from-[#06B6D4] to-[#1E3A8A]',
                                                        enabled: true,
                                                        description:
                                                            'Revolutionize travel planning with comprehensive flight booking, hotel reservations, travel packages, and insurance services. Complete solution for travel agencies and tour operators.',
                                                        icon: (
                                                            <svg
                                                                className="h-5 w-5"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                                                                />
                                                            </svg>
                                                        ),
                                                        link: route('travel'),
                                                    },
                                                    {
                                                        name:
                                                            hostname !==
                                                            'Neulify'
                                                                ? `${hostname} Delivery`
                                                                : 'Delivery',
                                                        color: 'from-[#14B8A6] to-[#1E3A8A]',
                                                        enabled: true,
                                                        description:
                                                            'Optimize retail operations with advanced order management, inventory tracking, delivery scheduling, and customer analytics. Perfect for retail stores and e-commerce businesses.',
                                                        icon: (
                                                            <svg
                                                                className="h-5 w-5"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                                                />
                                                            </svg>
                                                        ),
                                                        link: route('delivery'),
                                                    },
                                                    {
                                                        name:
                                                            hostname !==
                                                            'Neulify'
                                                                ? `${hostname} Job Board`
                                                                : 'Jobs',
                                                        color: 'from-[#1E3A8A] to-[#14B8A6]',
                                                        enabled: true,
                                                        description:
                                                            'Streamline HR operations with comprehensive employee management, recruitment tools, performance tracking, and payroll integration. Essential for businesses of all sizes.',
                                                        icon: (
                                                            <svg
                                                                className="h-5 w-5"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                                                />
                                                            </svg>
                                                        ),
                                                        link: route('jobs'),
                                                    },
                                                    {
                                                        name:
                                                            hostname !==
                                                            'Neulify'
                                                                ? `${hostname} Marketplace`
                                                                : 'Shop',
                                                        color: 'from-green-500 to-emerald-600',
                                                        enabled: true,
                                                        description:
                                                            'Launch and scale your online business with powerful product management, order processing, payment integration, and customer support tools. Complete e-commerce solution.',
                                                        icon: (
                                                            <svg
                                                                className="h-5 w-5"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth={
                                                                    1.5
                                                                }
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M2.25 3h1.5c.513 0 1.024.195 1.414.586L9 9.414V18a1 1 0 001 1h2a1 1 0 001-1v-4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1V9.414l3.836-3.828A2.25 2.25 0 0021.75 3h-1.5a2.25 2.25 0 00-2.25 2.25v.75a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-.75A2.25 2.25 0 004.5 3z"
                                                                />
                                                            </svg>
                                                        ),
                                                        link: route('shop'),
                                                    },
                                                ].map((project, index) => (
                                                    <button
                                                        key={project.name}
                                                        onClick={() =>
                                                            setActiveTab(index)
                                                        }
                                                        className={`flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-all duration-200 sm:gap-2 sm:px-4 sm:text-sm ${
                                                            activeTab === index
                                                                ? `bg-gradient-to-r ${project.color} text-white shadow-lg`
                                                                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                                        }`}
                                                    >
                                                        <div
                                                            className={`${activeTab === index ? 'text-white' : `text-${project.color.split('-')[1]}-500`}`}
                                                        >
                                                            {project.icon}
                                                        </div>
                                                        <span className="hidden sm:inline">
                                                            {project.name}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Tab Content */}
                                            <div className="rounded-xl bg-white p-4 shadow-lg dark:bg-gray-800 sm:p-6 lg:p-8">
                                                {(() => {
                                                    const projects = [
                                                        {
                                                            name:
                                                                hostname ===
                                                                'sakto'
                                                                    ? 'Komunidad'
                                                                    : 'Community',
                                                            color: 'from-pink-500 to-rose-500',
                                                            enabled: true,
                                                            description:
                                                                'Create and manage thriving communities with member engagement tools, event organization, content sharing, and real-time communication features. Perfect for organizations, clubs, and online communities.',
                                                            icon: (
                                                                <svg
                                                                    className="h-12 w-12"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                                                                    />
                                                                </svg>
                                                            ),
                                                            link: route(
                                                                'community',
                                                            ),
                                                        },
                                                        {
                                                            name:
                                                                hostname ===
                                                                'sakto'
                                                                    ? 'Logistika'
                                                                    : 'Logistics',
                                                            color: 'from-cyan-500 to-blue-500',
                                                            enabled: true,
                                                            description:
                                                                'Streamline your logistics operations with intelligent route optimization, real-time fleet tracking, delivery analytics, and comprehensive supply chain management tools. Ideal for delivery companies and transportation businesses.',
                                                            icon: (
                                                                <svg
                                                                    className="h-12 w-12"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                                                                    />
                                                                </svg>
                                                            ),
                                                            link: route(
                                                                'logistics',
                                                            ),
                                                        },
                                                        {
                                                            name:
                                                                hostname ===
                                                                'sakto'
                                                                    ? 'Medikal'
                                                                    : 'Medical',
                                                            color: 'from-emerald-500 to-teal-500',
                                                            enabled: true,
                                                            description:
                                                                'Transform healthcare delivery with comprehensive patient management, secure medical records, appointment scheduling, and health analytics. Designed for clinics, hospitals, and healthcare providers.',
                                                            icon: (
                                                                <svg
                                                                    className="h-12 w-12"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
                                                                    />
                                                                </svg>
                                                            ),
                                                            link: route(
                                                                'medical',
                                                            ),
                                                        },
                                                        {
                                                            name:
                                                                hostname ===
                                                                'sakto'
                                                                    ? 'Lakbay'
                                                                    : 'Travel',
                                                            color: 'from-[#06B6D4] to-[#1E3A8A]',
                                                            enabled: true,
                                                            description:
                                                                'Revolutionize travel planning with comprehensive flight booking, hotel reservations, travel packages, and insurance services. Complete solution for travel agencies and tour operators.',
                                                            icon: (
                                                                <svg
                                                                    className="h-12 w-12"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                                                                    />
                                                                </svg>
                                                            ),
                                                            link: route(
                                                                'travel',
                                                            ),
                                                        },
                                                        {
                                                            name:
                                                                hostname ===
                                                                'sakto'
                                                                    ? 'Hatid'
                                                                    : 'Delivery',
                                                            color: 'from-[#14B8A6] to-[#1E3A8A]',
                                                            enabled: true,
                                                            description:
                                                                'Optimize retail operations with advanced order management, inventory tracking, delivery scheduling, and customer analytics. Perfect for retail stores and e-commerce businesses.',
                                                            icon: (
                                                                <svg
                                                                    className="h-12 w-12"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                                                    />
                                                                </svg>
                                                            ),
                                                            link: route(
                                                                'delivery',
                                                            ),
                                                        },
                                                        {
                                                            name:
                                                                hostname ===
                                                                'sakto'
                                                                    ? 'Taohan'
                                                                    : 'Jobs',
                                                            color: 'from-[#1E3A8A] to-[#14B8A6]',
                                                            enabled: true,
                                                            description:
                                                                'Streamline HR operations with comprehensive employee management, recruitment tools, performance tracking, and payroll integration. Essential for businesses of all sizes.',
                                                            icon: (
                                                                <svg
                                                                    className="h-12 w-12"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                                                    />
                                                                </svg>
                                                            ),
                                                            link: route('jobs'),
                                                        },
                                                        {
                                                            name:
                                                                hostname ===
                                                                'sakto'
                                                                    ? 'Merkado'
                                                                    : 'Shop',
                                                            color: 'from-green-500 to-emerald-600',
                                                            enabled: true,
                                                            description:
                                                                'Launch and scale your online business with powerful product management, order processing, payment integration, and customer support tools. Complete e-commerce solution.',
                                                            icon: (
                                                                <svg
                                                                    className="h-12 w-12"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M2.25 3h1.5c.513 0 1.024.195 1.414.586L9 9.414V18a1 1 0 001 1h2a1 1 0 001-1v-4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1V9.414l3.836-3.828A2.25 2.25 0 0021.75 3h-1.5a2.25 2.25 0 00-2.25 2.25v.75a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-.75A2.25 2.25 0 004.5 3z"
                                                                    />
                                                                </svg>
                                                            ),
                                                            link: route('shop'),
                                                        },
                                                    ];

                                                    const project =
                                                        projects[activeTab];

                                                    return (
                                                        <div className="flex flex-col items-center gap-4 lg:flex-row lg:gap-8">
                                                            <div
                                                                className={`inline-flex flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${project.color} p-4 shadow-lg sm:p-6`}
                                                            >
                                                                <div className="text-white">
                                                                    <svg
                                                                        className="h-8 w-8 sm:h-12 sm:w-12"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        strokeWidth={
                                                                            1.5
                                                                        }
                                                                        stroke="currentColor"
                                                                    >
                                                                        {(() => {
                                                                            switch (
                                                                                project.name
                                                                            ) {
                                                                                case 'Community':
                                                                                    return (
                                                                                        <path
                                                                                            strokeLinecap="round"
                                                                                            strokeLinejoin="round"
                                                                                            d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                                                                                        />
                                                                                    );
                                                                                case 'Logistics':
                                                                                    return (
                                                                                        <path
                                                                                            strokeLinecap="round"
                                                                                            strokeLinejoin="round"
                                                                                            d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                                                                                        />
                                                                                    );
                                                                                case 'Medical':
                                                                                    return (
                                                                                        <path
                                                                                            strokeLinecap="round"
                                                                                            strokeLinejoin="round"
                                                                                            d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
                                                                                        />
                                                                                    );
                                                                                case 'Travel':
                                                                                    return (
                                                                                        <path
                                                                                            strokeLinecap="round"
                                                                                            strokeLinejoin="round"
                                                                                            d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                                                                                        />
                                                                                    );
                                                                                case 'Retail Delivery':
                                                                                    return (
                                                                                        <path
                                                                                            strokeLinecap="round"
                                                                                            strokeLinejoin="round"
                                                                                            d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                                                                        />
                                                                                    );
                                                                                case 'Human Resources':
                                                                                    return (
                                                                                        <path
                                                                                            strokeLinecap="round"
                                                                                            strokeLinejoin="round"
                                                                                            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                                                                        />
                                                                                    );
                                                                                case 'E-Commerce':
                                                                                    return (
                                                                                        <path
                                                                                            strokeLinecap="round"
                                                                                            strokeLinejoin="round"
                                                                                            d="M2.25 3h1.5c.513 0 1.024.195 1.414.586L9 9.414V18a1 1 0 001 1h2a1 1 0 001-1v-4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1V9.414l3.836-3.828A2.25 2.25 0 0021.75 3h-1.5a2.25 2.25 0 00-2.25 2.25v.75a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-.75A2.25 2.25 0 004.5 3z"
                                                                                        />
                                                                                    );
                                                                                default:
                                                                                    return (
                                                                                        <path
                                                                                            strokeLinecap="round"
                                                                                            strokeLinejoin="round"
                                                                                            d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                                                                                        />
                                                                                    );
                                                                            }
                                                                        })()}
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 text-center lg:text-left">
                                                                <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
                                                                    {
                                                                        project.name
                                                                    }
                                                                </h3>
                                                                <p className="mb-4 text-base text-gray-600 dark:text-gray-300 sm:mb-6 sm:text-lg">
                                                                    {
                                                                        project.description
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-shrink-0 items-center">
                                                                {project.enabled ? (
                                                                    <Link
                                                                        href={
                                                                            project.link
                                                                        }
                                                                        className={`inline-flex items-center bg-gradient-to-r px-4 py-2 text-sm font-medium text-white sm:px-6 sm:py-2.5 ${project.color} rounded-lg transition-all duration-200 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2`}
                                                                    >
                                                                        Launch
                                                                    </Link>
                                                                ) : (
                                                                    <div className="inline-flex cursor-not-allowed items-center rounded-lg bg-gray-400 px-4 py-2 text-sm font-medium text-white opacity-60 sm:px-6 sm:py-2.5">
                                                                        Coming
                                                                        Soon
                                                                    </div>
                                                                )}
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
            <Dialog
                open={isSolutionsDialogOpen}
                onOpenChange={setIsSolutionsDialogOpen}
            >
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                            Neulify
                        </DialogTitle>
                        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400 sm:text-base">
                            Choose a solution to get started
                        </p>
                    </DialogHeader>

                    <div className="custom-scrollbar max-h-[60vh] overflow-y-auto pr-2">
                        <style>{`
                            .custom-scrollbar::-webkit-scrollbar {
                                width: 8px;
                            }
                            
                            .custom-scrollbar::-webkit-scrollbar-track {
                                background: rgb(243 244 246);
                                border-radius: 4px;
                            }
                            
                            .custom-scrollbar::-webkit-scrollbar-thumb {
                                background: rgb(209 213 219);
                                border-radius: 4px;
                                transition: background 0.2s;
                            }
                            
                            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                background: rgb(156 163 175);
                            }
                            
                            .dark .custom-scrollbar::-webkit-scrollbar-track {
                                background: rgb(31 41 55);
                            }
                            
                            .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                                background: rgb(75 85 99);
                            }
                            
                            .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                background: rgb(107 114 128);
                            }
                            
                            /* For Firefox */
                            .custom-scrollbar {
                                scrollbar-width: thin;
                                scrollbar-color: rgb(209 213 219) rgb(243 244 246);
                            }
                            
                            .dark .custom-scrollbar {
                                scrollbar-color: rgb(75 85 99) rgb(31 41 55);
                            }
                        `}</style>
                        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {solutions.map((solution) => {
                                const Icon = solution.icon;
                                return (
                                    <Link
                                        key={solution.name}
                                        href={getUrlWithCurrency(solution.href)}
                                        className="group"
                                        onClick={() =>
                                            setIsSolutionsDialogOpen(false)
                                        }
                                    >
                                        <Card className="h-full border-2 transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg dark:hover:border-gray-600">
                                            <CardContent className="p-6">
                                                <div className="flex items-start space-x-4">
                                                    {/* Icon */}
                                                    <div
                                                        className={`flex-shrink-0 rounded-xl p-3 ${solution.bgColor} transition-transform duration-300 group-hover:scale-110`}
                                                    >
                                                        <Icon
                                                            className={`h-6 w-6 sm:h-8 sm:w-8 ${solution.color}`}
                                                        />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="min-w-0 flex-1">
                                                        <div className="mb-2 flex items-center justify-between">
                                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                                                                {solution.name}
                                                            </h3>
                                                            <ArrowRight className="h-5 w-5 flex-shrink-0 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                                                        </div>
                                                        <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                                                            {
                                                                solution.description
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
