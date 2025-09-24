import { Badge } from '@/Components/ui/badge';
import { CardContent } from '@/Components/ui/card';
import axios from 'axios';
import { useEffect, useState } from 'react';

interface KitchenOrder {
    id: number;
    table_number: string;
    status: 'pending' | 'preparing' | 'ready' | 'served';
    items: Array<{
        name: string;
        quantity: number;
        notes?: string;
    }>;
    created_at: string;
}

export function FnbKitchenWidget() {
    const [orders, setOrders] = useState<KitchenOrder[]>([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get(
                    '/pos-restaurant/kitchen-orders/overview',
                );
                const transformedOrders = response.data.map((order: any) => ({
                    ...order,
                    items: JSON.parse(order.items),
                    client_identifier: undefined,
                }));
                setOrders(transformedOrders);
            } catch (error) {
                console.error('Failed to fetch kitchen orders:', error);
            }
        };

        fetchOrders();
        const interval = setInterval(fetchOrders, 30000);

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: KitchenOrder['status']) => {
        const colors = {
            pending:
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
            preparing:
                'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
            ready: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
            served: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300',
        };
        return colors[status];
    };

    const ordersByStatus = {
        pending: orders.filter((order) => order.status === 'pending'),
        preparing: orders.filter((order) => order.status === 'preparing'),
        ready: orders.filter((order) => order.status === 'ready'),
        served: orders.filter((order) => order.status === 'served'),
    };

    const OrderCard = ({ order }: { order: KitchenOrder }) => (
        <div
            key={order.id}
            className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-800/50"
        >
            <div className="mb-3 flex items-start justify-between">
                <div>
                    <span className="text-lg font-medium dark:text-gray-100">
                        {order.table_number}
                    </span>
                    <Badge className={`ml-2 ${getStatusColor(order.status)}`}>
                        {order.status}
                    </Badge>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(order.created_at).toLocaleTimeString()}
                </span>
            </div>
            <ul className="space-y-2">
                {order.items.map((item, index) => (
                    <li key={index} className="flex items-start text-sm">
                        <span className="min-w-[2rem] font-medium dark:text-gray-300">
                            {item.quantity}x
                        </span>
                        <div>
                            <div className="dark:text-gray-200">
                                {item.name}
                            </div>
                            {item.notes && (
                                <div className="text-xs italic text-gray-500 dark:text-gray-400">
                                    {item.notes}
                                </div>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <CardContent>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Kitchen Orders</h3>
                    <Badge variant="outline" className="px-2">
                        {orders.length} Active
                    </Badge>
                </div>

                {orders.length === 0 ? (
                    <div className="py-4 text-center text-gray-500">
                        No active kitchen orders
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(ordersByStatus).map(
                            ([status, statusOrders]) =>
                                statusOrders.length > 0 && (
                                    <div key={status}>
                                        <h4 className="text-md mb-4 font-medium capitalize">
                                            {status} Orders (
                                            {statusOrders.length})
                                        </h4>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {statusOrders.map((order) => (
                                                <OrderCard
                                                    key={order.id}
                                                    order={order}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ),
                        )}
                    </div>
                )}
            </div>
        </CardContent>
    );
}
