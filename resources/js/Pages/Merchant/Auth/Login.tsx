import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';

const PROJECT_IMAGES: Record<string, string> = {
    retail:
        'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1470&q=80',
    restaurant:
        'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1470&q=80',
    logistics:
        'https://images.unsplash.com/photo-1593941707874-ef25b8b3e4e5?auto=format&fit=crop&w=1470&q=80',
    healthcare:
        'https://images.unsplash.com/photo-1587502536900-75cbe4efc586?auto=format&fit=crop&w=1470&q=80',
    hospitality:
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1470&q=80',
    ecommerce:
        'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1470&q=80',
    services:
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1470&q=80',
};

interface Props {
    projectParam?: string;
}

const getPortalName = (project?: string) => {
    const portalNames: Record<string, string> = {
        retail: 'Merchant Portal',
        restaurant: 'Restaurant Portal',
        logistics: 'Logistics Portal',
        healthcare: 'Healthcare Portal',
        hospitality: 'Hospitality Portal',
        ecommerce: 'E-commerce Portal',
        services: 'Services Portal',
    };

    return portalNames[project || ''] || 'Merchant Portal';
};

export default function Login({ projectParam }: Props) {
    const [hostname, setHostname] = useState('Sakto');

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const currentHostname = window.location.hostname;
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
        post(route('merchant.login.attempt'));
    };

    const imageUrl = projectParam && PROJECT_IMAGES[projectParam]
        ? PROJECT_IMAGES[projectParam]
        : PROJECT_IMAGES.retail;

    const portalName = getPortalName(projectParam);

    const registerUrl = projectParam
        ? route('merchant.register') + `?project=${projectParam}`
        : route('merchant.register');

    return (
        <GuestLayout>
            <Head title="Merchant Login" />

            <div className="flex min-h-screen w-full bg-white dark:bg-gray-900">
                <div className="flex w-full flex-col md:w-1/2">
                    <div className="p-4 sm:p-6 md:p-8">
                        <img
                            src="/images/neulify-logo-big.png"
                            className="block h-8 w-auto rounded-lg border-2 border-gray-800 p-2 dark:hidden sm:h-10 md:h-12"
                            alt="Logo"
                        />
                        <img
                            src="/images/neulify-logo-big-white.png"
                            className="hidden h-8 w-auto rounded-lg border-2 p-2 dark:block dark:border-white sm:h-10 md:h-12"
                            alt="Logo"
                        />
                    </div>

                    <div className="flex flex-grow items-center justify-center px-6 sm:px-8 md:px-12 lg:px-16">
                        <div className="w-full max-w-[440px]">
                            <div className="mb-6 sm:mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
                                    Welcome Back, {hostname}
                                </h2>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 sm:mt-2 sm:text-base">
                                    {portalName} - sign in to manage your operations
                                </p>
                            </div>

                            <form onSubmit={submit} className="space-y-4 sm:space-y-6">
                                <div>
                                    <InputLabel htmlFor="email" value="Business Email" className="text-sm text-gray-700 dark:text-gray-300 sm:text-base" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:mt-2 sm:text-base"
                                        autoComplete="username"
                                        isFocused
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    <InputError message={errors.email} className="mt-1 sm:mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password" value="Password" className="text-sm text-gray-700 dark:text-gray-300 sm:text-base" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:mt-2 sm:text-base"
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <InputError message={errors.password} className="mt-1 sm:mt-2" />
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
                                </div>

                                <div>
                                    <PrimaryButton className="w-full justify-center rounded-lg px-4 py-2.5 text-sm font-medium sm:py-3 sm:text-base" disabled={processing}>
                                        {processing ? 'Signing in...' : 'Sign in'}
                                    </PrimaryButton>
                                </div>

                                <div className="text-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Need an account?{' '}
                                        <Link
                                            href={registerUrl}
                                            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                        >
                                            Register as a merchant
                                        </Link>
                                    </span>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="hidden md:block md:w-1/2">
                    <div className="h-screen w-full">
                        <img
                            src={imageUrl}
                            alt={portalName}
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
