import ApplicationLogo from '@/Components/ApplicationLogo';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';
import { Mail, Lock, UserCircle } from 'lucide-react';

interface Props {
    projectParam?: string;
}

export default function Login({ projectParam }: Props) {
    const [hostname, setHostname] = useState('Sakto');

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    // Get portal name based on project parameter
    const getPortalName = (project?: string) => {
        const portalNames: Record<string, string> = {
            community: 'Member Portal',
            medical: 'Patient Portal',
            logistics: 'Client Portal',
            shop: 'Customer Portal',
            delivery: 'Customer Portal',
            jobs: 'Applicant Portal',
            travel: 'Traveler Portal',
            fnb: 'Diner Portal',
            education: 'Student Portal',
            finance: 'Client Portal',
            agriculture: 'Farmer Portal',
            construction: 'Contractor Portal',
        };

        return portalNames[project || ''] || 'Customer Portal';
    };

    const portalName = getPortalName(projectParam);

    useEffect(() => {
        // Get the hostname from the current URL
        if (typeof window !== 'undefined') {
            const currentHostname = window.location.hostname;
            // Capitalize the first letter and remove common TLDs for display
            const displayName =
                currentHostname.split('.')[0].charAt(0).toUpperCase() +
                currentHostname.split('.')[0].slice(1);
            setHostname(displayName);
        }

        return () => {
            reset('password');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('customer.login.attempt'));
    };

    // Construct the registration URL with project parameter
    const registerUrl = projectParam
        ? route('customer.register') + `?project=${projectParam}`
        : route('customer.register');

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8 dark:from-gray-950 dark:via-indigo-950 dark:to-purple-950 sm:px-6 lg:px-8">
            <Head title="Customer Login" />

            {/* Logo and Header Section */}
            <div className="mb-8 text-center">
                <Link href="/" className="inline-block">
                    <div className="flex flex-col items-center space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
                        <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-3 shadow-lg">
                            <ApplicationLogo className="h-12 w-12 fill-current text-white sm:h-14 sm:w-14" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white sm:text-3xl">
                                {hostname}
                            </h1>
                            <div className="flex items-center justify-center space-x-1.5">
                                <UserCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                    {portalName}
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    Sign in to access your account
                </p>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900 sm:p-8">
                    <form onSubmit={submit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <InputLabel
                                htmlFor="email"
                                value="Email Address"
                                className="text-gray-900 dark:text-white"
                            />
                            <div className="relative mt-2">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                </div>
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="block w-full pl-10"
                                    autoComplete="username"
                                    isFocused={true}
                                    placeholder="you@example.com"
                                    onChange={(e) =>
                                        setData('email', e.target.value)
                                    }
                                />
                            </div>
                            <InputError
                                message={errors.email}
                                className="mt-2"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <InputLabel
                                htmlFor="password"
                                value="Password"
                                className="text-gray-900 dark:text-white"
                            />
                            <div className="relative mt-2">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                </div>
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="block w-full pl-10"
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                />
                            </div>
                            <InputError
                                message={errors.password}
                                className="mt-2"
                            />
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) =>
                                    setData('remember', e.target.checked)
                                }
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:ring-offset-gray-900"
                            />
                            <label
                                htmlFor="remember"
                                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                            >
                                Remember me
                            </label>
                        </div>

                        {/* Submit Button */}
                        <PrimaryButton
                            className="w-full justify-center py-3 text-base font-semibold"
                            disabled={processing}
                        >
                            {processing ? 'Signing in...' : 'Sign in'}
                        </PrimaryButton>
                    </form>

                    {/* Register Link */}
                    <div className="mt-6 border-t border-gray-200 pt-6 text-center dark:border-gray-800">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Link
                                href={registerUrl}
                                className="font-semibold text-indigo-600 transition-colors duration-200 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                            >
                                Create an account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-500">
                © {new Date().getFullYear()} {hostname}. All rights reserved.
            </p>
        </div>
    );
}
