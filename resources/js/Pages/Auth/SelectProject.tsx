import { FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';
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

            <div className="w-full max-w-md mx-auto">
                <div className="mb-8 text-center">
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

                    <PrimaryButton
                        className="w-full justify-center py-3 px-4 text-base font-medium rounded-lg"
                        disabled={processing}
                    >
                        {processing ? 'Completing Registration...' : 'Complete Registration'}
                    </PrimaryButton>
                </form>
            </div>
        </GuestLayout>
    );
} 