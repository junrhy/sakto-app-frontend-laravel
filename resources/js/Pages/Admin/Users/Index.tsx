import { User, Project } from '@/types/index';
import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Pagination from '@/Components/Pagination';
import { PageProps } from '@/types/index';
import { formatDistance } from 'date-fns';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ChevronDownIcon, PencilIcon, TrashIcon, ShieldCheckIcon, ShieldExclamationIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

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

export default function Index({ auth, users, filters, projects }: Props & PageProps) {
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
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h3 className="text-lg font-medium mb-4 md:mb-0 text-gray-900 dark:text-gray-100">User Management</h3>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={toggleHiddenFields}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 dark:bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 dark:hover:bg-gray-500 focus:bg-gray-700 dark:focus:bg-gray-500 active:bg-gray-900 dark:active:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                  >
                    {showHiddenFields ? 'Hide Fields' : 'Show Fields'}
                  </button>
                  <Link
                    href={route('admin.users.create')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 dark:hover:bg-blue-600 focus:bg-blue-700 dark:focus:bg-blue-600 active:bg-blue-900 dark:active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                  >
                    Create New User
                  </Link>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6 border border-gray-200 dark:border-gray-600">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <InputLabel htmlFor="search" value="Search" className="text-gray-700 dark:text-gray-300" />
                    <TextInput
                      id="search"
                      type="text"
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      placeholder="Search by name or email"
                      value={searchForm.data.search}
                      onChange={(e) => searchForm.setData('search', e.target.value)}
                    />
                  </div>
                  
                  <div className="w-full md:w-48">
                    <InputLabel htmlFor="admin_filter" value="Admin Status" className="text-gray-700 dark:text-gray-300" />
                    <select
                      id="admin_filter"
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded-md shadow-sm"
                      value={searchForm.data.admin_filter}
                      onChange={(e) => searchForm.setData('admin_filter', e.target.value)}
                    >
                      <option value="all">All Users</option>
                      <option value="admin">Admins Only</option>
                      <option value="regular">Regular Users</option>
                    </select>
                  </div>

                  <div className="w-full md:w-48">
                    <InputLabel htmlFor="project_filter" value="Project" className="text-gray-700 dark:text-gray-300" />
                    <select
                      id="project_filter"
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded-md shadow-sm"
                      value={searchForm.data.project_filter}
                      onChange={(e) => searchForm.setData('project_filter', e.target.value)}
                    >
                      <option value="all">All Projects</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.identifier}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-end gap-2">
                    <PrimaryButton className="mt-1">Search</PrimaryButton>
                    <SecondaryButton type="button" className="mt-1" onClick={resetFilters}>Reset</SecondaryButton>
                  </div>
                </form>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/4">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/4">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/6">
                        Project
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/6">
                        Status
                      </th>
                      {showHiddenFields && (
                        <>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/6">
                            Identifier
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/6">
                            Email Verified
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/6">
                            Google Login
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/6">
                            Contact
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/6">
                            Referrer
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/6">
                            Theme
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/6">
                            Theme Color
                          </th>
                        </>
                      )}
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/6">
                        Registered
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-1/6">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.data.length === 0 ? (
                      <tr>
                        <td colSpan={showHiddenFields ? 10 : 8} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.data.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="text-sm text-gray-900 dark:text-gray-100">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="text-sm text-gray-900 dark:text-gray-100">{user.project_identifier}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.is_admin 
                                ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' 
                                : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            }`}>
                              {user.is_admin ? 'Admin' : 'User'}
                            </span>
                          </td>
                          {showHiddenFields && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{user.identifier}</div>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(user.identifier);
                                    }}
                                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-150"
                                    title="Copy identifier"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {user.email_verified_at ? formatDistance(new Date(user.email_verified_at), new Date(), { addSuffix: true }) : 'Not verified'}
                                  </div>
                                  {!user.email_verified_at && (
                                    <button
                                      onClick={() => router.get(route('admin.users.resend-verification', user.id))}
                                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-sm transition-colors duration-150"
                                      title="Resend verification email"
                                    >
                                      Resend
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.google_id 
                                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' 
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                                }`}>
                                  {user.google_id ? 'Yes' : 'No'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.contact_number || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.referrer || 'N/A'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.theme || 'Default'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm text-gray-500 dark:text-gray-400">{user.theme_color || 'Default'}</div>
                                  {user.theme_color && (
                                    <div 
                                      className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600" 
                                      style={{ backgroundColor: user.theme_color }}
                                    />
                                  )}
                                </div>
                              </td>
                            </>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {user.created_at ? formatDistance(new Date(user.created_at), new Date(), { addSuffix: true }) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Menu as="div" className="relative inline-block text-left">
                              <div>
                                <Menu.Button className="inline-flex justify-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-150">
                                  Actions
                                  <ChevronDownIcon className="w-5 h-5 ml-2 -mr-1" aria-hidden="true" />
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
                                <Menu.Items className="absolute right-0 z-10 w-56 mt-2 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none">
                                  <div className="py-1">
                                    <Menu.Item>
                                      {({ active }) => (
                                        <Link
                                          href={route('admin.users.edit', user.id)}
                                          className={`${
                                            active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
                                          } group flex items-center px-4 py-2 text-sm transition-colors duration-150`}
                                        >
                                          <PencilIcon className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                                          Edit
                                        </Link>
                                      )}
                                    </Menu.Item>

                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() => router.get(route('admin.users.toggle-admin', user.id))}
                                          className={`${
                                            active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
                                          } group flex items-center w-full px-4 py-2 text-sm transition-colors duration-150`}
                                        >
                                          {user.is_admin ? (
                                            <>
                                              <ShieldExclamationIcon className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                                              Remove Admin
                                            </>
                                          ) : (
                                            <>
                                              <ShieldCheckIcon className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                                              Make Admin
                                            </>
                                          )}
                                        </button>
                                      )}
                                    </Menu.Item>

                                    {!user.email_verified_at && (
                                      <Menu.Item>
                                        {({ active }) => (
                                          <button
                                            onClick={() => router.get(route('admin.users.resend-verification', user.id))}
                                            className={`${
                                              active ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
                                            } group flex items-center w-full px-4 py-2 text-sm transition-colors duration-150`}
                                          >
                                            <EnvelopeIcon className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                                            Resend Verification
                                          </button>
                                        )}
                                      </Menu.Item>
                                    )}

                                    <Menu.Item>
                                      {({ active }) => (
                                        <button
                                          onClick={() => {
                                            if (confirm('Are you sure you want to delete this user?')) {
                                              router.delete(route('admin.users.destroy', user.id));
                                            }
                                          }}
                                          className={`${
                                            active ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'text-red-600 dark:text-red-400'
                                          } group flex items-center w-full px-4 py-2 text-sm transition-colors duration-150`}
                                        >
                                          <TrashIcon className="w-5 h-5 mr-3 text-red-400 dark:text-red-500" aria-hidden="true" />
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