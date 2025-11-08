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
import MerchantLayout from '@/Layouts/Merchant/MerchantLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface Props extends PageProps {}

interface FoodDeliveryOrder {
    id: number;
    order_reference: string;
    customer_name: string;
    customer_phone?: string;
    total_amount: number;
    order_status: string;
    created_at: string;
}

const statusOptions = [
    'pending',
    'preparing',
    'ready',
    'delivered',
    'cancelled',
    'failed',
];

export default function RestaurantOrders({ auth }: Props) {
    const [orders, setOrders] = useState<FoodDeliveryOrder[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/food-delivery/orders/list', {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                },
            });

            if (response.data.success && response.data.data) {
                setOrders(response.data.data);
            }
        } catch (error: any) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter((order) => {
        if (!search) return true;
        const term = search.toLowerCase();
        return (
            order.order_reference.toLowerCase().includes(term) ||
            order.customer_name.toLowerCase().includes(term)
        );
    });

    return (
        <MerchantLayout
            auth={{ user: auth.user }}
            title="Restaurant Orders"
            header={
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Orders
                </h2>
            }
        >
            <Head title="Restaurant Orders" />

            <div className="space-y-6 p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Search
                                </label>
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Order reference or customer name"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Status
                                </label>
                                <Select
                                    value={statusFilter}
                                    onValueChange={setStatusFilter}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All statuses
                                        </SelectItem>
                                        {statusOptions.map((status) => (
                                            <SelectItem
                                                key={status}
                                                value={status}
                                            >
                                                {status.replace('_', ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="self-end">
                                <Button
                                    onClick={fetchOrders}
                                    disabled={loading}
                                    className="w-full"
                                >
                                    {loading ? 'Refreshing...' : 'Refresh'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 dark:bg-gray-700">
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Reference
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Customer
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Amount
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Created
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredOrders.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="py-8 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            No orders found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <TableRow
                                            key={order.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <TableCell className="text-gray-900 dark:text-white">
                                                #{order.order_reference}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {order.customer_name}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {order.order_status}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                ₱
                                                {Number(
                                                    order.total_amount,
                                                ).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {new Date(
                                                    order.created_at,
                                                ).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </MerchantLayout>
    );
}
