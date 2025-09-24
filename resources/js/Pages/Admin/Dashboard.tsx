import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { PageProps } from '@/types/index';
import { Head } from '@inertiajs/react';

export default function Dashboard({ auth }: PageProps) {
    return (
        <AdminLayout
            auth={{
                user: auth.user,
                project: auth.project,
                modules: auth.modules,
            }}
            title="Admin Dashboard"
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Admin Dashboard
                </h2>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                <div className="p-6 text-gray-900 dark:text-gray-100">
                    <h3 className="mb-4 text-lg font-medium">
                        Welcome to the Admin Dashboard
                    </h3>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border border-blue-100 bg-blue-50 p-6 shadow dark:border-blue-800 dark:bg-blue-900/20">
                            <h4 className="mb-2 font-semibold text-blue-800 dark:text-blue-300">
                                Subscriptions
                            </h4>
                            <p className="text-blue-600 dark:text-blue-400">
                                Manage user subscriptions and plans
                            </p>
                            <div className="mt-4">
                                <a
                                    href={route('admin.subscriptions.index')}
                                    className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-blue-900 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:bg-blue-600 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800 dark:active:bg-blue-700"
                                >
                                    View Subscriptions
                                </a>
                            </div>
                        </div>

                        <div className="rounded-lg border border-green-100 bg-green-50 p-6 shadow dark:border-green-800 dark:bg-green-900/20">
                            <h4 className="mb-2 font-semibold text-green-800 dark:text-green-300">
                                Users
                            </h4>
                            <p className="text-green-600 dark:text-green-400">
                                Manage user accounts and permissions
                            </p>
                            <div className="mt-4">
                                <a
                                    href={route('admin.users.index')}
                                    className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-green-700 focus:bg-green-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-green-900 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:bg-green-600 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800 dark:active:bg-green-700"
                                >
                                    Manage Users
                                </a>
                            </div>
                        </div>

                        <div className="rounded-lg border border-orange-100 bg-orange-50 p-6 shadow dark:border-orange-800 dark:bg-orange-900/20">
                            <h4 className="mb-2 font-semibold text-orange-800 dark:text-orange-300">
                                Apps
                            </h4>
                            <p className="text-orange-600 dark:text-orange-400">
                                Manage application modules and features
                            </p>
                            <div className="mt-4">
                                <a
                                    href={route('admin.apps.index')}
                                    className="inline-flex items-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-orange-700 focus:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-orange-900 dark:bg-orange-500 dark:hover:bg-orange-600 dark:focus:bg-orange-600 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800 dark:active:bg-orange-700"
                                >
                                    Manage Apps
                                </a>
                            </div>
                        </div>

                        <div className="rounded-lg border border-purple-100 bg-purple-50 p-6 shadow dark:border-purple-800 dark:bg-purple-900/20">
                            <h4 className="mb-2 font-semibold text-purple-800 dark:text-purple-300">
                                Settings
                            </h4>
                            <p className="text-purple-600 dark:text-purple-400">
                                Configure application settings
                            </p>
                            <div className="mt-4">
                                <a
                                    href={route('admin.settings.index')}
                                    className="inline-flex items-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-purple-700 focus:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-purple-900 dark:bg-purple-500 dark:hover:bg-purple-600 dark:focus:bg-purple-600 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800 dark:active:bg-purple-700"
                                >
                                    View Settings
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="mb-4 text-lg font-medium">
                            Recent Activity
                        </h3>
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-6 shadow dark:border-gray-600 dark:bg-gray-700">
                            <p className="italic text-gray-500 dark:text-gray-400">
                                No recent activity to display.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
