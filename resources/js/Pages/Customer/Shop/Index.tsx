import TextInput from '@/Components/TextInput';
import { Card } from '@/Components/ui/card';
import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

interface Shop {
    id: number;
    name: string;
    email: string;
    contact_number: string;
    created_at: string;
    slug: string;
    identifier: string;
}

interface ShopProps extends PageProps {
    shops: Shop[];
}

export default function Shop({ auth, shops }: ShopProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredShops = shops.filter(
        (shop) =>
            shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            shop.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (shop.contact_number &&
                shop.contact_number
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())),
    );

    return (
        <CustomerLayout
            auth={auth}
            title="Shop"
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Shop
                </h2>
            }
        >
            <Head title="Shop" />

            <div className="overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:rounded-lg">
                <div className="p-4 text-gray-900 dark:text-gray-100 sm:p-6">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-shrink-0">
                            <h3 className="text-lg font-medium">Shops</h3>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Total: {filteredShops.length}{' '}
                                {filteredShops.length === 1 ? 'shop' : 'shops'}
                            </p>
                        </div>
                        <div className="w-full sm:w-auto sm:max-w-sm">
                            <TextInput
                                type="text"
                                placeholder="Search by name, email, or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full"
                            />
                        </div>
                    </div>

                    {filteredShops.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {filteredShops.map((shop) => (
                                <Card
                                    key={shop.id}
                                    className="overflow-hidden border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
                                >
                                    <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-700 sm:px-6 sm:py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 sm:h-12 sm:w-12">
                                                <span className="text-base font-medium text-indigo-600 dark:text-indigo-300 sm:text-lg">
                                                    {shop.name
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="truncate text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg">
                                                    {shop.name}
                                                </h3>
                                                <p className="truncate text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                                                    {shop.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 sm:p-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center space-x-2">
                                                <svg
                                                    className="h-4 w-4 flex-shrink-0 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                    />
                                                </svg>
                                                <span className="min-w-0 truncate text-sm text-gray-600 dark:text-gray-400">
                                                    {shop.contact_number ||
                                                        'No phone number'}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <svg
                                                    className="h-4 w-4 flex-shrink-0 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    Joined{' '}
                                                    {new Date(
                                                        shop.created_at,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-700 sm:px-6">
                                        <Link
                                            href={route(
                                                'member.short',
                                                shop.slug || shop.id,
                                            )}
                                            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                        >
                                            View Profile
                                            <svg
                                                className="ml-1 h-4 w-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </Link>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-8">
                            <svg
                                className="mx-auto h-10 w-10 text-gray-400 sm:h-12 sm:w-12"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100 sm:text-base">
                                {searchQuery
                                    ? 'No shops found'
                                    : 'No shops available'}
                            </h3>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                                {searchQuery
                                    ? 'Try adjusting your search terms.'
                                    : 'No shops have been added yet.'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
