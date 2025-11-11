import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { CommunityCollectionItem } from '../types';

interface ChallengesSectionProps {
    challenges: CommunityCollectionItem[];
}

export function ChallengesSection({ challenges }: ChallengesSectionProps) {
    const normalizedChallenges = Array.isArray(challenges) ? challenges : [];

    return (
        <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Challenges
                </CardTitle>
            </CardHeader>
            {normalizedChallenges.length === 0 ? (
                <CardContent className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50/70 p-8 text-center dark:border-gray-600 dark:bg-gray-900/40">
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
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        No challenges available
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Check back later for the next community challenge.
                    </p>
                </CardContent>
            ) : (
                <CardContent className="space-y-4">
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
                                className="rounded-lg border border-gray-200/80 bg-white/80 p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-600/70 dark:bg-gray-800/50 dark:shadow-gray-900/40"
                            >
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {title}
                                        </h3>
                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                                                    normalizedStatus === 'active'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                        : normalizedStatus === 'upcoming'
                                                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                }`}
                                            >
                                                {normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)}
                                            </span>
                                            {hasValidEndDate && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200">
                                                    Ends{' '}
                                                    {parsedEndDate?.toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {prize && (
                                        <div className="inline-flex items-center rounded-md bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-200">
                                            Prize: {prize}
                                        </div>
                                    )}
                                </div>

                                {description && (
                                    <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                        {description}
                                    </p>
                                )}

                                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
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
                                        <span>participants</span>
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700/70 dark:text-gray-300">
                                        Managed by community coordinators
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            )}
        </Card>
    );
}
