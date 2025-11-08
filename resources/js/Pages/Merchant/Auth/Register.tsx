import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';

interface Project {
    identifier: string;
    name: string;
}

interface Props {
    projects: Project[];
    projectParam?: string;
    projectExists?: boolean;
    businessTypes: string[];
}

export default function Register({
    projects,
    projectParam,
    projectExists,
    businessTypes,
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        business_name: '',
        business_type: '',
        industry: '',
        website: '',
        contact_name: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirmation: '',
        project_identifier: projectParam && projectExists ? projectParam : '',
        street: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
    });

    useEffect(() => {
        if (projectParam && projectExists) {
            setData('project_identifier', projectParam);
        }
    }, [projectParam, projectExists]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('merchant.register.store'));
    };

    return (
        <GuestLayout>
            <Head title="Merchant Registration" />

            <div className="flex min-h-screen w-full bg-white dark:bg-gray-900">
                <div className="hidden w-2/5 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 p-12 text-white md:flex md:flex-col md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">
                            Create your merchant account
                        </h1>
                        <p className="mt-4 text-sm text-indigo-100">
                            Access your unified dashboard for orders, inventory,
                            delivery, and customer engagement tools. Manage your
                            entire business ecosystem in one place.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-200">
                                Why merchants choose Sakto
                            </p>
                            <ul className="mt-3 space-y-2 text-sm text-indigo-100">
                                <li>
                                    • Unified tools across retail, food,
                                    logistics, and services
                                </li>
                                <li>
                                    • Real-time visibility across your teams and
                                    locations
                                </li>
                                <li>
                                    • Integrated payment, delivery, and customer
                                    channels
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex w-full flex-col p-6 sm:p-10 md:w-3/5 md:p-16">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                Merchant Sign Up
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Already have an account?{' '}
                                <Link
                                    href={route('merchant.login')}
                                    className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                        <img
                            src="/images/neulify-logo-big.png"
                            className="hidden h-10 w-auto rounded-lg border-2 border-gray-200 p-2 dark:block dark:border-gray-700"
                            alt="Sakto"
                        />
                    </div>

                    <form onSubmit={submit} className="space-y-8">
                        <section className="grid gap-6 lg:grid-cols-2">
                            <div className="lg:col-span-2">
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    Business Details
                                </h3>
                            </div>

                            <div className="lg:col-span-2">
                                <InputLabel
                                    htmlFor="business_name"
                                    value="Business Name"
                                />
                                <TextInput
                                    id="business_name"
                                    value={data.business_name}
                                    className="mt-1 block w-full"
                                    autoComplete="organization"
                                    required
                                    onChange={(e) =>
                                        setData('business_name', e.target.value)
                                    }
                                />
                                <InputError
                                    message={errors.business_name}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="business_type"
                                    value="Business Type"
                                />
                                <select
                                    id="business_type"
                                    value={data.business_type}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    onChange={(e) =>
                                        setData('business_type', e.target.value)
                                    }
                                >
                                    <option value="">
                                        Select business type
                                    </option>
                                    {businessTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type.charAt(0).toUpperCase() +
                                                type.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={errors.business_type}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="industry"
                                    value="Industry"
                                />
                                <TextInput
                                    id="industry"
                                    value={data.industry}
                                    className="mt-1 block w-full"
                                    onChange={(e) =>
                                        setData('industry', e.target.value)
                                    }
                                />
                                <InputError
                                    message={errors.industry}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="website" value="Website" />
                                <TextInput
                                    id="website"
                                    value={data.website}
                                    className="mt-1 block w-full"
                                    placeholder="https://"
                                    onChange={(e) =>
                                        setData('website', e.target.value)
                                    }
                                />
                                <InputError
                                    message={errors.website}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="project_identifier"
                                    value="Primary Application"
                                />
                                <select
                                    id="project_identifier"
                                    value={data.project_identifier}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    onChange={(e) =>
                                        setData(
                                            'project_identifier',
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="">Select application</option>
                                    {projects.map((project) => (
                                        <option
                                            key={project.identifier}
                                            value={project.identifier}
                                        >
                                            {project.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={errors.project_identifier}
                                    className="mt-2"
                                />
                            </div>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                            <div className="lg:col-span-2">
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    Contact Person
                                </h3>
                            </div>

                            <div className="lg:col-span-2">
                                <InputLabel
                                    htmlFor="contact_name"
                                    value="Contact Name"
                                />
                                <TextInput
                                    id="contact_name"
                                    value={data.contact_name}
                                    className="mt-1 block w-full"
                                    required
                                    onChange={(e) =>
                                        setData('contact_name', e.target.value)
                                    }
                                />
                                <InputError
                                    message={errors.contact_name}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    className="mt-1 block w-full"
                                    autoComplete="email"
                                    required
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
                                    htmlFor="phone_number"
                                    value="Phone Number"
                                />
                                <TextInput
                                    id="phone_number"
                                    value={data.phone_number}
                                    className="mt-1 block w-full"
                                    autoComplete="tel"
                                    required
                                    onChange={(e) =>
                                        setData('phone_number', e.target.value)
                                    }
                                />
                                <InputError
                                    message={errors.phone_number}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="password"
                                    value="Password"
                                />
                                <TextInput
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    required
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
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
                                />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    className="mt-1 block w-full"
                                    autoComplete="new-password"
                                    required
                                    onChange={(e) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                        </section>

                        <section className="grid gap-6 lg:grid-cols-2">
                            <div className="lg:col-span-2">
                                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                    Business Address (optional)
                                </h3>
                            </div>

                            <div className="lg:col-span-2">
                                <InputLabel htmlFor="street" value="Street" />
                                <TextInput
                                    id="street"
                                    value={data.street}
                                    className="mt-1 block w-full"
                                    onChange={(e) =>
                                        setData('street', e.target.value)
                                    }
                                />
                                <InputError
                                    message={errors.street}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="city" value="City" />
                                <TextInput
                                    id="city"
                                    value={data.city}
                                    className="mt-1 block w-full"
                                    onChange={(e) =>
                                        setData('city', e.target.value)
                                    }
                                />
                                <InputError
                                    message={errors.city}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="state"
                                    value="State / Province"
                                />
                                <TextInput
                                    id="state"
                                    value={data.state}
                                    className="mt-1 block w-full"
                                    onChange={(e) =>
                                        setData('state', e.target.value)
                                    }
                                />
                                <InputError
                                    message={errors.state}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="postal_code"
                                    value="Postal Code"
                                />
                                <TextInput
                                    id="postal_code"
                                    value={data.postal_code}
                                    className="mt-1 block w-full"
                                    onChange={(e) =>
                                        setData('postal_code', e.target.value)
                                    }
                                />
                                <InputError
                                    message={errors.postal_code}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="country" value="Country" />
                                <TextInput
                                    id="country"
                                    value={data.country}
                                    className="mt-1 block w-full"
                                    onChange={(e) =>
                                        setData('country', e.target.value)
                                    }
                                />
                                <InputError
                                    message={errors.country}
                                    className="mt-2"
                                />
                            </div>
                        </section>

                        <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                By creating an account you agree to our{' '}
                                <Link
                                    href="/terms"
                                    className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                                >
                                    Terms
                                </Link>{' '}
                                and{' '}
                                <Link
                                    href="/privacy"
                                    className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                                >
                                    Privacy Policy
                                </Link>
                                .
                            </p>
                            <PrimaryButton disabled={processing}>
                                {processing
                                    ? 'Creating account...'
                                    : 'Create Account'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}
