import ApplicationLogo from '@/Components/ApplicationLogo';
import { User } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode } from 'react';
import { Toaster } from 'sonner';

interface EmployeeLayoutProps {
    auth?: {
        user?: User;
    };
    title?: string;
    header?: ReactNode;
}

export default function EmployeeLayout({ auth, title = 'Employee Dashboard', header, children }: PropsWithChildren<EmployeeLayoutProps>) {
    const page = usePage<{ auth: { user?: User } }>();
    const user = auth?.user ?? page.props.auth?.user;

    const logout = () => {
        router.post(route('employee.logout'));
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Head title={title} />
            <Toaster richColors />

            <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
                    <Link href="/employee/dashboard" className="flex items-center gap-3">
                        <ApplicationLogo className="h-8 w-auto" />
                        <span className="text-base font-semibold text-gray-900 dark:text-gray-100">Employee Portal</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="rounded-md border border-gray-200 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600 transition hover:border-red-300 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-gray-700 dark:text-gray-300 dark:hover:border-red-400 dark:hover:text-red-300"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-5xl px-6 py-8">
                {header && <div className="mb-6">{header}</div>}
                {children}
            </main>
        </div>
    );
}
