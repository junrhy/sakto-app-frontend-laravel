import { Link } from '@inertiajs/react';

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

interface MemberCardProps {
    user: User;
}

export default function MemberCard({ user }: MemberCardProps) {
    return (
        <Link 
            href={route('community.member', { id: user.id })}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
            <div className="relative h-48 bg-gradient-to-r from-indigo-500 to-purple-600">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-24 w-24 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                        <span className="text-4xl font-bold text-indigo-600">
                            {user.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>
            <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                <p className="mt-2 text-sm text-gray-500 hidden sm:block">{user.email}</p>
                <p className="mt-1 text-sm text-gray-400 hidden sm:block">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                </p>
            </div>
        </Link>
    );
} 