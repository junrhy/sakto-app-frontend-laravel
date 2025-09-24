import { Link } from '@inertiajs/react';
import { formatDateTimeForDisplay } from '../utils/dateUtils';

interface Member {
    id: number;
    name: string;
    email: string;
    contact_number: string | null;
    app_currency: {
        code: string;
        symbol: string;
    } | null;
    created_at: string;
    identifier?: string;
}

interface ProfileSectionProps {
    member: Member;
}

export default function ProfileSection({ member }: ProfileSectionProps) {
    return (
        <div>
            <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Your Profile
            </h2>
            <div className="full-width">
                {/* Profile Header */}
                <div className="mb-8 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4 dark:from-blue-900/20 dark:to-indigo-900/20 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg sm:h-16 sm:w-16">
                                <span className="text-lg font-bold text-white sm:text-2xl">
                                    {(() => {
                                        const authData = localStorage.getItem(
                                            `visitor_auth_${member.id}`,
                                        );
                                        if (authData) {
                                            try {
                                                const { visitorInfo } =
                                                    JSON.parse(authData);
                                                return (
                                                    visitorInfo?.firstName
                                                        ?.charAt(0)
                                                        .toUpperCase() || 'U'
                                                );
                                            } catch (error) {
                                                return 'U';
                                            }
                                        }
                                        return 'U';
                                    })()}
                                </span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="mb-1 truncate text-lg font-semibold text-gray-900 dark:text-gray-100 sm:text-xl">
                                    {(() => {
                                        const authData = localStorage.getItem(
                                            `visitor_auth_${member.id}`,
                                        );
                                        if (authData) {
                                            try {
                                                const { visitorInfo } =
                                                    JSON.parse(authData);
                                                return `${visitorInfo?.firstName || 'User'} ${visitorInfo?.middleName ? `${visitorInfo.middleName} ` : ''}${visitorInfo?.lastName || ''}`;
                                            } catch (error) {
                                                return 'User Profile';
                                            }
                                        }
                                        return 'User Profile';
                                    })()}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Visitor Profile
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-start sm:justify-end">
                            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400 sm:text-sm">
                                <svg
                                    className="mr-1 h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Active Session
                            </span>
                        </div>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Personal Information */}
                    <div className="space-y-4">
                        <h4 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
                            <svg
                                className="mr-2 h-5 w-5 flex-shrink-0 text-blue-500 dark:text-blue-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                            Personal Information
                        </h4>

                        <div className="space-y-4">
                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                        <svg
                                            className="h-5 w-5 text-blue-600 dark:text-blue-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                            First Name
                                        </p>
                                        <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                                            {(() => {
                                                const authData =
                                                    localStorage.getItem(
                                                        `visitor_auth_${member.id}`,
                                                    );
                                                if (authData) {
                                                    try {
                                                        const { visitorInfo } =
                                                            JSON.parse(
                                                                authData,
                                                            );
                                                        return (
                                                            visitorInfo?.firstName ||
                                                            'Not available'
                                                        );
                                                    } catch (error) {
                                                        return 'Not available';
                                                    }
                                                }
                                                return 'Not available';
                                            })()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                        <svg
                                            className="h-5 w-5 text-purple-600 dark:text-purple-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                            Middle Name
                                        </p>
                                        <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                                            {(() => {
                                                const authData =
                                                    localStorage.getItem(
                                                        `visitor_auth_${member.id}`,
                                                    );
                                                if (authData) {
                                                    try {
                                                        const { visitorInfo } =
                                                            JSON.parse(
                                                                authData,
                                                            );
                                                        return (
                                                            visitorInfo?.middleName ||
                                                            'Not available'
                                                        );
                                                    } catch (error) {
                                                        return 'Not available';
                                                    }
                                                }
                                                return 'Not available';
                                            })()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                                        <svg
                                            className="h-5 w-5 text-green-600 dark:text-green-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                            Last Name
                                        </p>
                                        <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                                            {(() => {
                                                const authData =
                                                    localStorage.getItem(
                                                        `visitor_auth_${member.id}`,
                                                    );
                                                if (authData) {
                                                    try {
                                                        const { visitorInfo } =
                                                            JSON.parse(
                                                                authData,
                                                            );
                                                        return (
                                                            visitorInfo?.lastName ||
                                                            'Not available'
                                                        );
                                                    } catch (error) {
                                                        return 'Not available';
                                                    }
                                                }
                                                return 'Not available';
                                            })()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900/30">
                                        <svg
                                            className="h-5 w-5 text-pink-600 dark:text-pink-400"
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
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                            Date of Birth
                                        </p>
                                        <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                                            {(() => {
                                                const authData =
                                                    localStorage.getItem(
                                                        `visitor_auth_${member.id}`,
                                                    );
                                                if (authData) {
                                                    try {
                                                        const { visitorInfo } =
                                                            JSON.parse(
                                                                authData,
                                                            );
                                                        return visitorInfo?.date_of_birth
                                                            ? new Date(
                                                                  visitorInfo.date_of_birth,
                                                              ).toLocaleDateString(
                                                                  'en-US',
                                                                  {
                                                                      year: 'numeric',
                                                                      month: 'short',
                                                                      day: 'numeric',
                                                                  },
                                                              )
                                                            : 'Not available';
                                                    } catch (error) {
                                                        return 'Not available';
                                                    }
                                                }
                                                return 'Not available';
                                            })()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
                                        <svg
                                            className="h-5 w-5 text-teal-600 dark:text-teal-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                            Gender
                                        </p>
                                        <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                                            {(() => {
                                                const authData =
                                                    localStorage.getItem(
                                                        `visitor_auth_${member.id}`,
                                                    );
                                                if (authData) {
                                                    try {
                                                        const { visitorInfo } =
                                                            JSON.parse(
                                                                authData,
                                                            );
                                                        return (
                                                            visitorInfo?.gender ||
                                                            'Not available'
                                                        );
                                                    } catch (error) {
                                                        return 'Not available';
                                                    }
                                                }
                                                return 'Not available';
                                            })()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                        <h4 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
                            <svg
                                className="mr-2 h-5 w-5 flex-shrink-0 text-purple-500 dark:text-purple-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                            Contact Information
                        </h4>

                        <div className="space-y-4">
                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                        <svg
                                            className="h-5 w-5 text-purple-600 dark:text-purple-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                            Email Address
                                        </p>
                                        <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                                            {(() => {
                                                const authData =
                                                    localStorage.getItem(
                                                        `visitor_auth_${member.id}`,
                                                    );
                                                if (authData) {
                                                    try {
                                                        const { visitorInfo } =
                                                            JSON.parse(
                                                                authData,
                                                            );
                                                        return (
                                                            visitorInfo?.email ||
                                                            'Not available'
                                                        );
                                                    } catch (error) {
                                                        return 'Not available';
                                                    }
                                                }
                                                return 'Not available';
                                            })()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                        <svg
                                            className="h-5 w-5 text-orange-600 dark:text-orange-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                            Phone Number
                                        </p>
                                        <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                                            {(() => {
                                                const authData =
                                                    localStorage.getItem(
                                                        `visitor_auth_${member.id}`,
                                                    );
                                                if (authData) {
                                                    try {
                                                        const { visitorInfo } =
                                                            JSON.parse(
                                                                authData,
                                                            );
                                                        return (
                                                            visitorInfo?.phone ||
                                                            'Not available'
                                                        );
                                                    } catch (error) {
                                                        return 'Not available';
                                                    }
                                                }
                                                return 'Not available';
                                            })()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Session Information */}
                <div className="mb-8 space-y-4">
                    <h4 className="mb-4 flex items-center text-lg font-semibold text-gray-900 dark:text-gray-100">
                        <svg
                            className="mr-2 h-5 w-5 flex-shrink-0 text-indigo-500 dark:text-indigo-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        Session Information
                    </h4>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                                    <svg
                                        className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                                        />
                                    </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                        Accessing
                                    </p>
                                    <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                                        {member.name}'s Page
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                                    <svg
                                        className="h-5 w-5 text-yellow-600 dark:text-yellow-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                                        Session Started
                                    </p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {(() => {
                                            const authData =
                                                localStorage.getItem(
                                                    `visitor_auth_${member.id}`,
                                                );
                                            if (authData) {
                                                try {
                                                    const { timestamp } =
                                                        JSON.parse(authData);
                                                    return formatDateTimeForDisplay(
                                                        timestamp,
                                                        {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: 'numeric',
                                                            minute: '2-digit',
                                                        },
                                                    );
                                                } catch (error) {
                                                    return 'Not available';
                                                }
                                            }
                                            return 'Not available';
                                        })()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="border-t border-gray-200 pt-6">
                    <Link
                        href={route('home')}
                        className="hidden items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-md transition-colors hover:bg-blue-700 hover:shadow-lg sm:inline-flex"
                    >
                        <svg
                            className="mr-2 h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                        </svg>
                        Go to {member.name} Portal
                    </Link>
                </div>
            </div>
        </div>
    );
}
