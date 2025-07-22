import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { PageProps } from '@/types';

interface User {
    name: string;
    email: string;
    email_verified_at: string | null;
    contact_number?: string;
}

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
    hideHeader?: boolean;
}

export default function UpdateProfileInformationForm({ mustVerifyEmail, status, className = '', hideHeader = false }: Props) {
    const user = usePage<{ auth: { user: any } }>().props.auth.user;
    const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    
    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            contact_number: (user as any).contact_number || '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setAlert(null);
        
        patch(route('profile.update'), {
            onSuccess: () => {
                setAlert({
                    type: 'success',
                    message: 'Profile information updated successfully.'
                });
            },
            onError: () => {
                setAlert({
                    type: 'error',
                    message: 'Failed to update profile information.'
                });
            }
        });
    };

    return (
        <section className={className}>
            {!hideHeader && (
                <header>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Profile Information
                    </h2>

                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Update your account's profile information and email address.
                    </p>
                </header>
            )}

            {alert && (
                <div className={`mt-4 p-4 rounded-md ${
                    alert.type === 'success' 
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300' 
                        : 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                }`}>
                    {alert.message}
                </div>
            )}

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div>
                    <InputLabel htmlFor="contact_number" value="Contact Number" />

                    <TextInput
                        id="contact_number"
                        type="tel"
                        className="mt-1 block w-full"
                        value={data.contact_number}
                        onChange={(e) => setData('contact_number', e.target.value)}
                        autoComplete="tel"
                    />

                    <InputError className="mt-2" message={errors.contact_number} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                A new verification link has been sent to your
                                email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
