import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import SearchBar from '@/Components/ui/SearchBar';
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
    totalContacts: number;
}

export default function Community({ auth, communityUsers, totalContacts }: PageProps) {
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

    // Use totalContacts from backend instead of calculating from communityUsers
    const totalMembers = totalContacts;
    const totalCommunities = communityUsers.length;
    const filteredCount = filteredUsers.length;

    return (
        <>
            <Head title="Community - Connect and Share" />
            <div className="min-h-screen bg-slate-50 scroll-smooth">
                {/* Header */}
                <div className="bg-blue-600 shadow-sm border-b border-blue-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center">
                                <ApplicationLogo className="block h-8 w-auto fill-current text-white" />
                                <div className="ml-3">
                                    <div className="text-2xl font-bold text-white leading-tight">Komunidad</div>
                                </div>
                            </div>
                            
                            {/* Navigation Menu - Left Aligned */}
                            <div className="hidden lg:flex items-center space-x-8 ml-8">
                                <Link
                                    href="#features"
                                    className="text-white hover:text-blue-100 transition-colors duration-200 text-sm font-medium"
                                >
                                    How it works
                                </Link>
                                <Link
                                    href="#pricing"
                                    className="text-white hover:text-blue-100 transition-colors duration-200 text-sm font-medium"
                                >
                                    Pricing
                                </Link>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-center gap-4 ml-auto">
                                <Link
                                    href={route('login', { project: 'community' })}
                                    className="inline-flex items-center px-4 py-2 border border-white text-sm font-medium rounded-md text-white hover:bg-white hover:text-blue-600 transition-colors duration-200 w-full sm:w-auto justify-center whitespace-nowrap"
                                >
                                    Login
                                </Link>
                                <Link
                                    href={route('register', { project: 'community' })}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-slate-50 transition-colors duration-200 w-full sm:w-auto justify-center whitespace-nowrap"
                                >
                                    Get Started
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
                                        Connect with {totalMembers.toLocaleString()}+ members, share experiences, and grow together in our vibrant community platform.
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
                                                    <div className="text-2xl font-bold text-white">{totalMembers.toLocaleString()}</div>
                                                    <div className="text-xs text-blue-100">Members</div>
                                                </div>
                                                <div className="bg-white/20 rounded-lg p-4 text-center">
                                                    <div className="text-2xl font-bold text-white">{totalCommunities}</div>
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

                    {/* How It Works Section */}
                    <div id="features" className="mb-16">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">How It Works</h2>
                            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                                Get started with our community platform in just a few simple steps. Build, grow, and manage your community with ease.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                            {/* Step 1 */}
                            <div className="text-center">
                                <div className="relative mb-6">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl font-bold text-blue-600">1</span>
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-3">Sign Up</h3>
                                <p className="text-slate-600">
                                    Create your account and choose your community plan. Get started in minutes with our simple registration process.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="text-center">
                                <div className="relative mb-6">
                                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl font-bold text-emerald-600">2</span>
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-3">Set Up Your Community</h3>
                                <p className="text-slate-600">
                                    Customize your community profile, add members, and configure your settings to match your needs.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="text-center">
                                <div className="relative mb-6">
                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl font-bold text-purple-600">3</span>
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-3">Start Engaging</h3>
                                <p className="text-slate-600">
                                    Launch events, share content, and connect with your members. Use our tools to foster meaningful interactions.
                                </p>
                            </div>

                            {/* Step 4 */}
                            <div className="text-center">
                                <div className="relative mb-6">
                                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl font-bold text-orange-600">4</span>
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-3">Grow & Scale</h3>
                                <p className="text-slate-600">
                                    Watch your community thrive! Monitor growth, analyze engagement, and scale your success with advanced features.
                                </p>
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div className="text-center mt-12">
                            <Link
                                href={route('register', { project: 'community' })}
                                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                            >
                                Get Started Today
                                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        </div>
                    </div>

                    {/* Page Header */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Community Directory</h2>
                        <p className="text-slate-600">Discover and connect with amazing communities</p>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-8">
                        <div className="max-w-2xl mx-auto">
                            <SearchBar
                                placeholder="Search communities by name..."
                                value={searchQuery}
                                onChange={setSearchQuery}
                                size="lg"
                                className="w-full"
                            />
                        </div>
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
                                        : `Showing all ${totalMembers.toLocaleString()} communities`
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

                    {/* Pricing Section */}
                    <div id="pricing" className="mt-16 mb-16">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Choose Your Community Plan</h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                Select the perfect plan for your community needs. All plans include our core community features with different levels of support and integrations.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {/* Basic Plan */}
                            <div className="relative group">
                                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-10 transition duration-200"></div>
                                <div className="relative p-8 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition duration-200 h-full flex flex-col">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Basic</h3>
                                        <p className="text-sm text-slate-600 mb-6">Perfect for small communities and organizations</p>
                                        <p className="mb-6">
                                            <span className="text-3xl font-extrabold text-slate-900">₱99</span>
                                            <span className="text-sm text-slate-600">/month</span>
                                        </p>
                                        <Link
                                            href={route('register', { project: 'community', plan: 'basic' })}
                                            className="block w-full py-3 px-4 border border-transparent rounded-lg shadow text-center text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                                        >
                                            Get Started
                                        </Link>
                                    </div>
                                    <div className="flex-grow mt-6">
                                        <ul className="space-y-3">
                                            <li className="flex items-center text-sm">
                                                <svg className="h-4 w-4 text-blue-500 flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-slate-600">All Community Apps</span>
                                            </li>
                                            <li className="flex items-center text-sm">
                                                <svg className="h-4 w-4 text-blue-500 flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-slate-600">Basic Support</span>
                                            </li>
                                            <li className="flex items-center text-sm">
                                                <svg className="h-4 w-4 text-blue-500 flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-slate-600">Email Support</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Pro Plan */}
                            <div className="relative group lg:-mt-4 lg:mb-4">
                                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 opacity-20 transition duration-200"></div>
                                <div className="relative p-8 bg-white rounded-xl border-2 border-indigo-500 shadow-lg h-full flex flex-col">
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                            Most Popular
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Pro</h3>
                                        <p className="text-sm text-slate-600 mb-6">Ideal for growing communities</p>
                                        <p className="mb-6">
                                            <span className="text-3xl font-extrabold text-slate-900">₱199</span>
                                            <span className="text-sm text-slate-600">/month</span>
                                        </p>
                                        <Link
                                            href={route('register', { project: 'community', plan: 'pro' })}
                                            className="block w-full py-3 px-4 border border-transparent rounded-lg shadow text-center text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
                                        >
                                            Get Started
                                        </Link>
                                    </div>
                                    <div className="flex-grow mt-6">
                                        <ul className="space-y-3">
                                            <li className="flex items-center text-sm">
                                                <svg className="h-4 w-4 text-indigo-500 flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-slate-600">All Community Apps</span>
                                            </li>
                                            <li className="flex items-center text-sm">
                                                <svg className="h-4 w-4 text-indigo-500 flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-slate-600">Email Integration</span>
                                            </li>
                                            <li className="flex items-center text-sm">
                                                <svg className="h-4 w-4 text-indigo-500 flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-slate-600">SMS Integration</span>
                                            </li>
                                            <li className="flex items-center text-sm">
                                                <svg className="h-4 w-4 text-indigo-500 flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-slate-600">Priority Support</span>
                                            </li>
                                            <li className="flex items-center text-sm">
                                                <svg className="h-4 w-4 text-indigo-500 flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-slate-600">24/7 Support</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Business Plan */}
                            <div className="relative group">
                                <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 opacity-0 group-hover:opacity-10 transition duration-200"></div>
                                <div className="relative p-8 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition duration-200 h-full flex flex-col">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">Business</h3>
                                        <p className="text-sm text-slate-600 mb-6">Perfect for established communities with advanced needs</p>
                                        <p className="mb-6">
                                            <span className="text-3xl font-extrabold text-slate-900">₱299</span>
                                            <span className="text-sm text-slate-600">/month</span>
                                        </p>
                                        <Link
                                            href={route('register', { project: 'community', plan: 'business' })}
                                            className="block w-full py-3 px-4 border border-transparent rounded-lg shadow text-center text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
                                        >
                                            Get Started
                                        </Link>
                                    </div>
                                    <div className="flex-grow mt-6">
                                        <ul className="space-y-3">
                                            <li className="flex items-center text-sm">
                                                <svg className="h-4 w-4 text-purple-500 flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-slate-600">All Community Apps</span>
                                            </li>
                                            <li className="flex items-center text-sm">
                                                <svg className="h-4 w-4 text-purple-500 flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-slate-600">Email Integration</span>
                                            </li>
                                            <li className="flex items-center text-sm">
                                                <svg className="h-4 w-4 text-purple-500 flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-slate-600">SMS Integration</span>
                                            </li>
                                            <li className="flex items-center text-sm">
                                                <svg className="h-4 w-4 text-purple-500 flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-slate-600">Priority Support</span>
                                            </li>
                                            <li className="flex items-center text-sm">
                                                <svg className="h-4 w-4 text-purple-500 flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-slate-600">24/7 Support</span>
                                            </li>
                                            <li className="flex items-center text-sm">
                                                <svg className="h-4 w-4 text-purple-500 flex-shrink-0 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-slate-600">Virtual Assistant</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Section */}
                        <div className="mt-16">
                            <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">Frequently Asked Questions</h3>
                            <div className="max-w-3xl mx-auto">
                                <dl className="space-y-6">
                                    <div className="bg-white rounded-lg p-6 border border-slate-200">
                                        <dt className="text-lg font-medium text-slate-900 mb-2">
                                            Can I change plans later?
                                        </dt>
                                        <dd className="text-slate-600">
                                            Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                                        </dd>
                                    </div>
                                    <div className="bg-white rounded-lg p-6 border border-slate-200">
                                        <dt className="text-lg font-medium text-slate-900 mb-2">
                                            What payment methods do you accept?
                                        </dt>
                                        <dd className="text-slate-600">
                                            We accept Visa, Mastercard, JCB, or AMEX credit or debit card. You can also use e-Wallets such as Maya, GCash, WeChat Pay, ShopeePay, and more via QR Ph.
                                        </dd>
                                    </div>
                                    <div className="bg-white rounded-lg p-6 border border-slate-200">
                                        <dt className="text-lg font-medium text-slate-900 mb-2">
                                            Do you offer refunds?
                                        </dt>
                                        <dd className="text-slate-600">
                                            Yes, we offer a 30-day money-back guarantee for all paid plans.
                                        </dd>
                                    </div>
                                    <div className="bg-white rounded-lg p-6 border border-slate-200">
                                        <dt className="text-lg font-medium text-slate-900 mb-2">
                                            What kind of support do you provide?
                                        </dt>
                                        <dd className="text-slate-600">
                                            All plans include email support. Pro and Business plans include 24/7 support with priority response times.
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer id="contact" className="bg-slate-900 text-white mt-16">
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
                                        <a href="#" className="text-slate-300 hover:text-white transition-colors text-sm">
                                            About Us
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