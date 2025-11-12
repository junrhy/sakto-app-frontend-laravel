import { useMemo, useState } from 'react';
import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import { Link, Head } from '@inertiajs/react';
import type { PageProps } from '@/types';
import {
    CommunityCollectionItem,
    CommunityCurrency,
} from '../Communities/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    extractYouTubeVideos,
    hideYouTubeLinks,
    YouTubeVideo,
} from '@/lib/youtube-utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { formatDateTimeForDisplay } from '@/Pages/Public/Community/utils/dateUtils';

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
    const [expandedUpdates, setExpandedUpdates] = useState<Set<string | number>>(new Set());
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
                <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Newsfeed
                        </CardTitle>
                        <CardDescription>
                            Latest announcements and updates from this partner.
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
            <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
                <CardHeader>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Newsfeed
                            </CardTitle>
                            <CardDescription>
                                Latest announcements and updates from this partner.
                            </CardDescription>
                        </div>
                        {viewAllLink && (
                            <Link
                                href={viewAllLink}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-300 dark:hover:text-indigo-200"
                            >
                                View all updates →
                            </Link>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {normalizedUpdates.map((update, index) => {
                        const updateId =
                            typeof update.id === 'number' || typeof update.id === 'string'
                                ? update.id
                                : typeof update.slug === 'string'
                                    ? update.slug
                                    : index;
                        const author = toString(update.author ?? update.created_by ?? 'Community');
                        const createdAt = toString(update.created_at ?? update.published_at ?? '');
                        const title = toString(update.title ?? 'Untitled update');
                        const content = toString(update.content ?? update.description ?? '');
                        const featuredImage = toString(update.featured_image ?? update.image_url);
                        const status = toString(update.status ?? 'published').toLowerCase();

                        const youtubeVideos = extractYouTubeVideos(content);
                        const processedContent = hideYouTubeLinks(content, false);
                        const isExpanded = expandedUpdates.has(updateId);
                        const displayContent =
                            isExpanded || processedContent.length <= 280
                                ? processedContent
                                : `${processedContent.substring(0, 280)}...`;

                        return (
                            <div
                                key={`newsfeed-${updateId}`}
                                className="rounded-lg border border-gray-200/80 bg-white/80 p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-600/70 dark:bg-gray-800/50 dark:shadow-gray-900/40"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-sm">
                                        <span className="text-sm font-semibold text-white">
                                            {author.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {author}
                                            </h3>
                                            {status === 'published' && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-500/20 dark:text-blue-200">
                                                    Published
                                                </span>
                                            )}
                                            {status === 'draft' && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600 dark:bg-amber-500/20 dark:text-amber-200">
                                                    Draft
                                                </span>
                                            )}
                                        </div>
                                        {createdAt && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatDateTimeForDisplay(createdAt, {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        )}
                                        <div>
                                            <h4 className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100">
                                                {title}
                                            </h4>
                                            <div
                                                className="newsfeed-content text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                                                dangerouslySetInnerHTML={{ __html: displayContent }}
                                            />
                                            {processedContent.length > 280 && !isExpanded && (
                                                <button
                                                    onClick={() => toggleUpdateExpansion(updateId)}
                                                    className="mt-2 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                >
                                                    Read more
                                                </button>
                                            )}
                                        </div>
                                        {featuredImage && (
                                            <div
                                                className="group relative overflow-hidden rounded-lg"
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
                                                    className="h-48 w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
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
                                                                {youtubeVideos.length}{' '}
                                                                video{youtubeVideos.length > 1 ? 's' : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
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
                        Array.isArray((selectedUpdateForVideos as any).youtubeVideos) && (
                            <div className="space-y-4">
                                {((selectedUpdateForVideos as any).youtubeVideos as YouTubeVideo[]).map(
                                    (video, index) => (
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
                                    ),
                                )}
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
    const ownerIdentifier =
        owner.slug ?? owner.identifier ?? String(owner.id);

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
                            Project: <span className="font-semibold">{project}</span>
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


