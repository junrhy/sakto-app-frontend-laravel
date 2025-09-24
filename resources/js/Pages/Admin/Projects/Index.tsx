import PrimaryButton from '@/Components/PrimaryButton';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/Components/ui/tooltip';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { parseEnabledModules } from '@/lib/utils';
import { Project } from '@/types/index.d';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface Props {
    projects: {
        data: Project[];
        links: any;
    };
}

export default function Index({ projects }: Props) {
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(
        null,
    );

    const handleDelete = (project: Project) => {
        setProjectToDelete(project);
    };

    const confirmDelete = () => {
        if (projectToDelete) {
            router.delete(route('admin.projects.destroy', projectToDelete.id));
            setProjectToDelete(null);
        }
    };

    return (
        <AdminLayout
            title="Projects"
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Projects
                </h2>
            }
        >
            <Head title="Projects" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    Project List
                                </h3>
                                <Link href={route('admin.projects.create')}>
                                    <PrimaryButton>
                                        Create Project
                                    </PrimaryButton>
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                            >
                                                Name
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                            >
                                                Identifier
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                            >
                                                Modules
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                            >
                                                Users
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                            >
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                        {projects.data.map((project) => (
                                            <tr
                                                key={project.id}
                                                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                            >
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {project.name}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {project.identifier}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {
                                                                        parseEnabledModules(
                                                                            project.enabledModules,
                                                                        ).length
                                                                    }{' '}
                                                                    modules
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <div className="max-w-xs">
                                                                    <p className="mb-1 font-medium text-gray-900 dark:text-gray-100">
                                                                        Enabled
                                                                        Modules:
                                                                    </p>
                                                                    <ol className="list-inside list-decimal">
                                                                        {parseEnabledModules(
                                                                            project.enabledModules,
                                                                        ).map(
                                                                            (
                                                                                module,
                                                                            ) => (
                                                                                <li
                                                                                    key={
                                                                                        module
                                                                                    }
                                                                                    className="text-sm text-gray-700 dark:text-gray-300"
                                                                                >
                                                                                    {
                                                                                        module
                                                                                    }
                                                                                </li>
                                                                            ),
                                                                        )}
                                                                    </ol>
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {project.users_count}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={route(
                                                                'admin.projects.edit',
                                                                project.id,
                                                            )}
                                                            className="text-indigo-600 transition-colors hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    project,
                                                                )
                                                            }
                                                            className={`${
                                                                project.users_count >
                                                                0
                                                                    ? 'cursor-not-allowed text-gray-400 dark:text-gray-500'
                                                                    : 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
                                                            } transition-colors`}
                                                            disabled={
                                                                project.users_count >
                                                                0
                                                            }
                                                            title={
                                                                project.users_count >
                                                                0
                                                                    ? 'Cannot delete project with users'
                                                                    : 'Delete project'
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AlertDialog
                open={!!projectToDelete}
                onOpenChange={() => setProjectToDelete(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the project
                            {projectToDelete && ` "${projectToDelete.name}"`}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
