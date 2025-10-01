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
import { useState } from 'react';
import { formatDateTimeForDisplay } from '../utils/dateUtils';

interface Update {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    status: 'draft' | 'published';
    featured_image: string | null;
    author: string;
    client_identifier: string;
    created_at: string;
    updated_at: string;
}

interface UpdatesSectionProps {
    updates: Update[];
}

export default function UpdatesSection({ updates }: UpdatesSectionProps) {
    const [expandedUpdates, setExpandedUpdates] = useState<Set<number>>(
        new Set(),
    );
    const [selectedUpdateForVideos, setSelectedUpdateForVideos] =
        useState<any>(null);
    const [showVideoDialog, setShowVideoDialog] = useState(false);

    const toggleUpdateExpansion = (updateId: number) => {
        const newExpanded = new Set(expandedUpdates);
        if (newExpanded.has(updateId)) {
            newExpanded.delete(updateId);
        } else {
            newExpanded.add(updateId);
        }
        setExpandedUpdates(newExpanded);
    };

    if (updates.length === 0) {
        return (
            <div className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/50">
                <div className="space-y-4">
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
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            No updates found
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Check back later for new updates
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3 xl:columns-4">
                {updates.map((update) => (
                    <div
                        key={update.id}
                        className="mb-6 break-inside-avoid rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:shadow-gray-900/50 dark:hover:shadow-gray-900/70"
                    >
                        {/* Post Header */}
                        <div className="p-4 pb-2">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
                                    <span className="text-sm font-semibold text-white">
                                        {update.author.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {update.author}
                                        </h3>
                                        {update.status === 'published' && (
                                            <svg
                                                className="h-4 w-4 text-blue-500 dark:text-blue-400"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                        <span>
                                            {formatDateTimeForDisplay(
                                                update.created_at,
                                                {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                },
                                            )}
                                        </span>
                                        {update.status === 'draft' && (
                                            <>
                                                <span>•</span>
                                                <span className="font-medium text-yellow-600 dark:text-yellow-400">
                                                    Draft
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Post Content */}
                        <div className="flex-1 px-4 pb-3">
                            {(() => {
                                // Extract YouTube videos from the content
                                const youtubeVideos = extractYouTubeVideos(
                                    update.content,
                                );
                                // Hide YouTube links from the content
                                const processedContent = hideYouTubeLinks(
                                    update.content,
                                    false,
                                );

                                return (
                                    <>
                                        {/* Text Content */}
                                        <div
                                            className="text-sm leading-relaxed text-gray-700 dark:text-gray-300"
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    expandedUpdates.has(
                                                        update.id,
                                                    ) ||
                                                    processedContent.length <=
                                                        300
                                                        ? processedContent
                                                        : processedContent.substring(
                                                              0,
                                                              300,
                                                          ) + '...',
                                            }}
                                        />
                                        {processedContent.length > 300 &&
                                            !expandedUpdates.has(update.id) && (
                                                <button
                                                    onClick={() =>
                                                        toggleUpdateExpansion(
                                                            update.id,
                                                        )
                                                    }
                                                    className="mt-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                >
                                                    See more
                                                </button>
                                            )}
                                    </>
                                );
                            })()}
                        </div>

                        {/* Post Image */}
                        {update.featured_image && (
                            <div
                                className="group relative mt-auto cursor-pointer"
                                onClick={() => {
                                    const youtubeVideos = extractYouTubeVideos(
                                        update.content,
                                    );
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
                                    src={update.featured_image}
                                    alt={update.title}
                                    className="max-h-96 w-full rounded-lg object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                                />
                                {(() => {
                                    const youtubeVideos = extractYouTubeVideos(
                                        update.content,
                                    );
                                    return youtubeVideos.length > 0 ? (
                                        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
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
                                                    {youtubeVideos.length} video
                                                    {youtubeVideos.length > 1
                                                        ? 's'
                                                        : ''}
                                                </p>
                                            </div>
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Video Dialog */}
            <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {selectedUpdateForVideos?.title || 'Videos'}
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                            Videos
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUpdateForVideos?.youtubeVideos && (
                        <div className="space-y-4">
                            {selectedUpdateForVideos.youtubeVideos.map(
                                (video: YouTubeVideo, index: number) => (
                                    <div
                                        key={index}
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
                                            frameBorder="0"
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
