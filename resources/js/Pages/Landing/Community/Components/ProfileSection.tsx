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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 p-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Your Profile</h2>
            <div className="max-w-2xl">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 sm:p-6 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                                <span className="text-lg sm:text-2xl font-bold text-white">
                                    {(() => {
                                        const authData = localStorage.getItem(`visitor_auth_${member.id}`);
                                        if (authData) {
                                            try {
                                                const { visitorInfo } = JSON.parse(authData);
                                                return visitorInfo?.firstName?.charAt(0).toUpperCase() || 'U';
                                            } catch (error) {
                                                return 'U';
                                            }
                                        }
                                        return 'U';
                                    })()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                                    {(() => {
                                        const authData = localStorage.getItem(`visitor_auth_${member.id}`);
                                        if (authData) {
                                            try {
                                                const { visitorInfo } = JSON.parse(authData);
                                                return `${visitorInfo?.firstName || 'User'} ${visitorInfo?.lastName || ''}`;
                                            } catch (error) {
                                                return 'User Profile';
                                            }
                                        }
                                        return 'User Profile';
                                    })()}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Visitor Profile</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-start sm:justify-end">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Active Session
                            </span>
                        </div>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Personal Information */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Personal Information
                        </h4>
                        
                        <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">First Name</p>
                                        <p className="text-gray-900 dark:text-gray-100 font-medium truncate">
                                            {(() => {
                                                const authData = localStorage.getItem(`visitor_auth_${member.id}`);
                                                if (authData) {
                                                    try {
                                                        const { visitorInfo } = JSON.parse(authData);
                                                        return visitorInfo?.firstName || 'Not available';
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

                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Name</p>
                                        <p className="text-gray-900 dark:text-gray-100 font-medium truncate">
                                            {(() => {
                                                const authData = localStorage.getItem(`visitor_auth_${member.id}`);
                                                if (authData) {
                                                    try {
                                                        const { visitorInfo } = JSON.parse(authData);
                                                        return visitorInfo?.lastName || 'Not available';
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
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-purple-500 dark:text-purple-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Contact Information
                        </h4>
                        
                        <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email Address</p>
                                        <p className="text-gray-900 dark:text-gray-100 font-medium truncate">
                                            {(() => {
                                                const authData = localStorage.getItem(`visitor_auth_${member.id}`);
                                                if (authData) {
                                                    try {
                                                        const { visitorInfo } = JSON.parse(authData);
                                                        return visitorInfo?.email || 'Not available';
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

                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Phone Number</p>
                                        <p className="text-gray-900 dark:text-gray-100 font-medium truncate">
                                            {(() => {
                                                const authData = localStorage.getItem(`visitor_auth_${member.id}`);
                                                if (authData) {
                                                    try {
                                                        const { visitorInfo } = JSON.parse(authData);
                                                        return visitorInfo?.phone || 'Not available';
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
                <div className="space-y-4 mb-8">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Session Information
                    </h4>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Accessing</p>
                                    <p className="text-gray-900 dark:text-gray-100 font-medium truncate">{member.name}'s Page</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Session Started</p>
                                    <p className="text-gray-900 dark:text-gray-100 font-medium text-sm">
                                        {(() => {
                                            const authData = localStorage.getItem(`visitor_auth_${member.id}`);
                                            if (authData) {
                                                try {
                                                    const { timestamp } = JSON.parse(authData);
                                                    return formatDateTimeForDisplay(timestamp, {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit'
                                                    });
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
                <div className="pt-6 border-t border-gray-200">
                    <Link
                        href={route('home')}
                        className="hidden sm:inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-md hover:shadow-lg"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Go to {member.name} Portal
                    </Link>
                </div>
            </div>
        </div>
    );
} 