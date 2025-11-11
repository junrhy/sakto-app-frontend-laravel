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
import { useMemo, useState } from 'react';
import { formatDateTimeForDisplay } from '@/Pages/Public/Community/utils/dateUtils';
import { CommunityCollectionItem } from '../types';

interface NewsfeedSectionProps {
    updates: CommunityCollectionItem[];
}

export function NewsfeedSection({ updates }: NewsfeedSectionProps) {
    const [expandedUpdates, setExpandedUpdates] = useState<Set<number>>(new Set());
    const [selectedUpdateForVideos, setSelectedUpdateForVideos] =
        useState<CommunityCollectionItem | null>(null);
    const [showVideoDialog, setShowVideoDialog] = useState(false);

    const normalizedUpdates = useMemo(() => {
        return Array.isArray(updates) ? updates : [];
    }, [updates]);

    const toggleUpdateExpansion = (updateId: number) => {
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

    if (normalizedUpdates.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50/70 p-8 text-center dark:border-gray-600 dark:bg-gray-900/40">
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
                    No newsfeed items
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Check back later for updates from this community.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {normalizedUpdates.map((update) => {
                    const id = Number(update.id ?? 0);
                    const author = String(update.author ?? update.created_by ?? 'Community');
                    const createdAt = String(update.created_at ?? '');
                    const title = String(update.title ?? 'Untitled');
                    const content = String(update.content ?? update.description ?? '');
                    const featuredImage = update.featured_image as string | undefined;
                    const status = String(update.status ?? 'published');

                    const youtubeVideos = extractYouTubeVideos(content);
                    const processedContent = hideYouTubeLinks(content, false);
                    const isExpanded = expandedUpdates.has(id);
                    const displayContent =
                        isExpanded || processedContent.length <= 280
                            ? processedContent
                            : `${processedContent.substring(0, 280)}...`;

                    return (
                        <div
                            key={id}
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
                                                Verified update
                                            </span>
                                        )}
                                        {status === 'draft' && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600 dark:bg-amber-500/20 dark:text-amber-200">
                                                Draft
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatDateTimeForDisplay(createdAt, {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </p>
                                    <div>
                                        <h4 className="mb-2 text-base font-semibold text-gray-900 dark:text-gray-100">
                                            {title}
                                        </h4>
                                        <div
                                            className="text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                                            dangerouslySetInnerHTML={{ __html: displayContent }}
                                        />
                                        {processedContent.length > 280 && !isExpanded && (
                                            <button
                                                onClick={() => toggleUpdateExpansion(id)}
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
                                                    setSelectedUpdateForVideos({ ...update, youtubeVideos });
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
            </div>

            <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {String(selectedUpdateForVideos?.title ?? 'Videos')}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                            Videos
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
        </>
    );
}
