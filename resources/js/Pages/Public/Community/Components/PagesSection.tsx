import { Link } from '@inertiajs/react';

interface Page {
    id: number;
    title: string;
    slug: string;
    content: string;
    meta_description: string | null;
    meta_keywords: string | null;
    is_published: boolean;
    template: string | null;
    featured_image: string | null;
    client_identifier: string;
    created_at: string;
    updated_at: string;
}

interface PagesSectionProps {
    pages: Page[];
}

export default function PagesSection({ pages }: PagesSectionProps) {
    // Filter only published pages
    const publishedPages = pages.filter((page) => page.is_published);

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
                    No published pages found
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Check back later for new content
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {publishedPages.map((page) => (
                <div
                    key={page.id}
                    className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-lg dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:shadow-gray-900/70"
                >
                    {/* Page Image */}
                    {page.featured_image && (
                        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                            <img
                                src={page.featured_image}
                                alt={page.title}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                    )}

                    {/* Page Content */}
                    <div className="p-6">
                        {/* Page Header */}
                        <div className="mb-4">
                            <h3 className="mb-2 text-xl font-semibold text-gray-900 transition-colors duration-200 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                                {page.title}
                            </h3>
                            {page.meta_description && (
                                <p className="line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                    {page.meta_description}
                                </p>
                            )}
                        </div>

                        {/* Page Details */}
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
                                    {new Date(
                                        page.updated_at,
                                    ).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-end">
                            <Link
                                href={route('pages.public', page.slug)}
                                target="_blank"
                                rel="noopener noreferrer"
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
                                View Page
                            </Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
