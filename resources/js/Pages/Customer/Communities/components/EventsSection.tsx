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
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                <svg
                    className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600"
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
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    No events found
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Check back later for upcoming events.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                        className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-lg dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:shadow-gray-900/70"
                    >
                        {image && (
                            <div className="relative h-48">
                                <img
                                    src={image}
                                    alt={title}
                                    className="h-full w-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/20" />
                            </div>
                        )}

                        <div className="p-6">
                            <div className="mb-4">
                                <h3 className="mb-2 text-xl font-semibold text-gray-900 transition-colors duration-200 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                                    {title}
                                </h3>
                            </div>

                            <div className="mb-6 space-y-3">
                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <svg
                                        className="mr-3 h-5 w-5 flex-shrink-0 text-blue-500 dark:text-blue-400"
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
                                    <div>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {formatDateTimeForDisplay(startDate, {
                                                weekday: 'long',
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                    <svg
                                        className="mr-3 h-5 w-5 flex-shrink-0 text-green-500 dark:text-green-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                        {location}
                                    </span>
                                </div>

                                {category && (
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <svg
                                            className="mr-3 h-5 w-5 flex-shrink-0 text-purple-500 dark:text-purple-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                            />
                                        </svg>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {category}
                                        </span>
                                    </div>
                                )}

                                {isPaid && formattedPriceValue !== null && (
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <svg
                                            className="mr-3 h-5 w-5 flex-shrink-0 text-yellow-500 dark:text-yellow-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                            />
                                        </svg>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {formatPrice(formattedPriceValue)}
                                        </span>
                                        <span className="ml-1 text-gray-500 dark:text-gray-400">
                                            per person
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="mb-6 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                <div className={!expandedEvents.has(id) ? 'line-clamp-3' : ''}>{description}</div>
                                {!expandedEvents.has(id) && description.length > 150 && (
                                    <button
                                        onClick={() => expandEventDescription(id)}
                                        className="mt-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        See more
                                    </button>
                                )}
                            </div>

                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <svg
                                            className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400"
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
                                        <span className="ml-1">registered</span>
                                    </div>
                                    {spotsLeft !== null && (
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <svg
                                                className="mr-2 h-4 w-4 text-green-500 dark:text-green-400"
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
                                            <span className="ml-1">spots left</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {hasValidRegistrationDeadline && registrationDeadlineDate.getTime() > Date.now() && (
                                <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                                    <div className="flex items-center text-sm text-yellow-800 dark:text-yellow-200">
                                        <svg
                                            className="mr-2 h-4 w-4 flex-shrink-0"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span>
                                            Online registration closes on{' '}
                                            {formatDateTimeForDisplay(registrationDeadlineDate.toISOString(), {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end">
                                <span className="inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                    Registration managed by community
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
