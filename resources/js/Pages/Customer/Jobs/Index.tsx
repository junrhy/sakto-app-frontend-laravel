import TextInput from '@/Components/TextInput';
import { Card } from '@/Components/ui/card';
import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

interface JobProvider {
    id: number;
    name: string;
    email: string;
    contact_number: string;
    created_at: string;
    slug: string;
    identifier: string;
}

interface JobsProps extends PageProps {
    jobs: JobProvider[];
}

export default function Jobs({ auth, jobs }: JobsProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredJobs = jobs.filter(
        (provider) =>
            provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            provider.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (provider.contact_number &&
                provider.contact_number
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())),
    );

    return (
        <CustomerLayout
            auth={auth}
            title="Jobs"
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Jobs
                </h2>
            }
        >
            <Head title="Jobs" />

            <div className="overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                <div className="p-4 text-gray-900 dark:text-gray-100 sm:p-6">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-shrink-0">
                            <h3 className="text-lg font-medium">
                                Job Providers
                            </h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Total: {filteredJobs.length}{' '}
                                {filteredJobs.length === 1
                                    ? 'provider'
                                    : 'providers'}
                            </p>
                        </div>
                        <div className="w-full sm:w-auto sm:max-w-sm">
                            <TextInput
                                type="text"
                                placeholder="Search by name, email, or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {filteredJobs.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredJobs.map((provider) => (
                                <Card
                                    key={provider.id}
                                    className="overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
                                >
                                    <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-700 sm:px-6 sm:py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 sm:h-12 sm:w-12">
                                                <span className="text-base font-medium text-indigo-600 dark:text-indigo-300 sm:text-lg">
                                                    {provider.name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="truncate text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg">
                                                    {provider.name}
                                                </h3>
                                                <p className="truncate text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                                                    {provider.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 sm:p-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <svg
                                                    className="h-4 w-4 flex-shrink-0 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                    />
                                                </svg>
                                                <span className="min-w-0 truncate text-sm text-gray-600 dark:text-gray-400">
                                                    {provider.contact_number ||
                                                        'No phone number'}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <svg
                                                    className="h-4 w-4 flex-shrink-0 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    Joined{' '}
                                                    {new Date(
                                                        provider.created_at,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-700 sm:px-6">
                                        <Link
                                            href={route(
                                                'member.short',
                                                provider.slug || provider.id,
                                            )}
                                            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                        >
                                            View Profile
                                            <svg
                                                className="ml-1 h-4 w-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </Link>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-8">
                            <svg
                                className="mx-auto h-10 w-10 text-gray-400 sm:h-12 sm:w-12"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100 sm:text-base">
                                {searchQuery
                                    ? 'No providers found'
                                    : 'No job providers available'}
                            </h3>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                                {searchQuery
                                    ? 'Try adjusting your search terms.'
                                    : 'No job providers have been added yet.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
