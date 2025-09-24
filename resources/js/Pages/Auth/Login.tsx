import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SocialButton from '@/Components/SocialButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

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

            <div className="flex min-h-screen w-full bg-white dark:bg-gray-900">
                {/* Left side - Login Form */}
                <div className="flex w-full flex-col md:w-1/2">
                    {/* Logo Section */}
                    <div className="p-8">
                        <img
                            src="/images/tetris.png"
                            className="block h-12 w-auto dark:hidden"
                            alt="Logo"
                        />
                        <img
                            src="/images/tetris-white.png"
                            className="hidden h-12 w-auto dark:block"
                            alt="Logo"
                        />
                    </div>

                    {/* Form Section */}
                    <div className="flex flex-grow items-center justify-center px-8 sm:px-12 lg:px-16">
                        <div className="w-full max-w-[440px]">
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    Welcome Back
                                </h2>
                                <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                                    Please sign in to your account
                                </p>
                            </div>

                            {status && (
                                <div className="mb-4 rounded-md bg-green-50 p-4 text-sm font-medium text-green-600 dark:bg-green-900/50 dark:text-green-400">
                                    {status}
                                </div>
                            )}

                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel
                                        htmlFor="email"
                                        value="Email"
                                        className="text-base text-gray-700 dark:text-gray-300"
                                    />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-2 block w-full rounded-lg border-gray-300 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        autoComplete="username"
                                        isFocused={true}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.email}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="password"
                                        value="Password"
                                        className="text-base text-gray-700 dark:text-gray-300"
                                    />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-2 block w-full rounded-lg border-gray-300 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        autoComplete="current-password"
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.password}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center">
                                        <Checkbox
                                            name="remember"
                                            checked={data.remember}
                                            onChange={(e) =>
                                                setData(
                                                    'remember',
                                                    e.target.checked,
                                                )
                                            }
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
                                        <span className="bg-white px-2 text-gray-500 dark:bg-gray-900">
                                            Or continue with
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <SocialButton
                                        provider="Google"
                                        icon="/images/google.svg"
                                        onClick={() =>
                                            (window.location.href =
                                                route('google.redirect'))
                                        }
                                        type="button"
                                    >
                                        Google
                                    </SocialButton>
                                </div>

                                <div>
                                    <PrimaryButton
                                        className="w-full justify-center rounded-lg px-4 py-3 text-base font-medium"
                                        disabled={processing}
                                    >
                                        {processing
                                            ? 'Signing in...'
                                            : 'Sign in'}
                                    </PrimaryButton>
                                </div>

                                <div className="text-center">
                                    <div className="group relative inline-block">
                                        <div className="invisible absolute bottom-full left-1/2 z-[100] mb-1 w-40 origin-bottom -translate-x-1/2 transform rounded-md bg-white opacity-0 shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-200 group-hover:visible group-hover:opacity-100 dark:bg-gray-800">
                                            <div
                                                className="py-0.5"
                                                role="menu"
                                                aria-orientation="vertical"
                                            >
                                                {[
                                                    {
                                                        name: 'Community',
                                                        href: route(
                                                            'register',
                                                            {
                                                                project:
                                                                    'community',
                                                            },
                                                        ),
                                                    },
                                                    {
                                                        name: 'Logistics',
                                                        href: route(
                                                            'register',
                                                            {
                                                                project:
                                                                    'logistics',
                                                            },
                                                        ),
                                                    },
                                                    {
                                                        name: 'Medical',
                                                        href: route(
                                                            'register',
                                                            {
                                                                project:
                                                                    'medical',
                                                            },
                                                        ),
                                                    },
                                                    {
                                                        name: 'Enterprise',
                                                        href: route(
                                                            'register',
                                                            {
                                                                project:
                                                                    'enterprise',
                                                            },
                                                        ),
                                                    },
                                                ].map((option) => (
                                                    <Link
                                                        key={option.name}
                                                        href={option.href}
                                                        className="block px-3 py-1.5 text-sm text-gray-700 transition-colors duration-200 hover:bg-indigo-50 dark:text-gray-200 dark:hover:bg-gray-700"
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
                                                className="inline-flex items-center font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                            >
                                                Sign up
                                                <svg
                                                    className="ml-1 h-4 w-4 transition-transform group-hover:translate-y-0.5"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 9l-7 7-7-7"
                                                    />
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
                    <div className="h-full w-full">
                        <img
                            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                            alt="Office workspace with laptop and coffee"
                            className="block h-full w-full object-cover dark:hidden"
                        />
                        <img
                            src="https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                            alt="Dark office workspace at night"
                            className="hidden h-full w-full object-cover dark:block"
                        />
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
