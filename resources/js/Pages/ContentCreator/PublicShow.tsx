import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Content, YouTubeVideo } from '@/types/content';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { Calendar, Copy, Facebook } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    content: Content;
    suggestedContent: Content[];
    youtubeVideos?: YouTubeVideo[];
}

export default function PublicShow({
    content,
    suggestedContent,
    youtubeVideos = [],
}: Props) {
    const shareUrl = window.location.href;
    const shareText = `${content.title} - ${content.excerpt || 'Read this amazing post'}`;

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Link copied to clipboard!');
        } catch (err) {
            toast.error('Failed to copy link');
        }
    };

    const openShareDialog = (platform: string) => {
        const url = shareLinks[platform as keyof typeof shareLinks];
        if (url) {
            window.open(url, '_blank', 'width=600,height=400');
        }
    };

    return (
        <>
            <Head>
                <title>{content.meta_title || content.title}</title>
                <meta
                    name="description"
                    content={content.meta_description || content.excerpt}
                />
                <meta
                    property="og:title"
                    content={content.meta_title || content.title}
                />
                <meta
                    property="og:description"
                    content={content.meta_description || content.excerpt}
                />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={shareUrl} />
                {content.featured_image && (
                    <meta
                        property="og:image"
                        content={content.featured_image}
                    />
                )}
                <meta name="twitter:card" content="summary_large_image" />
                <meta
                    name="twitter:title"
                    content={content.meta_title || content.title}
                />
                <meta
                    name="twitter:description"
                    content={content.meta_description || content.excerpt}
                />
                {content.featured_image && (
                    <meta
                        name="twitter:image"
                        content={content.featured_image}
                    />
                )}

                {/* PWA Meta Tags */}
                <meta
                    name="application-name"
                    content={`${content.title} - Neulify`}
                />
                <meta
                    name="apple-mobile-web-app-title"
                    content={content.title}
                />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="black-translucent"
                />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content="#ffffff" />
                <meta name="msapplication-TileColor" content="#ffffff" />

                {/* Article specific meta tags */}
                <meta
                    property="article:published_time"
                    content={content.created_at}
                />
                <meta
                    property="article:modified_time"
                    content={content.updated_at || content.created_at}
                />
                <meta property="article:author" content={content.author} />
                {content.tags &&
                    content.tags.length > 0 &&
                    content.tags.map((tag, index) => (
                        <meta
                            key={index}
                            property="article:tag"
                            content={tag}
                        />
                    ))}
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
                    {/* Title, Date, and Excerpt */}
                    <div className="mb-8">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            <div className="flex-1">
                                <h1 className="mb-2 text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100 md:text-3xl">
                                    {content.title}
                                </h1>
                                {content.excerpt && (
                                    <p className="text-sm italic text-gray-600 dark:text-gray-300 md:text-base">
                                        {content.excerpt}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center space-x-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {format(
                                        new Date(content.created_at),
                                        'MMM d, yyyy',
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Featured Image */}
                    {content.featured_image && (
                        <div className="mb-12">
                            <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl">
                                <img
                                    src={content.featured_image}
                                    alt={content.title}
                                    className="h-auto w-full object-cover object-center"
                                    loading="lazy"
                                />
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                            </div>
                        </div>
                    )}

                    {/* YouTube Videos */}
                    {youtubeVideos && youtubeVideos.length > 0 && (
                        <div className="mb-12">
                            <div className="rounded-2xl border-0 bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:bg-gray-800/80">
                                <h3 className="mb-6 text-center text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    Featured Videos
                                </h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {youtubeVideos.map((video, index) => (
                                        <div
                                            key={video.id}
                                            className="group relative"
                                        >
                                            <div
                                                className="relative w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
                                                style={{
                                                    paddingBottom: '56.25%',
                                                }}
                                            >
                                                <iframe
                                                    src={video.embedUrl}
                                                    title={`YouTube video ${index + 1}`}
                                                    className="absolute left-0 top-0 h-full w-full rounded-lg transition-transform duration-300 group-hover:scale-[1.02]"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                    loading="lazy"
                                                />
                                                <div className="pointer-events-none absolute inset-0 rounded-lg bg-black/5 transition-colors duration-300 group-hover:bg-black/0"></div>
                                            </div>
                                            <div className="mt-3 text-center">
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Video {index + 1} of{' '}
                                                    {youtubeVideos.length}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <Card className="mb-12 border-0 bg-white/80 shadow-xl backdrop-blur-sm dark:bg-gray-800/80">
                        <CardContent className="p-8 md:p-12">
                            {/* Tags and Categories */}
                            {(content.tags && content.tags.length > 0) ||
                            (content.categories &&
                                content.categories.length > 0) ? (
                                <div className="mb-8 rounded-xl bg-gray-50 p-6 dark:bg-gray-700/50">
                                    {content.tags &&
                                        content.tags.length > 0 && (
                                            <div className="mb-4">
                                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                                                    Tags
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {content.tags.map(
                                                        (tag, index) => (
                                                            <Badge
                                                                key={index}
                                                                variant="secondary"
                                                                className="rounded-full px-3 py-1 text-xs"
                                                            >
                                                                {tag}
                                                            </Badge>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                    {content.categories &&
                                        content.categories.length > 0 && (
                                            <div>
                                                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                                                    Categories
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {content.categories.map(
                                                        (category, index) => (
                                                            <Badge
                                                                key={index}
                                                                variant="outline"
                                                                className="rounded-full px-3 py-1 text-xs"
                                                            >
                                                                {category}
                                                            </Badge>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                </div>
                            ) : null}

                            {/* Main Content */}
                            <div
                                className="prose prose-lg max-w-none dark:prose-invert md:prose-xl prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline dark:prose-headings:text-gray-100 dark:prose-p:text-gray-300 dark:prose-a:text-blue-400"
                                dangerouslySetInnerHTML={{
                                    __html: content.content,
                                }}
                            />
                        </CardContent>
                    </Card>

                    {/* Suggested Content */}
                    {suggestedContent && suggestedContent.length > 0 && (
                        <div className="mb-12">
                            <div className="rounded-2xl border-0 bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:bg-gray-800/80">
                                <h3 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    You might also like
                                </h3>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {suggestedContent.map((suggested) => (
                                        <a
                                            key={suggested.id}
                                            href={route(
                                                'content-creator.public',
                                                suggested.slug,
                                            )}
                                            className="block cursor-pointer rounded-xl bg-gray-50 p-6 transition-shadow hover:shadow-lg dark:bg-gray-700/50"
                                        >
                                            {suggested.featured_image ? (
                                                <div
                                                    className="mb-4 h-32 rounded-lg bg-cover bg-center"
                                                    style={{
                                                        backgroundImage: `url(${suggested.featured_image})`,
                                                    }}
                                                ></div>
                                            ) : (
                                                <div className="mb-4 h-32 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20"></div>
                                            )}
                                            <h4 className="mb-2 line-clamp-2 font-semibold text-gray-900 dark:text-gray-100">
                                                {suggested.title}
                                            </h4>
                                            <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                                                {suggested.excerpt ||
                                                    'Read this amazing post...'}
                                            </p>
                                            <div className="mt-4 flex items-center justify-between">
                                                <span className="text-xs text-gray-500 dark:text-gray-500">
                                                    by {suggested.author}
                                                </span>
                                                <span className="text-xs text-blue-600 dark:text-blue-400">
                                                    Read more →
                                                </span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Share Section */}
                    <div className="mb-12 text-center">
                        <div className="rounded-2xl border-0 bg-white/80 p-8 shadow-xl backdrop-blur-sm dark:bg-gray-800/80">
                            <h3 className="mb-6 text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Enjoyed this post? Share it!
                            </h3>
                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={copyToClipboard}
                                    className="flex items-center space-x-2 px-8"
                                >
                                    <Copy className="h-5 w-5" />
                                    <span>Copy Link</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => openShareDialog('facebook')}
                                    className="flex items-center space-x-2 px-8"
                                >
                                    <Facebook className="h-5 w-5" />
                                    <span>Share on Facebook</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 py-12 text-center dark:border-gray-700">
                        <div className="mx-auto max-w-2xl">
                            <p className="mb-2 text-lg text-gray-600 dark:text-gray-400">
                                Published by{' '}
                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {content.author}
                                </span>
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                © {new Date().getFullYear()} - Created with
                                Sakto Community Platform
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
