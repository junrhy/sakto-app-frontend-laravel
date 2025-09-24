import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { PageProps } from '@/types/index';
import { Head, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';

interface Props {
    auth: PageProps['auth'];
    projects: Array<{
        id: number;
        name: string;
        identifier: string;
    }>;
}

export default function Create({ auth, projects }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        contact_number: '',
        is_admin: false,
        project_identifier: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AdminLayout
            auth={{
                user: auth.user,
                project: auth.project,
                modules: auth.modules,
            }}
            title="Create User"
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Create User
                </h2>
            }
        >
            <Head title="Create User" />

            <div className="py-4">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <Card className="border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                                    <CardTitle className="text-gray-900 dark:text-gray-100">
                                        Create User
                                    </CardTitle>
                                    <CardDescription className="text-gray-600 dark:text-gray-400">
                                        Add a new user to the system.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <form
                                        onSubmit={submit}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <InputLabel
                                                htmlFor="name"
                                                value="Name"
                                                className="text-gray-700 dark:text-gray-300"
                                            />
                                            <TextInput
                                                id="name"
                                                type="text"
                                                name="name"
                                                value={data.name}
                                                className="mt-1 block w-full border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
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
                                                className="text-gray-700 dark:text-gray-300"
                                            />
                                            <TextInput
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={data.email}
                                                className="mt-1 block w-full border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
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

                                        <div>
                                            <InputLabel
                                                htmlFor="password"
                                                value="Password"
                                                className="text-gray-700 dark:text-gray-300"
                                            />
                                            <TextInput
                                                id="password"
                                                type="password"
                                                name="password"
                                                value={data.password}
                                                className="mt-1 block w-full border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
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
                                                htmlFor="contact_number"
                                                value="Contact Number"
                                                className="text-gray-700 dark:text-gray-300"
                                            />
                                            <TextInput
                                                id="contact_number"
                                                type="text"
                                                name="contact_number"
                                                value={data.contact_number}
                                                className="mt-1 block w-full border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                                                onChange={(e) =>
                                                    setData(
                                                        'contact_number',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={errors.contact_number}
                                                className="mt-2"
                                            />
                                        </div>

                                        <div>
                                            <InputLabel
                                                htmlFor="project_identifier"
                                                value="Project"
                                                className="text-gray-700 dark:text-gray-300"
                                            />
                                            <Select
                                                value={data.project_identifier}
                                                onValueChange={(value) =>
                                                    setData(
                                                        'project_identifier',
                                                        value,
                                                    )
                                                }
                                                required
                                            >
                                                <SelectTrigger className="w-full border-gray-300 bg-white text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400">
                                                    <SelectValue
                                                        placeholder="Select a project"
                                                        className="text-gray-500 dark:text-gray-400"
                                                    />
                                                </SelectTrigger>
                                                <SelectContent className="border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                                                    {projects.map((project) => (
                                                        <SelectItem
                                                            key={project.id}
                                                            value={
                                                                project.identifier
                                                            }
                                                            className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                                                        >
                                                            {project.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={
                                                    errors.project_identifier
                                                }
                                                className="mt-2"
                                            />
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <Checkbox
                                                id="is_admin"
                                                name="is_admin"
                                                checked={data.is_admin}
                                                onChange={(e) =>
                                                    setData(
                                                        'is_admin',
                                                        e.target.checked,
                                                    )
                                                }
                                                className="border-gray-300 bg-white text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-indigo-400 dark:focus:ring-indigo-400"
                                            />
                                            <InputLabel
                                                htmlFor="is_admin"
                                                value="Admin User"
                                                className="text-gray-700 dark:text-gray-300"
                                            />
                                        </div>

                                        <div className="flex items-center justify-end gap-4">
                                            <Button
                                                variant="outline"
                                                type="button"
                                                onClick={() =>
                                                    window.history.back()
                                                }
                                                className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-indigo-400"
                                            >
                                                Create User
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
