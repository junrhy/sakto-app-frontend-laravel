import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Props {
    projectParam?: string;
}

export default function Login({ projectParam }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('employee.login.attempt'));
    };

    const registerUrl = projectParam
        ? route('employee.register') + `?project=${projectParam}`
        : route('employee.register');

    return (
        <GuestLayout>
            <Head title="Employee Login" />

            <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-10 px-6 py-12">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
                        Sign in to your employee account
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Access schedules, company updates, and internal tools.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                    <div className="space-y-6">
                        <div>
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                type="email"
                                value={data.email}
                                className="mt-1 block w-full"
                                autoComplete="username"
                                isFocused
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
                            <InputLabel htmlFor="password" value="Password" />
                            <TextInput
                                id="password"
                                type="password"
                                value={data.password}
                                className="mt-1 block w-full"
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
                            <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData('remember', e.target.checked)
                                    }
                                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                Remember me
                            </label>
                        </div>

                        <PrimaryButton
                            className="w-full justify-center"
                            disabled={processing}
                        >
                            {processing ? 'Signing in...' : 'Sign in'}
                        </PrimaryButton>

                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                            Need an account?{' '}
                            <Link
                                href={registerUrl}
                                className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                            >
                                Register
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
