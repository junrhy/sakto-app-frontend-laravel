import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SocialButton from '@/Components/SocialButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Props {
    projectParam?: string;
    projectExists?: boolean;
}

const ALLOWED_PROJECTS = [
    'trial',
    'community',
    'logistics',
    'medical',
    'travel',
    'delivery',
    'jobs',
    'shop',
    'enterprise',
    'fnb',
] as const;

const PROJECT_IMAGES = {
    trial: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    community:
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    medical:
        'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    logistics:
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    travel: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    delivery:
        'https://images.unsplash.com/photo-1526367790999-0150786686a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    jobs: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    shop: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    enterprise:
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    fnb: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
} as const;

export default function Register({ projectParam, projectExists }: Props) {
    const urlProject = new URLSearchParams(window.location.search).get(
        'project',
    );
    const validProject: (typeof ALLOWED_PROJECTS)[number] =
        ALLOWED_PROJECTS.includes(urlProject as any)
            ? (urlProject as (typeof ALLOWED_PROJECTS)[number])
            : 'trial';

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        project_identifier: validProject,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="flex min-h-screen w-full bg-white dark:bg-gray-900">
                {/* Left side - Registration Form */}
                <div className="flex w-full flex-col md:w-1/2">
                    {/* Form Section */}
                    <div className="flex flex-grow items-start justify-center overflow-y-auto px-8 pt-16 sm:px-12 lg:px-16">
                        {/* Floating Warning Notification */}
                        {projectParam && !projectExists && (
                            <div className="fixed left-1/2 top-4 z-50 w-full max-w-md -translate-x-1/2 transform px-4">
                                <div className="rounded-lg border border-yellow-400 bg-yellow-50 p-4 shadow-lg dark:border-yellow-600 dark:bg-yellow-900/95">
                                    <div className="flex items-start">
                                        <svg
                                            className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <div className="ml-3 flex-1">
                                            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                                                Project Not Configured
                                            </h3>
                                            <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                                                The project "{projectParam}" is
                                                not yet configured in our
                                                system. Please contact support
                                                for assistance.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="w-full max-w-[440px]">
                            <div className="mb-6">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    Create an Account
                                </h2>
                                <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                                    Join us today and start your journey
                                </p>
                            </div>

                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <InputLabel
                                        htmlFor="name"
                                        value="Name"
                                        className="text-base text-gray-700 dark:text-gray-300"
                                    />
                                    <TextInput
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        className="mt-2 block w-full rounded-lg border-gray-300 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        autoComplete="name"
                                        isFocused={true}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.name}
                                        className="mt-2"
                                    />
                                </div>

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
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                        required
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
                                        autoComplete="new-password"
                                        onChange={(e) =>
                                            setData('password', e.target.value)
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.password}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="password_confirmation"
                                        value="Confirm Password"
                                        className="text-base text-gray-700 dark:text-gray-300"
                                    />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="mt-2 block w-full rounded-lg border-gray-300 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        autoComplete="new-password"
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.password_confirmation}
                                        className="mt-2"
                                    />
                                </div>

                                <div className="relative my-6 hidden md:block">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="bg-white px-2 text-gray-500 dark:bg-gray-900">
                                            Or continue with
                                        </span>
                                    </div>
                                </div>

                                <div className="grid hidden grid-cols-1 gap-4 md:grid">
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
                                            ? 'Creating account...'
                                            : 'Create Account'}
                                    </PrimaryButton>
                                </div>

                                <div className="text-center">
                                    <Link
                                        href={route('login')}
                                        className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                                    >
                                        Already have an account?{' '}
                                        <span className="font-medium text-indigo-600 dark:text-indigo-400">
                                            Sign in
                                        </span>
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right side - Image */}
                <div className="hidden md:block md:w-1/2">
                    <div className="h-screen w-full">
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
