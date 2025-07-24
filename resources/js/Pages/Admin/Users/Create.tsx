import { User, Project } from '@/types/index';
import React, { FormEvent } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Button } from '@/Components/ui/button';

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
      auth={{ user: auth.user, project: auth.project, modules: auth.modules }}
      title="Create User"
      header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Create User</h2>}
    >
      <Head title="Create User" />

      <div className="py-4">
        <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 text-gray-900 dark:text-gray-100">
              <Card>
                <CardHeader>
                  <CardTitle>Create User</CardTitle>
                  <CardDescription>Add a new user to the system.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submit} className="space-y-6">
                    <div>
                      <InputLabel htmlFor="name" value="Name" />
                      <TextInput
                        id="name"
                        type="text"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                      />
                      <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div>
                      <InputLabel htmlFor="email" value="Email" />
                      <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                      />
                      <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                      <InputLabel htmlFor="password" value="Password" />
                      <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                      />
                      <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div>
                      <InputLabel htmlFor="contact_number" value="Contact Number" />
                      <TextInput
                        id="contact_number"
                        type="text"
                        name="contact_number"
                        value={data.contact_number}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('contact_number', e.target.value)}
                      />
                      <InputError message={errors.contact_number} className="mt-2" />
                    </div>

                    <div>
                      <InputLabel htmlFor="project_identifier" value="Project" />
                      <Select
                        value={data.project_identifier}
                        onValueChange={(value) => setData('project_identifier', value)}
                        required
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.identifier}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <InputError message={errors.project_identifier} className="mt-2" />
                    </div>

                    <div className="flex items-center gap-4">
                      <Checkbox
                        id="is_admin"
                        name="is_admin"
                        checked={data.is_admin}
                        onChange={(e) => setData('is_admin', e.target.checked)}
                      />
                      <InputLabel htmlFor="is_admin" value="Admin User" />
                    </div>

                    <div className="flex items-center justify-end gap-4">
                      <Button variant="outline" type="button" onClick={() => window.history.back()}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={processing}>
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