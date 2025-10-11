import ApplicationLogo from '@/Components/ApplicationLogo';
import SearchBar from '@/Components/ui/SearchBar';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

interface PageProps {
    auth: {
        user: {
            name: string;
            email: string;
        };
    };
    communityUsers: {
        id: number;
        name: string;
        email: string;
        created_at: string;
        slug: string;
    }[];
    totalContacts: number;
}

export default function SearchMember({
    auth,
    communityUsers,
    totalContacts,
}: PageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const itemsPerPage = 8;

    // Filter community users based on search query using useMemo for better performance
    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return [];

        const query = searchQuery.toLowerCase().trim();
        return communityUsers.filter(
            (user) =>
                user.name.toLowerCase() === query ||
                user.email.toLowerCase() === query,
        );
    }, [communityUsers, searchQuery]);

    // Use totalContacts from backend instead of calculating from communityUsers
    const totalMembers = totalContacts;
    const totalCommunities = communityUsers.length;
    const filteredCount = filteredUsers.length;

    // Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Reset to first page when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    return (
        <>
            <Head title="Search Community" />
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
                        <div className="flex items-center">
                            {/* Mobile menu button */}
                            <div className="mr-4 lg:hidden">
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center rounded-md p-2 text-white transition-colors duration-200 hover:bg-blue-700 hover:text-blue-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                    aria-controls="mobile-menu"
                                    aria-expanded={isMobileMenuOpen}
                                    onClick={() =>
                                        setIsMobileMenuOpen(!isMobileMenuOpen)
                                    }
                                >
                                    <span className="sr-only">
                                        Open main menu
                                    </span>
                                    {isMobileMenuOpen ? (
                                        <svg
                                            className="block h-6 w-6"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            className="block h-6 w-6"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M4 6h16M4 12h16M4 18h16"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center">
                                <ApplicationLogo className="block h-8 w-auto fill-current text-white" />
                                <div className="ml-3">
                                    <div className="text-2xl font-bold leading-tight text-white">
                                        Community
                                    </div>
                                </div>
                            </div>

                            {/* Desktop Navigation Menu */}
                            <div className="ml-8 hidden items-center space-x-8 lg:flex">
                                <Link
                                    href={route('community')}
                                    className="text-sm font-medium text-white transition-colors duration-200 hover:text-blue-100"
                                >
                                    Home
                                </Link>
                                <Link
                                    href={route('community') + '#features'}
                                    className="text-sm font-medium text-white transition-colors duration-200 hover:text-blue-100"
                                >
                                    How it works
                                </Link>
                                <Link
                                    href={route('community') + '#pricing'}
                                    className="text-sm font-medium text-white transition-colors duration-200 hover:text-blue-100"
                                >
                                    Pricing
                                </Link>
                            </div>

                            {/* Desktop Auth Buttons */}
                            <div className="ml-auto hidden items-center space-x-4 lg:flex">
                                <Link
                                    href={route('login', {
                                        project: 'community',
                                    })}
                                    className="inline-flex items-center rounded-md border border-white px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-white hover:text-blue-600"
                                >
                                    Login
                                </Link>
                                <Link
                                    href={route('register', {
                                        project: 'community',
                                    })}
                                    className="inline-flex items-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-colors duration-200 hover:bg-slate-50"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>

                        {/* Mobile menu overlay */}
                        {isMobileMenuOpen && (
                            <div
                                className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                                onClick={() => setIsMobileMenuOpen(false)}
                            ></div>
                        )}

                        {/* Mobile menu sidebar */}
                        <div
                            className={`fixed left-0 top-0 z-50 h-full w-full max-w-sm transform bg-blue-600 shadow-xl transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                            id="mobile-menu"
                        >
                            {/* Header with close button */}
                            <div className="flex items-center justify-between border-b border-blue-700 p-6">
                                <div className="flex items-center">
                                    <ApplicationLogo className="block h-6 w-auto fill-current text-white" />
                                    <span className="ml-2 text-lg font-bold text-white">
                                        Community
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="rounded-md p-2 text-white transition-colors duration-200 hover:bg-blue-700 hover:text-blue-100"
                                >
                                    <svg
                                        className="h-6 w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {/* Menu items */}
                            <div className="space-y-6 p-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-200">
                                        Navigation
                                    </h3>
                                    <Link
                                        href={route('community')}
                                        className="block rounded-lg px-3 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-blue-700 hover:text-blue-100"
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        Home
                                    </Link>
                                    <Link
                                        href={route('community') + '#features'}
                                        className="block rounded-lg px-3 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-blue-700 hover:text-blue-100"
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        How it works
                                    </Link>
                                    <Link
                                        href={route('community') + '#pricing'}
                                        className="block rounded-lg px-3 py-3 text-base font-medium text-white transition-colors duration-200 hover:bg-blue-700 hover:text-blue-100"
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        Pricing
                                    </Link>
                                </div>

                                <div className="space-y-4 border-t border-blue-700 pt-6">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-200">
                                        Account
                                    </h3>
                                    <Link
                                        href={route('login', {
                                            project: 'community',
                                        })}
                                        className="block w-full rounded-lg border border-white/20 px-4 py-3 text-center text-base font-medium text-white transition-colors duration-200 hover:bg-blue-700 hover:text-blue-100"
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href={route('register', {
                                            project: 'community',
                                        })}
                                        className="block w-full rounded-lg bg-white px-4 py-3 text-center text-base font-medium text-blue-600 transition-colors duration-200 hover:bg-slate-50"
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative z-20">
                    <div className="mx-auto max-w-7xl px-4 py-8 pt-16 sm:px-6 lg:px-8">
                        {/* Page Header */}
                        <div className="mb-8 mt-16 text-center">
                            <h1 className="mb-2 text-3xl font-bold text-slate-900">
                                Search
                            </h1>
                            <p className="text-slate-600">
                                Discover and connect with your community
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-8">
                            <div className="mx-auto max-w-2xl">
                                <SearchBar
                                    placeholder="Enter exact full name or email to search..."
                                    value={searchQuery}
                                    onChange={setSearchQuery}
                                    size="lg"
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Search Results Section */}
                        <div className="relative z-30 min-h-[200px] space-y-6">
                            {/* Single Result Display */}
                            {paginatedUsers.length > 0 ? (
                                <div className="mx-auto max-w-2xl px-4 sm:px-0">
                                    <div className="relative z-30 overflow-hidden rounded-xl border border-slate-200/50 bg-white/80 shadow-sm backdrop-blur-sm">
                                        <div className="p-4 sm:p-6">
                                            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                                                <div className="flex flex-shrink-0 justify-center sm:justify-start">
                                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-blue-600">
                                                        <span className="text-xl font-bold text-white">
                                                            {paginatedUsers[0].name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="min-w-0 flex-1 text-center sm:text-left">
                                                    <h3 className="mb-1 text-lg font-semibold text-slate-900 sm:text-xl">
                                                        {paginatedUsers[0].name}
                                                    </h3>
                                                    <p className="mb-2 break-all text-sm text-slate-600 sm:text-base">
                                                        {
                                                            paginatedUsers[0]
                                                                .email
                                                        }
                                                    </p>
                                                    <p className="text-xs text-slate-500 sm:text-sm">
                                                        Member since{' '}
                                                        {new Date(
                                                            paginatedUsers[0].created_at,
                                                        ).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="relative z-40 flex flex-shrink-0 justify-center sm:justify-start">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={`/m/${paginatedUsers[0].slug}`}
                                                            onClick={() =>
                                                                setIsLoading(
                                                                    true,
                                                                )
                                                            }
                                                            className={`relative z-40 inline-flex w-full items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white transition-colors duration-200 sm:w-auto ${
                                                                isLoading
                                                                    ? 'cursor-not-allowed bg-blue-500'
                                                                    : 'bg-blue-600 hover:bg-blue-700'
                                                            }`}
                                                        >
                                                            {isLoading ? (
                                                                <>
                                                                    <svg
                                                                        className="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <circle
                                                                            className="opacity-25"
                                                                            cx="12"
                                                                            cy="12"
                                                                            r="10"
                                                                            stroke="currentColor"
                                                                            strokeWidth="4"
                                                                        ></circle>
                                                                        <path
                                                                            className="opacity-75"
                                                                            fill="currentColor"
                                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                        ></path>
                                                                    </svg>
                                                                    Loading...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <svg
                                                                        className="mr-2 h-4 w-4"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        viewBox="0 0 24 24"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth="2"
                                                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                                        />
                                                                    </svg>
                                                                    Login
                                                                </>
                                                            )}
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : searchQuery.trim() ? (
                                <div className="mx-auto max-w-2xl">
                                    <div className="rounded-xl border border-slate-200/50 bg-white/80 py-12 text-center backdrop-blur-sm">
                                        <svg
                                            className="mx-auto mb-4 h-12 w-12 text-slate-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                            />
                                        </svg>
                                        <h3 className="mb-2 text-lg font-medium text-slate-900">
                                            No member found
                                        </h3>
                                        <p className="mb-4 text-slate-500">
                                            No member found with that exact name
                                            or email. Please check the spelling
                                            and try again.
                                        </p>
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                        >
                                            Clear Search
                                        </button>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
