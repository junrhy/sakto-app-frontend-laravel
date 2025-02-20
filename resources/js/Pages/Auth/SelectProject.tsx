import { FormEventHandler } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';

interface Project {
    identifier: string;
    name: string;
}

interface Props {
    projects: Project[];
    googleUser: {
        name: string;
        email: string;
        google_id: string;
    };
}

export default function SelectProject({ projects, googleUser }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        project_identifier: '',
        ...googleUser
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('google.register'));
    };

    return (
        <GuestLayout>
            <Head title="Select Project" />

            <div className="flex w-full min-h-screen bg-white dark:bg-gray-900">
                {/* Left side - Project Selection Form */}
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
                                    Almost there!
                                </h2>
                                <p className="text-base text-gray-600 dark:text-gray-400 mt-2">
                                    Please select a project to complete your registration
                                </p>
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="project_identifier" value="Project" className="text-gray-700 dark:text-gray-300 text-base" />
                                    <select
                                        id="project_identifier"
                                        name="project_identifier"
                                        value={data.project_identifier}
                                        className="mt-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base"
                                        onChange={(e) => setData('project_identifier', e.target.value)}
                                        required
                                    >
                                        <option value="">Select a project</option>
                                        {projects.map((project) => (
                                            <option key={project.identifier} value={project.identifier}>
                                                {project.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.project_identifier} className="mt-2" />
                                </div>

                                <div>
                                    <PrimaryButton
                                        className="w-full justify-center py-3 px-4 text-base font-medium rounded-lg"
                                        disabled={processing}
                                    >
                                        {processing ? 'Completing Registration...' : 'Complete Registration'}
                                    </PrimaryButton>
                                </div>

                                <div className="text-center">
                                    <Link
                                        href={route('login')}
                                        className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                                    >
                                        Changed your mind? <span className="font-medium text-indigo-600 dark:text-indigo-400">Sign in instead</span>
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