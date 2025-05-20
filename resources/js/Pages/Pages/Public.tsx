import React, { useEffect, useState } from 'react';
import { Link, Head } from '@inertiajs/react';
import { Page } from '@/types/pages';
import axios from 'axios';

interface PublicProps {
    slug: string;
}

const Public: React.FC<PublicProps> = ({ slug }) => {
    const [page, setPage] = useState<Page | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const response = await axios.get(`/api/pages/${slug}`);
                console.log(response.data);
                setPage(response.data);
                setLoading(false);
            } catch (err) {
                setError('Page not found');
                setLoading(false);
            }
        };

        fetchPage();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-lg text-gray-600">Page not found</p>
                </div>
            </div>
        );
    }

    // Template-based rendering
    const renderContent = () => {
        switch (page.template) {
            case 'full-width':
                return (
                    <div className="min-h-screen bg-white">
                        <div className="w-full px-0 py-12">
                            {page.featured_image && (
                                <div className="mb-8">
                                    <img
                                        src={page.featured_image}
                                        alt={page.title}
                                        className="w-full h-64 object-cover rounded-none"
                                    />
                                </div>
                            )}
                            <h1 className="text-4xl font-bold text-gray-900 mb-6 px-8">{page.title}</h1>
                            <div 
                                className="prose max-w-none px-8"
                                dangerouslySetInnerHTML={{ __html: page.content }}
                            />
                        </div>
                    </div>
                );
            case 'sidebar':
                return (
                    <div className="min-h-screen bg-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8">
                            <aside className="md:w-1/4 w-full mb-8 md:mb-0 bg-gray-50 p-6 rounded-lg border border-gray-200">
                                {/* Example sidebar content, can be dynamic */}
                                <h2 className="text-xl font-semibold mb-4">Sidebar</h2>
                                <p className="text-gray-600">This is a sidebar area. You can customize this per template.</p>
                            </aside>
                            <main className="md:w-3/4 w-full">
                                {page.featured_image && (
                                    <div className="mb-8">
                                        <img
                                            src={page.featured_image}
                                            alt={page.title}
                                            className="w-full h-64 object-cover rounded-lg"
                                        />
                                    </div>
                                )}
                                <h1 className="text-4xl font-bold text-gray-900 mb-6">{page.title}</h1>
                                <div 
                                    className="prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: page.content }}
                                />
                            </main>
                        </div>
                    </div>
                );
            case 'default':
            default:
                return (
                    <div className="min-h-screen bg-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                            {page.featured_image && (
                                <div className="mb-8">
                                    <img
                                        src={page.featured_image}
                                        alt={page.title}
                                        className="w-full h-64 object-cover rounded-lg"
                                    />
                                </div>
                            )}
                            <h1 className="text-4xl font-bold text-gray-900 mb-6">{page.title}</h1>
                            <div 
                                className="prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: page.content }}
                            />
                        </div>
                    </div>
                );
        }
    };

    return (
        <>
            <Head>
                <title>{page.title}</title>
                {page.meta_description && (
                    <meta name="description" content={page.meta_description} />
                )}
                {page.meta_keywords && (
                    <meta name="keywords" content={page.meta_keywords} />
                )}
                <meta property="og:title" content={page.title} />
                {page.meta_description && (
                    <meta property="og:description" content={page.meta_description} />
                )}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
                {page.featured_image && (
                    <meta property="og:image" content={page.featured_image} />
                )}
            </Head>
            {renderContent()}
            {page.custom_css && (
                <style>{page.custom_css}</style>
            )}
            {page.custom_js && (
                <script dangerouslySetInnerHTML={{ __html: page.custom_js }} />
            )}
        </>
    );
};

export default Public;
