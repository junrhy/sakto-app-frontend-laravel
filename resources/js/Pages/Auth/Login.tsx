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
                        <Link href="/">
                            <img 
                                src="/images/tetris.png" 
                                alt="Logo" 
                                className="h-12 w-auto"
                            />
                        </Link>
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

                                <div className="grid grid-cols-2 gap-4">
                                    <SocialButton
                                        provider="Google"
                                        icon="/images/google.svg"
                                        onClick={() => window.location.href = route('google.redirect')}
                                        type="button"
                                    >
                                        Google
                                    </SocialButton>

                                    <SocialButton
                                        provider="Apple"
                                        icon="/images/apple.svg"
                                        onClick={() => window.location.href = route('apple.redirect')}
                                        type="button"
                                        className="dark:text-white"
                                    >
                                        Apple
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
                                    <Link
                                        href={route('register')}
                                        className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                                    >
                                        Don't have an account? <span className="font-medium text-indigo-600 dark:text-indigo-400">Sign up</span>
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right side - Marketing Video */}
                <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-indigo-500 to-purple-600">
                    <div className="w-full h-full flex flex-col items-center justify-center p-12">
                        <div className="w-full max-w-xl aspect-video bg-black/10 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
                            <iframe
                                className="w-full h-full"
                                src="https://www.youtube.com/embed/your-video-id"
                                title="Marketing Video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <div className="mt-8 text-center">
                            <h3 className="text-2xl font-semibold text-white">
                                Why Choose Us?
                            </h3>
                            <p className="mt-3 text-lg text-white/80 max-w-lg">
                            Find out how our platform's cutting-edge IT solutions can make managing your business easier.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
