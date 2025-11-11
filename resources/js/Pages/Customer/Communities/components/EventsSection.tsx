import { useMemo, useState } from 'react';
import { formatDateTimeForDisplay } from '@/Pages/Public/Community/utils/dateUtils';
import { CommunityCollectionItem } from '../types';

interface EventsSectionProps {
    events: CommunityCollectionItem[];
    formatPrice: (price: number | string) => string;
}

export function EventsSection({ events, formatPrice }: EventsSectionProps) {
    const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());

    const normalizedEvents = useMemo(() => {
        return Array.isArray(events) ? events : [];
    }, [events]);

    const expandEventDescription = (eventId: number) => {
        setExpandedEvents((prev) => {
            const next = new Set(prev);
            next.add(eventId);
            return next;
        });
    };

    if (normalizedEvents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50/70 p-8 text-center dark:border-gray-600 dark:bg-gray-900/40">
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
                    No events found
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Check back later for upcoming events.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {normalizedEvents.map((event) => {
                const id = Number(event.id ?? 0);
                const title = String(event.title ?? event.name ?? 'Untitled Event');
                const description = String(event.description ?? '');
                const startDate = String(event.start_date ?? event.startDate ?? '');
                const registrationDeadlineRaw = event.registration_deadline ?? event.registrationDeadline ?? null;
                const location = String(event.location ?? 'TBA');
                const category = event.category ? String(event.category) : '';
                const image = event.image as string | undefined;
                const status = String(event.status ?? 'scheduled');
                const isPaid = Boolean(event.is_paid_event ?? event.isPaidEvent);
                const rawPrice = event.event_price ?? event.price ?? null;
                const participants = Array.isArray(event.participants) ? event.participants.length : 0;
                const maxParticipants = Number(event.max_participants ?? event.maxParticipants ?? 0) || null;

                const spotsLeft = maxParticipants !== null
                    ? Math.max(0, maxParticipants - participants)
                    : null;

                const formattedPriceValue =
                    typeof rawPrice === 'number' ||
                    (typeof rawPrice === 'string' && rawPrice.trim().length > 0)
                        ? rawPrice
                        : null;

                const registrationDeadlineDate =
                    typeof registrationDeadlineRaw === 'string' || typeof registrationDeadlineRaw === 'number'
                        ? new Date(registrationDeadlineRaw)
                        : null;
                const hasValidRegistrationDeadline =
                    registrationDeadlineDate instanceof Date &&
                    !Number.isNaN(registrationDeadlineDate.getTime());

                return (
                    <div
                        key={id}
                        className="rounded-lg border border-gray-200/80 bg-white/80 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-600/70 dark:bg-gray-800/50 dark:shadow-gray-900/40"
                    >
                        <div className="flex flex-col gap-4 p-5 md:flex-row">
                            {image && (
                                <div className="overflow-hidden rounded-lg md:w-40">
                                    <img
                                        src={image}
                                        alt={title}
                                        className="h-32 w-full object-cover md:h-full"
                                    />
                                </div>
                            )}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {title}
                                        </h3>
                                        {category && (
                                            <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-600 dark:bg-purple-500/20 dark:text-purple-200">
                                                {category}
                                            </span>
                                        )}
                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-500/20 dark:text-blue-200">
                                            {status?.charAt(0).toUpperCase() + status.slice(1)}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        {formatDateTimeForDisplay(startDate, {
                                            weekday: 'long',
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                        {' • '}
                                        {location}
                                    </p>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                    {isPaid && formattedPriceValue !== null && (
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            {formatPrice(formattedPriceValue)}{' '}
                                            <span className="font-normal text-gray-500 dark:text-gray-400">
                                                per person
                                            </span>
                                        </p>
                                    )}
                                    <div className={!expandedEvents.has(id) ? 'line-clamp-3' : ''}>
                                        {description}
                                    </div>
                                    {!expandedEvents.has(id) && description.length > 160 && (
                                        <button
                                            onClick={() => expandEventDescription(id)}
                                            className="mt-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                        >
                                            Read more
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
                                    {hasValidRegistrationDeadline &&
                                        registrationDeadlineDate.getTime() > Date.now() && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-200">
                                                Register by{' '}
                                                {formatDateTimeForDisplay(
                                                    registrationDeadlineDate.toISOString(),
                                                    {
                                                        month: 'short',
                                                        day: 'numeric',
                                                    },
                                                )}
                                            </span>
                                        )}
                                </div>

                                <div className="flex justify-end">
                                    <span className="inline-flex items-center rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700/70 dark:text-gray-300">
                                        Managed by community
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
