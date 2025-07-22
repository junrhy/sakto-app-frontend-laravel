import { Link } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    slug?: string;
}

interface MemberCardProps {
    user: User;
}

export default function MemberCard({ user }: MemberCardProps) {
    return (
        <Link 
            href={route('member.short', { identifier: user.slug || user.id })}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
            <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-600">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-24 w-24 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                        <span className="text-4xl font-bold text-blue-600">
                            {user.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>
            <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{user.name}</h3>
                <p className="text-sm text-slate-500 mb-4">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                </p>
                <Link
                    href={route('register', { project: 'community', community: user.id })}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Join Community
                </Link>
            </div>
        </Link>
    );
} 