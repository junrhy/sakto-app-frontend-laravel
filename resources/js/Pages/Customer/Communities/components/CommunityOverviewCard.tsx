import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { Community } from '../types';
import { DetailItem } from './DetailItem';
import { SpinnerIcon } from './SpinnerIcon';

interface CommunityOverviewCardProps {
    community: Community;
    isJoined: boolean;
    isPending: boolean;
    joining: boolean;
    leaving: boolean;
    onJoin: () => void;
    onLeaveClick: () => void;
    joinedAt?: string | null;
    totalCustomers?: number;
}

export function CommunityOverviewCard({
    community,
    isJoined,
    isPending,
    joining,
    leaving,
    onJoin,
    onLeaveClick,
    joinedAt,
    totalCustomers,
}: CommunityOverviewCardProps) {
    const memberSince = joinedAt ?? community.created_at;
    const memberSinceLabel = isJoined
        ? new Date(memberSince).toLocaleDateString()
        : null;

    return (
        <Card
            id="overview"
            className="overflow-hidden border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 shadow-lg transition-shadow duration-300 hover:shadow-xl dark:border-gray-700 dark:from-gray-800 dark:to-gray-900/50"
        >
            <CardHeader className="relative bg-gradient-to-r from-rose-400 via-pink-500 to-orange-400 p-4 text-white sm:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex flex-col gap-2 pr-12 md:pr-0">
                        <CardTitle className="text-lg font-bold text-white sm:text-xl md:text-2xl">
                            {community.name}
                        </CardTitle>
                        <p className="text-xs font-medium text-white/90 sm:text-sm">
                            Community Overview
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            {isJoined && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                    <svg
                                        className="h-3.5 w-3.5"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    Member since {memberSinceLabel}
                                </span>
                            )}
                            {isPending && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                    <svg
                                        className="h-3.5 w-3.5 animate-spin"
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
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Pending Approval
                                </span>
                            )}
                        </div>
                    </div>
                    {isJoined && (
                        <div className="absolute right-2 top-2 flex justify-end md:static md:right-0 md:top-0 md:justify-start">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="h-9 w-9 rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 dark:border-white/30 dark:bg-white/10 dark:hover:bg-white/20"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">
                                            Community actions
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-48"
                                >
                                    <DropdownMenuItem
                                        disabled={leaving}
                                        onSelect={(event) => {
                                            event.preventDefault();
                                            if (!leaving) {
                                                onLeaveClick();
                                            }
                                        }}
                                        className="text-red-600 focus:text-red-600"
                                    >
                                        {leaving ? (
                                            <span className="flex items-center gap-2 text-sm">
                                                <SpinnerIcon /> Leaving…
                                            </span>
                                        ) : (
                                            'Leave Community'
                                        )}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:space-y-6 sm:p-6">
                {/* Highlight Total Members */}
                {totalCustomers !== undefined && (
                    <div className="rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4 dark:from-indigo-900/20 dark:to-purple-900/20 sm:p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 sm:h-12 sm:w-12">
                                    <svg
                                        className="h-5 w-5 text-white sm:h-6 sm:w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                                        Total Members
                                    </p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-gray-100 sm:text-2xl">
                                        {totalCustomers.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Other Details Grid */}
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                    <div className="group rounded-lg border border-gray-200 bg-white p-3 transition-all duration-200 hover:border-indigo-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-indigo-600 sm:col-span-2 sm:p-4">
                        <DetailItem
                            label="Email"
                            value={community.email || 'No email'}
                            iconPath="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                            secondaryPath="M3 7l9 6 9-6"
                        />
                    </div>
                    <div className="group rounded-lg border border-gray-200 bg-white p-3 transition-all duration-200 hover:border-indigo-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-indigo-600 sm:col-span-2 sm:p-4">
                        <DetailItem
                            label="Contact Number"
                            value={community.contact_number || 'Not provided'}
                            iconPath="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                    </div>
                    <div className="group rounded-lg border border-gray-200 bg-white p-3 transition-all duration-200 hover:border-indigo-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-indigo-600 sm:col-span-2 sm:p-4">
                        <DetailItem
                            label="Registered on"
                            value={new Date(
                                community.created_at,
                            ).toLocaleDateString()}
                            iconPath="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex flex-col gap-3 sm:flex-row">
                    {isJoined ? null : isPending ? (
                        <Button
                            type="button"
                            disabled
                            variant="outline"
                            className="w-full border-amber-300 bg-amber-50 text-amber-800 shadow-sm transition-all duration-200 hover:shadow-md dark:border-amber-600 dark:bg-amber-900/30 dark:text-amber-300 sm:w-auto"
                        >
                            <svg
                                className="mr-2 h-4 w-4 animate-spin"
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
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Pending Approval
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={onJoin}
                            disabled={joining}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold text-white shadow-lg transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl disabled:opacity-50 dark:from-indigo-500 dark:to-purple-500 dark:hover:from-indigo-600 dark:hover:to-purple-600 sm:w-auto"
                        >
                            {joining ? (
                                <>
                                    <SpinnerIcon />
                                    Joining...
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
                                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                        />
                                    </svg>
                                    Join Community
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
