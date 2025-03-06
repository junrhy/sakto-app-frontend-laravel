import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import SocialButton from '@/Components/SocialButton';

interface Props {
    // Remove projects prop since it's no longer needed
}

export default function Register({}: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        project_identifier: 'trial', // Set default value to 'trial'
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

            <div className="flex w-full min-h-screen bg-white dark:bg-gray-900">
                {/* Left side - Registration Form */}
                <div className="w-full md:w-1/2 flex flex-col">
                    {/* Logo Section */}
                    <div className="p-8">
                        <Link href="/">
                            <img 
                                src="/images/tetris.png" 
                                alt="Logo" 
                                className="h-12 w-auto"
                            />
                        </Link>
                    </div>

                    {/* Form Section */}
                    <div className="flex-grow flex items-center justify-center px-8 sm:px-12 lg:px-16">
                        <div className="w-full max-w-[440px]">
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    Create an Account
                                </h2>
                                <p className="text-base text-gray-600 dark:text-gray-400 mt-2">
                                    Join us today and start your journey
                                </p>
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Name" className="text-gray-700 dark:text-gray-300 text-base" />
                                    <TextInput
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
                                        autoComplete="name"
                                        isFocused={true}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="Email" className="text-gray-700 dark:text-gray-300 text-base" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
                                        autoComplete="username"
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password" value="Password" className="text-gray-700 dark:text-gray-300 text-base" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="password_confirmation"
                                        value="Confirm Password"
                                        className="text-gray-700 dark:text-gray-300 text-base"
                                    />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.password_confirmation} className="mt-2" />
                                </div>

                                <div className="relative my-6 hidden md:block">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 text-gray-500 bg-white dark:bg-gray-900">Or continue with</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 hidden md:grid">
                                    <SocialButton
                                        provider="Google"
                                        icon="/images/google.svg"
                                        onClick={() => window.location.href = route('google.redirect')}
                                        type="button"
                                    >
                                        Google
                                    </SocialButton>
                                </div>

                                <div>
                                    <PrimaryButton
                                        className="w-full justify-center py-3 px-4 text-base font-medium rounded-lg"
                                        disabled={processing}
                                    >
                                        {processing ? 'Creating account...' : 'Create Account'}
                                    </PrimaryButton>
                                </div>

                                <div className="text-center">
                                    <Link
                                        href={route('login')}
                                        className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                                    >
                                        Already have an account? <span className="font-medium text-indigo-600 dark:text-indigo-400">Sign in</span>
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right side - Image */}
                <div className="hidden md:block md:w-1/2">
                    <div className="w-full h-full">
                        <img
                            src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                            alt="Office workspace with laptop and coffee"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
