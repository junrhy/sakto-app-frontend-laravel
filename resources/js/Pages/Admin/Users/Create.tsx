import { User, Project } from '@/types/index';
import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { PageProps } from '@/types/index';
import { Link } from '@inertiajs/react';

interface Props {
  auth: PageProps['auth'];
}

export default function Create({ auth }: Props) {
  const form = useForm({
    name: '',
    email: '',
    password: '',
    contact_number: '',
    is_admin: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.post(route('admin.users.store'));
  };

  return (
    <AdminLayout
      auth={{ user: auth.user, project: auth.project, modules: auth.modules }}
      title="Create User"
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Create User</h2>}
    >
      <Head title="Create User" />

      <div className="py-4">
        <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <InputLabel htmlFor="name" value="Name" />
                  <TextInput
                    id="name"
                    type="text"
                    className="mt-1 block w-full"
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.target.value)}
                    required
                    autoFocus
                  />
                  <InputError message={form.errors.name} className="mt-2" />
                </div>

                <div className="mb-6">
                  <InputLabel htmlFor="email" value="Email" />
                  <TextInput
                    id="email"
                    type="email"
                    className="mt-1 block w-full"
                    value={form.data.email}
                    onChange={(e) => form.setData('email', e.target.value)}
                    required
                  />
                  <InputError message={form.errors.email} className="mt-2" />
                </div>

                <div className="mb-6">
                  <InputLabel htmlFor="password" value="Password" />
                  <TextInput
                    id="password"
                    type="password"
                    className="mt-1 block w-full"
                    value={form.data.password}
                    onChange={(e) => form.setData('password', e.target.value)}
                    required
                  />
                  <InputError message={form.errors.password} className="mt-2" />
                </div>

                <div className="mb-6">
                  <InputLabel htmlFor="contact_number" value="Contact Number (Optional)" />
                  <TextInput
                    id="contact_number"
                    type="text"
                    className="mt-1 block w-full"
                    value={form.data.contact_number}
                    onChange={(e) => form.setData('contact_number', e.target.value)}
                  />
                  <InputError message={form.errors.contact_number} className="mt-2" />
                </div>

                <div className="mb-6">
                  <div className="flex items-center">
                    <Checkbox
                      id="is_admin"
                      checked={form.data.is_admin}
                      onChange={(e) => form.setData('is_admin', e.target.checked)}
                    />
                    <InputLabel htmlFor="is_admin" value="Admin User" className="ml-2" />
                  </div>
                  <InputError message={form.errors.is_admin} className="mt-2" />
                </div>

                <div className="flex items-center justify-end mt-6">
                  <Link
                    href={route('admin.users.index')}
                    className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </Link>

                  <PrimaryButton className="ml-4" disabled={form.processing}>
                    Create User
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 