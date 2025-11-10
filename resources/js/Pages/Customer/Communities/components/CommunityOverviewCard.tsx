import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
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
}

export function CommunityOverviewCard({
    community,
    isJoined,
    isPending,
    joining,
    leaving,
    onJoin,
    onLeaveClick,
}: CommunityOverviewCardProps) {
    return (
        <Card
            id="overview"
            className="border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
            <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                            {community.name}
                        </CardTitle>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Identifier: {community.identifier}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {isJoined && (
                            <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200">
                                Joined
                            </span>
                        )}
                        {isPending && (
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                                Pending Approval
                            </span>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
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
                        label="Member Since"
                        value={new Date(community.created_at).toLocaleDateString()}
                        iconPath="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </div>

                <div className="flex flex-wrap gap-3">
                    {isJoined ? (
                        <Button
                            type="button"
                            onClick={onLeaveClick}
                            disabled={leaving}
                            variant="outline"
                            className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            {leaving ? (
                                <>
                                    <SpinnerIcon />
                                    Leaving...
                                </>
                            ) : (
                                'Leave Community'
                            )}
                        </Button>
                    ) : isPending ? (
                        <Button
                            type="button"
                            disabled
                            variant="outline"
                            className="border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-600 dark:bg-amber-900/30 dark:text-amber-300"
                        >
                            Pending Approval
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={onJoin}
                            disabled={joining}
                            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
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
