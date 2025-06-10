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
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
                {/* Navigation */}
                <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100">
                    <div className="px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex">
                                <div className="flex-shrink-0 flex items-center">
                                    <ApplicationLogo className="block h-9 w-auto" />
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search members..."
                                        className="w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('login', { project: 'community' })}
                                        className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                    >
                                        Log in
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="relative overflow-hidden bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
                            <div className="pt-16 sm:pt-24 lg:pt-32 px-4 sm:px-6 lg:px-8">
                                <div className="text-center lg:text-left">
                                    <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                        <span className="block">Connect with your</span>
                                        <span className="block text-indigo-600">Family</span>
                                    </h1>
                                    <p className="mt-5 max-w-xl mx-auto lg:mx-0 text-xl text-gray-500">
                                        Reunite with relatives, strengthen family bonds, and build lasting connections across generations in our family-focused communities.
                                    </p>
                                    <div className="mt-8 flex justify-center lg:justify-start">
                                        <div className="rounded-md shadow">
                                            <Link
                                                href={route('register', { project: 'community' })}
                                                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-all duration-200 transform hover:scale-105"
                                            >
                                                Add your family
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
                        <div className="h-56 w-full sm:h-72 md:h-96 lg:w-full lg:h-full relative">
                            <img
                                className="absolute inset-0 w-full h-full object-cover"
                                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                                alt="Family gathering"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/90 to-purple-600/90 mix-blend-multiply"></div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Community Members Section */}
                    <div className="mt-12">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900">Community Members</h2>
                            <div className="text-sm text-gray-500">
                                {searchQuery ? (
                                    <span>Showing {filteredCount} of {totalMembers} members</span>
                                ) : (
                                    <span>{totalMembers} members</span>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <MemberCard key={user.id} user={user} />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-12">
                                    <p className="text-gray-500 text-lg">No members found matching your search.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="bg-white border-t border-gray-100 mt-12">
                    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                        <p className="text-center text-base text-gray-400">
                            &copy; {new Date().getFullYear()} Sakto Community Platform. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
} 