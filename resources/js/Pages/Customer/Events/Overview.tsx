import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import { formatDateTimeForDisplay } from '@/Pages/Public/Community/utils/dateUtils';
import type { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    CommunityCollectionItem,
    CommunityCurrency,
} from '../Communities/types';

interface EventsOverviewSectionProps {
    id?: string;
    events: CommunityCollectionItem[];
    projectIdentifier?: string;
    ownerIdentifier?: string | number;
    appCurrency?: CommunityCurrency | null;
    emptyMessage?: string;
}

type OwnerSummary = {
    id: number | string;
    name?: string | null;
    slug?: string | null;
    identifier?: string | null;
    project_identifier?: string | null;
};

export interface EventsOverviewPageProps extends PageProps {
    project: string;
    owner: OwnerSummary;
    events: CommunityCollectionItem[];
    appCurrency?: CommunityCurrency | null;
    backUrl?: string;
    error?: string | null;
}

const formatCurrency = (
    value: number | string | undefined,
    currency?: CommunityCurrency | null,
): string => {
    if (value === undefined || value === null) {
        return '';
    }

    const numeric =
        typeof value === 'string' ? Number.parseFloat(value) : Number(value);

    if (Number.isNaN(numeric)) {
        return '';
    }

    const symbol = currency?.symbol ?? '₱';
    const decimal = currency?.decimal_separator ?? '.';
    const thousands = currency?.thousands_separator ?? ',';

    const [whole, fraction = '00'] = numeric.toFixed(2).split('.');
    const wholeWithSeparators = whole.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        thousands,
    );

    return `${symbol}${wholeWithSeparators}${decimal}${fraction}`;
};

const toString = (value: unknown, fallback = ''): string => {
    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'number') {
        return String(value);
    }

    return fallback;
};

const toBoolean = (value: unknown): boolean => {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'number') {
        return value === 1;
    }

    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        return ['1', 'true', 'yes'].includes(normalized);
    }

    return false;
};

const toNumber = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) {
            return parsed;
        }
    }

    return null;
};

const formatDateLabel = (
    value: unknown,
    options?: Intl.DateTimeFormatOptions,
): string | null => {
    if (typeof value === 'string' || typeof value === 'number') {
        return formatDateTimeForDisplay(String(value), options);
    }

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return formatDateTimeForDisplay(value.toISOString(), options);
    }

    return null;
};

export function EventsOverviewSection({
    id = 'events-overview',
    events,
    projectIdentifier,
    ownerIdentifier,
    appCurrency,
    emptyMessage = 'No events available yet.',
}: EventsOverviewSectionProps) {
    const [expandedEvents, setExpandedEvents] = useState<Set<string | number>>(
        new Set(),
    );

    const normalizedEvents = useMemo(
        () => (Array.isArray(events) ? events : []),
        [events],
    );

    const hasProjectContext =
        projectIdentifier !== undefined &&
        projectIdentifier !== null &&
        ownerIdentifier !== undefined &&
        ownerIdentifier !== null;

    const expandEventDescription = (eventId: string | number) => {
        setExpandedEvents((prev) => {
            const next = new Set(prev);
            next.add(eventId);
            return next;
        });
    };

    if (normalizedEvents.length === 0) {
        return (
            <section id={id} className="space-y-4">
                <Card className="overflow-hidden border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 shadow-lg transition-shadow duration-300 hover:shadow-xl dark:border-gray-700 dark:from-gray-800 dark:to-gray-900/50">
                    <CardHeader className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
                        <CardTitle className="text-xl font-bold text-white">
                            Events
                        </CardTitle>
                        <CardDescription className="text-white/90">
                            Upcoming activities hosted by this partner.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50/70 p-8 text-center text-gray-500 dark:border-gray-600 dark:bg-gray-900/40 dark:text-gray-400">
                        <svg
                            className="h-12 w-12 text-gray-300 dark:text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            {emptyMessage}
                        </p>
                        <p className="text-sm">
                            Check back later for new activities.
                        </p>
                    </CardContent>
                </Card>
            </section>
        );
    }

    return (
        <section id={id} className="space-y-4">
            <Card className="overflow-hidden border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 shadow-lg transition-shadow duration-300 hover:shadow-xl dark:border-gray-700 dark:from-gray-800 dark:to-gray-900/50">
                <CardHeader className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
                    <CardTitle className="text-xl font-bold text-white">
                        Events
                    </CardTitle>
                    <CardDescription className="text-white/90">
                        Upcoming and ongoing events.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                    {normalizedEvents.map((event, index) => {
                        const eventId =
                            typeof event.id === 'number' ||
                            typeof event.id === 'string'
                                ? event.id
                                : typeof event.slug === 'string'
                                  ? event.slug
                                  : index;
                        const title = toString(
                            event.title ?? event.name,
                            'Untitled Event',
                        );
                        const description = toString(event.description, '');
                        const startDate = formatDateLabel(
                            event.start_date ?? event.startDate,
                            {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                            },
                        );
                        const location = toString(event.location, 'TBA');
                        const category = toString(event.category);
                        const image = toString(
                            event.image ?? event.featured_image,
                        );
                        const isPaid = toBoolean(
                            event.is_paid_event ?? event.isPaidEvent,
                        );
                        const rawPrice =
                            event.event_price ?? event.price ?? null;
                        const participants = Array.isArray(event.participants)
                            ? event.participants.length
                            : (toNumber(
                                  event.participant_count ??
                                      event.participants_count ??
                                      0,
                              ) ?? 0);
                        const maxParticipants = toNumber(
                            event.max_participants ?? event.maxParticipants,
                        );
                        const spotsLeft =
                            maxParticipants !== null
                                ? Math.max(0, maxParticipants - participants)
                                : null;

                        const registrationDeadline = formatDateLabel(
                            event.registration_deadline ??
                                event.registrationDeadline,
                            {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            },
                        );

                        const eventLink = hasProjectContext
                            ? route('customer.projects.events.overview', {
                                  project: projectIdentifier,
                                  owner: ownerIdentifier,
                              })
                            : '#';

                        let publicEventLink: string | undefined;
                        if (typeof event.id === 'number') {
                            publicEventLink = route(
                                'events.public-register',
                                event.id,
                            );
                        } else if (
                            typeof event.id === 'string' &&
                            event.id.trim() !== '' &&
                            !Number.isNaN(Number(event.id))
                        ) {
                            publicEventLink = route(
                                'events.public-register',
                                Number(event.id),
                            );
                        }

                        const formattedPrice =
                            rawPrice !== null
                                ? formatCurrency(
                                      rawPrice as number | string,
                                      appCurrency,
                                  )
                                : '';

                        return (
                            <div
                                key={`event-${eventId}`}
                                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-indigo-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/80 dark:hover:border-indigo-600"
                            >
                                <div className="flex flex-col gap-5 md:flex-row">
                                    {image && (
                                        <div className="overflow-hidden rounded-xl md:w-48">
                                            <img
                                                src={image}
                                                alt={title}
                                                className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105 md:h-full"
                                                onError={(eventTarget) => {
                                                    const target =
                                                        eventTarget.target as HTMLImageElement;
                                                    target.style.display =
                                                        'none';
                                                }}
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-4">
                                        <div className="space-y-3 border-b border-gray-100 pb-3 dark:border-gray-700">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                    {title}
                                                </h3>
                                                {category && (
                                                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                                                        {category}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 text-sm">
                                                {startDate && (
                                                    <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                        <svg
                                                            className="h-3.5 w-3.5"
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
                                                        <span className="whitespace-nowrap">
                                                            {startDate}
                                                        </span>
                                                    </div>
                                                )}
                                                {location && location !== 'TBA' && (
                                                    <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                        <svg
                                                            className="h-3.5 w-3.5"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                            />
                                                        </svg>
                                                        <span>{location}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                                            {isPaid && formattedPrice && (
                                                <div className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 dark:from-indigo-900/20 dark:to-purple-900/20">
                                                    <svg
                                                        className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="2"
                                                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                    <p className="font-bold text-gray-900 dark:text-gray-100">
                                                        {formattedPrice}
                                                    </p>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        per person
                                                    </span>
                                                </div>
                                            )}
                                            <div
                                                className={
                                                    !expandedEvents.has(eventId)
                                                        ? 'line-clamp-3'
                                                        : ''
                                                }
                                            >
                                                {description}
                                            </div>
                                            {!expandedEvents.has(eventId) &&
                                                description.length > 160 && (
                                                    <button
                                                        onClick={() =>
                                                            expandEventDescription(
                                                                eventId,
                                                            )
                                                        }
                                                        className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    >
                                                        Read more
                                                        <svg
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M19 9l-7 7-7-7"
                                                            />
                                                        </svg>
                                                    </button>
                                                )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                            <span className="inline-flex items-center gap-2">
                                                <svg
                                                    className="h-4 w-4 text-blue-500 dark:text-blue-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                    />
                                                </svg>
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {participants}
                                                </span>
                                                <span>registered</span>
                                            </span>
                                            {spotsLeft !== null && (
                                                <span className="inline-flex items-center gap-2">
                                                    <svg
                                                        className="h-4 w-4 text-green-500 dark:text-green-400"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                                        {spotsLeft}
                                                    </span>
                                                    <span>spots left</span>
                                                </span>
                                            )}
                                            {registrationDeadline && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-200">
                                                    Register by{' '}
                                                    {registrationDeadline}
                                                </span>
                                            )}
                                        </div>

                                        {(hasProjectContext ||
                                            publicEventLink) && (
                                            <div className="flex flex-wrap justify-end gap-2 pt-2">
                                                {publicEventLink && (
                                                    <Link
                                                        href={publicEventLink}
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl dark:from-green-500 dark:to-emerald-500 dark:hover:from-green-600 dark:hover:to-emerald-600"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Register Now
                                                        <svg
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth="2"
                                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                            />
                                                        </svg>
                                                    </Link>
                                                )}
                                                {hasProjectContext && (
                                                    <Link
                                                        href={eventLink}
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl dark:from-indigo-500 dark:to-purple-500 dark:hover:from-indigo-600 dark:hover:to-purple-600"
                                                    >
                                                        View Event Details
                                                        <svg
                                                            className="h-4 w-4"
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
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </section>
    );
}

export default function EventsOverviewPage({
    auth,
    project,
    owner,
    events,
    appCurrency,
    backUrl,
    error,
}: EventsOverviewPageProps) {
    const ownerName = owner?.name ?? 'Events Partner';
    const ownerIdentifier = owner.slug ?? owner.identifier ?? String(owner.id);

    return (
        <CustomerLayout
            auth={auth}
            title={`Events – ${ownerName}`}
            header={
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Events
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Upcoming activities organized by {ownerName}.
                        </p>
                    </div>
                    <Link
                        href={backUrl ?? route('customer.dashboard')}
                        className="inline-flex items-center justify-center rounded-md border border-indigo-500 px-3 py-1 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-300 dark:hover:bg-indigo-400/10"
                    >
                        ← Back
                    </Link>
                </div>
            }
        >
            <Head title={`Events – ${ownerName}`} />

            <div className="space-y-6">
                {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-700/70 dark:bg-red-900/20 dark:text-red-300">
                        {error}
                    </div>
                )}

                <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Partner Details
                        </CardTitle>
                        <CardDescription>
                            Project:{' '}
                            <span className="font-semibold">{project}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Partner
                            </p>
                            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                {ownerName}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Identifier
                            </p>
                            <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                                {ownerIdentifier}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <EventsOverviewSection
                    events={events}
                    projectIdentifier={project}
                    ownerIdentifier={ownerIdentifier}
                    appCurrency={appCurrency}
                />
            </div>
        </CustomerLayout>
    );
}
