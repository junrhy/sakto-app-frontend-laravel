import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';

const PROJECT_IMAGES = {
    community:
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    medical:
        'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    logistics:
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    delivery:
        'https://images.unsplash.com/photo-1526367790999-0150786686a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    jobs: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    shop: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    travel: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    fnb: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    education:
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    finance:
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    agriculture:
        'https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    construction:
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
} as const;

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

    // Get image URL based on project parameter, fallback to default
    const imageUrl =
        projectParam && projectParam in PROJECT_IMAGES
            ? PROJECT_IMAGES[
                  projectParam as keyof typeof PROJECT_IMAGES
              ]
            : PROJECT_IMAGES.community;

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
        <GuestLayout>
            <Head title="Customer Login" />

            <div className="flex min-h-screen w-full bg-white dark:bg-gray-900">
                {/* Left side - Login Form */}
                <div className="flex w-full flex-col md:w-1/2">
                    {/* Logo Section */}
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

                    {/* Form Section */}
                    <div className="flex flex-grow items-center justify-center px-6 sm:px-8 md:px-12 lg:px-16">
                        <div className="w-full max-w-[440px]">
                            <div className="mb-6 sm:mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 sm:text-3xl">
                                    Welcome Back
                                </h2>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 sm:mt-2 sm:text-base">
                                    {portalName} - Please sign in to your account
                                </p>
                            </div>

                            <form
                                onSubmit={submit}
                                className="space-y-4 sm:space-y-6"
                            >
                                <div>
                                    <InputLabel
                                        htmlFor="email"
                                        value="Email"
                                        className="text-sm text-gray-700 dark:text-gray-300 sm:text-base"
                                    />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:mt-2 sm:text-base"
                                        autoComplete="username"
                                        isFocused={true}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.email}
                                        className="mt-1 sm:mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="password"
                                        value="Password"
                                        className="text-sm text-gray-700 dark:text-gray-300 sm:text-base"
                                    />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:mt-2 sm:text-base"
                                        autoComplete="current-password"
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.password}
                                        className="mt-1 sm:mt-2"
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
                                </div>

                                <div>
                                    <PrimaryButton
                                        className="w-full justify-center rounded-lg px-4 py-2.5 text-sm font-medium sm:py-3 sm:text-base"
                                        disabled={processing}
                                    >
                                        {processing
                                            ? 'Signing in...'
                                            : 'Sign in'}
                                    </PrimaryButton>
                                </div>

                                <div className="text-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Don't have an account?{' '}
                                        <Link
                                            href={registerUrl}
                                            className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                        >
                                            Sign up
                                        </Link>
                                    </span>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right side - Image */}
                <div className="hidden md:block md:w-1/2">
                    <div className="h-screen w-full">
                        <img
                            src={imageUrl}
                            alt={
                                projectParam
                                    ? `${projectParam.charAt(0).toUpperCase() + projectParam.slice(1)} workspace`
                                    : 'Customer Portal'
                            }
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
