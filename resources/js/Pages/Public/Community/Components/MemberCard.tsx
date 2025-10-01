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
        <div className="transform overflow-hidden rounded-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-600">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm">
                        <span className="text-4xl font-bold text-blue-600">
                            {user.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6">
                <h3 className="mb-2 text-lg font-semibold text-slate-900">
                    {user.name}
                </h3>
                <p className="mb-4 text-sm text-slate-500">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                </p>
                <Link
                    href={route('member.short', {
                        identifier: user.slug || user.id,
                    })}
                    className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
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
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                    </svg>
                    Join Community
                </Link>
            </div>
        </div>
    );
}
