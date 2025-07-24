import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Project } from '@/types/index.d';
import PrimaryButton from '@/Components/PrimaryButton';
import { parseEnabledModules } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/Components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/Components/ui/alert-dialog";

interface Props {
  projects: {
    data: Project[];
    links: any;
  };
}

export default function Index({ projects }: Props) {
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

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
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Projects
        </h2>
      }
    >
      <Head title="Projects" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Project List</h3>
                <Link href={route('admin.projects.create')}>
                  <PrimaryButton>Create Project</PrimaryButton>
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Identifier
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Modules
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Users
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {projects.data.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {project.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {project.identifier}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {parseEnabledModules(project.enabledModules).length} modules
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="max-w-xs">
                                  <p className="font-medium mb-1 text-gray-900 dark:text-gray-100">Enabled Modules:</p>
                                  <ol className="list-decimal list-inside">
                                    {parseEnabledModules(project.enabledModules).map((module) => (
                                      <li key={module} className="text-sm text-gray-700 dark:text-gray-300">
                                        {module}
                                      </li>
                                    ))}
                                  </ol>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {project.users_count}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              href={route('admin.projects.edit', project.id)}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(project)}
                              className={`${
                                project.users_count > 0 
                                  ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed' 
                                  : 'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300'
                              } transition-colors`}
                              disabled={project.users_count > 0}
                              title={project.users_count > 0 ? 'Cannot delete project with users' : 'Delete project'}
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

      <AlertDialog open={!!projectToDelete} onOpenChange={() => setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              {projectToDelete && ` "${projectToDelete.name}"`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
} 