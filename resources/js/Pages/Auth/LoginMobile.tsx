import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SocialButton from '@/Components/SocialButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function LoginMobile({
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

        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="min-h-screen bg-white px-4 py-8 dark:bg-gray-900">
                {/* Logo Section */}
                <div className="mb-8 flex justify-center">
                    <img
                        src="/images/tetris.png"
                        className="block h-10 w-auto dark:hidden"
                        alt="Logo"
                    />
                    <img
                        src="/images/tetris-white.png"
                        className="hidden h-10 w-auto dark:block"
                        alt="Logo"
                    />
                </div>

                <div className="mx-auto w-full max-w-sm">
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Welcome Back
                        </h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Please sign in to your account
                        </p>
                    </div>

                    {status && (
                        <div className="mb-4 rounded-md bg-green-50 p-3 text-sm font-medium text-green-600 dark:bg-green-900/50 dark:text-green-400">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <InputLabel
                                htmlFor="email"
                                value="Email"
                                className="text-gray-700 dark:text-gray-300"
                            />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                            />
                            <InputError
                                message={errors.email}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="password"
                                value="Password"
                                className="text-gray-700 dark:text-gray-300"
                            />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                autoComplete="current-password"
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                            />
                            <InputError
                                message={errors.password}
                                className="mt-1"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData('remember', e.target.checked)
                                    }
                                />
                                <span className="ms-2 text-sm text-gray-600 dark:text-gray-400">
                                    Remember me
                                </span>
                            </label>
                        </div>

                        {canResetPassword && (
                            <div className="text-center">
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                                >
                                    Forgot your password?
                                </Link>
                            </div>
                        )}

                        <PrimaryButton
                            className="mt-6 w-full justify-center rounded-lg py-2.5 text-sm font-medium"
                            disabled={processing}
                        >
                            {processing ? 'Signing in...' : 'Sign in'}
                        </PrimaryButton>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-2 text-gray-500 dark:bg-gray-900">
                                    Or
                                </span>
                            </div>
                        </div>

                        <SocialButton
                            provider="Google"
                            icon="/images/google.svg"
                            onClick={() =>
                                (window.location.href =
                                    route('google.redirect'))
                            }
                            type="button"
                        >
                            Continue with Google
                        </SocialButton>

                        <div className="mt-6 text-center">
                            <Link
                                href="/register"
                                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                            >
                                Don't have an account?{' '}
                                <span className="font-medium text-indigo-600 dark:text-indigo-400">
                                    Sign up
                                </span>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}
