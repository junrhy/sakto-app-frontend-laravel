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

interface Props {
  auth: PageProps['auth'];
  users: {
    data: User[];
    links: any[];
    meta: {
      current_page: number;
      from: number;
      last_page: number;
      links: any[];
      path: string;
      per_page: number;
      to: number;
      total: number;
    };
  };
  filters: {
    search: string;
    admin_filter: string;
  };
}

export default function Index({ auth, users, filters }: Props) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const searchForm = useForm({
    search: filters.search,
    admin_filter: filters.admin_filter,
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

  return (
    <AdminLayout
      auth={{ user: auth.user, project: auth.project, modules: auth.modules }}
      title="Manage Users"
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Manage Users</h2>}
    >
      <Head title="Manage Users" />

      <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
        <div className="p-6 text-gray-900">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h3 className="text-lg font-medium mb-4 md:mb-0">User Management</h3>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={route('admin.users.create')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
              >
                Create New User
              </Link>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <InputLabel htmlFor="search" value="Search" />
                <TextInput
                  id="search"
                  type="text"
                  className="mt-1 block w-full"
                  placeholder="Search by name or email"
                  value={searchForm.data.search}
                  onChange={(e) => searchForm.setData('search', e.target.value)}
                />
              </div>
              
              <div className="w-full md:w-48">
                <InputLabel htmlFor="admin_filter" value="Admin Status" />
                <select
                  id="admin_filter"
                  className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                  value={searchForm.data.admin_filter}
                  onChange={(e) => searchForm.setData('admin_filter', e.target.value)}
                >
                  <option value="all">All Users</option>
                  <option value="admin">Admins Only</option>
                  <option value="regular">Regular Users</option>
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.data.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_admin ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                          {user.is_admin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.created_at ? formatDistance(new Date(user.created_at), new Date(), { addSuffix: true }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={route('admin.users.edit', user.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </Link>
                          
                          <button
                            onClick={() => toggleAdminStatus(user)}
                            className={`${user.is_admin ? 'text-orange-600 hover:text-orange-900' : 'text-blue-600 hover:text-blue-900'}`}
                            disabled={user.id === auth.user.id}
                          >
                            {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                          </button>
                          
                          {user.id !== auth.user.id && (
                            <button
                              onClick={() => openDeleteModal(user)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6">
            <Pagination links={users.links} />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <form onSubmit={handleDeleteSubmit} className="p-6">
          <h2 className="text-lg font-medium text-gray-900">
            Are you sure you want to delete this user?
          </h2>
          
          <p className="mt-1 text-sm text-gray-600">
            This action cannot be undone. All data associated with this user will be permanently deleted.
          </p>
          
          {userToDelete && (
            <div className="mt-4 bg-gray-50 p-4 rounded-md">
              <p><strong>Name:</strong> {userToDelete.name}</p>
              <p><strong>Email:</strong> {userToDelete.email}</p>
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <SecondaryButton onClick={() => setShowDeleteModal(false)}>Cancel</SecondaryButton>
            <DangerButton className="ml-3" disabled={!userToDelete}>
              Delete User
            </DangerButton>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
} 