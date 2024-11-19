import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import UpdateCurrencyForm from './Partials/UpdateCurrencyForm';
import UpdateThemeForm from './Partials/UpdateThemeForm';
import UpdateColorThemeForm from './Partials/UpdateColorThemeForm';
import UpdateAddressesForm from './Partials/UpdateAddressesForm';
import BottomNav from '@/Components/BottomNav';

export default function Edit({
    mustVerifyEmail,
    status,
    addresses,
    currency,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    addresses: Array<any>;
    currency: any;
}) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="min-h-screen flex flex-col">
                <div className="flex-grow pb-16">
                    <div className="bg-gray-50 dark:bg-gray-800/80 rounded-lg shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
                        <div className="mx-auto w-full space-y-6">
                            <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                                <div className="max-w-xl">
                                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        Logout
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                        Click the button below to logout from your account.
                                    </p>
                                    <button
                                        onClick={() => router.post(route('logout'))}
                                        className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-500 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                                <UpdateProfileInformationForm
                                    mustVerifyEmail={mustVerifyEmail}
                                    status={status}
                                    className="max-w-xl"
                                />
                            </div>

                            <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                                <UpdateAddressesForm 
                                    addresses={addresses}
                                    className="w-full" 
                                />
                            </div>

                            <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                                <UpdatePasswordForm className="max-w-xl" />
                            </div>

                            <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                                <UpdateCurrencyForm 
                                    currency={currency}
                                    className="max-w-xl" 
                                />
                            </div>

                            <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                                <UpdateThemeForm className="max-w-xl" />
                            </div>

                            <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                                <UpdateColorThemeForm className="max-w-xl" />
                            </div>

                            <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8 dark:bg-gray-800">
                                <DeleteUserForm className="max-w-xl" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 right-0 z-50 w-full">
                    <BottomNav />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
