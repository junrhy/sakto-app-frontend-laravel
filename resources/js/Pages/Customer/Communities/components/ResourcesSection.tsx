import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { formatDateTimeForDisplay } from '@/Pages/Public/Community/utils/dateUtils';
import { CommunityCollectionItem } from '../types';

interface ResourcesSectionProps {
    pages: CommunityCollectionItem[];
}

export function ResourcesSection({ pages }: ResourcesSectionProps) {
    const publishedPages = Array.isArray(pages)
        ? pages.filter((page) => Boolean(page.is_published ?? page.published ?? true))
        : [];

    return (
        <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Resources
                </CardTitle>
            </CardHeader>
            {publishedPages.length === 0 ? (
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        No resources available
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        The community has not published any resources yet.
                    </p>
                </CardContent>
            ) : (
                <CardContent className="space-y-4">
                    {publishedPages.map((page, index) => {
                        const id = String(page.id ?? index);
                        const title = String(page.title ?? page.name ?? 'Untitled Resource');
                        const description = String(page.meta_description ?? page.description ?? '');
                        const featuredImage = page.featured_image as string | undefined;
                        const updatedAt = String(page.updated_at ?? page.created_at ?? '');
                        const externalUrl = (page.url as string | undefined) ?? undefined;
                        const slug = page.slug ? String(page.slug) : null;

                        return (
                            <div
                                key={id}
                                className="flex flex-col gap-4 rounded-lg border border-gray-200/80 bg-white/80 p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-gray-600/70 dark:bg-gray-800/50 dark:shadow-gray-900/40"
                            >
                                <div className="flex flex-col gap-4 md:flex-row">
                                    {featuredImage && (
                                        <div className="overflow-hidden rounded-lg md:w-40">
                                            <img
                                                src={featuredImage}
                                                alt={title}
                                                className="h-28 w-full object-cover md:h-full"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {title}
                                            </h3>
                                            {description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {description}
                                                </p>
                                            )}
                                        </div>
                                        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                            Updated{' '}
                                            {formatDateTimeForDisplay(updatedAt, {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </p>
                                        <div className="flex justify-end">
                                            <a
                                                href={externalUrl ?? (slug ? `/pages/${slug}` : '#')}
                                                target={externalUrl ? '_blank' : undefined}
                                                rel={externalUrl ? 'noopener noreferrer' : undefined}
                                                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
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
                                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                    />
                                                </svg>
                                                View Resource
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            )}
        </Card>
    );
}
