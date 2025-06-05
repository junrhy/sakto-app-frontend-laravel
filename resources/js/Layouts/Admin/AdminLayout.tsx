import React, { PropsWithChildren, ReactNode, useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps, User, Project } from '@/types/index';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Toaster } from 'sonner';

interface AdminLayoutProps {
  auth?: {
    user?: User;
    project?: Project;
    modules?: string[];
  };
  header?: ReactNode;
  title?: string;
}

export default function AdminLayout({
  auth,
  header,
  children,
  title = 'Admin Dashboard',
}: PropsWithChildren<AdminLayoutProps>) {
  const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
  const user = auth?.user;

  return (
    <div className="min-h-screen bg-gray-100">
      <Head title={title} />
      <Toaster richColors />

      <nav className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex">
              <div className="shrink-0 flex items-center">
                <Link href="/admin/dashboard" className="transition-transform hover:scale-105">
                  <div className="flex items-center">
                    <ApplicationLogo className="block h-7 w-auto sm:h-9 fill-current text-white" />
                    <span className="text-lg sm:text-xl font-black ml-1 sm:ml-2 text-white">
                      Sakto <span className="text-blue-500">Admin</span>
                    </span>
                  </div>
                </Link>
              </div>

              <div className="hidden space-x-2 sm:space-x-4 md:space-x-8 sm:-my-px sm:ml-4 md:ml-10 sm:flex">
                <NavLink
                  href={route('admin.dashboard')}
                  active={route().current('admin.dashboard')}
                  className={`text-white hover:text-white transition-colors duration-150 px-2 sm:px-3 py-1 sm:py-2 ${
                    route().current('admin.dashboard') 
                      ? 'bg-white text-black font-medium border-transparent' 
                      : 'border-transparent'
                  }`}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  href={route('admin.subscriptions.index')}
                  active={route().current('admin.subscriptions.index')}
                  className={`text-white hover:text-white transition-colors duration-150 px-2 sm:px-3 py-1 sm:py-2 ${
                    route().current('admin.subscriptions.index') 
                      ? 'bg-white text-black font-medium border-transparent' 
                      : 'border-transparent'
                  }`}
                >
                  Subscriptions
                </NavLink>
                <NavLink
                  href={route('admin.users.index')}
                  active={route().current('admin.users.index') || route().current('admin.users.create') || route().current('admin.users.edit')}
                  className={`text-white hover:text-white transition-colors duration-150 px-2 sm:px-3 py-1 sm:py-2 ${
                    route().current('admin.users.index') || route().current('admin.users.create') || route().current('admin.users.edit')
                      ? 'bg-white text-black font-medium border-transparent' 
                      : 'border-transparent'
                  }`}
                >
                  Users
                </NavLink>
                <NavLink
                  href={route('admin.settings.index')}
                  active={route().current('admin.settings.index')}
                  className={`text-white hover:text-white transition-colors duration-150 px-2 sm:px-3 py-1 sm:py-2 ${
                    route().current('admin.settings.index')
                      ? 'bg-white text-black font-medium border-transparent' 
                      : 'border-transparent'
                  }`}
                >
                  Settings
                </NavLink>
              </div>
            </div>

            <div className="hidden sm:flex sm:items-center sm:ml-6">
              <div className="ml-3 relative">
                <Dropdown>
                  <Dropdown.Trigger>
                    <span className="inline-flex rounded-md">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white/90 hover:text-white focus:outline-none transition ease-in-out duration-150"
                      >
                        {user?.name}

                        <svg
                          className="ml-2 -mr-0.5 h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </span>
                  </Dropdown.Trigger>

                  <Dropdown.Content>
                    <Dropdown.Link href={route('home')}>
                      Return to App
                    </Dropdown.Link>
                    <Dropdown.Link href={route('admin.logout')} method="post" as="button">
                      Log Out
                    </Dropdown.Link>
                  </Dropdown.Content>
                </Dropdown>
              </div>
            </div>

            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                className="inline-flex items-center justify-center p-1.5 sm:p-2 rounded-md text-white/80 hover:text-white hover:bg-white/10 focus:outline-none focus:bg-white/10 focus:text-white transition duration-150 ease-in-out"
              >
                <svg className="h-5 w-5 sm:h-6 sm:w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path
                    className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                  <path
                    className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden bg-gray-900'}>
          <div className="pt-2 pb-3 space-y-1">
            <ResponsiveNavLink
              href={route('admin.dashboard')}
              active={route().current('admin.dashboard')}
              className={`text-white hover:text-white`}
            >
              Dashboard
            </ResponsiveNavLink>
            <ResponsiveNavLink
              href={route('admin.subscriptions.index')}
              active={route().current('admin.subscriptions.index')}
              className={`text-white hover:text-white`}
            >
              Subscriptions
            </ResponsiveNavLink>
            <ResponsiveNavLink
              href={route('admin.users.index')}
              active={route().current('admin.users.index') || route().current('admin.users.create') || route().current('admin.users.edit')}
              className={`text-white hover:text-white`}
            >
              Users
            </ResponsiveNavLink>
            <ResponsiveNavLink
              href={route('admin.settings.index')}
              active={route().current('admin.settings.index')}
              className={`text-white hover:text-white`}
            >
              Settings
            </ResponsiveNavLink>
          </div>

          <div className="pt-4 pb-1 border-t border-gray-700">
            <div className="px-4">
              <div className="font-medium text-base text-white">{user?.name}</div>
              <div className="font-medium text-sm text-white/70">{user?.email}</div>
            </div>

            <div className="mt-3 space-y-1">
              <ResponsiveNavLink
                href={route('home')}
                className="text-white hover:text-white hover:bg-white/10 px-4 py-2 flex items-center"
              >
                Return to App
              </ResponsiveNavLink>
              <ResponsiveNavLink
                method="post"
                href={route('admin.logout')}
                className="text-white hover:text-white hover:bg-white/10 px-4 py-2 flex items-center"
                as="button"
              >
                Log Out
              </ResponsiveNavLink>
            </div>
          </div>
        </div>
      </nav>

      {header && (
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{header}</div>
        </header>
      )}

      <main>
        <div className="py-6">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
} 