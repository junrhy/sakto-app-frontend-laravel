import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

export default function RegistrationDisabled() {
  return (
    <GuestLayout>
      <Head title="Registration Disabled" />

      <div className="flex w-full min-h-screen bg-white dark:bg-gray-900">
        <div className="w-full flex flex-col items-center justify-center px-8 sm:px-12 lg:px-16">
          <div className="w-full max-w-[440px] text-center">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Registration Disabled
              </h2>
              <p className="text-base text-gray-600 dark:text-gray-400 mt-4">
                User registration is currently disabled. Please contact the administrator for more information.
              </p>
            </div>

            <div className="mt-8">
              <Link
                href={route('login')}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
} 