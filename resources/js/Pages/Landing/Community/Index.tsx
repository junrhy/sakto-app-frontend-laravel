import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { useState, useMemo } from 'react';
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
    }[];
}

export default function Community({ auth, communityUsers }: PageProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter community users based on search query using useMemo for better performance
    const filteredUsers = useMemo(() => {
        if (!searchQuery.trim()) return communityUsers;
        
        const query = searchQuery.toLowerCase().trim();
        return communityUsers.filter(user => 
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );
    }, [communityUsers, searchQuery]);

    // Calculate total members count
    const totalMembers = communityUsers.length;
    const filteredCount = filteredUsers.length;

    return (
        <>
            <Head title="Community - Connect and Share" />
            <div className="min-h-screen bg-slate-50">
                {/* Header */}
                <div className="bg-blue-600 shadow-sm border-b border-blue-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center">
                                <ApplicationLogo className="block h-8 w-auto fill-current text-white" />
                                <div className="ml-3">
                                    <div className="text-xl font-bold text-white leading-tight">Sakto</div>
                                    <div className="text-sm font-medium text-blue-100 leading-tight">Community</div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="relative w-full sm:min-w-96">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search communities..."
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Link
                                    href={route('register', { project: 'community' })}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-slate-50 transition-colors duration-200 w-full sm:w-auto justify-center whitespace-nowrap"
                                >
                                    New Community
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Hero Banner */}
                    <div className="relative mb-12 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700">
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="relative px-8 py-12 sm:px-12 sm:py-16">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                                <div>
                                    <h1 className="text-4xl font-bold text-white mb-4">Join Our Thriving Community</h1>
                                    <p className="text-xl text-blue-100 mb-6">
                                        Connect with {totalMembers}+ members, share experiences, and grow together in our vibrant community platform.
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center text-white">
                                            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm">Verified Members</span>
                                        </div>
                                        <div className="flex items-center text-white">
                                            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm">24/7 Support</span>
                                        </div>
                                        <div className="flex items-center text-white">
                                            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-sm">Secure Platform</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="hidden lg:block">
                                    <div className="relative">
                                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-2xl opacity-30"></div>
                                        <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="bg-white/20 rounded-lg p-4 text-center">
                                                    <div className="text-2xl font-bold text-white">{totalMembers}</div>
                                                    <div className="text-xs text-blue-100">Members</div>
                                                </div>
                                                <div className="bg-white/20 rounded-lg p-4 text-center">
                                                    <div className="text-2xl font-bold text-white">50+</div>
                                                    <div className="text-xs text-blue-100">Communities</div>
                                                </div>
                                                <div className="bg-white/20 rounded-lg p-4 text-center">
                                                    <div className="text-2xl font-bold text-white">24/7</div>
                                                    <div className="text-xs text-blue-100">Active</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Featured Communities Banner */}
                    <div className="mb-8">
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-emerald-900">Featured Communities</h2>
                                    <p className="text-emerald-700">Discover trending and popular communities</p>
                                </div>
                                <div className="flex space-x-2">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                                    <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                                    <div className="w-2 h-2 bg-emerald-200 rounded-full"></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white rounded-lg p-4 border border-emerald-100">
                                    <div className="flex items-center mb-3">
                                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-white font-bold">T</span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">Tech Enthusiasts</h3>
                                            <p className="text-xs text-slate-500">1.2k members</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600">Latest in technology, programming, and innovation</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-emerald-100">
                                    <div className="flex items-center mb-3">
                                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-white font-bold">B</span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">Business Network</h3>
                                            <p className="text-xs text-slate-500">856 members</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600">Connect with entrepreneurs and professionals</p>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-emerald-100">
                                    <div className="flex items-center mb-3">
                                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                                            <span className="text-white font-bold">C</span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">Creative Hub</h3>
                                            <p className="text-xs text-slate-500">634 members</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600">Art, design, and creative inspiration</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Page Header */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Community Directory</h2>
                        <p className="text-slate-600">Discover and connect with amazing communities</p>
                    </div>

                    {/* Communities Grid Section */}
                    <div className="space-y-6">
                        {/* Section Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    {searchQuery.trim() ? 'Search Results' : 'All Communities'}
                                </h2>
                                <p className="text-sm text-slate-600">
                                    {searchQuery.trim() 
                                        ? `Found ${filteredCount} community${filteredCount !== 1 ? 's' : ''} matching "${searchQuery}"`
                                        : `Showing all ${totalMembers} communities`
                                    }
                                </p>
                            </div>
                            {searchQuery.trim() && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>

                        {/* Communities Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredUsers.length > 0 ? (
                                <>
                                    {filteredUsers.map((user) => (
                                        <MemberCard key={user.id} user={user} />
                                    ))}
                                    
                                    {/* Fill remaining grid spaces with engaging content */}
                                    {filteredUsers.length < 8 && Array.from({ length: Math.max(0, 8 - filteredUsers.length) }).map((_, index) => {
                                        const cardData = [
                                            {
                                                image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233B82F6' stroke-width='2'%3E%3Cpath d='M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='9' cy='7' r='4'/%3E%3Cpath d='M23 21v-2a4 4 0 0 0-3-3.87'/%3E%3Cpath d='M16 3.13a4 4 0 0 1 0 7.75'/%3E%3C/svg%3E",
                                                title: "Connect & Grow",
                                                description: "Join our network of professionals and expand your horizons",
                                                gradient: "from-blue-500 to-blue-600"
                                            },
                                            {
                                                image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310B981' stroke-width='2'%3E%3Cpath d='M13 10V3L4 14h7v7l9-11h-7z'/%3E%3C/svg%3E",
                                                title: "Innovate Together",
                                                description: "Share ideas and collaborate on groundbreaking projects",
                                                gradient: "from-emerald-500 to-emerald-600"
                                            },
                                            {
                                                image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238B5CF6' stroke-width='2'%3E%3Cpath d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'/%3E%3C/svg%3E",
                                                title: "Premium Access",
                                                description: "Get exclusive content and early access to new features",
                                                gradient: "from-purple-500 to-purple-600"
                                            },
                                            {
                                                image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23F59E0B' stroke-width='2'%3E%3Cpath d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'/%3E%3C/svg%3E",
                                                title: "Verified Member",
                                                description: "Join as a founding member with special privileges",
                                                gradient: "from-amber-500 to-amber-600"
                                            },
                                            {
                                                image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23EF4444' stroke-width='2'%3E%3Cpath d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'/%3E%3C/svg%3E",
                                                title: "Limited Time",
                                                description: "Only a few spots left - secure your place now",
                                                gradient: "from-red-500 to-red-600"
                                            },
                                            {
                                                image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2306B6D4' stroke-width='2'%3E%3Cpath d='M13 10V3L4 14h7v7l9-11h-7z'/%3E%3Cpath d='M9 17l3 3 3-3'/%3E%3Cpath d='M9 7l3-3 3 3'/%3E%3C/svg%3E",
                                                title: "Rapid Growth",
                                                description: "Be part of the fastest-growing community platform",
                                                gradient: "from-cyan-500 to-cyan-600"
                                            }
                                        ];
                                        
                                        const card = cardData[index % cardData.length];
                                        
                                        return (
                                            <div key={`placeholder-${index}`} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                                <div className={`h-48 bg-gradient-to-r ${card.gradient} flex items-center justify-center`}>
                                                    <img 
                                                        src={card.image} 
                                                        alt={card.title}
                                                        className="h-16 w-16 text-white filter brightness-0 invert"
                                                    />
                                                </div>
                                                <div className="p-6">
                                                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{card.title}</h3>
                                                    <p className="text-sm text-slate-600">
                                                        {card.description}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            ) : (
                                <div className="col-span-full">
                                    <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                                        <svg className="mx-auto h-12 w-12 text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <h3 className="text-lg font-medium text-slate-900 mb-2">
                                            {searchQuery.trim() ? 'No communities found' : 'No communities available'}
                                        </h3>
                                        <p className="text-slate-500 mb-4">
                                            {searchQuery.trim() 
                                                ? 'Try adjusting your search terms or browse all communities'
                                                : 'Check back later for new communities'
                                            }
                                        </p>
                                        {searchQuery.trim() && (
                                            <button
                                                onClick={() => setSearchQuery('')}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                            >
                                                Clear Search
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Promotional Banner */}
                    <div className="mt-12 mb-8">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl overflow-hidden">
                            <div className="relative px-8 py-12">
                                <div className="absolute inset-0 bg-black/10"></div>
                                <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                                    <div>
                                        <div className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium mb-4">
                                            <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Limited Time Offer
                                        </div>
                                        <h3 className="text-3xl font-bold text-white mb-4">Create Your Own Community</h3>
                                        <p className="text-xl text-orange-100 mb-6">
                                            Start building your community today and connect with like-minded people. Get 50% off your first month!
                                        </p>
                                        <div className="flex flex-wrap gap-4">
                                            <button className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors">
                                                Start Free Trial
                                            </button>
                                            <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                                                Learn More
                                            </button>
                                        </div>
                                    </div>
                                    <div className="hidden lg:block">
                                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                                            <div className="text-center">
                                                <div className="text-4xl font-bold text-white mb-2">50% OFF</div>
                                                <div className="text-orange-100 mb-4">First Month</div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div className="bg-white/20 rounded-lg p-3">
                                                        <div className="text-white font-semibold">Unlimited</div>
                                                        <div className="text-orange-100">Members</div>
                                                    </div>
                                                    <div className="bg-white/20 rounded-lg p-3">
                                                        <div className="text-white font-semibold">Premium</div>
                                                        <div className="text-orange-100">Features</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Community Stats Section */}
                    <div className="mb-8">
                        <div className="bg-slate-50 rounded-2xl p-8">
                            <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">Community Impact</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900">{totalMembers}+</div>
                                    <div className="text-slate-600">Active Members</div>
                                </div>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900">10k+</div>
                                    <div className="text-slate-600">Messages Daily</div>
                                </div>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900">24/7</div>
                                    <div className="text-slate-600">Active Support</div>
                                </div>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900">99.9%</div>
                                    <div className="text-slate-600">Uptime</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-slate-900 text-white mt-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {/* Company Info */}
                            <div className="col-span-1 md:col-span-2">
                                <div className="flex items-center mb-4">
                                    <ApplicationLogo className="block h-8 w-auto fill-current text-white" />
                                    <span className="ml-2 text-xl font-bold">Sakto Community</span>
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
                                        <span className="sr-only">Twitter</span>
                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
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
                                        <a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">
                                            About Us
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">
                                            Contact Support
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">
                                            Community Guidelines
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">
                                            Help Center
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Legal Links */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase mb-4">Legal</h3>
                                <ul className="space-y-3">
                                    <li>
                                        <a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">
                                            Privacy Policy
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">
                                            Terms of Service
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">
                                            Cookie Policy
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">
                                            Data Protection
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">
                                            Accessibility
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Bottom Footer */}
                        <div className="border-t border-slate-800 mt-12 pt-8">
                            <div className="flex flex-col md:flex-row justify-between items-center">
                                <div className="text-slate-400 text-sm">
                                    © 2024 Sakto Community. All rights reserved.
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
                                        GDPR Compliant
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