import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    const { url } = usePage();
    const showFooterRoutes = [
        '/privacy-policy',
        '/terms-and-conditions',
        '/cookie-policy',
        '/faq',
    ];
    const shouldShowFooter = showFooterRoutes.includes(url);

    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex-grow">{children}</div>

            {shouldShowFooter && (
                <footer className="border-t border-gray-200 bg-white py-4">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-center space-x-6">
                            <Link
                                href={route('privacy-policy')}
                                className="text-sm text-gray-600 hover:text-gray-900"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href={route('terms-and-conditions')}
                                className="text-sm text-gray-600 hover:text-gray-900"
                            >
                                Terms and Conditions
                            </Link>
                            <Link
                                href={route('cookie-policy')}
                                className="text-sm text-gray-600 hover:text-gray-900"
                            >
                                Cookie Policy
                            </Link>
                            <Link
                                href={route('faq')}
                                className="text-sm text-gray-600 hover:text-gray-900"
                            >
                                FAQ
                            </Link>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
}
