import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import { ChallengesOverviewSection } from '@/Pages/Customer/Challenges/Overview';
import { CoursesOverviewSection } from '@/Pages/Customer/Courses/Overview';
import { EventsOverviewSection } from '@/Pages/Customer/Events/Overview';
import { HealthcareRecordsSection } from '@/Pages/Customer/Healthcare/Index';
import { LendingRecordsSection } from '@/Pages/Customer/Lending/Index';
import { MarketplaceOverviewSection } from '@/Pages/Customer/Marketplace/Overview';
import { MortuaryRecordsSection } from '@/Pages/Customer/Mortuary/Index';
import { NewsfeedOverviewSection } from '@/Pages/Customer/Newsfeed/Overview';
import { ResourcesOverviewSection } from '@/Pages/Customer/Resources/Overview';
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
    challenges,
    events,
    pages,
    updates,
    products,
    courses,
    orderHistory,
    lendingRecords,
    healthcareRecords,
    mortuaryRecords,
}: CommunityDetailProps) {
    const [joining, setJoining] = useState(false);
    const [leaving, setLeaving] = useState(false);
    const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('overview');

    const normalizedSections = useMemo(
        () => ({
            challenges: normalizeCollection(challenges),
            events: normalizeCollection(events),
            pages: normalizeCollection(pages),
            updates: normalizeCollection(updates),
            products: normalizeCollection(products),
            courses: normalizeCollection(courses),
            orderHistory: normalizeCollection(orderHistory),
        }),
        [challenges, events, pages, updates, products, courses, orderHistory],
    );

    const lendingRecordsSafe = useMemo(
        () => (Array.isArray(lendingRecords) ? lendingRecords : []),
        [lendingRecords],
    );
    const healthcareRecordsSafe = useMemo(
        () => (Array.isArray(healthcareRecords) ? healthcareRecords : []),
        [healthcareRecords],
    );
    const mortuaryRecordsSafe = useMemo(
        () => (Array.isArray(mortuaryRecords) ? mortuaryRecords : []),
        [mortuaryRecords],
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
            { id: 'courses', label: 'Courses' },
            { id: 'healthcare', label: 'Healthcare' },
            { id: 'mortuary', label: 'Mortuary' },
            { id: 'lending', label: 'Lending' },
        ],
        [],
    );

    const handleNavigation = useCallback((id: string) => {
        setActiveSection(id);
        if (typeof window !== 'undefined') {
            const target = document.getElementById(id);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, []);

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
                        'orderHistory',
                        'lendingRecords',
                        'healthcareRecords',
                        'mortuaryRecords',
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
                        'orderHistory',
                        'lendingRecords',
                        'healthcareRecords',
                        'mortuaryRecords',
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

    const sectionNodes = useMemo(
        () => [
            {
                id: 'overview',
                node: (
                    <div id="overview">
                        <div className="grid gap-6 lg:grid-cols-3">
                            {/* First Column: Newsfeed (wider - spans 2 columns) */}
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

                            {/* Second Column: Overview and Events (spans 1 column) */}
                            <div className="space-y-6">
                                <div className="hidden lg:block">
                                    <CommunityOverviewCard
                                        key="overview"
                                        community={community}
                                        isJoined={isJoined}
                                        isPending={isPending}
                                        joining={joining}
                                        leaving={leaving}
                                        onJoin={handleJoin}
                                        onLeaveClick={() => setLeaveConfirmOpen(true)}
                                        joinedAt={joinedAt}
                                        totalCustomers={totalCustomers}
                                    />
                                </div>
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
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                id: 'resources',
                node: (
                    <ResourcesOverviewSection
                        key="resources"
                        id="resources"
                        resources={normalizedSections.pages}
                        projectIdentifier={projectIdentifier}
                        ownerIdentifier={ownerIdentifier}
                    />
                ),
            },
            {
                id: 'challenges',
                node: (
                    <ChallengesOverviewSection
                        key="challenges"
                        id="challenges"
                        challenges={normalizedSections.challenges}
                        projectIdentifier={projectIdentifier}
                        ownerIdentifier={ownerIdentifier}
                    />
                ),
            },
            {
                id: 'marketplace',
                node: (
                    <MarketplaceOverviewSection
                        key="marketplace"
                        id="marketplace"
                        projectIdentifier={projectIdentifier}
                        ownerIdentifier={ownerIdentifier}
                        products={normalizedSections.products}
                        orderHistory={
                            normalizedSections.orderHistory as CommunityCollectionItem[]
                        }
                        appCurrency={community.app_currency}
                        authUser={auth.user as any}
                    />
                ),
            },
            {
                id: 'courses',
                node: (
                    <CoursesOverviewSection
                        key="courses"
                        id="courses"
                        courses={normalizedSections.courses}
                        projectIdentifier={projectIdentifier}
                        ownerIdentifier={ownerIdentifier}
                        appCurrency={community.app_currency}
                        emptyMessage="No courses available."
                    />
                ),
            },
            {
                id: 'healthcare',
                node: (
                    <HealthcareRecordsSection
                        key="healthcare"
                        id="healthcare"
                        records={healthcareRecordsSafe}
                        projectIdentifier={projectIdentifier}
                        ownerIdentifier={ownerIdentifier}
                        appCurrency={community.app_currency}
                    />
                ),
            },
            {
                id: 'mortuary',
                node: (
                    <MortuaryRecordsSection
                        key="mortuary"
                        id="mortuary"
                        records={mortuaryRecordsSafe}
                        projectIdentifier={projectIdentifier}
                        ownerIdentifier={ownerIdentifier}
                        appCurrency={community.app_currency}
                    />
                ),
            },
            {
                id: 'lending',
                node: (
                    <LendingRecordsSection
                        key="lending"
                        id="lending"
                        records={lendingRecordsSafe}
                        projectIdentifier={projectIdentifier}
                        ownerIdentifier={ownerIdentifier}
                        appCurrency={community.app_currency}
                    />
                ),
            },
        ],
        [
            community,
            isJoined,
            isPending,
            joining,
            leaving,
            normalizedSections,
            handleJoin,
            healthcareRecordsSafe,
            mortuaryRecordsSafe,
            lendingRecordsSafe,
            projectIdentifier,
            ownerIdentifier,
        ],
    );

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
