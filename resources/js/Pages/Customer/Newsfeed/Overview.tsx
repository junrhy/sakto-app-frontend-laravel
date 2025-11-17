import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import {
    extractYouTubeVideos,
    hideYouTubeLinks,
    YouTubeVideo,
} from '@/lib/youtube-utils';
import { formatDateTimeForDisplay } from '@/Pages/Public/Community/utils/dateUtils';
import type { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    CommunityCollectionItem,
    CommunityCurrency,
} from '../Communities/types';

interface NewsfeedOverviewSectionProps {
    id?: string;
    updates: CommunityCollectionItem[];
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

export interface NewsfeedOverviewPageProps extends PageProps {
    project: string;
    owner: OwnerSummary;
    updates: CommunityCollectionItem[];
    appCurrency?: CommunityCurrency | null;
    backUrl?: string;
    error?: string | null;
}

const toString = (value: unknown, fallback = ''): string => {
    if (typeof value === 'string') {
        return value;
    }

    if (typeof value === 'number') {
        return String(value);
    }

    return fallback;
};

export function NewsfeedOverviewSection({
    id = 'newsfeed-overview',
    updates,
    projectIdentifier,
    ownerIdentifier,
    emptyMessage = 'No newsfeed items yet.',
}: NewsfeedOverviewSectionProps) {
    const [expandedUpdates, setExpandedUpdates] = useState<
        Set<string | number>
    >(new Set());
    const [selectedUpdateForVideos, setSelectedUpdateForVideos] =
        useState<CommunityCollectionItem | null>(null);
    const [showVideoDialog, setShowVideoDialog] = useState(false);

    const normalizedUpdates = useMemo(
        () => (Array.isArray(updates) ? updates : []),
        [updates],
    );

    const hasProjectContext =
        projectIdentifier !== undefined &&
        projectIdentifier !== null &&
        ownerIdentifier !== undefined &&
        ownerIdentifier !== null;

    const toggleUpdateExpansion = (updateId: string | number) => {
        setExpandedUpdates((prev) => {
            const next = new Set(prev);
            if (next.has(updateId)) {
                next.delete(updateId);
            } else {
                next.add(updateId);
            }
            return next;
        });
    };

    const viewAllLink = hasProjectContext
        ? route('customer.projects.newsfeed.overview', {
              project: projectIdentifier,
              owner: ownerIdentifier,
          })
        : undefined;

    if (normalizedUpdates.length === 0) {
        return (
            <section id={id} className="space-y-4">
                <Card className="border border-gray-200 bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 shadow-lg transition-shadow duration-300 hover:shadow-xl dark:border-gray-700 dark:from-rose-900/40 dark:via-amber-900/40 dark:to-orange-900/40">
                    <CardHeader className="bg-gradient-to-r from-rose-400 via-pink-500 to-orange-400 p-6 text-white">
                        <CardTitle className="text-lg font-semibold text-white">
                            Newsfeed
                        </CardTitle>
                        <CardDescription className="text-white/90">
                            Latest announcements and updates from this group.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-rose-200 bg-white/70 p-8 text-center text-gray-600 dark:border-rose-700/60 dark:bg-gray-900/40 dark:text-gray-300">
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
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                            {emptyMessage}
                        </p>
                        <p className="text-sm">
                            Check back later for new updates.
                        </p>
                    </CardContent>
                </Card>
            </section>
        );
    }

    return (
        <section id={id} className="space-y-4">
            <Card className="overflow-hidden border border-gray-200 bg-gradient-to-br from-rose-50 via-amber-50 to-orange-50 shadow-lg transition-shadow duration-300 hover:shadow-xl dark:border-gray-700 dark:from-rose-900/40 dark:via-amber-900/40 dark:to-orange-900/40">
                <CardHeader className="bg-gradient-to-r from-rose-400 via-pink-500 to-orange-400 p-6 text-white">
                    <div>
                        <CardTitle className="text-xl font-bold text-white">
                            Newsfeed
                        </CardTitle>
                        <CardDescription className="text-white/90">
                            Latest announcements and updates from this group.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                    {normalizedUpdates.map((update, index) => {
                        const updateId =
                            typeof update.id === 'number' ||
                            typeof update.id === 'string'
                                ? update.id
                                : typeof update.slug === 'string'
                                  ? update.slug
                                  : index;
                        const author = toString(
                            update.author ?? update.created_by ?? 'Community',
                        );
                        const createdAt = toString(
                            update.created_at ?? update.published_at ?? '',
                        );
                        const title = toString(
                            update.title ?? 'Untitled update',
                        );
                        const content = toString(
                            update.content ?? update.description ?? '',
                        );
                        const featuredImage = toString(
                            update.featured_image ?? update.image_url,
                        );

                        const youtubeVideos = extractYouTubeVideos(content);
                        const processedContent = hideYouTubeLinks(
                            content,
                            false,
                        );
                        const isExpanded = expandedUpdates.has(updateId);
                        const displayContent =
                            isExpanded || processedContent.length <= 280
                                ? processedContent
                                : `${processedContent.substring(0, 280)}...`;

                        return (
                            <div
                                key={`newsfeed-${updateId}`}
                                className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-indigo-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/80 dark:hover:border-indigo-600"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 dark:border-gray-700">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                {title}
                                            </h3>
                                        </div>
                                        {createdAt && (
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
                                                    {formatDateTimeForDisplay(
                                                        createdAt,
                                                        {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        },
                                                    )}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-3">
                                        <div
                                            className="newsfeed-content text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                                            dangerouslySetInnerHTML={{
                                                __html: displayContent,
                                            }}
                                        />
                                        {processedContent.length > 280 &&
                                            !isExpanded && (
                                                <button
                                                    onClick={() =>
                                                        toggleUpdateExpansion(
                                                            updateId,
                                                        )
                                                    }
                                                    className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
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
                                    {featuredImage && (
                                        <div
                                            className="group relative overflow-hidden rounded-lg bg-black"
                                            onClick={() => {
                                                if (youtubeVideos.length > 0) {
                                                    setSelectedUpdateForVideos({
                                                        ...update,
                                                        youtubeVideos,
                                                    });
                                                    setShowVideoDialog(true);
                                                }
                                            }}
                                        >
                                            <img
                                                src={featuredImage}
                                                alt={title}
                                                className="max-h-96 w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
                                            />
                                            {youtubeVideos.length > 0 && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                    <div className="text-center text-white">
                                                        <svg
                                                            className="mx-auto mb-2 h-8 w-8"
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path d="M8 5v14l11-7z" />
                                                        </svg>
                                                        <p className="text-sm font-medium">
                                                            Watch Videos
                                                        </p>
                                                        <p className="text-xs opacity-75">
                                                            {
                                                                youtubeVideos.length
                                                            }{' '}
                                                            video
                                                            {youtubeVideos.length >
                                                            1
                                                                ? 's'
                                                                : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {String(selectedUpdateForVideos?.title ?? 'Videos')}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                            Videos attached to this update.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUpdateForVideos &&
                        Array.isArray(
                            (selectedUpdateForVideos as any).youtubeVideos,
                        ) && (
                            <div className="space-y-4">
                                {(
                                    (selectedUpdateForVideos as any)
                                        .youtubeVideos as YouTubeVideo[]
                                ).map((video, index) => (
                                    <div
                                        key={`${video.id ?? index}`}
                                        className="relative w-full"
                                        style={{ paddingBottom: '56.25%' }}
                                    >
                                        <iframe
                                            src={
                                                index === 0
                                                    ? `${video.embedUrl}&autoplay=1`
                                                    : video.embedUrl
                                            }
                                            title={`YouTube video ${index + 1}`}
                                            className="absolute left-0 top-0 h-full w-full rounded-lg"
                                            frameBorder={0}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                </DialogContent>
            </Dialog>
        </section>
    );
}

export default function NewsfeedOverviewPage({
    auth,
    project,
    owner,
    updates,
    appCurrency,
    backUrl,
    error,
}: NewsfeedOverviewPageProps) {
    const ownerName = owner?.name ?? 'Newsfeed Partner';
    const ownerIdentifier = owner.slug ?? owner.identifier ?? String(owner.id);

    return (
        <CustomerLayout
            auth={auth}
            title={`Newsfeed – ${ownerName}`}
            header={
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Newsfeed
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Updates and announcements from {ownerName}.
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
            <Head title={`Newsfeed – ${ownerName}`} />

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

                <NewsfeedOverviewSection
                    updates={updates}
                    projectIdentifier={project}
                    ownerIdentifier={ownerIdentifier}
                    appCurrency={appCurrency}
                />
            </div>
        </CustomerLayout>
    );
}
