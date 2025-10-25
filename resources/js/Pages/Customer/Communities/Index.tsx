import TextInput from '@/Components/TextInput';
import { Card } from '@/Components/ui/card';
import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Community {
    id: number;
    name: string;
    email: string;
    contact_number: string;
    created_at: string;
    slug: string;
    identifier: string;
}

interface CommunitiesProps extends PageProps {
    communities: Community[];
    joinedCommunityIds: number[];
    pendingRequestIds: number[];
}

export default function Communities({
    auth,
    communities,
    joinedCommunityIds,
    pendingRequestIds,
}: CommunitiesProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [joiningIds, setJoiningIds] = useState<number[]>([]);
    const [filter, setFilter] = useState<'my' | 'all'>('my');

    // Filter communities based on search query and filter type
    const filteredCommunities = communities
        .filter((community) => {
            // First filter by membership status
            if (filter === 'my') {
                return joinedCommunityIds.includes(community.id);
            }
            return true;
        })
        .filter((community) => {
            // Then filter by search query
            return (
                community.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                community.email
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                (community.contact_number &&
                    community.contact_number
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()))
            );
        });

    const handleJoin = async (communityId: number) => {
        setJoiningIds([...joiningIds, communityId]);

        try {
            const response = await fetch(
                route('customer.communities.join', communityId),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                },
            );

            const data = await response.json();

            if (data.status === 'success') {
                toast.success(data.message);
                router.reload({ only: ['communities', 'joinedCommunityIds', 'pendingRequestIds'] });
            } else {
                toast.error(data.message || 'Failed to join community');
            }
        } catch (error) {
            toast.error('An error occurred while joining the community');
        } finally {
            setJoiningIds(joiningIds.filter((id) => id !== communityId));
        }
    };

    const handleUnjoin = async (communityId: number) => {
        setJoiningIds([...joiningIds, communityId]);

        try {
            const response = await fetch(
                route('customer.communities.unjoin', communityId),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                },
            );

            const data = await response.json();

            if (data.status === 'success') {
                toast.success(data.message);
                router.reload({ only: ['communities', 'joinedCommunityIds', 'pendingRequestIds'] });
            } else {
                toast.error(data.message || 'Failed to leave community');
            }
        } catch (error) {
            toast.error('An error occurred while leaving the community');
        } finally {
            setJoiningIds(joiningIds.filter((id) => id !== communityId));
        }
    };

    const isJoined = (communityId: number) =>
        joinedCommunityIds.includes(communityId);
    const isPending = (communityId: number) =>
        pendingRequestIds.includes(communityId);
    const isProcessing = (communityId: number) =>
        joiningIds.includes(communityId);

    return (
        <CustomerLayout
            auth={auth}
            title="Communities"
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Communities
                </h2>
            }
        >
            <Head title="Communities" />

            <div className="overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                <div className="p-4 text-gray-900 dark:text-gray-100 sm:p-6">
                    <div className="mb-6 flex flex-col gap-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex-shrink-0">
                                <h3 className="text-lg font-medium">
                                    Communities
                                </h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    Total: {filteredCommunities.length}{' '}
                                    {filteredCommunities.length === 1
                                        ? 'community'
                                        : 'communities'}
                                </p>
                            </div>
                            <div className="w-full sm:w-auto sm:max-w-sm">
                                <TextInput
                                    type="text"
                                    placeholder="Search by name, email, or phone..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Filter Tabs */}
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    onClick={() => setFilter('my')}
                                    className={`whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
                                        filter === 'my'
                                            ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                                    }`}
                                >
                                    My Communities
                                    {joinedCommunityIds.length > 0 && (
                                        <span
                                            className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                                                filter === 'my'
                                                    ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
                                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                            }`}
                                        >
                                            {joinedCommunityIds.length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`whitespace-nowrap border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
                                        filter === 'all'
                                            ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300'
                                    }`}
                                >
                                    All Communities
                                    <span
                                        className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                                            filter === 'all'
                                                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                        }`}
                                    >
                                        {communities.length}
                                    </span>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {filteredCommunities.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredCommunities.map((community) => (
                                <Card
                                    key={community.id}
                                    className={`overflow-hidden border bg-white shadow-sm dark:bg-gray-800 ${
                                        isJoined(community.id)
                                            ? 'border-indigo-500 ring-2 ring-indigo-500/20 dark:border-indigo-400 dark:ring-indigo-400/20'
                                            : isPending(community.id)
                                              ? 'border-amber-500 ring-2 ring-amber-500/20 dark:border-amber-400 dark:ring-amber-400/20'
                                              : 'border-gray-200 dark:border-gray-700'
                                    }`}
                                >
                                    {/* Header */}
                                    <div
                                        className={`border-b px-4 py-3 dark:border-gray-700 sm:px-6 sm:py-4 ${
                                            isJoined(community.id)
                                                ? 'bg-indigo-50 dark:bg-indigo-900/20'
                                                : isPending(community.id)
                                                  ? 'bg-amber-50 dark:bg-amber-900/20'
                                                  : 'bg-gray-50 dark:bg-gray-700'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 sm:h-12 sm:w-12">
                                                <span className="text-base font-medium text-indigo-600 dark:text-indigo-300 sm:text-lg">
                                                    {community.name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="truncate text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg">
                                                        {community.name}
                                                    </h3>
                                                    {isJoined(community.id) && (
                                                        <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200">
                                                            Joined
                                                        </span>
                                                    )}
                                                    {isPending(community.id) && (
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

                                    {/* Content */}
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
                                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                    />
                                                </svg>
                                                <span className="min-w-0 truncate text-sm text-gray-600 dark:text-gray-400">
                                                    {community.contact_number ||
                                                        'No phone number'}
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
                                                    Joined{' '}
                                                    {new Date(
                                                        community.created_at,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-700 sm:px-6">
                                        <div className="flex items-center justify-between gap-3">
                                            <Link
                                                href={route(
                                                    'member.short',
                                                    community.slug ||
                                                        community.id,
                                                )}
                                                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                            >
                                                View Profile
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
                                            </Link>

                                            {isJoined(community.id) ? (
                                                <button
                                                    onClick={() =>
                                                        handleUnjoin(
                                                            community.id,
                                                        )
                                                    }
                                                    disabled={isProcessing(
                                                        community.id,
                                                    )}
                                                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                                >
                                                    {isProcessing(
                                                        community.id,
                                                    ) ? (
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
                                                            Leaving...
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
                                                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                                                />
                                                            </svg>
                                                            Leave
                                                        </>
                                                    )}
                                                </button>
                                            ) : isPending(community.id) ? (
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
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        handleJoin(community.id)
                                                    }
                                                    disabled={isProcessing(
                                                        community.id,
                                                    )}
                                                    className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                                >
                                                    {isProcessing(
                                                        community.id,
                                                    ) ? (
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
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-8">
                            <svg
                                className="mx-auto h-10 w-10 text-gray-400 sm:h-12 sm:w-12"
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
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100 sm:text-base">
                                {searchQuery
                                    ? 'No communities found'
                                    : filter === 'my'
                                      ? 'No joined communities yet'
                                      : 'No communities available'}
                            </h3>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                                {searchQuery
                                    ? 'Try adjusting your search terms.'
                                    : filter === 'my'
                                      ? 'Join communities from the "All Communities" tab to see them here.'
                                      : 'No community members have been added yet.'}
                            </p>
                            {filter === 'my' && !searchQuery && (
                                <button
                                    onClick={() => setFilter('all')}
                                    className="mt-4 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                                >
                                    Browse All Communities
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
