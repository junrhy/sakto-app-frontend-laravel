import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('employee.register.store'));
    };

    return (
        <GuestLayout>
            <Head title="Employee Registration" />

            <div className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center gap-8 px-6 py-12">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">Create your employee account</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Gain access to your workspace tools and company updates.
                    </p>
                </div>

                <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="space-y-6">
                        <div>
                            <InputLabel htmlFor="name" value="Full Name" />
                            <TextInput
                                id="name"
                                value={data.name}
                                className="mt-1 block w-full"
                                autoComplete="name"
                                required
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            <InputError message={errors.name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Work Email" />
                            <TextInput
                                id="email"
                                type="email"
                                value={data.email}
                                className="mt-1 block w-full"
                                autoComplete="email"
                                required
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Password" />
                            <TextInput
                                id="password"
                                type="password"
                                value={data.password}
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                required
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                className="mt-1 block w-full"
                                required
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                            />
                        </div>

                        <PrimaryButton className="w-full justify-center" disabled={processing}>
                            {processing ? 'Creating account...' : 'Create account'}
                        </PrimaryButton>

                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                            Already have access?{' '}
                            <Link href={route('employee.login')} className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
