import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

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

// Get user type name based on project parameter
const getUserTypeName = (project?: string): string => {
    const userTypes: Record<string, string> = {
        community: 'Member',
        medical: 'Patient',
        logistics: 'Client',
        shop: 'Customer',
        delivery: 'Customer',
        jobs: 'Applicant',
        travel: 'Traveler',
        fnb: 'Diner',
        education: 'Student',
        finance: 'Client',
        agriculture: 'Farmer',
        construction: 'Contractor',
        enterprise: 'Client',
        trial: 'User',
    };

    return userTypes[project || ''] || 'Customer';
};

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

    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    const steps = [
        {
            id: 1,
            title: 'Personal Information',
            description: 'Name, Email, Phone',
        },
        {
            id: 2,
            title: 'Account Security',
            description: 'Password',
        },
        {
            id: 3,
            title: 'Address',
            description: 'Location Details',
        },
    ];

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                return !!(data.name && data.email && data.phone_number);
            case 2:
                return !!(data.password && data.password_confirmation);
            case 3:
                return !!(
                    data.street &&
                    data.city &&
                    data.state &&
                    data.postal_code &&
                    data.country
                );
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep) && currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (!validateStep(currentStep)) {
            return;
        }

        post(route('customer.register.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    // Get user type name based on project parameter
    const userTypeName = getUserTypeName(validProject || projectParam);

    // Construct the login URL with project parameter
    const loginUrl = projectParam
        ? route('customer.login') + `?project=${projectParam}`
        : route('customer.login');

    return (
        <GuestLayout>
            <Head title={`${userTypeName} Registration`} />

            <div className="flex min-h-screen w-full bg-white dark:bg-gray-900">
                {/* Left side - Registration Form */}
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
                    <div className="flex flex-grow items-start justify-center overflow-y-auto px-8 pt-8 sm:px-12 lg:px-16">
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
                                    Create {userTypeName} Account
                                </h2>
                                <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
                                    Join us as a {userTypeName.toLowerCase()}{' '}
                                    and get started
                                </p>
                            </div>

                            {/* Step Indicators */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between">
                                    {steps.map((step, index) => {
                                        const isActive =
                                            step.id === currentStep;
                                        const isCompleted =
                                            step.id < currentStep;
                                        const isLast =
                                            index === steps.length - 1;

                                        return (
                                            <div
                                                key={step.id}
                                                className="flex flex-1 items-center"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                                                            isCompleted
                                                                ? 'border-green-500 bg-green-500 text-white'
                                                                : isActive
                                                                  ? 'border-indigo-500 bg-indigo-500 text-white'
                                                                  : 'border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                        }`}
                                                    >
                                                        {isCompleted ? (
                                                            <Check className="h-4 w-4" />
                                                        ) : (
                                                            <span className="text-sm font-medium">
                                                                {step.id}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-2 hidden text-center sm:block">
                                                        <p
                                                            className={`text-xs font-medium ${
                                                                isActive
                                                                    ? 'text-indigo-600 dark:text-indigo-400'
                                                                    : isCompleted
                                                                      ? 'text-green-600 dark:text-green-400'
                                                                      : 'text-gray-500 dark:text-gray-400'
                                                            }`}
                                                        >
                                                            {step.title}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!isLast && (
                                                    <div
                                                        className={`mx-2 h-0.5 flex-1 transition-all duration-200 ${
                                                            isCompleted
                                                                ? 'bg-green-500'
                                                                : 'bg-gray-300 dark:bg-gray-600'
                                                        }`}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <form onSubmit={submit} className="space-y-4">
                                {/* Step 1: Personal Information */}
                                {currentStep === 1 && (
                                    <div className="space-y-4">
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
                                                        setData(
                                                            'name',
                                                            e.target.value,
                                                        )
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
                                                        setData(
                                                            'email',
                                                            e.target.value,
                                                        )
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
                                                Accepts formats: +1 (555)
                                                123-4567, +1-555-123-4567,
                                                555-123-4567
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Account Security */}
                                {currentStep === 2 && (
                                    <div className="space-y-4">
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
                                                    value={
                                                        data.password_confirmation
                                                    }
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
                                    </div>
                                )}

                                {/* Step 3: Address Information */}
                                {currentStep === 3 && (
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                Address Information
                                            </h3>
                                        </div>

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
                                                        message={
                                                            errors.unit_number
                                                        }
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
                                                        message={
                                                            errors.postal_code
                                                        }
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
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex items-center justify-between gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={handlePrevious}
                                        disabled={currentStep === 1}
                                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                            currentStep === 1
                                                ? 'cursor-not-allowed text-gray-400 dark:text-gray-600'
                                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </button>

                                    {currentStep < totalSteps ? (
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            disabled={
                                                !validateStep(currentStep)
                                            }
                                            className={`ml-auto flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white transition-colors ${
                                                !validateStep(currentStep)
                                                    ? 'cursor-not-allowed bg-gray-400 dark:bg-gray-600'
                                                    : 'hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600'
                                            }`}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    ) : (
                                        <PrimaryButton
                                            type="submit"
                                            className="ml-auto flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-medium"
                                            disabled={
                                                processing || !validProject
                                            }
                                        >
                                            {processing
                                                ? 'Creating account...'
                                                : !validProject
                                                  ? 'Invalid Registration Link'
                                                  : 'Create Account'}
                                        </PrimaryButton>
                                    )}
                                </div>

                                {!validProject && (
                                    <p className="mt-2 text-center text-sm text-red-600 dark:text-red-400">
                                        Please use a valid registration link
                                        with a project parameter.
                                    </p>
                                )}

                                <div className="text-center">
                                    <Link
                                        href={loginUrl}
                                        className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                                    >
                                        Already have a{' '}
                                        {userTypeName.toLowerCase()} account?{' '}
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
