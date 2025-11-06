import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import { UtensilsIcon, PlusIcon, EditIcon, TrashIcon, SearchIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { FoodDeliveryRestaurant } from '../types';
import axios from 'axios';
import { toast } from 'sonner';

interface Props extends PageProps {
    restaurants?: FoodDeliveryRestaurant[];
}

export default function AdminRestaurants({ auth, restaurants: initialRestaurants }: Props) {
    const [restaurants, setRestaurants] = useState<FoodDeliveryRestaurant[]>(initialRestaurants || []);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchRestaurants();
    }, [search]);

    const fetchRestaurants = async () => {
        setLoading(true);
        try {
            const params: any = {
                client_identifier: (auth.user as any)?.identifier,
            };
            if (search) {
                params.search = search;
            }

            const response = await axios.get('/food-delivery/restaurants/list', { params });
            if (response.data.success) {
                setRestaurants(response.data.data || []);
            }
        } catch (error: any) {
            toast.error('Failed to load restaurants');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (restaurantId: number) => {
        if (!confirm('Are you sure you want to delete this restaurant?')) return;

        try {
            const response = await axios.delete(`/food-delivery/restaurants/${restaurantId}`, {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                },
            });
            if (response.data.success) {
                toast.success('Restaurant deleted successfully');
                fetchRestaurants();
            }
        } catch (error: any) {
            toast.error('Failed to delete restaurant');
        }
    };

    const formatCurrency = (amount: number) => {
        let currency: { symbol: string; thousands_separator?: string; decimal_separator?: string };
        const appCurrency = (auth.user as any)?.app_currency;
        if (appCurrency) {
            if (typeof appCurrency === 'string') {
                currency = JSON.parse(appCurrency);
            } else {
                currency = appCurrency;
            }
        } else {
            currency = { symbol: '₱', thousands_separator: ',', decimal_separator: '.' };
        }
        return `${currency.symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                            <UtensilsIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                                Restaurants Management
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Manage all restaurants in the platform
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => router.visit('/food-delivery/admin/restaurants/create')}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Restaurant
                    </Button>
                </div>
            }
        >
            <Head title="Restaurants Management" />

            <div className="space-y-6 p-6">
                {/* Search */}
                <Card>
                    <CardContent className="p-4">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search restaurants..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Restaurants Table */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                        <p className="mt-2 text-gray-500">Loading restaurants...</p>
                    </div>
                ) : restaurants.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <UtensilsIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No restaurants found</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 dark:bg-gray-700">
                                        <TableHead className="text-gray-900 dark:text-white">Name</TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">Phone</TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">Address</TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">Delivery Fee</TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">Status</TableHead>
                                        <TableHead className="text-right text-gray-900 dark:text-white">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {restaurants.map((restaurant) => (
                                        <TableRow key={restaurant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <TableCell className="text-gray-900 dark:text-white">{restaurant.name}</TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">{restaurant.phone}</TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">{restaurant.address}</TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {formatCurrency(restaurant.delivery_fee)}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    restaurant.status === 'active'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                        : restaurant.status === 'inactive'
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                    {restaurant.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right text-gray-900 dark:text-white">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.visit(`/food-delivery/admin/restaurants/${restaurant.id}/edit`)}
                                                    >
                                                        <EditIcon className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(restaurant.id)}
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

