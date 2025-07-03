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
    const publishedPages = pages.filter(page => page.is_published);

    if (publishedPages.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Pages</h2>
                <div className="text-center text-gray-500 py-12">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-lg font-medium">No published pages found</p>
                    <p className="text-sm">Check back later for new content</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publishedPages.map((page) => (
                    <div key={page.id} className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200">
                        {/* Page Image */}
                        {page.featured_image && (
                            <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                                <img 
                                    src={page.featured_image} 
                                    alt={page.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                        )}

                        {/* Page Content */}
                        <div className="p-6">
                            {/* Page Header */}
                            <div className="mb-4">
                                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-2">
                                    {page.title}
                                </h3>
                                {page.meta_description && (
                                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                                        {page.meta_description}
                                    </p>
                                )}
                            </div>

                            {/* Page Details */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center text-sm text-gray-500">
                                    <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                    </svg>
                                    <span className="font-mono text-xs">/{page.slug}</span>
                                </div>

                                {page.template && (
                                    <div className="flex items-center text-sm text-gray-500">
                                        <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                                        </svg>
                                        <span className="capitalize">{page.template} template</span>
                                    </div>
                                )}

                                <div className="flex items-center text-sm text-gray-500">
                                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>
                                        Updated {new Date(page.updated_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
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
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-200 text-sm font-medium"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    View Page
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 