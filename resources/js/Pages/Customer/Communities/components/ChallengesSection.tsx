import { CommunityCollectionItem } from '../types';

interface ChallengesSectionProps {
    challenges: CommunityCollectionItem[];
}

export function ChallengesSection({ challenges }: ChallengesSectionProps) {
    const normalizedChallenges = Array.isArray(challenges) ? challenges : [];

    if (normalizedChallenges.length === 0) {
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    No challenges available
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Check back later for new challenges.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {normalizedChallenges.map((challenge, index) => {
                const id = Number(challenge.id ?? index);
                const title = String(challenge.title ?? challenge.name ?? 'Untitled Challenge');
                const description = String(challenge.description ?? '');
                const status = String(challenge.status ?? 'active');
                const prize = challenge.prize ? String(challenge.prize) : null;
                const participants = Array.isArray(challenge.participants)
                    ? challenge.participants.length
                    : Number(challenge.participant_count ?? 0);
                const rawEndDate = challenge.end_date ?? challenge.due_date ?? null;

                const normalizedStatus = status.toLowerCase();
                const parsedEndDate =
                    typeof rawEndDate === 'string' || typeof rawEndDate === 'number'
                        ? new Date(rawEndDate)
                        : null;
                const hasValidEndDate =
                    parsedEndDate instanceof Date && !Number.isNaN(parsedEndDate.getTime());

                return (
                    <div
                        key={id}
                        className="group rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-gray-300 hover:shadow-lg dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:shadow-gray-900/70"
                    >
                        <div className="mb-4 flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="mb-1 text-lg font-semibold text-gray-900 transition-colors duration-200 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                                    {title}
                                </h3>
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                            normalizedStatus === 'active'
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : normalizedStatus === 'upcoming'
                                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                        }`}
                                    >
                                        {normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)}
                                    </span>
                                    {hasValidEndDate && (
                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                            <svg
                                                className="mr-1 h-3 w-3"
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
                                            Ends{' '}
                                            {parsedEndDate?.toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <p className="mb-6 line-clamp-4 leading-relaxed text-gray-600 dark:text-gray-300">
                            {description}
                        </p>

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
                                    <span className="ml-1">participants</span>
                                </div>
                                {prize && (
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <svg
                                            className="mr-2 h-4 w-4 text-yellow-500 dark:text-yellow-400"
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
                                            {prize}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <span className="inline-flex items-center rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                Details managed externally
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
