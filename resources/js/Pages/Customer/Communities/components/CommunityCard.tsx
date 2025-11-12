import { Card } from '@/Components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Community } from '../types';

interface CommunityCardProps {
    community: Community;
    isJoined: boolean;
    isPending: boolean;
    isProcessing: boolean;
    onJoin: (communityId: number) => Promise<void> | void;
    onLeave: (community: Community) => Promise<void> | void;
    onView: (community: Community) => Promise<void> | void;
}

export function CommunityCard({
    community,
    isJoined,
    isPending,
    isProcessing,
    onJoin,
    onLeave,
    onView,
}: CommunityCardProps) {
    const statusStyles = isJoined
        ? 'border-indigo-500 ring-2 ring-indigo-500/20 dark:border-indigo-400 dark:ring-indigo-400/20'
        : isPending
          ? 'border-amber-500 ring-2 ring-amber-500/20 dark:border-amber-400 dark:ring-amber-400/20'
          : 'border-gray-200 dark:border-gray-700';

    const headerStyles = isJoined
        ? 'bg-indigo-50 dark:bg-indigo-900/20'
        : isPending
          ? 'bg-amber-50 dark:bg-amber-900/20'
          : 'bg-gray-50 dark:bg-gray-700';

    const renderActionButton = () => {
        if (isJoined) {
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            aria-label="Community actions"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                            disabled={isProcessing}
                            onSelect={(event) => {
                                event.preventDefault();
                                if (!isProcessing) {
                                    onLeave(community);
                                }
                            }}
                            className="text-red-600 focus:text-red-600"
                        >
                            {isProcessing ? 'Leaving…' : 'Leave Community'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }

        if (isPending) {
            return (
                <button
                    disabled
                    className="inline-flex items-center rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 shadow-sm disabled:cursor-not-allowed dark:border-amber-600 dark:bg-amber-900/30 dark:text-amber-300"
                >
                    <svg
                        className="mr-1.5 h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    Pending Approval
                </button>
            );
        }

        return (
            <button
                onClick={() => onJoin(community.id)}
                disabled={isProcessing}
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
                {isProcessing ? (
                    <>
                        <svg
                            className="mr-1.5 h-3 w-3 animate-spin"
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
                        Joining...
                    </>
                ) : (
                    <>
                        <svg
                            className="mr-1.5 h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                            />
                        </svg>
                        Join
                    </>
                )}
            </button>
        );
    };

    return (
        <Card
            className={`overflow-hidden border bg-white shadow-sm dark:bg-gray-800 ${statusStyles}`}
        >
            <div
                className={`border-b px-4 py-3 dark:border-gray-700 sm:px-6 sm:py-4 ${headerStyles}`}
            >
                <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 sm:h-12 sm:w-12">
                        <span className="text-base font-medium text-indigo-600 dark:text-indigo-300 sm:text-lg">
                            {community.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="truncate text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg">
                                {community.name}
                            </h3>
                            {isJoined && (
                                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200">
                                    Joined
                                </span>
                            )}
                            {isPending && (
                                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                                    Pending
                                </span>
                            )}
                        </div>
                        <p className="truncate text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                            {community.email}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 sm:p-6">
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <svg
                            className="h-4 w-4 flex-shrink-0 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M3 7l9 6 9-6"
                            />
                        </svg>
                        <span className="min-w-0 truncate text-sm text-gray-600 dark:text-gray-400">
                            {community.email || 'No email'}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <svg
                            className="h-4 w-4 flex-shrink-0 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            Registered on{' '}
                            {new Date(
                                community.created_at,
                            ).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-700 sm:px-6">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        {isJoined && (
                            <button
                                type="button"
                                onClick={() => onView(community)}
                                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                                View Details
                                <svg
                                    className="ml-1 h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>

                    {renderActionButton()}
                </div>
            </div>
        </Card>
    );
}
