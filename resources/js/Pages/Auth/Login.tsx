import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import SocialButton from '@/Components/SocialButton';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="flex w-full min-h-screen bg-white dark:bg-gray-900">
                {/* Left side - Login Form */}
                <div className="w-full md:w-1/2 flex flex-col">
                    {/* Logo Section */}
                    <div className="p-8">
                        <img 
                            src="/images/tetris.png"
                            className="h-12 w-auto block dark:hidden"
                            alt="Logo"
                        />
                        <img 
                            src="/images/tetris-white.png"
                            className="h-12 w-auto hidden dark:block"
                            alt="Logo"
                        />
                    </div>

                    {/* Form Section */}
                    <div className="flex-grow flex items-center justify-center px-8 sm:px-12 lg:px-16">
                        <div className="w-full max-w-[440px]">
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    Welcome Back
                                </h2>
                                <p className="text-base text-gray-600 dark:text-gray-400 mt-2">
                                    Please sign in to your account
                                </p>
                            </div>

                            {status && (
                                <div className="mb-4 p-4 rounded-md bg-green-50 dark:bg-green-900/50 text-sm font-medium text-green-600 dark:text-green-400">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="email" value="Email" className="text-gray-700 dark:text-gray-300 text-base" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
                                        autoComplete="username"
                                        isFocused={true}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password" value="Password" className="text-gray-700 dark:text-gray-300 text-base" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <Checkbox
                                            name="remember"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                        />
                                        <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                                            Remember me
                                        </span>
                                    </label>

                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                        >
                                            Forgot your password?
                                        </Link>
                                    )}
                                </div>

                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 text-gray-500 bg-white dark:bg-gray-900">Or continue with</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <SocialButton
                                        provider="Google"
                                        icon="/images/google.svg"
                                        onClick={() => window.location.href = route('google.redirect')}
                                        type="button"
                                    >
                                        Google
                                    </SocialButton>
                                </div>

                                <div>
                                    <PrimaryButton
                                        className="w-full justify-center py-3 px-4 text-base font-medium rounded-lg"
                                        disabled={processing}
                                    >
                                        {processing ? 'Signing in...' : 'Sign in'}
                                    </PrimaryButton>
                                </div>

                                <div className="text-center">
                                    <div className="relative inline-block group">
                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 w-40 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] transform origin-bottom">
                                            <div className="py-0.5" role="menu" aria-orientation="vertical">
                                                {[
                                                    { name: 'Community', href: route('register', { project: 'community' }) },
                                                    { name: 'Logistics', href: route('register', { project: 'logistics' }) },
                                                    { name: 'Medical', href: route('register', { project: 'medical' }) },
                                                    { name: 'Enterprise', href: route('register', { project: 'enterprise' }) },
                                                ].map((option) => (
                                                    <Link
                                                        key={option.name}
                                                        href={option.href}
                                                        className="block px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors duration-200"
                                                        role="menuitem"
                                                    >
                                                        {option.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Don't have an account?{' '}
                                            <button
                                                type="button"
                                                className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 inline-flex items-center"
                                            >
                                                Sign up
                                                <svg className="ml-1 w-4 h-4 group-hover:translate-y-0.5 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </span>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right side - Image */}
                <div className="hidden md:block md:w-1/2">
                    <div className="w-full h-full">
                        <img
                            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                            alt="Office workspace with laptop and coffee"
                            className="w-full h-full object-cover block dark:hidden"
                        />
                        <img
                            src="https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                            alt="Dark office workspace at night"
                            className="w-full h-full object-cover hidden dark:block"
                        />
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
