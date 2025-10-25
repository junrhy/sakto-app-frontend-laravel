import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
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
    const validProject: (typeof ALLOWED_PROJECTS)[number] | '' =
        ALLOWED_PROJECTS.includes(urlProject as any)
            ? (urlProject as (typeof ALLOWED_PROJECTS)[number])
            : '';

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirmation: '',
        project_identifier: validProject,
        // Address fields
        street: '',
        unit_number: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('customer.register.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    // Construct the login URL with project parameter
    const loginUrl = projectParam
        ? route('customer.login') + `?project=${projectParam}`
        : route('customer.login');

    return (
        <GuestLayout>
            <Head title="Customer Registration" />

            <div className="flex min-h-screen w-full bg-white dark:bg-gray-900">
                {/* Left side - Registration Form */}
                <div className="flex w-full flex-col md:w-1/2">
                    {/* Form Section */}
                    <div className="flex flex-grow items-start justify-center overflow-y-auto px-8 pt-16 sm:px-12 lg:px-16">
                        {/* Floating Error Notification */}
                        {(!validProject || errors.project_identifier) && (
                            <div className="fixed left-1/2 top-4 z-50 w-full max-w-md -translate-x-1/2 transform px-4">
                                <div className="rounded-lg border border-red-400 bg-red-50 p-4 shadow-lg dark:border-red-600 dark:bg-red-900/95">
                                    <div className="flex items-start">
                                        <svg
                                            className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <div className="ml-3 flex-1">
                                            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                                                Invalid or Missing Project
                                                Parameter
                                            </h3>
                                            <p className="mt-1 text-sm text-red-700 dark:text-red-400">
                                                {errors.project_identifier ||
                                                    'This registration link requires a valid project parameter. Please use the correct registration link provided to you.'}
                                            </p>
                                            {!urlProject && (
                                                <p className="mt-2 text-sm text-red-700 dark:text-red-400">
                                                    <strong>Example:</strong>{' '}
                                                    /customer/register?project=community
                                                </p>
                                            )}
                                            {urlProject && !validProject && (
                                                <p className="mt-2 text-sm text-red-700 dark:text-red-400">
                                                    <strong>
                                                        Invalid project:
                                                    </strong>{' '}
                                                    "{urlProject}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="w-full max-w-[440px]">
                            <div className="mb-6">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    Create Customer Account
                                </h2>
                                <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                                    Join us as a customer and start shopping
                                </p>
                            </div>

                            <form onSubmit={submit} className="space-y-4">
                                {/* Name and Email Row */}
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
                                </div>

                                {/* Phone Number - Full Width */}
                                <div>
                                    <InputLabel
                                        htmlFor="phone_number"
                                        value="Phone Number"
                                        className="text-base text-gray-700 dark:text-gray-300"
                                    />
                                    <TextInput
                                        id="phone_number"
                                        type="tel"
                                        name="phone_number"
                                        value={data.phone_number}
                                        className="mt-2 block w-full rounded-lg border-gray-300 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        autoComplete="tel"
                                        placeholder="+1 (555) 123-4567"
                                        onChange={(e) =>
                                            setData(
                                                'phone_number',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.phone_number}
                                        className="mt-2"
                                    />
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        Accepts formats: +1 (555) 123-4567,
                                        +1-555-123-4567, 555-123-4567
                                    </p>
                                </div>

                                {/* Password Fields Row */}
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
                                                setData(
                                                    'password',
                                                    e.target.value,
                                                )
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
                                            message={
                                                errors.password_confirmation
                                            }
                                            className="mt-2"
                                        />
                                    </div>
                                </div>

                                {/* Address Section */}
                                <div className="mt-8">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Address Information
                                    </h3>

                                    <div className="space-y-4">
                                        {/* Street and Unit Row */}
                                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                                            <div className="lg:col-span-2">
                                                <InputLabel
                                                    htmlFor="street"
                                                    value="Street Address"
                                                    className="text-base text-gray-700 dark:text-gray-300"
                                                />
                                                <TextInput
                                                    id="street"
                                                    name="street"
                                                    value={data.street}
                                                    className="mt-2 block w-full rounded-lg border-gray-300 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    autoComplete="street-address"
                                                    placeholder="123 Main Street"
                                                    onChange={(e) =>
                                                        setData(
                                                            'street',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                                <InputError
                                                    message={errors.street}
                                                    className="mt-2"
                                                />
                                            </div>

                                            <div className="lg:col-span-1">
                                                <InputLabel
                                                    htmlFor="unit_number"
                                                    value="Unit/Apt (Optional)"
                                                    className="text-base text-gray-700 dark:text-gray-300"
                                                />
                                                <TextInput
                                                    id="unit_number"
                                                    name="unit_number"
                                                    value={data.unit_number}
                                                    className="mt-2 block w-full rounded-lg border-gray-300 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    autoComplete="address-line2"
                                                    placeholder="Apt 4B"
                                                    onChange={(e) =>
                                                        setData(
                                                            'unit_number',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={errors.unit_number}
                                                    className="mt-2"
                                                />
                                            </div>
                                        </div>

                                        {/* City and State Row */}
                                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                            <div>
                                                <InputLabel
                                                    htmlFor="city"
                                                    value="City"
                                                    className="text-base text-gray-700 dark:text-gray-300"
                                                />
                                                <TextInput
                                                    id="city"
                                                    name="city"
                                                    value={data.city}
                                                    className="mt-2 block w-full rounded-lg border-gray-300 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    autoComplete="address-level2"
                                                    placeholder="New York"
                                                    onChange={(e) =>
                                                        setData(
                                                            'city',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                                <InputError
                                                    message={errors.city}
                                                    className="mt-2"
                                                />
                                            </div>

                                            <div>
                                                <InputLabel
                                                    htmlFor="state"
                                                    value="State/Province"
                                                    className="text-base text-gray-700 dark:text-gray-300"
                                                />
                                                <TextInput
                                                    id="state"
                                                    name="state"
                                                    value={data.state}
                                                    className="mt-2 block w-full rounded-lg border-gray-300 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    autoComplete="address-level1"
                                                    placeholder="NY"
                                                    onChange={(e) =>
                                                        setData(
                                                            'state',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                                <InputError
                                                    message={errors.state}
                                                    className="mt-2"
                                                />
                                            </div>
                                        </div>

                                        {/* Postal Code and Country Row */}
                                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                            <div>
                                                <InputLabel
                                                    htmlFor="postal_code"
                                                    value="Postal Code"
                                                    className="text-base text-gray-700 dark:text-gray-300"
                                                />
                                                <TextInput
                                                    id="postal_code"
                                                    name="postal_code"
                                                    value={data.postal_code}
                                                    className="mt-2 block w-full rounded-lg border-gray-300 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    autoComplete="postal-code"
                                                    placeholder="10001"
                                                    onChange={(e) =>
                                                        setData(
                                                            'postal_code',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                                <InputError
                                                    message={errors.postal_code}
                                                    className="mt-2"
                                                />
                                            </div>

                                            <div>
                                                <InputLabel
                                                    htmlFor="country"
                                                    value="Country"
                                                    className="text-base text-gray-700 dark:text-gray-300"
                                                />
                                                <TextInput
                                                    id="country"
                                                    name="country"
                                                    value={data.country}
                                                    className="mt-2 block w-full rounded-lg border-gray-300 text-base shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                    autoComplete="country"
                                                    placeholder="United States"
                                                    onChange={(e) =>
                                                        setData(
                                                            'country',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                />
                                                <InputError
                                                    message={errors.country}
                                                    className="mt-2"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <PrimaryButton
                                        className="w-full justify-center rounded-lg px-4 py-3 text-base font-medium"
                                        disabled={processing || !validProject}
                                    >
                                        {processing
                                            ? 'Creating account...'
                                            : !validProject
                                              ? 'Invalid Registration Link'
                                              : 'Create Customer Account'}
                                    </PrimaryButton>
                                    {!validProject && (
                                        <p className="mt-2 text-center text-sm text-red-600 dark:text-red-400">
                                            Please use a valid registration link
                                            with a project parameter.
                                        </p>
                                    )}
                                </div>

                                <div className="text-center">
                                    <Link
                                        href={loginUrl}
                                        className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                                    >
                                        Already have a customer account?{' '}
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
                            src={
                                validProject && PROJECT_IMAGES[validProject]
                                    ? PROJECT_IMAGES[validProject]
                                    : 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
                            }
                            alt={`${validProject ? validProject.charAt(0).toUpperCase() + validProject.slice(1) : 'Default'} workspace`}
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
