import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import { buildOwnerSidebarSections } from '@/Pages/Customer/Communities/utils/ownerSidebarSections';
import type { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useMemo } from 'react';
import { CommunityCollectionItem } from '../Communities/types';

interface ChallengesOverviewSectionProps {
    id?: string;
    challenges: CommunityCollectionItem[];
    projectIdentifier?: string;
    ownerIdentifier?: string | number;
    emptyMessage?: string;
}

type OwnerSummary = {
    id: number | string;
    name?: string | null;
    slug?: string | null;
    identifier?: string | null;
    project_identifier?: string | null;
};

export interface ChallengesOverviewPageProps extends PageProps {
    project: string;
    owner: OwnerSummary;
    challenges: CommunityCollectionItem[];
    backUrl?: string;
    error?: string | null;
}

const formatDate = (value: unknown): string | null => {
    if (typeof value === 'string' || typeof value === 'number') {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            });
        }
    }

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }

    return null;
};

const toNumber = (value: unknown, fallback = 0): number => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value);
        if (!Number.isNaN(parsed)) {
            return parsed;
        }
    }

    return fallback;
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

export function ChallengesOverviewSection({
    id = 'challenges-overview',
    challenges,
    projectIdentifier,
    ownerIdentifier,
    emptyMessage = 'No challenges available.',
}: ChallengesOverviewSectionProps) {
    const normalizedChallenges = useMemo(
        () => (Array.isArray(challenges) ? challenges : []),
        [challenges],
    );

    if (normalizedChallenges.length === 0) {
        return (
            <section id={id} className="space-y-4">
                <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Challenges
                        </CardTitle>
                        <CardDescription>
                            Join activities and competitions organized by this
                            partner.
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
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            {emptyMessage}
                        </p>
                        <p className="text-sm">
                            Check back later for the next challenge.
                        </p>
                    </CardContent>
                </Card>
            </section>
        );
    }

    const hasProjectContext =
        projectIdentifier !== undefined &&
        projectIdentifier !== null &&
        ownerIdentifier !== undefined &&
        ownerIdentifier !== null;

    return (
        <section id={id} className="space-y-4">
            <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Challenges
                    </CardTitle>
                    <CardDescription>
                        Join activities and competitions organized by this
                        partner.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {normalizedChallenges.map((challenge, index) => {
                        const idValue = challenge.id ?? challenge.slug ?? index;
                        const title = toString(
                            challenge.title ?? challenge.name,
                            'Untitled Challenge',
                        );
                        const description = toString(challenge.description, '');
                        const status = toString(
                            challenge.status ?? 'active',
                            'active',
                        ).toLowerCase();
                        const prize = toString(challenge.prize, '');
                        const participants = Array.isArray(
                            challenge.participants,
                        )
                            ? challenge.participants.length
                            : toNumber(
                                  challenge.participant_count ??
                                      challenge.participants_count ??
                                      0,
                              );
                        const startLabel = formatDate(
                            challenge.start_date ?? challenge.startDate,
                        );
                        const endLabel = formatDate(
                            challenge.end_date ??
                                challenge.endDate ??
                                challenge.due_date,
                        );
                        const statusLabel =
                            status.charAt(0).toUpperCase() + status.slice(1);

                        const statusClass =
                            status === 'active'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : status === 'upcoming'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';

                        const challengeDetailsUrl = hasProjectContext
                            ? route('customer.projects.challenges.overview', {
                                  project: projectIdentifier,
                                  owner: ownerIdentifier,
                              })
                            : undefined;

                        const challengePublicUrl =
                            challenge.id !== undefined && challenge.id !== null
                                ? route('challenges.public-show', challenge.id)
                                : null;

                        const challengeRegisterUrl =
                            status === 'active' &&
                            challenge.id !== undefined &&
                            challenge.id !== null
                                ? route(
                                      'challenges.public-register',
                                      challenge.id,
                                  )
                                : null;

                        return (
                            <div
                                key={`challenge-${idValue}`}
                                className="rounded-lg border border-gray-200/80 bg-white/80 p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-600/70 dark:bg-gray-800/50 dark:shadow-gray-900/40"
                            >
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {title}
                                        </h3>
                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}
                                            >
                                                {statusLabel}
                                            </span>
                                            {startLabel && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200">
                                                    Starts {startLabel}
                                                </span>
                                            )}
                                            {endLabel && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-200">
                                                    Ends {endLabel}
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
                                    {challengeDetailsUrl && (
                                        <Link
                                            href={challengeDetailsUrl}
                                            className="inline-flex items-center gap-2 text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
                                        >
                                            View challenge details
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                className="h-3.5 w-3.5"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M7.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L10.586 10 7.293 6.707a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </Link>
                                    )}
                                </div>

                                <div className="mt-4 flex flex-wrap justify-end gap-2">
                                    {challengePublicUrl && (
                                        <Link
                                            href={challengePublicUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center rounded-lg border border-indigo-200 px-4 py-2 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-500/50 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
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
                                                    d="M14 3h7m0 0v7m0-7L10 14"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 10V5a2 2 0 012-2h5"
                                                />
                                            </svg>
                                            View Public Page
                                        </Link>
                                    )}
                                    {challengeRegisterUrl ? (
                                        <Link
                                            href={challengeRegisterUrl}
                                            className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg dark:bg-blue-700 dark:shadow-gray-900/50 dark:hover:bg-blue-600 dark:hover:shadow-gray-900/70"
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
                                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                                />
                                            </svg>
                                            Join Challenge
                                        </Link>
                                    ) : (
                                        <button
                                            className="inline-flex items-center rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                            disabled
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
                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                            Register Interest
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </section>
    );
}

export default function ChallengesOverviewPage({
    auth,
    project,
    owner,
    challenges,
    backUrl,
    error,
}: ChallengesOverviewPageProps) {
    const ownerName = owner?.name ?? 'Challenges Partner';
    const ownerIdentifier = owner.slug ?? owner.identifier ?? String(owner.id);
    const projectIdentifier = project ?? 'community';
    const sidebarSections = useMemo(
        () =>
            buildOwnerSidebarSections(
                projectIdentifier,
                ownerIdentifier,
                'challenges',
            ),
        [projectIdentifier, ownerIdentifier],
    );

    return (
        <CustomerLayout
            auth={auth}
            title={`Challenges – ${ownerName}`}
            header={
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Challenges
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Engage with community activities hosted by{' '}
                            {ownerName}.
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
            sidebarSections={sidebarSections}
            sidebarSectionTitle={ownerName}
        >
            <Head title={`Challenges – ${ownerName}`} />

            <div className="space-y-6">
                {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-700/70 dark:bg-red-900/20 dark:text-red-300">
                        {error}
                    </div>
                )}

                <ChallengesOverviewSection
                    challenges={challenges}
                    projectIdentifier={project}
                    ownerIdentifier={ownerIdentifier}
                />
            </div>
        </CustomerLayout>
    );
}
