import { User, Project } from '@/types/index';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { PageProps } from '@/types/index';

export default function Dashboard({ auth }: PageProps) {
  return (
    <AdminLayout
      auth={{ user: auth.user, project: auth.project, modules: auth.modules }}
      title="Admin Dashboard"
      header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Admin Dashboard</h2>}
    >
      <Head title="Admin Dashboard" />

      <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 text-gray-900 dark:text-gray-100">
          <h3 className="text-lg font-medium mb-4">Welcome to the Admin Dashboard</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg shadow border border-blue-100 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Subscriptions</h4>
              <p className="text-blue-600 dark:text-blue-400">Manage user subscriptions and plans</p>
              <div className="mt-4">
                <a 
                  href={route('admin.subscriptions.index')} 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 dark:hover:bg-blue-600 focus:bg-blue-700 dark:focus:bg-blue-600 active:bg-blue-900 dark:active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                >
                  View Subscriptions
                </a>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg shadow border border-green-100 dark:border-green-800">
              <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Users</h4>
              <p className="text-green-600 dark:text-green-400">Manage user accounts and permissions</p>
              <div className="mt-4">
                <a 
                  href={route('admin.users.index')} 
                  className="inline-flex items-center px-4 py-2 bg-green-600 dark:bg-green-500 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 dark:hover:bg-green-600 focus:bg-green-700 dark:focus:bg-green-600 active:bg-green-900 dark:active:bg-green-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                >
                  Manage Users
                </a>
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg shadow border border-purple-100 dark:border-purple-800">
              <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">Settings</h4>
              <p className="text-purple-600 dark:text-purple-400">Configure application settings</p>
              <div className="mt-4">
                <a 
                  href={route('admin.settings.index')} 
                  className="inline-flex items-center px-4 py-2 bg-purple-600 dark:bg-purple-500 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-purple-700 dark:hover:bg-purple-600 focus:bg-purple-700 dark:focus:bg-purple-600 active:bg-purple-900 dark:active:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                >
                  View Settings
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-600">
              <p className="text-gray-500 dark:text-gray-400 italic">No recent activity to display.</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 