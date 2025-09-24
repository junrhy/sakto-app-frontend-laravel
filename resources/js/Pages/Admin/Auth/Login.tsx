import ApplicationLogo from '@/Components/ApplicationLogo';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';
import { Toaster } from 'sonner';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.login.attempt'));
    };

    return (
        <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-gray-50 to-gray-100 pt-6 dark:from-gray-900 dark:to-gray-800 sm:justify-center sm:pt-0">
            <Head title="Admin Login" />
            <Toaster richColors />

            <div className="mt-6 w-full overflow-hidden border border-gray-200 bg-white px-6 py-4 shadow-xl dark:border-gray-700 dark:bg-gray-800 sm:max-w-md sm:rounded-lg">
                <div className="mb-6 flex justify-center">
                    <Link href="/">
                        <div className="flex items-center">
                            <ApplicationLogo className="h-20 w-20 fill-current text-gray-800 dark:text-gray-200" />
                            <span className="ml-2 text-2xl font-black text-gray-900 dark:text-white">
                                Sakto{' '}
                                <span className="text-blue-600 dark:text-blue-400">
                                    Admin
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

                    <div className="mt-4 flex items-center justify-end">
                        <Link
                            href={route('login')}
                            className="rounded-md text-sm text-gray-600 underline transition-colors duration-200 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-200 dark:focus:ring-offset-gray-800"
                        >
                            Back to regular login
                        </Link>

                        <PrimaryButton className="ml-4" disabled={processing}>
                            Log in
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
