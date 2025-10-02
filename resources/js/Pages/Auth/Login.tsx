import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SocialButton from '@/Components/SocialButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const ALLOWED_PROJECTS = [
    'trial',
    'community',
    'medical',
    'logistics',
    'delivery',
    'jobs',
    'shop',
    'enterprise',
    'travel',
] as const;

const PROJECT_IMAGES = {
    trial: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    community:
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    medical:
        'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    logistics:
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    delivery:
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    jobs: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    shop: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    enterprise:
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    travel: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
} as const;

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const urlProject = new URLSearchParams(window.location.search).get(
        'project',
    );

    // Check if project parameter exists and is valid
    if (!urlProject || !ALLOWED_PROJECTS.includes(urlProject as any)) {
        return (
            <GuestLayout>
                <Head title="404 - Project Not Found" />
                <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
                    <div className="text-center">
                        <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
                            404
                        </h1>
                        <h2 className="mt-4 text-2xl font-semibold text-gray-700 dark:text-gray-300">
                            Project Not Found
                        </h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            {!urlProject
                                ? 'Project parameter is required.'
                                : `The project "${urlProject}" is not valid.`}
                        </p>
                        <div className="mt-4">
                            <Link
                                href={route('login', { project: 'trial' })}
                                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                Go to Trial Login
                            </Link>
                        </div>
                    </div>
                </div>
            </GuestLayout>
        );
    }

    const validProject: (typeof ALLOWED_PROJECTS)[number] =
        urlProject as (typeof ALLOWED_PROJECTS)[number];

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
        project_identifier: validProject,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            ...data,
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
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Don't have an account?{' '}
                                        <Link
                                            href={route('register', {
                                                project: validProject,
                                            })}
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
                    <div className="h-full w-full">
                        <img
                            src={PROJECT_IMAGES[validProject]}
                            alt={`${validProject.charAt(0).toUpperCase() + validProject.slice(1)} workspace`}
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
