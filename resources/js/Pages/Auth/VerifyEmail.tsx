import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <div className="flex min-h-screen w-full bg-white dark:bg-gray-900">
                {/* Left side - Verification Form */}
                <div className="flex w-full flex-col md:w-1/2">
                    {/* Logo Section */}
                    <div className="p-8">
                        <Link href="/">
                            <img
                                src="/images/tetris.png"
                                alt="Logo"
                                className="h-12 w-auto"
                            />
                        </Link>
                    </div>

                    {/* Form Section */}
                    <div className="flex flex-grow items-center justify-center px-8 sm:px-12 lg:px-16">
                        <div className="w-full max-w-[440px]">
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    Verify Your Email
                                </h2>
                                <p className="mt-4 text-base text-gray-600 dark:text-gray-400">
                                    Thanks for signing up! Before getting
                                    started, could you verify your email address
                                    by clicking on the link we just emailed to
                                    you? If you didn't receive the email, we
                                    will gladly send you another.
                                </p>
                            </div>

                            {status === 'verification-link-sent' && (
                                <div className="mb-6 rounded-lg bg-green-50 p-4 dark:bg-green-900/50">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg
                                                className="h-5 w-5 text-green-400"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                                A new verification link has been
                                                sent to your email address.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-6">
                                <div className="flex flex-col space-y-4">
                                    <PrimaryButton
                                        className="w-full justify-center rounded-lg px-4 py-3 text-base font-medium"
                                        disabled={processing}
                                    >
                                        {processing
                                            ? 'Sending...'
                                            : 'Resend Verification Email'}
                                    </PrimaryButton>

                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="text-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                                    >
                                        Log Out
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right side - Image */}
                <div className="hidden md:block md:w-1/2">
                    <div className="h-full w-full">
                        <img
                            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                            alt="Office workspace with laptop and coffee"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
