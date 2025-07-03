import { Link } from '@inertiajs/react';

interface Challenge {
    id: number;
    title: string;
    description: string;
    status: 'active' | 'upcoming' | 'completed' | string;
    end_date?: string;
    prize?: string;
    participants?: any[];
}

interface ChallengesSectionProps {
    challenges: Challenge[];
}

export default function ChallengesSection({ challenges }: ChallengesSectionProps) {
    if (challenges.length === 0) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">No challenges found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Check back later for new challenges</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {challenges.map((challenge) => (
                    <div key={challenge.id} className="group bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:shadow-lg dark:hover:shadow-gray-900/70 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200">
                        {/* Challenge Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 mb-1">
                                    {challenge.title}
                                </h3>
                                <div className="flex items-center gap-3">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                        challenge.status === 'active' ? 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30' : 
                                        challenge.status === 'upcoming' ? 'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30' : 
                                        'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700'
                                    }`}>
                                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            {challenge.status === 'active' ? (
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            ) : challenge.status === 'upcoming' ? (
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            ) : (
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            )}
                                        </svg>
                                        {challenge.status?.charAt(0).toUpperCase() + challenge.status?.slice(1) || 'Unknown'}
                                    </span>
                                    {challenge.end_date && (
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {Math.max(0, Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days left
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Challenge Description */}
                        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed line-clamp-3">
                            {challenge.description}
                        </p>

                        {/* Challenge Stats */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <svg className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">{challenge.participants?.length ?? 0}</span>
                                    <span className="ml-1">participants</span>
                                </div>
                                {challenge.prize && (
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <svg className="w-4 h-4 mr-2 text-yellow-500 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">{challenge.prize}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Challenge Progress Bar (if applicable) */}
                        {challenge.end_date && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    <span>Progress</span>
                                    <span>
                                        {Math.max(0, Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days remaining
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div 
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            challenge.status === 'active' ? 'bg-green-500 dark:bg-green-400' : 
                                            challenge.status === 'upcoming' ? 'bg-blue-500 dark:bg-blue-400' : 
                                            'bg-gray-400 dark:bg-gray-500'
                                        }`}
                                        style={{ 
                                            width: `${Math.max(0, Math.min(100, 100 - (Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) / 30) * 100))}%` 
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Action Button */}
                        <div className="flex justify-end">
                            {challenge.status === 'active' ? (
                                <Link
                                    href={route('challenges.public-register', challenge.id)}
                                    className="inline-flex items-center px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 shadow-md dark:shadow-gray-900/50 hover:shadow-lg dark:hover:shadow-gray-900/70 transition-all duration-200 font-medium"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Join Challenge
                                </Link>
                            ) : (
                                <button className="inline-flex items-center px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium" disabled>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Register Interest
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
    );
} 