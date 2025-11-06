import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState, useEffect } from 'react';
import { TruckIcon, PlusIcon, EditIcon, TrashIcon, SearchIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { FoodDeliveryDriver } from '../types';
import axios from 'axios';
import { toast } from 'sonner';

interface Props extends PageProps {
    drivers?: FoodDeliveryDriver[];
}

export default function AdminDrivers({ auth, drivers: initialDrivers }: Props) {
    const [drivers, setDrivers] = useState<FoodDeliveryDriver[]>(initialDrivers || []);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchDrivers();
    }, [search]);

    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const params: any = {
                client_identifier: (auth.user as any)?.identifier,
            };
            if (search) {
                params.search = search;
            }

            const response = await axios.get('/food-delivery/drivers/list', { params });
            if (response.data.success) {
                setDrivers(response.data.data || []);
            }
        } catch (error: any) {
            toast.error('Failed to load drivers');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (driverId: number) => {
        if (!confirm('Are you sure you want to delete this driver?')) return;

        try {
            const response = await axios.delete(`/food-delivery/drivers/${driverId}`, {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                },
            });
            if (response.data.success) {
                toast.success('Driver deleted successfully');
                fetchDrivers();
            }
        } catch (error: any) {
            toast.error('Failed to delete driver');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'busy': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'offline': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                            <TruckIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                                Drivers Management
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Manage delivery drivers
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => router.visit('/food-delivery/admin/drivers/create')}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Driver
                    </Button>
                </div>
            }
        >
            <Head title="Drivers Management" />

            <div className="space-y-6 p-6">
                <Card>
                    <CardContent className="p-4">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search drivers..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 dark:bg-gray-700">
                                        <TableHead className="text-gray-900 dark:text-white">Name</TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">Phone</TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">Vehicle</TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">Status</TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">Rating</TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">Deliveries</TableHead>
                                        <TableHead className="text-right text-gray-900 dark:text-white">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {drivers.map((driver) => (
                                        <TableRow key={driver.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <TableCell className="text-gray-900 dark:text-white">{driver.name}</TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">{driver.phone}</TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">{driver.vehicle_type || 'N/A'}</TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                                                    {driver.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {driver.rating ? driver.rating.toFixed(1) : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">{driver.total_deliveries}</TableCell>
                                            <TableCell className="text-right text-gray-900 dark:text-white">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => router.visit(`/food-delivery/admin/drivers/${driver.id}/edit`)}
                                                    >
                                                        <EditIcon className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDelete(driver.id)}
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

