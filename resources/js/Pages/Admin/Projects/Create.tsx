import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Checkbox } from '@/Components/ui/checkbox';
import { Label } from '@/Components/ui/label';

interface Module {
  id: number;
  name: string;
  identifier: string;
}

interface Props {
  modules: Module[];
}

export default function Create({ modules }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    identifier: '',
    enabledModules: [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('admin.projects.store'));
  };

  const toggleModule = (moduleIdentifier: string) => {
    const currentModules = [...data.enabledModules];
    const index = currentModules.indexOf(moduleIdentifier);
    
    if (index === -1) {
      currentModules.push(moduleIdentifier);
    } else {
      currentModules.splice(index, 1);
    }
    
    setData('enabledModules', currentModules);
  };

  return (
    <AdminLayout
      title="Create Project"
      header={
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          Create Project
        </h2>
      }
    >
      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="identifier"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Identifier
                  </label>
                  <input
                    type="text"
                    id="identifier"
                    value={data.identifier}
                    onChange={(e) => setData('identifier', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.identifier && (
                    <p className="mt-1 text-sm text-red-600">{errors.identifier}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enabled Modules
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modules.map((module) => (
                      <div key={module.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`module-${module.id}`}
                          checked={data.enabledModules.includes(module.identifier)}
                          onCheckedChange={() => toggleModule(module.identifier)}
                        />
                        <Label htmlFor={`module-${module.id}`}>{module.name}</Label>
                      </div>
                    ))}
                  </div>
                  {errors.enabledModules && (
                    <p className="mt-1 text-sm text-red-600">{errors.enabledModules}</p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-4 mt-4">
                  <Link
                    href={route('admin.projects.index')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={processing}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 