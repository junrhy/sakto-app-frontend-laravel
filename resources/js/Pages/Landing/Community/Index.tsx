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
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-indigo-600 shadow-sm border-b border-indigo-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex items-center">
                                <ApplicationLogo className="block h-8 w-auto fill-current text-white" />
                                <span className="ml-2 text-xl font-bold text-white">Sakto Community</span>
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
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Link
                                    href={route('register', { project: 'community' })}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 transition-colors duration-200 w-full sm:w-auto justify-center whitespace-nowrap"
                                >
                                    New Community
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Members Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <MemberCard key={user.id} user={user} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <div className="max-w-md mx-auto">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No members found</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {searchQuery ? 'Try adjusting your search terms.' : 'No members have joined yet.'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
} 