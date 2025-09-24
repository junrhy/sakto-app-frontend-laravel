import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';

export default function RegistrationDisabled() {
    return (
        <GuestLayout>
            <Head title="Registration Disabled" />

            <div className="flex min-h-screen w-full bg-white dark:bg-gray-900">
                <div className="flex w-full flex-col items-center justify-center px-8 sm:px-12 lg:px-16">
                    <div className="w-full max-w-[440px] text-center">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Registration Disabled
                            </h2>
                            <p className="mt-4 text-base text-gray-600 dark:text-gray-400">
                                User registration is currently disabled. Please
                                contact the administrator for more information.
                            </p>
                        </div>

                        <div className="mt-8">
                            <Link
                                href={route('login')}
                                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-indigo-700 focus:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-indigo-900"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
