import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { LeaveCommunityDialog } from './components/LeaveCommunityDialog';
import { CommunityOrderHistory } from './components/CommunityOrderHistory';
import { CommunityOverviewCard } from './components/CommunityOverviewCard';
import { NewsfeedSection } from './components/NewsfeedSection';
import { EventsSection } from './components/EventsSection';
import { ResourcesSection } from './components/ResourcesSection';
import { ChallengesSection } from './components/ChallengesSection';
import { HealthcareRecordsSection } from './components/HealthcareRecordsSection';
import { MortuaryRecordsSection } from './components/MortuaryRecordsSection';
import { LendingRecordsSection } from './components/LendingRecordsSection';
import { CoursesSection } from './components/CoursesSection';
import { MarketplaceSection } from './components/MarketplaceSection';
import {
    CommunityCollectionItem,
    CommunityDetailProps,
} from './types';
import { normalizeCollection } from './utils/communityCollections';

export default function Show({
    auth,
    community,
    isJoined,
    isPending,
    joinedAt,
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

    const formatPrice = useCallback(
        (price: number | string) => {
            const currency = community.app_currency;
            const symbol = currency?.symbol ?? '₱';
            const decimalSeparator = currency?.decimal_separator ?? '.';
            const thousandsSeparator = currency?.thousands_separator ?? ',';

            const numericValue =
                typeof price === 'string' ? Number.parseFloat(price) : Number(price);

            if (Number.isNaN(numericValue)) {
                return `${symbol}0${decimalSeparator}00`;
            }

            const [whole, fraction = '00'] = numericValue.toFixed(2).split('.');
            const wholeWithSeparators = whole.replace(
                /\B(?=(\d{3})+(?!\d))/g,
                thousandsSeparator,
            );

            return `${symbol}${wholeWithSeparators}${decimalSeparator}${fraction}`;
        },
        [community.app_currency],
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
                        />
                        <div className="mt-8 space-y-6">
                            <div className="grid gap-6 lg:grid-cols-2">
                                <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            What's happening in {community.name}?
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <NewsfeedSection
                                            key="newsfeed"
                                            updates={normalizedSections.updates}
                                        />
                                    </CardContent>
                                </Card>
                                <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            Upcoming Events
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <EventsSection
                                            key="events"
                                            events={normalizedSections.events}
                                            formatPrice={formatPrice}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                id: 'resources',
                node: (
                    <div id="resources">
                        <ResourcesSection
                            key="resources"
                            pages={normalizedSections.pages}
                        />
                    </div>
                ),
            },
            {
                id: 'challenges',
                node: (
                    <div id="challenges">
                        <ChallengesSection
                            key="challenges"
                            challenges={normalizedSections.challenges}
                        />
                    </div>
                ),
            },
            {
                id: 'marketplace',
                node: (
                    <MarketplaceSection
                        key="marketplace"
                        id="marketplace"
                        community={community}
                        projectIdentifier={projectIdentifier}
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
                    <CoursesSection
                        key="courses"
                        id="courses"
                        courses={normalizedSections.courses}
                        community={community}
                                    projectIdentifier={projectIdentifier}
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
                        communityIdentifier={community.identifier}
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
                        communityIdentifier={community.identifier}
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
            formatPrice,
            handleJoin,
            healthcareRecordsSafe,
            mortuaryRecordsSafe,
            lendingRecordsSafe,
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
        >
            <Head title={`Community: ${community.name}`} />

            <div className="space-y-8">
                {(sectionNodes.find((section) => section.id === activeSection) ??
                    sectionNodes[0]
                ).node}
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
