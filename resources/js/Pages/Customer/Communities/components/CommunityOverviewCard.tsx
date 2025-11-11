import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
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
}: CommunityOverviewCardProps) {
    const memberSince = joinedAt ?? community.created_at;
    const memberSinceLabel = isJoined
        ? new Date(memberSince).toLocaleDateString()
        : null;

    return (
        <Card
            id="overview"
            className="border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
            <CardHeader className="relative">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex flex-col gap-2 pr-12 md:pr-0">
                        <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            Overview
                        </CardTitle>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            {isJoined && (
                                <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200">
                                    You're a member since {memberSinceLabel}
                                </span>
                            )}
                            {isPending && (
                                <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                                    Pending Approval
                                </span>
                            )}
                        </div>
                    </div>
                    {isJoined && (
                        <div className="absolute right-2 top-2 flex justify-end md:static md:justify-start md:right-0 md:top-0">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="h-9 w-9 rounded-full border border-gray-200 text-gray-500 hover:text-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Community actions</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
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
            <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <DetailItem
                        label="Email"
                        value={community.email || 'No email'}
                        iconPath="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                        secondaryPath="M3 7l9 6 9-6"
                    />
                    <DetailItem
                        label="Contact Number"
                        value={community.contact_number || 'Not provided'}
                        iconPath="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                    <DetailItem
                        label="Registered on"
                        value={new Date(community.created_at).toLocaleDateString()}
                        iconPath="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    {isJoined ? null : isPending ? (
                        <Button
                            type="button"
                            disabled
                            variant="outline"
                            className="w-full border-amber-300 bg-amber-50 text-amber-800 sm:w-auto dark:border-amber-600 dark:bg-amber-900/30 dark:text-amber-300"
                        >
                            Pending Approval
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={onJoin}
                            disabled={joining}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 sm:w-auto dark:bg-indigo-500 dark:hover:bg-indigo-600"
                        >
                            {joining ? (
                                <>
                                    <SpinnerIcon />
                                    Joining...
                                </>
                            ) : (
                                'Join Community'
                            )}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
