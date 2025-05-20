import React, { useEffect, useState } from 'react';
import { Link, Head } from '@inertiajs/react';
import { Page } from '@/types/pages';
import axios from 'axios';
import DOMPurify from 'dompurify';

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
                console.log('Page data:', response.data);
                setPage(response.data);
                setLoading(false);
            } catch (err) {
                setError('Page not found');
                setLoading(false);
            }
        };

        fetchPage();
    }, [slug]);

    // Add effect to handle custom JS execution
    useEffect(() => {
        if (page?.custom_js) {
            try {
                // Create and execute the script
                const script = document.createElement('script');
                script.textContent = page.custom_js;
                document.body.appendChild(script);
                script.remove(); // Clean up after execution
            } catch (error) {
                console.error('Error executing custom JS:', error);
            }
        }
    }, [page]);

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
                    <div className="min-h-screen bg-white" id={`page-container-${page.id}`}>
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
            {page.custom_css && (
                <style>
                    {DOMPurify.sanitize(page.custom_css)}
                </style>
            )}
            <style>
                {`
                    .prose a {
                        color: #2563eb;
                        text-decoration: underline;
                        font-weight: 500;
                        transition: color 0.2s ease;
                    }
                    .prose a:hover {
                        color: #1d4ed8;
                    }
                    .prose ul {
                        list-style-type: disc;
                        padding-left: 1.5em;
                        margin-top: 1em;
                        margin-bottom: 1em;
                    }
                    .prose ol {
                        list-style-type: decimal;
                        padding-left: 1.5em;
                        margin-top: 1em;
                        margin-bottom: 1em;
                    }
                    .prose li {
                        margin-top: 0.5em;
                        margin-bottom: 0.5em;
                    }
                `}
            </style>
            {renderContent()}
            {page.custom_js && (
                <script
                    id={`page-js-${page.id}`}
                    dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(page.custom_js, {
                            ADD_TAGS: ['script'],
                            ADD_ATTR: ['onload', 'onerror']
                        })
                    }}
                />
            )}
        </>
    );
};

export default Public;
