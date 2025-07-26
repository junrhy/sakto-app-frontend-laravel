import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import SearchBar from '@/Components/ui/SearchBar';
import { useState, useMemo, useEffect } from 'react';
import MemberCard from './Components/MemberCard';

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

export default function SearchMember({ auth, communityUsers, totalContacts }: PageProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const itemsPerPage = 8;

    // Filter community users based on search query using useMemo for better performance
    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return [];
        
        const query = searchQuery.toLowerCase().trim();
        return communityUsers.filter(user => 
            user.name.toLowerCase() === query ||
            user.email.toLowerCase() === query
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
                        <div className="flex items-center">
                            {/* Mobile menu button */}
                            <div className="lg:hidden mr-4">
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-blue-100 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-200"
                                    aria-controls="mobile-menu"
                                    aria-expanded={isMobileMenuOpen}
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                >
                                    <span className="sr-only">Open main menu</span>
                                    {isMobileMenuOpen ? (
                                        <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    ) : (
                                        <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center">
                                <ApplicationLogo className="block h-8 w-auto fill-current text-white" />
                                <div className="ml-3">
                                    <div className="text-2xl font-bold text-white leading-tight">Komunidad</div>
                                </div>
                            </div>
                            
                            {/* Desktop Navigation Menu */}
                            <div className="hidden lg:flex items-center space-x-8 ml-8">
                                <Link
                                    href={route('community.index')}
                                    className="text-white hover:text-blue-100 transition-colors duration-200 text-sm font-medium"
                                >
                                    Home
                                </Link>
                                <Link
                                    href={route('community.index') + '#features'}
                                    className="text-white hover:text-blue-100 transition-colors duration-200 text-sm font-medium"
                                >
                                    How it works
                                </Link>
                                <Link
                                    href={route('community.index') + '#pricing'}
                                    className="text-white hover:text-blue-100 transition-colors duration-200 text-sm font-medium"
                                >
                                    Pricing
                                </Link>
                            </div>
                            
                            {/* Desktop Auth Buttons */}
                            <div className="hidden lg:flex items-center space-x-4 ml-auto">
                                <Link
                                    href={route('login', { project: 'community' })}
                                    className="inline-flex items-center px-4 py-2 border border-white text-sm font-medium rounded-md text-white hover:bg-white hover:text-blue-600 transition-colors duration-200"
                                >
                                    Login
                                </Link>
                                <Link
                                    href={route('register', { project: 'community' })}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-slate-50 transition-colors duration-200"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>

                        {/* Mobile menu overlay */}
                        {isMobileMenuOpen && (
                            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)}></div>
                        )}
                        
                        {/* Mobile menu sidebar */}
                        <div className={`lg:hidden fixed top-0 left-0 h-full w-full max-w-sm bg-blue-600 shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} id="mobile-menu">
                            {/* Header with close button */}
                            <div className="flex items-center justify-between p-6 border-b border-blue-700">
                                <div className="flex items-center">
                                    <ApplicationLogo className="block h-6 w-auto fill-current text-white" />
                                    <span className="ml-2 text-lg font-bold text-white">Komunidad</span>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 rounded-md text-white hover:text-blue-100 hover:bg-blue-700 transition-colors duration-200"
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            {/* Menu items */}
                            <div className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-blue-200 uppercase tracking-wider">Navigation</h3>
                                    <Link
                                        href={route('community.index')}
                                        className="block px-3 py-3 rounded-lg text-base font-medium text-white hover:text-blue-100 hover:bg-blue-700 transition-colors duration-200"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Home
                                    </Link>
                                    <Link
                                        href={route('community.index') + '#features'}
                                        className="block px-3 py-3 rounded-lg text-base font-medium text-white hover:text-blue-100 hover:bg-blue-700 transition-colors duration-200"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        How it works
                                    </Link>
                                    <Link
                                        href={route('community.index') + '#pricing'}
                                        className="block px-3 py-3 rounded-lg text-base font-medium text-white hover:text-blue-100 hover:bg-blue-700 transition-colors duration-200"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Pricing
                                    </Link>
                                </div>
                                
                                <div className="space-y-4 pt-6 border-t border-blue-700">
                                    <h3 className="text-sm font-semibold text-blue-200 uppercase tracking-wider">Account</h3>
                                    <Link
                                        href={route('login', { project: 'community' })}
                                        className="block w-full px-4 py-3 rounded-lg text-center text-base font-medium text-white hover:text-blue-100 hover:bg-blue-700 transition-colors duration-200 border border-white/20"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href={route('register', { project: 'community' })}
                                        className="block w-full px-4 py-3 rounded-lg text-center text-base font-medium text-blue-600 bg-white hover:bg-slate-50 transition-colors duration-200"
                                        onClick={() => setIsMobileMenuOpen(false)}
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
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16">
                        {/* Page Header */}
                        <div className="mb-8 text-center mt-16">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Search</h1>
                            <p className="text-slate-600">Discover and connect with your community</p>
                        </div>

                        {/* Search Bar */}
                        <div className="mb-8">
                            <div className="max-w-2xl mx-auto">
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
                        <div className="space-y-6 relative z-30 min-h-[200px]">
                            {/* Single Result Display */}
                            {paginatedUsers.length > 0 ? (
                                <div className="max-w-2xl mx-auto px-4 sm:px-0">
                                    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm overflow-hidden relative z-30">
                                        <div className="p-4 sm:p-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                                                <div className="flex-shrink-0 flex justify-center sm:justify-start">
                                                    <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-xl font-bold">
                                                            {paginatedUsers[0].name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0 text-center sm:text-left">
                                                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-1">
                                                        {paginatedUsers[0].name}
                                                    </h3>
                                                    <p className="text-sm sm:text-base text-slate-600 mb-2 break-all">
                                                        {paginatedUsers[0].email}
                                                    </p>
                                                    <p className="text-xs sm:text-sm text-slate-500">
                                                        Member since {new Date(paginatedUsers[0].created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex-shrink-0 relative z-40 flex justify-center sm:justify-start">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={`/m/${paginatedUsers[0].slug}`}
                                                            onClick={() => setIsLoading(true)}
                                                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md transition-colors duration-200 relative z-40 w-full sm:w-auto justify-center text-white ${
                                                                isLoading 
                                                                    ? 'bg-blue-500 cursor-not-allowed' 
                                                                    : 'bg-blue-600 hover:bg-blue-700'
                                                            }`}
                                                        >
                                                            {isLoading ? (
                                                                <>
                                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                    Loading...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
                                <div className="max-w-2xl mx-auto">
                                    <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/50">
                                        <svg className="mx-auto h-12 w-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <h3 className="text-lg font-medium text-slate-900 mb-2">
                                            No member found
                                        </h3>
                                        <p className="text-slate-500 mb-4">
                                            No member found with that exact name or email. Please check the spelling and try again.
                                        </p>
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
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