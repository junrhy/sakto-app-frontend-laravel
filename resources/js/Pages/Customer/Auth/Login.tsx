import ApplicationLogo from '@/Components/ApplicationLogo';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';

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
        <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-indigo-50 to-indigo-100 pt-6 dark:from-indigo-900 dark:to-indigo-800 sm:justify-center sm:pt-0">
            <Head title="Customer Login" />

            <div className="mt-6 w-full overflow-hidden border border-indigo-200 bg-white px-6 py-4 shadow-xl dark:border-indigo-700 dark:bg-gray-800 sm:max-w-md sm:rounded-lg">
                <div className="mb-6 flex justify-center">
                    <Link href="/">
                        <div className="flex items-center">
                            <ApplicationLogo className="h-20 w-20 fill-current text-indigo-800 dark:text-indigo-200" />
                            <span className="ml-2 text-2xl font-black text-gray-900 dark:text-white">
                                {hostname}{' '}
                                <span className="text-indigo-600 dark:text-indigo-400">
                                    Customer
                                </span>
                            </span>
                        </div>
                    </Link>
                </div>

                <form onSubmit={submit}>
                    <div>
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="password" value="Password" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full"
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

                    <div className="mt-4 flex items-center justify-between">
                        <Link
                            href={registerUrl}
                            className="rounded-md text-sm text-indigo-600 underline transition-colors duration-200 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-indigo-400 dark:hover:text-indigo-200 dark:focus:ring-offset-gray-800"
                        >
                            Create an account
                        </Link>

                        <PrimaryButton className="ml-4" disabled={processing}>
                            Log in
                        </PrimaryButton>
                    </div>
                </form>

                <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
                    <Link
                        href={route('login')}
                        className="block text-center text-sm text-gray-600 underline transition-colors duration-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:ring-offset-gray-800"
                    >
                        Back to regular login
                    </Link>
                </div>
            </div>
        </div>
    );
}
