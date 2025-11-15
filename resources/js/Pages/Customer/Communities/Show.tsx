import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import { EventsOverviewSection } from '@/Pages/Customer/Events/Overview';
import { NewsfeedOverviewSection } from '@/Pages/Customer/Newsfeed/Overview';
import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CommunityOverviewCard } from './components/CommunityOverviewCard';
import { LeaveCommunityDialog } from './components/LeaveCommunityDialog';
import { CommunityCollectionItem, CommunityDetailProps } from './types';
import { normalizeCollection } from './utils/communityCollections';

export default function Show({
    auth,
    community,
    isJoined,
    isPending,
    joinedAt,
    totalCustomers,
    events,
    updates,
}: CommunityDetailProps) {
    const [joining, setJoining] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('overview');

    const normalizedSections = useMemo(
        () => ({
            events: normalizeCollection(events),
            updates: normalizeCollection(updates),
        }),
        [events, updates],
    );

    const projectIdentifier = community.project_identifier ?? 'community';
    const ownerIdentifier =
        community.slug ?? community.identifier ?? String(community.id);

    const navigationItems = useMemo(
        () => [
            { id: 'overview', label: 'Overview' },
            { id: 'resources', label: 'Resources' },
            { id: 'challenges', label: 'Challenges' },
            { id: 'marketplace', label: 'Marketplace' },
            { id: 'jobs', label: 'Jobs' },
            { id: 'courses', label: 'Courses' },
            { id: 'healthcare', label: 'Healthcare' },
            { id: 'mortuary', label: 'Mortuary' },
            { id: 'lending', label: 'Lending' },
        ],
        [],
    );

    const handleNavigation = useCallback(
        (id: string) => {
            const externalRoutes: Record<string, string> = {
                resources: 'customer.projects.resources.overview',
                challenges: 'customer.projects.challenges.overview',
                marketplace: 'customer.projects.marketplace.overview',
                jobs: 'customer.projects.jobs.index',
                courses: 'customer.projects.courses.index',
                healthcare: 'customer.projects.healthcare.index',
                mortuary: 'customer.projects.mortuary.index',
                lending: 'customer.projects.lending.index',
            };

            if (externalRoutes[id]) {
                router.visit(
                    route(externalRoutes[id], {
                        project: projectIdentifier,
                        owner: ownerIdentifier,
                    }),
                );
                return;
            }

        setActiveSection(id);
        if (typeof window !== 'undefined') {
            const target = document.getElementById(id);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
        },
        [router, projectIdentifier, ownerIdentifier],
    );

    const sidebarSections = useMemo(
        () =>
            navigationItems.map((item) => ({
                id: item.id,
                label: item.label,
                isActive: activeSection === item.id,
                onSelect: handleNavigation,
            })),
        [navigationItems, activeSection, handleNavigation],
    );

    const handleJoin = useCallback(async () => {
        setJoining(true);

        try {
            const response = await fetch(
                route('customer.communities.join', community.id),
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
                        'community',
                        'isJoined',
                        'isPending',
                        'joinedAt',
                    ],
                });
            } else {
                toast.error(data.message || 'Failed to join community');
            }
        } catch (error) {
            toast.error('An error occurred while joining the community');
        } finally {
            setJoining(false);
        }
    }, [community.id, router]);

    const handleUnjoin = useCallback(async () => {
        setLeaving(true);

        try {
            const response = await fetch(
                route('customer.communities.unjoin', community.id),
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
                        'community',
                        'isJoined',
                        'isPending',
                        'joinedAt',
                    ],
                });
            } else {
                toast.error(data.message || 'Failed to leave community');
            }
        } catch (error) {
            toast.error('An error occurred while leaving the community');
        } finally {
            setLeaving(false);
            setLeaveConfirmOpen(false);
        }
    }, [community.id, router]);

    const sectionNodes = useMemo(() => {
        const sections = [
            {
                id: 'overview',
                node: (
                    <div id="overview">
                        <div className="grid gap-6 lg:grid-cols-3">
                            <div className="space-y-6 lg:col-span-2 lg:px-2 xl:px-20 2xl:px-40">
                                <NewsfeedOverviewSection
                                    key="newsfeed-overview"
                                    id="newsfeed-overview"
                                    updates={normalizedSections.updates}
                                    projectIdentifier={projectIdentifier}
                                    ownerIdentifier={ownerIdentifier}
                                    emptyMessage="No newsfeed items."
                                />
                            </div>

                            <div className="space-y-6">
                                <EventsOverviewSection
                                    key="overview-events"
                                    id="overview-events"
                                    events={normalizedSections.events.slice(
                                        0,
                                        3,
                                    )}
                                    projectIdentifier={projectIdentifier}
                                    ownerIdentifier={ownerIdentifier}
                                    appCurrency={community.app_currency}
                                    emptyMessage="No upcoming events."
                                />
                                <div className="hidden lg:block">
                                    <CommunityOverviewCard
                                        key="overview"
                                        community={community}
                                        isJoined={isJoined}
                                        isPending={isPending}
                                        joining={joining}
                                        leaving={leaving}
                                        onJoin={handleJoin}
                                        onLeaveClick={() =>
                                            setLeaveConfirmOpen(true)
                                        }
                                        joinedAt={joinedAt}
                                        totalCustomers={totalCustomers}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                ),
            },
        ];

        return sections;
    }, [
        community,
        isJoined,
        isPending,
        joining,
        leaving,
        normalizedSections,
        handleJoin,
        projectIdentifier,
        ownerIdentifier,
    ]);

    return (
        <CustomerLayout
            auth={auth}
            title={`${community.name} Community`}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        {`${community.name}`}
                    </h2>
                    <Link
                        href={route('customer.communities')}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                        &larr; Back to Communities
                    </Link>
                </div>
            }
            sidebarSections={sidebarSections}
            sidebarSectionTitle={community.name}
        >
            <Head title={`Community: ${community.name}`} />

            <div className="space-y-8">
                {
                    (
                        sectionNodes.find(
                            (section) => section.id === activeSection,
                        ) ?? sectionNodes[0]
                    ).node
                }
            </div>

            <LeaveCommunityDialog
                open={leaveConfirmOpen}
                community={community}
                isProcessing={leaving}
                onClose={() => setLeaveConfirmOpen(false)}
                onConfirm={handleUnjoin}
            />
        </CustomerLayout>
    );
}
