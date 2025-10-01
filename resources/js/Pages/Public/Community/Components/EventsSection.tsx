import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { formatDateTimeForDisplay } from '../utils/dateUtils';

interface Event {
    id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    location: string;
    max_participants: number;
    registration_deadline: string;
    is_public: boolean;
    is_paid_event: boolean;
    event_price: number | null;
    category: string;
    image: string | null;
    status: 'draft' | 'published' | 'cancelled';
    client_identifier: string;
    created_at: string;
    updated_at: string;
    participants: any[];
}

interface EventsSectionProps {
    events: Event[];
    formatPrice: (price: number | string) => string;
}

export default function EventsSection({
    events,
    formatPrice,
}: EventsSectionProps) {
    const [expandedEvents, setExpandedEvents] = useState<Set<number>>(
        new Set(),
    );

    const expandEventDescription = (eventId: number) => {
        const newExpanded = new Set(expandedEvents);
        newExpanded.add(eventId);
        setExpandedEvents(newExpanded);
    };

    if (events.length === 0) {
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
                    Check back later for upcoming events
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
                <div
                    key={event.id}
                    className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-lg dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:shadow-gray-900/70"
                >
                    {/* Event Image */}
                    {event.image && (
                        <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
                            <img
                                src={event.image}
                                alt={event.title}
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                        </div>
                    )}

                    {/* Event Content */}
                    <div className="p-6">
                        {/* Event Header */}
                        <div className="mb-4">
                            <h3 className="mb-2 text-xl font-semibold text-gray-900 transition-colors duration-200 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                                {event.title}
                            </h3>
                        </div>

                        {/* Event Details */}
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
                                        {formatDateTimeForDisplay(
                                            event.start_date,
                                            {
                                                weekday: 'long',
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric',
                                            },
                                        )}
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
                                    {event.location}
                                </span>
                            </div>

                            {event.category && (
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
                                        {event.category}
                                    </span>
                                </div>
                            )}

                            {event.is_paid_event && event.event_price && (
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
                                        {formatPrice(event.event_price)}
                                    </span>
                                    <span className="ml-1 text-gray-500 dark:text-gray-400">
                                        per person
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Event Description */}
                        <div className="mb-6 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                            <div
                                className={`whitespace-pre-wrap ${!expandedEvents.has(event.id) ? 'line-clamp-3' : ''}`}
                            >
                                {event.description}
                            </div>
                            {!expandedEvents.has(event.id) &&
                                event.description.length > 150 && (
                                    <button
                                        onClick={() =>
                                            expandEventDescription(event.id)
                                        }
                                        className="mt-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                        See more
                                    </button>
                                )}
                        </div>

                        {/* Event Stats */}
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
                                        {event.participants.length}
                                    </span>
                                    <span className="ml-1">registered</span>
                                </div>
                                {event.max_participants && (
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
                                            {Math.max(
                                                0,
                                                event.max_participants -
                                                    event.participants.length,
                                            )}
                                        </span>
                                        <span className="ml-1">spots left</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Registration Deadline Warning */}
                        {event.registration_deadline &&
                            new Date(event.registration_deadline) >
                                new Date() && (
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
                                            {formatDateTimeForDisplay(
                                                event.registration_deadline,
                                                {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                },
                                            )}
                                        </span>
                                    </div>
                                </div>
                            )}

                        {/* Action Button */}
                        <div className="flex justify-end">
                            {event.status === 'published' &&
                            new Date(event.registration_deadline) >
                                new Date() ? (
                                <Link
                                    href={`/events/${event.id}/public-register`}
                                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                                >
                                    Register Now
                                </Link>
                            ) : event.status === 'cancelled' ? (
                                <span className="inline-flex items-center rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                    Cancelled
                                </span>
                            ) : (
                                <span className="inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                    Registration Closed
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
