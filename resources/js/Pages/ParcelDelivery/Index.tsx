import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { PackageIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { DeliveryStats, ParcelDelivery } from './types';

interface Props extends PageProps {
    deliveries?: ParcelDelivery[];
    stats?: DeliveryStats;
}

export default function ParcelDeliveryIndex({
    auth,
    deliveries: initialDeliveries,
    stats: initialStats,
}: Props) {
    const [deliveries, setDeliveries] = useState<ParcelDelivery[]>(
        initialDeliveries || [],
    );
    const [stats, setStats] = useState<DeliveryStats>(
        initialStats || {
            total_deliveries: 0,
            pending_deliveries: 0,
            in_transit_deliveries: 0,
            delivered_deliveries: 0,
            total_revenue: 0,
        },
    );
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    useEffect(() => {
        fetchDeliveries();
    }, [statusFilter, typeFilter, search]);

    const fetchDeliveries = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (typeFilter !== 'all') params.delivery_type = typeFilter;
            if (search) params.search = search;

            const response = await axios.get('/parcel-delivery/list', {
                params,
            });
            if (response.data.success) {
                setDeliveries(response.data.data);
            }
        } catch (error: any) {
            toast.error('Failed to load deliveries');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'scheduled':
                return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
            case 'out_for_pickup':
                return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400';
            case 'picked_up':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'at_warehouse':
                return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400';
            case 'in_transit':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'out_for_delivery':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            case 'delivery_attempted':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
            case 'delivered':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'returned':
                return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
            case 'returned_to_sender':
                return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400';
            case 'on_hold':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
            case 'failed':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'express':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'standard':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'economy':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const formatCurrency = (amount: number) => {
        let currency: {
            symbol: string;
            thousands_separator?: string;
            decimal_separator?: string;
        };
        const appCurrency = (auth.user as any)?.app_currency;
        if (appCurrency) {
            if (typeof appCurrency === 'string') {
                currency = JSON.parse(appCurrency);
            } else {
                currency = appCurrency;
            }
        } else {
            currency = {
                symbol: '₱',
                thousands_separator: ',',
                decimal_separator: '.',
            };
        }
        return `${currency.symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                            <PackageIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                                Parcel Delivery
                            </h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Manage your parcel deliveries and track
                                shipments
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.visit('/parcel-delivery/track')
                            }
                            className="flex items-center space-x-2"
                        >
                            <SearchIcon className="h-4 w-4" />
                            <span>Track Delivery</span>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.visit('/parcel-delivery/couriers')
                            }
                            className="flex items-center space-x-2"
                        >
                            <PackageIcon className="h-4 w-4" />
                            <span>Couriers</span>
                        </Button>
                        <Button
                            onClick={() =>
                                router.visit('/parcel-delivery/create')
                            }
                            className="flex items-center space-x-2"
                        >
                            <PlusIcon className="h-4 w-4" />
                            <span>New Delivery</span>
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Parcel Delivery" />

            <div className="space-y-6 p-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Deliveries
                            </CardTitle>
                            <PackageIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats.total_deliveries}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pending
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                {stats.pending_deliveries}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                In Transit
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {stats.in_transit_deliveries}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Revenue
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatCurrency(stats.total_revenue)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Deliveries</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex flex-col gap-4 md:flex-row">
                            <div className="relative flex-1">
                                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Search deliveries..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="picked_up">
                                        Picked Up
                                    </SelectItem>
                                    <SelectItem value="in_transit">
                                        In Transit
                                    </SelectItem>
                                    <SelectItem value="delivered">
                                        Delivered
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                        Cancelled
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={typeFilter}
                                onValueChange={setTypeFilter}
                            >
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Types
                                    </SelectItem>
                                    <SelectItem value="express">
                                        Express
                                    </SelectItem>
                                    <SelectItem value="standard">
                                        Standard
                                    </SelectItem>
                                    <SelectItem value="economy">
                                        Economy
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Deliveries Table */}
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50 dark:bg-gray-700">
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Reference
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Type
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Sender
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Recipient
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Status
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Cost
                                            </TableHead>
                                            <TableHead className="text-right text-gray-900 dark:text-white">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={7}
                                                    className="text-center"
                                                >
                                                    Loading...
                                                </TableCell>
                                            </TableRow>
                                        ) : deliveries.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={7}
                                                    className="text-center"
                                                >
                                                    No deliveries found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            deliveries.map((delivery) => (
                                                <TableRow
                                                    key={delivery.id}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                                >
                                                    <TableCell className="font-mono text-sm text-gray-900 dark:text-white">
                                                        {
                                                            delivery.delivery_reference
                                                        }
                                                    </TableCell>
                                                    <TableCell className="text-gray-900 dark:text-white">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getTypeColor(delivery.delivery_type)}`}
                                                        >
                                                            {
                                                                delivery.delivery_type
                                                            }
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-gray-900 dark:text-white">
                                                        <div>
                                                            <div className="font-medium">
                                                                {
                                                                    delivery.sender_name
                                                                }
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {
                                                                    delivery.sender_phone
                                                                }
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-gray-900 dark:text-white">
                                                        <div>
                                                            <div className="font-medium">
                                                                {
                                                                    delivery.recipient_name
                                                                }
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {
                                                                    delivery.recipient_phone
                                                                }
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-gray-900 dark:text-white">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(delivery.status)}`}
                                                        >
                                                            {delivery.status
                                                                .replace(
                                                                    /_/g,
                                                                    ' ',
                                                                )
                                                                .replace(
                                                                    /\b\w/g,
                                                                    (l) =>
                                                                        l.toUpperCase(),
                                                                )}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="text-gray-900 dark:text-white">
                                                        {delivery.estimated_cost
                                                            ? formatCurrency(
                                                                  delivery.estimated_cost,
                                                              )
                                                            : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right text-gray-900 dark:text-white">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    router.visit(
                                                                        `/parcel-delivery/${delivery.id}`,
                                                                    )
                                                                }
                                                            >
                                                                View
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </CardContent>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
