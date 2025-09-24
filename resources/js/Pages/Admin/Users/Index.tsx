import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { PageProps, User } from '@/types/index';
import { Menu, Transition } from '@headlessui/react';
import {
    ChevronDownIcon,
    EnvelopeIcon,
    PencilIcon,
    ShieldCheckIcon,
    ShieldExclamationIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { Link, router, useForm } from '@inertiajs/react';
import { formatDistance } from 'date-fns';
import React, { Fragment, useState } from 'react';

interface Props {
    auth: PageProps['auth'];
    users: {
        data: Array<{
            id: number;
            name: string;
            email: string;
            project_identifier: string;
            is_admin: boolean;
            email_verified_at: string | null;
            created_at: string;
            identifier: string;
            google_id: string | null;
            contact_number: string | null;
            referrer: string | null;
            theme: string | null;
            theme_color: string | null;
            credits: number;
            pending_credits: number;
        }>;
        links: any;
    };
    filters: {
        search: string;
        admin_filter: string;
        project_filter: string;
    };
    projects: Array<{
        id: number;
        name: string;
        identifier: string;
    }>;
}

export default function Index({
    auth,
    users,
    filters,
    projects,
}: Props & PageProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [showIdentifier, setShowIdentifier] = useState(false);
    const [showEmailVerified, setShowEmailVerified] = useState(false);
    const [showHiddenFields, setShowHiddenFields] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const searchForm = useForm({
        search: filters.search,
        admin_filter: filters.admin_filter,
        project_filter: filters.project_filter,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchForm.get(route('admin.users.index'), {
            preserveState: true,
        });
    };

    const resetFilters = () => {
        searchForm.setData('search', '');
        searchForm.setData('admin_filter', 'all');
        searchForm.setData('project_filter', 'all');
        searchForm.get(route('admin.users.index'), {
            preserveState: true,
        });
    };

    const openDeleteModal = (user: User) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const handleDeleteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (userToDelete) {
            router.delete(route('admin.users.destroy', userToDelete.id), {
                onSuccess: () => setShowDeleteModal(false),
            });
        }
    };

    const toggleAdminStatus = (user: User) => {
        if (user.id === auth.user.id) {
            alert('You cannot change your own admin status.');
            return;
        }

        router.get(route('admin.users.toggle-admin', user.id));
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(text);
            setTimeout(() => setCopiedId(null), 2000); // Reset after 2 seconds
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const toggleHiddenFields = () => {
        setShowHiddenFields(!showHiddenFields);
    };

    return (
        <AdminLayout>
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="mb-6 flex flex-col items-start justify-between md:flex-row md:items-center">
                                <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100 md:mb-0">
                                    User Management
                                </h3>

                                <div className="flex flex-col gap-4 sm:flex-row">
                                    <button
                                        onClick={toggleHiddenFields}
                                        className="inline-flex items-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900 dark:bg-gray-600 dark:hover:bg-gray-500 dark:focus:bg-gray-500 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800 dark:active:bg-gray-600"
                                    >
                                        {showHiddenFields
                                            ? 'Hide Fields'
                                            : 'Show Fields'}
                                    </button>
                                    <Link
                                        href={route('admin.users.create')}
                                        className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-blue-900 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:bg-blue-600 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800 dark:active:bg-blue-700"
                                    >
                                        Create New User
                                    </Link>
                                </div>
                            </div>

                            {/* Search and Filter */}
                            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                                <form
                                    onSubmit={handleSearch}
                                    className="flex flex-col gap-4 md:flex-row"
                                >
                                    <div className="flex-1">
                                        <InputLabel
                                            htmlFor="search"
                                            value="Search"
                                            className="text-gray-700 dark:text-gray-300"
                                        />
                                        <TextInput
                                            id="search"
                                            type="text"
                                            className="mt-1 block w-full border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                                            placeholder="Search by name or email"
                                            value={searchForm.data.search}
                                            onChange={(e) =>
                                                searchForm.setData(
                                                    'search',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="w-full md:w-48">
                                        <InputLabel
                                            htmlFor="admin_filter"
                                            value="Admin Status"
                                            className="text-gray-700 dark:text-gray-300"
                                        />
                                        <select
                                            id="admin_filter"
                                            className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                                            value={searchForm.data.admin_filter}
                                            onChange={(e) =>
                                                searchForm.setData(
                                                    'admin_filter',
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            <option value="all">
                                                All Users
                                            </option>
                                            <option value="admin">
                                                Admins Only
                                            </option>
                                            <option value="regular">
                                                Regular Users
                                            </option>
                                        </select>
                                    </div>

                                    <div className="w-full md:w-48">
                                        <InputLabel
                                            htmlFor="project_filter"
                                            value="Project"
                                            className="text-gray-700 dark:text-gray-300"
                                        />
                                        <select
                                            id="project_filter"
                                            className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
                                            value={
                                                searchForm.data.project_filter
                                            }
                                            onChange={(e) =>
                                                searchForm.setData(
                                                    'project_filter',
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            <option value="all">
                                                All Projects
                                            </option>
                                            {projects.map((project) => (
                                                <option
                                                    key={project.id}
                                                    value={project.identifier}
                                                >
                                                    {project.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-end gap-2">
                                        <PrimaryButton className="mt-1">
                                            Search
                                        </PrimaryButton>
                                        <SecondaryButton
                                            type="button"
                                            className="mt-1"
                                            onClick={resetFilters}
                                        >
                                            Reset
                                        </SecondaryButton>
                                    </div>
                                </form>
                            </div>

                            {/* Users Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="w-1/4 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                            >
                                                Name
                                            </th>
                                            <th
                                                scope="col"
                                                className="w-1/4 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                            >
                                                Email
                                            </th>
                                            <th
                                                scope="col"
                                                className="w-1/6 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                            >
                                                Project
                                            </th>
                                            <th
                                                scope="col"
                                                className="w-1/6 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                            >
                                                Status
                                            </th>
                                            <th
                                                scope="col"
                                                className="w-1/6 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                            >
                                                Credits
                                            </th>
                                            {showHiddenFields && (
                                                <>
                                                    <th
                                                        scope="col"
                                                        className="w-1/6 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                    >
                                                        Identifier
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="w-1/6 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                    >
                                                        Email Verified
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="w-1/6 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                    >
                                                        Google Login
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="w-1/6 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                    >
                                                        Contact
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="w-1/6 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                    >
                                                        Referrer
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="w-1/6 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                    >
                                                        Theme
                                                    </th>
                                                    <th
                                                        scope="col"
                                                        className="w-1/6 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                                    >
                                                        Theme Color
                                                    </th>
                                                </>
                                            )}
                                            <th
                                                scope="col"
                                                className="w-1/6 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                            >
                                                Registered
                                            </th>
                                            <th
                                                scope="col"
                                                className="w-1/6 px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                                            >
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                        {users.data.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={
                                                        showHiddenFields
                                                            ? 11
                                                            : 9
                                                    }
                                                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                                                >
                                                    No users found
                                                </td>
                                            </tr>
                                        ) : (
                                            users.data.map((user) => (
                                                <tr
                                                    key={user.id}
                                                    className="transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-700"
                                                >
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                        <div className="flex items-center">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {user.name}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                        <div className="text-sm text-gray-900 dark:text-gray-100">
                                                            {user.email}
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                        <div className="text-sm text-gray-900 dark:text-gray-100">
                                                            {
                                                                user.project_identifier
                                                            }
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                                user.is_admin
                                                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                                                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                            }`}
                                                        >
                                                            {user.is_admin
                                                                ? 'Admin'
                                                                : 'User'}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                        <div className="flex flex-col">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {user.credits.toLocaleString()}
                                                            </div>
                                                            {user.pending_credits >
                                                                0 && (
                                                                <div className="text-xs text-orange-600 dark:text-orange-400">
                                                                    +
                                                                    {
                                                                        user.pending_credits
                                                                    }{' '}
                                                                    pending
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    {showHiddenFields && (
                                                        <>
                                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                        {
                                                                            user.identifier
                                                                        }
                                                                    </div>
                                                                    <button
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(
                                                                                user.identifier,
                                                                            );
                                                                        }}
                                                                        className="text-gray-400 transition-colors duration-150 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                                                        title="Copy identifier"
                                                                    >
                                                                        <svg
                                                                            className="h-4 w-4"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth="2"
                                                                                d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                                                                            />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                        {user.email_verified_at
                                                                            ? formatDistance(
                                                                                  new Date(
                                                                                      user.email_verified_at,
                                                                                  ),
                                                                                  new Date(),
                                                                                  {
                                                                                      addSuffix:
                                                                                          true,
                                                                                  },
                                                                              )
                                                                            : 'Not verified'}
                                                                    </div>
                                                                    {!user.email_verified_at && (
                                                                        <button
                                                                            onClick={() =>
                                                                                router.get(
                                                                                    route(
                                                                                        'admin.users.resend-verification',
                                                                                        user.id,
                                                                                    ),
                                                                                )
                                                                            }
                                                                            className="text-sm text-blue-600 transition-colors duration-150 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                                            title="Resend verification email"
                                                                        >
                                                                            Resend
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                                <span
                                                                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                                                        user.google_id
                                                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                                    }`}
                                                                >
                                                                    {user.google_id
                                                                        ? 'Yes'
                                                                        : 'No'}
                                                                </span>
                                                            </td>
                                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {user.contact_number ||
                                                                        'N/A'}
                                                                </div>
                                                            </td>
                                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {user.referrer ||
                                                                        'N/A'}
                                                                </div>
                                                            </td>
                                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                    {user.theme ||
                                                                        'Default'}
                                                                </div>
                                                            </td>
                                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                                        {user.theme_color ||
                                                                            'Default'}
                                                                    </div>
                                                                    {user.theme_color && (
                                                                        <div
                                                                            className="h-4 w-4 rounded-full border border-gray-300 dark:border-gray-600"
                                                                            style={{
                                                                                backgroundColor:
                                                                                    user.theme_color,
                                                                            }}
                                                                        />
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </>
                                                    )}
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                        {user.created_at
                                                            ? formatDistance(
                                                                  new Date(
                                                                      user.created_at,
                                                                  ),
                                                                  new Date(),
                                                                  {
                                                                      addSuffix:
                                                                          true,
                                                                  },
                                                              )
                                                            : 'N/A'}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                                        <Menu
                                                            as="div"
                                                            className="relative inline-block text-left"
                                                        >
                                                            <div>
                                                                <Menu.Button className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:focus:ring-indigo-400">
                                                                    Actions
                                                                    <ChevronDownIcon
                                                                        className="-mr-1 ml-2 h-5 w-5"
                                                                        aria-hidden="true"
                                                                    />
                                                                </Menu.Button>
                                                            </div>
                                                            <Transition
                                                                as={Fragment}
                                                                enter="transition ease-out duration-100"
                                                                enterFrom="transform opacity-0 scale-95"
                                                                enterTo="transform opacity-100 scale-100"
                                                                leave="transition ease-in duration-75"
                                                                leaveFrom="transform opacity-100 scale-100"
                                                                leaveTo="transform opacity-0 scale-95"
                                                            >
                                                                <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
                                                                    <div className="py-1">
                                                                        <Menu.Item>
                                                                            {({
                                                                                active,
                                                                            }) => (
                                                                                <Link
                                                                                    href={route(
                                                                                        'admin.users.edit',
                                                                                        user.id,
                                                                                    )}
                                                                                    className={`${
                                                                                        active
                                                                                            ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                                                                                            : 'text-gray-700 dark:text-gray-300'
                                                                                    } group flex items-center px-4 py-2 text-sm transition-colors duration-150`}
                                                                                >
                                                                                    <PencilIcon
                                                                                        className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500"
                                                                                        aria-hidden="true"
                                                                                    />
                                                                                    Edit
                                                                                </Link>
                                                                            )}
                                                                        </Menu.Item>

                                                                        <Menu.Item>
                                                                            {({
                                                                                active,
                                                                            }) => (
                                                                                <button
                                                                                    onClick={() =>
                                                                                        router.get(
                                                                                            route(
                                                                                                'admin.users.toggle-admin',
                                                                                                user.id,
                                                                                            ),
                                                                                        )
                                                                                    }
                                                                                    className={`${
                                                                                        active
                                                                                            ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                                                                                            : 'text-gray-700 dark:text-gray-300'
                                                                                    } group flex w-full items-center px-4 py-2 text-sm transition-colors duration-150`}
                                                                                >
                                                                                    {user.is_admin ? (
                                                                                        <>
                                                                                            <ShieldExclamationIcon
                                                                                                className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500"
                                                                                                aria-hidden="true"
                                                                                            />
                                                                                            Remove
                                                                                            Admin
                                                                                        </>
                                                                                    ) : (
                                                                                        <>
                                                                                            <ShieldCheckIcon
                                                                                                className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500"
                                                                                                aria-hidden="true"
                                                                                            />
                                                                                            Make
                                                                                            Admin
                                                                                        </>
                                                                                    )}
                                                                                </button>
                                                                            )}
                                                                        </Menu.Item>

                                                                        {!user.email_verified_at && (
                                                                            <Menu.Item>
                                                                                {({
                                                                                    active,
                                                                                }) => (
                                                                                    <button
                                                                                        onClick={() =>
                                                                                            router.get(
                                                                                                route(
                                                                                                    'admin.users.resend-verification',
                                                                                                    user.id,
                                                                                                ),
                                                                                            )
                                                                                        }
                                                                                        className={`${
                                                                                            active
                                                                                                ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                                                                                                : 'text-gray-700 dark:text-gray-300'
                                                                                        } group flex w-full items-center px-4 py-2 text-sm transition-colors duration-150`}
                                                                                    >
                                                                                        <EnvelopeIcon
                                                                                            className="mr-3 h-5 w-5 text-gray-400 dark:text-gray-500"
                                                                                            aria-hidden="true"
                                                                                        />
                                                                                        Resend
                                                                                        Verification
                                                                                    </button>
                                                                                )}
                                                                            </Menu.Item>
                                                                        )}

                                                                        <Menu.Item>
                                                                            {({
                                                                                active,
                                                                            }) => (
                                                                                <button
                                                                                    onClick={() => {
                                                                                        if (
                                                                                            confirm(
                                                                                                'Are you sure you want to delete this user?',
                                                                                            )
                                                                                        ) {
                                                                                            router.delete(
                                                                                                route(
                                                                                                    'admin.users.destroy',
                                                                                                    user.id,
                                                                                                ),
                                                                                            );
                                                                                        }
                                                                                    }}
                                                                                    className={`${
                                                                                        active
                                                                                            ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                                                                            : 'text-red-600 dark:text-red-400'
                                                                                    } group flex w-full items-center px-4 py-2 text-sm transition-colors duration-150`}
                                                                                >
                                                                                    <TrashIcon
                                                                                        className="mr-3 h-5 w-5 text-red-400 dark:text-red-500"
                                                                                        aria-hidden="true"
                                                                                    />
                                                                                    Delete
                                                                                </button>
                                                                            )}
                                                                        </Menu.Item>
                                                                    </div>
                                                                </Menu.Items>
                                                            </Transition>
                                                        </Menu>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="mt-4">
                                {/* Add your pagination component here */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
