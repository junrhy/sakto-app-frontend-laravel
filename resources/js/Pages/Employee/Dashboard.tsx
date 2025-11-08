import EmployeeLayout from '@/Layouts/Employee/EmployeeLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';

interface DashboardProps extends PageProps {
    profile?: {
        name: string;
        email: string;
    };
}

export default function Dashboard({ auth, profile }: DashboardProps) {
    return (
        <EmployeeLayout
            auth={{ user: auth.user }}
            title="Employee Dashboard"
            header={
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Welcome, {profile?.name ?? auth.user.name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Here’s what’s happening today.
                    </p>
                </div>
            }
        >
            <Head title="Employee Dashboard" />

            <div className="space-y-6">
                <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Account Information
                    </h3>
                    <dl className="mt-4 grid gap-4 text-sm text-gray-700 dark:text-gray-300 sm:grid-cols-2">
                        <div>
                            <dt className="font-medium">Name</dt>
                            <dd className="mt-1">
                                {profile?.name ?? auth.user.name}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium">Email</dt>
                            <dd className="mt-1">
                                {profile?.email ?? auth.user.email}
                            </dd>
                        </div>
                    </dl>
                </section>

                <section className="rounded-xl border border-dashed border-gray-300 p-6 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
                    Updates and tools for employees will appear here.
                </section>
            </div>
        </EmployeeLayout>
    );
}
