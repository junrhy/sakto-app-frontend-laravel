import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { PageProps } from '@/types';
import { CheckCircle, AlertCircle, User, Mail, Phone } from 'lucide-react';

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
        <section className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden backdrop-blur-sm dark:backdrop-blur-md ${className}`}>
            {!hideHeader && (
                <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100 dark:from-gray-800 dark:via-blue-900/20 dark:to-indigo-900/20">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center ring-1 ring-blue-200 dark:ring-blue-800">
                                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Profile Information
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                Update your account's profile information and email address.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {alert && (
                <div className={`mx-6 mt-6 p-4 rounded-lg border backdrop-blur-sm ${
                    alert.type === 'success' 
                        ? 'bg-green-50/80 border-green-200 dark:bg-green-900/30 dark:border-green-800/50' 
                        : 'bg-red-50/80 border-red-200 dark:bg-red-900/30 dark:border-red-800/50'
                }`}>
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            {alert.type === 'success' ? (
                                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className={`text-sm font-medium ${
                                alert.type === 'success' 
                                    ? 'text-green-800 dark:text-green-200' 
                                    : 'text-red-800 dark:text-red-200'
                            }`}>
                                {alert.message}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={submit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <InputLabel htmlFor="name" value="Full Name" className="text-sm font-medium text-gray-700 dark:text-gray-200" />

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors duration-200" />
                            </div>
                            <TextInput
                                id="name"
                                className="pl-10 block w-full border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 rounded-lg transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-600"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                isFocused
                                autoComplete="name"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <InputError className="mt-1" message={errors.name} />
                    </div>

                    <div className="space-y-2">
                        <InputLabel htmlFor="email" value="Email Address" className="text-sm font-medium text-gray-700 dark:text-gray-200" />

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors duration-200" />
                            </div>
                            <TextInput
                                id="email"
                                type="email"
                                className="pl-10 block w-full border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 rounded-lg transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-600"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Enter your email address"
                            />
                        </div>

                        <InputError className="mt-1" message={errors.email} />
                    </div>
                </div>

                <div className="space-y-2">
                    <InputLabel htmlFor="contact_number" value="Contact Number" className="text-sm font-medium text-gray-700 dark:text-gray-200" />

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors duration-200" />
                        </div>
                        <TextInput
                            id="contact_number"
                            type="tel"
                            className="pl-10 block w-full border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 rounded-lg transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-600"
                            value={data.contact_number}
                            onChange={(e) => setData('contact_number', e.target.value)}
                            autoComplete="tel"
                            placeholder="Enter your contact number"
                        />
                    </div>

                    <InputError className="mt-1" message={errors.contact_number} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4 backdrop-blur-sm">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-amber-500 dark:text-amber-400 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    Your email address is unverified. Please verify your email to access all features.
                                </p>
                                <Link
                                    href={route('verification.send')}
                                    method="post"
                                    as="button"
                                    className="mt-2 inline-flex items-center text-sm font-medium text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 transition-colors duration-200"
                                >
                                    Resend verification email
                                </Link>
                            </div>
                        </div>

                        {status === 'verification-link-sent' && (
                            <div className="mt-3 p-3 bg-green-50/80 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-md backdrop-blur-sm">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 dark:text-green-400" />
                                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                                        A new verification link has been sent to your email address.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center space-x-4">
                        <PrimaryButton 
                            disabled={processing}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-500 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg dark:shadow-blue-900/25"
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </PrimaryButton>

                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-in-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="transition ease-in-out duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                                <CheckCircle className="w-4 h-4" />
                                <span className="font-medium">Saved successfully!</span>
                            </div>
                        </Transition>
                    </div>
                </div>
            </form>
        </section>
    );
}
