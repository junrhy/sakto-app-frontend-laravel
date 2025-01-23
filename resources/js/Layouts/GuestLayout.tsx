import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen flex flex-col">
            <div className="flex-grow">
                {children}
            </div>
            
            <footer className="bg-white border-t border-gray-200 py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        </div>
    );
}
