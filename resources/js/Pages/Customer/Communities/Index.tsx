import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CommunityCard } from './components/CommunityCard';
import { CommunityEmptyState } from './components/CommunityEmptyState';
import { CommunityFilters } from './components/CommunityFilters';
import { LeaveCommunityDialog } from './components/LeaveCommunityDialog';
import { CommunitiesProps, Community, CommunityFilter } from './types';

export default function Communities({
    auth,
    communities,
    joinedCommunityIds,
    pendingRequestIds,
}: CommunitiesProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [joiningIds, setJoiningIds] = useState<number[]>([]);
    const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
    const [communityToLeave, setCommunityToLeave] = useState<Community | null>(
        null,
    );
    const [filter, setFilter] = useState<CommunityFilter>('my');

    const joinedCount = joinedCommunityIds.length;
    const totalCount = communities.length;

    const filteredCommunities = useMemo(() => {
        const lowerQuery = searchQuery.toLowerCase();

        return communities
            .filter((community) =>
                filter === 'my'
                    ? joinedCommunityIds.includes(community.id)
                    : true,
            )
            .filter((community) => {
                const matchesName = community.name
                    .toLowerCase()
                    .includes(lowerQuery);
                const matchesEmail = community.email
                    .toLowerCase()
                    .includes(lowerQuery);
                const matchesContact = community.contact_number
                    ?.toLowerCase()
                    .includes(lowerQuery);

                return matchesName || matchesEmail || matchesContact;
            });
    }, [communities, filter, joinedCommunityIds, searchQuery]);

    const handleJoin = async (communityId: number) => {
        setJoiningIds((prev) => [...prev, communityId]);

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
                router.reload({
                    only: [
                        'communities',
                        'joinedCommunityIds',
                        'pendingRequestIds',
                    ],
                });
            } else {
                toast.error(data.message || 'Failed to join community');
            }
        } catch (error) {
            toast.error('An error occurred while joining the community');
        } finally {
            setJoiningIds((prev) => prev.filter((id) => id !== communityId));
        }
    };

    const handleUnjoin = async (communityId: number) => {
        setJoiningIds((prev) => [...prev, communityId]);

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
                router.reload({
                    only: [
                        'communities',
                        'joinedCommunityIds',
                        'pendingRequestIds',
                    ],
                });
            } else {
                toast.error(data.message || 'Failed to leave community');
            }
        } catch (error) {
            toast.error('An error occurred while leaving the community');
        } finally {
            setJoiningIds((prev) => prev.filter((id) => id !== communityId));
        }
    };

    const openLeaveConfirm = (community: Community) => {
        setCommunityToLeave(community);
        setLeaveConfirmOpen(true);
    };

    const closeLeaveConfirm = () => {
        setLeaveConfirmOpen(false);
        setCommunityToLeave(null);
    };

    const confirmLeave = async () => {
        if (!communityToLeave) {
            return;
        }

        await handleUnjoin(communityToLeave.id);
        closeLeaveConfirm();
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
                    <CommunityFilters
                        filter={filter}
                        searchQuery={searchQuery}
                        joinedCount={joinedCount}
                        totalCount={totalCount}
                        onFilterChange={setFilter}
                        onSearchChange={setSearchQuery}
                    />

                    {filteredCommunities.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredCommunities.map((community) => (
                                <CommunityCard
                                    key={community.id}
                                    community={community}
                                    isJoined={isJoined(community.id)}
                                    isPending={isPending(community.id)}
                                    isProcessing={isProcessing(community.id)}
                                    onJoin={handleJoin}
                                    onLeave={openLeaveConfirm}
                                    onView={(selectedCommunity) =>
                                        router.visit(
                                            route(
                                                'customer.communities.show',
                                                selectedCommunity.slug ||
                                                    selectedCommunity.id,
                                            ),
                                        )
                                    }
                                />
                            ))}
                        </div>
                    ) : (
                        <CommunityEmptyState
                            filter={filter}
                            searchQuery={searchQuery}
                            onBrowseAll={() => setFilter('all')}
                        />
                    )}
                </div>
            </div>

            <LeaveCommunityDialog
                open={leaveConfirmOpen}
                community={communityToLeave}
                isProcessing={
                    communityToLeave ? isProcessing(communityToLeave.id) : false
                }
                onClose={closeLeaveConfirm}
                onConfirm={confirmLeave}
            />
        </CustomerLayout>
    );
}
