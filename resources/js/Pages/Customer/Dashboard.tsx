import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import { PageProps } from '@/types/index';
import { Head } from '@inertiajs/react';

interface UserAddress {
    id: number;
    street: string;
    unit_number?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone?: string;
    address_type: string;
    is_primary: boolean;
}

interface ConnectedBusiness {
    id: number;
    business: {
        id: number;
        name: string;
        email: string;
        project_identifier?: string;
    };
    relationship_type: string;
    total_spent: number;
    total_orders: number;
}

interface DashboardProps extends PageProps {
    address?: UserAddress;
    connectedBusinesses?: ConnectedBusiness[];
}

export default function Dashboard({
    auth,
    address,
    connectedBusinesses = [],
}: DashboardProps) {
    return (
        <CustomerLayout
            auth={{
                user: auth.user,
                project: auth.project,
                modules: auth.modules,
            }}
            title="Dashboard"
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                <div className="p-6 text-gray-900 dark:text-gray-100">
                    <h3 className="mb-4 text-lg font-medium">
                        Welcome to Your Dashboard
                    </h3>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-6 shadow dark:border-indigo-800 dark:bg-indigo-900/20">
                            <h4 className="mb-2 font-semibold text-indigo-800 dark:text-indigo-300">
                                Orders
                            </h4>
                            <p className="text-indigo-600 dark:text-indigo-400">
                                View and track your orders
                            </p>
                            <div className="mt-4">
                                <span className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-indigo-700 focus:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-indigo-900 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:bg-indigo-600 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800 dark:active:bg-indigo-700">
                                    Coming Soon
                                </span>
                            </div>
                        </div>

                        <div className="rounded-lg border border-green-100 bg-green-50 p-6 shadow dark:border-green-800 dark:bg-green-900/20">
                            <h4 className="mb-2 font-semibold text-green-800 dark:text-green-300">
                                Profile
                            </h4>
                            <p className="text-green-600 dark:text-green-400">
                                Manage your account details
                            </p>
                            <div className="mt-4">
                                <a
                                    href={route('customer.profile.edit')}
                                    className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-green-700 focus:bg-green-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-green-900 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:bg-green-600 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800 dark:active:bg-green-700"
                                >
                                    Edit Profile
                                </a>
                            </div>
                        </div>

                        <div className="rounded-lg border border-purple-100 bg-purple-50 p-6 shadow dark:border-purple-800 dark:bg-purple-900/20">
                            <h4 className="mb-2 font-semibold text-purple-800 dark:text-purple-300">
                                Wishlist
                            </h4>
                            <p className="text-purple-600 dark:text-purple-400">
                                View your saved items
                            </p>
                            <div className="mt-4">
                                <span className="inline-flex items-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-purple-700 focus:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-purple-900 dark:bg-purple-500 dark:hover:bg-purple-600 dark:focus:bg-purple-600 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-800 dark:active:bg-purple-700">
                                    Coming Soon
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="mb-4 text-lg font-medium">
                            Recent Activity
                        </h3>
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-6 shadow dark:border-gray-600 dark:bg-gray-700">
                            <p className="italic text-gray-500 dark:text-gray-400">
                                No recent activity to display.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Account Information */}
                        <div className="rounded-lg border border-blue-100 bg-blue-50 p-6 shadow dark:border-blue-800 dark:bg-blue-900/20">
                            <h4 className="mb-4 font-semibold text-blue-800 dark:text-blue-300">
                                Account Information
                            </h4>
                            <div className="space-y-2 text-blue-600 dark:text-blue-400">
                                <p>
                                    <span className="font-medium">Name:</span>{' '}
                                    {auth.user?.name}
                                </p>
                                <p>
                                    <span className="font-medium">Email:</span>{' '}
                                    {auth.user?.email}
                                </p>
                                <p>
                                    <span className="font-medium">Phone:</span>{' '}
                                    {auth.user?.contact_number ||
                                        'Not provided'}
                                </p>
                                <p>
                                    <span className="font-medium">
                                        Account Type:
                                    </span>{' '}
                                    Customer
                                </p>
                                {auth.project && (
                                    <p>
                                        <span className="font-medium">
                                            Project:
                                        </span>{' '}
                                        {auth.project.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Address Information */}
                        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-6 shadow dark:border-emerald-800 dark:bg-emerald-900/20">
                            <h4 className="mb-4 font-semibold text-emerald-800 dark:text-emerald-300">
                                Primary Address
                            </h4>
                            {address ? (
                                <div className="space-y-2 text-emerald-600 dark:text-emerald-400">
                                    <p>
                                        <span className="font-medium">
                                            Street:
                                        </span>{' '}
                                        {address.street}
                                        {address.unit_number &&
                                            `, ${address.unit_number}`}
                                    </p>
                                    <p>
                                        <span className="font-medium">
                                            City:
                                        </span>{' '}
                                        {address.city}
                                    </p>
                                    <p>
                                        <span className="font-medium">
                                            State:
                                        </span>{' '}
                                        {address.state}
                                    </p>
                                    <p>
                                        <span className="font-medium">
                                            Postal Code:
                                        </span>{' '}
                                        {address.postal_code}
                                    </p>
                                    <p>
                                        <span className="font-medium">
                                            Country:
                                        </span>{' '}
                                        {address.country}
                                    </p>
                                    {address.phone && (
                                        <p>
                                            <span className="font-medium">
                                                Phone:
                                            </span>{' '}
                                            {address.phone}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="italic text-emerald-500 dark:text-emerald-400">
                                    No address on file.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Connected Businesses Section */}
                    {connectedBusinesses.length > 0 && (
                        <div className="mt-8">
                            <h3 className="mb-4 text-lg font-medium">
                                My Businesses
                            </h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {connectedBusinesses.map((connection) => (
                                    <div
                                        key={connection.id}
                                        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-700"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                                                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
                                                    {connection.business.name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {connection.business.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {connection.total_orders}{' '}
                                                    {connection.total_orders ===
                                                    1
                                                        ? 'order'
                                                        : 'orders'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                                    $
                                                    {Number(
                                                        connection.total_spent,
                                                    ).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
