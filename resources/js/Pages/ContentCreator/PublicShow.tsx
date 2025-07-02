import React from 'react';
import { Head } from '@inertiajs/react';
import { Content } from '@/types/content';
import { format } from 'date-fns';
import { Calendar, User, Share2, Facebook, Copy } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { toast, Toaster } from 'sonner';

interface Props {
    content: Content;
    suggestedContent: Content[];
}

export default function PublicShow({ content, suggestedContent }: Props) {
    const shareUrl = window.location.href;
    const shareText = `${content.title} - ${content.excerpt || 'Read this amazing post'}`;

    const shareLinks = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
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
                <meta name="description" content={content.meta_description || content.excerpt} />
                <meta property="og:title" content={content.meta_title || content.title} />
                <meta property="og:description" content={content.meta_description || content.excerpt} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={shareUrl} />
                {content.featured_image && (
                    <meta property="og:image" content={content.featured_image} />
                )}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={content.meta_title || content.title} />
                <meta name="twitter:description" content={content.meta_description || content.excerpt} />
                {content.featured_image && (
                    <meta name="twitter:image" content={content.featured_image} />
                )}
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <Toaster />
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Title, Date, and Excerpt */}
                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                            <div className="flex-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 leading-tight">
                                    {content.title}
                                </h1>
                                {content.excerpt && (
                                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 italic">
                                        {content.excerpt}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                <Calendar className="w-4 h-4" />
                                <span>{format(new Date(content.created_at), 'MMM d, yyyy')}</span>
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
                                    className="w-full h-auto object-cover object-center"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none"></div>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <Card className="mb-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-xl">
                        <CardContent className="p-8 md:p-12">

                            {/* Tags and Categories */}
                            {(content.tags && content.tags.length > 0) || (content.categories && content.categories.length > 0) ? (
                                <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    {content.tags && content.tags.length > 0 && (
                                        <div className="mb-4">
                                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Tags</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {content.tags.map((tag, index) => (
                                                    <Badge key={index} variant="secondary" className="text-xs px-3 py-1 rounded-full">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {content.categories && content.categories.length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Categories</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {content.categories.map((category, index) => (
                                                    <Badge key={index} variant="outline" className="text-xs px-3 py-1 rounded-full">
                                                        {category}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : null}

                            {/* Main Content */}
                            <div 
                                className="prose prose-lg md:prose-xl max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline"
                                dangerouslySetInnerHTML={{ __html: content.content }}
                            />
                        </CardContent>
                    </Card>

                    {/* Suggested Content */}
                    {suggestedContent && suggestedContent.length > 0 && (
                        <div className="mb-12">
                            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-0">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
                                    You might also like
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {suggestedContent.map((suggested) => (
                                        <a 
                                            key={suggested.id}
                                            href={route('content-creator.public', suggested.slug)}
                                            className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer block"
                                        >
                                            {suggested.featured_image ? (
                                                <div className="h-32 bg-cover bg-center rounded-lg mb-4" 
                                                     style={{ backgroundImage: `url(${suggested.featured_image})` }}>
                                                </div>
                                            ) : (
                                                <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg mb-4"></div>
                                            )}
                                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                                                {suggested.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                {suggested.excerpt || 'Read this amazing post...'}
                                            </p>
                                            <div className="flex items-center justify-between mt-4">
                                                <span className="text-xs text-gray-500 dark:text-gray-500">
                                                    by {suggested.author}
                                                </span>
                                                <span className="text-xs text-blue-600 dark:text-blue-400">Read more →</span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Share Section */}
                    <div className="mb-12 text-center">
                        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-0">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                                Enjoyed this post? Share it!
                            </h3>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={copyToClipboard}
                                    className="flex items-center space-x-2 px-8"
                                >
                                    <Copy className="w-5 h-5" />
                                    <span>Copy Link</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => openShareDialog('facebook')}
                                    className="flex items-center space-x-2 px-8"
                                >
                                    <Facebook className="w-5 h-5" />
                                    <span>Share on Facebook</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center py-12 border-t border-gray-200 dark:border-gray-700">
                        <div className="max-w-2xl mx-auto">
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                                Published by <span className="font-semibold text-gray-900 dark:text-gray-100">{content.author}</span>
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                © {new Date().getFullYear()} - Created with Sakto Community Platform
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
} 