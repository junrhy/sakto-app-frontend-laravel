import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import EmployeeLayout from '@/Layouts/Employee/EmployeeLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface Props extends PageProps {
    driverId?: number | null;
    orders?: DriverOrder[];
    error?: string;
}

interface DriverOrder {
    id: number;
    order_reference: string;
    customer_name: string;
    customer_phone?: string;
    total_amount: number;
    order_status: string;
    created_at: string;
}

export default function DriverOrders({
    auth,
    driverId,
    orders: initialOrders = [],
    error,
}: Props) {
    const [orders, setOrders] = useState<DriverOrder[]>(initialOrders);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (driverId) {
            fetchOrders(driverId);
        } else {
            setOrders([]);
        }
    }, [driverId]);

    const fetchOrders = async (currentDriverId: number) => {
        setLoading(true);
        try {
            const response = await axios.get('/food-delivery/orders/list', {
                params: {
                    client_identifier: (auth.user as any)?.identifier,
                    driver_id: currentDriverId,
                },
            });

            if (response.data.success && response.data.data) {
                setOrders(response.data.data);
            }
        } catch (fetchError: any) {
            console.error('Failed to fetch driver orders:', fetchError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <EmployeeLayout
            auth={{ user: auth.user }}
            title="Driver Orders"
            header={
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    My Deliveries
                </h2>
            }
        >
            <Head title="Driver Orders" />

            <div className="space-y-6 p-6">
                {!driverId ? (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Driver profile required
                        </h3>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {error ||
                                'No driver profile found for this account. Please contact your administrator.'}
                        </p>
                    </div>
                ) : (
                    <Card>
                        <CardHeader className="flex items-center justify-between">
                            <CardTitle>Assigned Deliveries</CardTitle>
                            <Button
                                onClick={() => fetchOrders(driverId)}
                                disabled={loading}
                            >
                                {loading ? 'Refreshing...' : 'Refresh'}
                            </Button>
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
                                    {orders.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="py-8 text-center text-gray-500 dark:text-gray-400"
                                            >
                                                No deliveries assigned yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        orders.map((order) => (
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
                )}
            </div>
        </EmployeeLayout>
    );
}
