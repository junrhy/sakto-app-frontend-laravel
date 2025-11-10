import { CommunityCollectionItem } from '../types';

interface ResourcesSectionProps {
    pages: CommunityCollectionItem[];
}

export function ResourcesSection({ pages }: ResourcesSectionProps) {
    const publishedPages = Array.isArray(pages)
        ? pages.filter((page) => Boolean(page.is_published ?? page.published ?? true))
        : [];

    if (publishedPages.length === 0) {
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    No resources available
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    The community has not published any resources yet.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                        className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-lg dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:shadow-gray-900/70"
                    >
                        {featuredImage && (
                            <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                                <img
                                    src={featuredImage}
                                    alt={title}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>
                        )}

                        <div className="p-6">
                            <div className="mb-4">
                                <h3 className="mb-2 text-xl font-semibold text-gray-900 transition-colors duration-200 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                                    {title}
                                </h3>
                                {description && (
                                    <p className="line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                        {description}
                                    </p>
                                )}
                            </div>

                            <div className="mb-6 space-y-3">
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <svg
                                        className="mr-2 h-4 w-4 text-green-500 dark:text-green-400"
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
                                    <span>
                                        Updated{' '}
                                        {new Date(updatedAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <a
                                    href={externalUrl ?? (slug ? `/pages/${slug}` : '#')}
                                    target={externalUrl ? '_blank' : undefined}
                                    rel={externalUrl ? 'noopener noreferrer' : undefined}
                                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg dark:bg-blue-700 dark:shadow-gray-900/50 dark:hover:bg-blue-600 dark:hover:shadow-gray-900/70"
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
                );
            })}
        </div>
    );
}
