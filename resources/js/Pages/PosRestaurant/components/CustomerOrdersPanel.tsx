import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Bell, Check, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CustomerOrderItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
}

interface CustomerOrder {
    id: number;
    table_name: string;
    customer_name: string | null;
    items: CustomerOrderItem[];
    customer_notes: string | null;
    status: 'pending' | 'active' | 'completed';
    order_source: 'staff' | 'customer';
    subtotal: number;
    created_at: string;
}

interface CustomerOrdersPanelProps {
    onAddItemsToPOS?: (
        tableNumber: string,
        items: CustomerOrderItem[],
        customerName?: string | null,
        customerNotes?: string | null
    ) => void;
    onRefresh?: () => void;
}

export const CustomerOrdersPanel: React.FC<CustomerOrdersPanelProps> = ({
    onAddItemsToPOS,
    onRefresh,
}) => {
    const [orders, setOrders] = useState<CustomerOrder[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `/pos-restaurant/customer-orders/pending`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );

            const data = await response.json();
            if (data.status === 'success') {
                setOrders(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch customer orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // Poll for new orders every 30 seconds
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    const cancelOrder = async (orderId: number) => {
        try {
            const response = await fetch(
                `/pos-restaurant/customer-orders/${orderId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                },
            );

            const data = await response.json();
            if (data.status === 'success') {
                toast.success('Order cancelled and removed');
                fetchOrders();
                if (onRefresh) onRefresh();
            } else {
                toast.error(data.message || 'Failed to cancel order');
            }
        } catch (error) {
            console.error('Failed to cancel order:', error);
            toast.error('Failed to cancel order');
        }
    };

    const updateOrderStatus = async (
        orderId: number,
        status: 'active' | 'completed',
    ) => {
        try {
            const response = await fetch(
                `/pos-restaurant/customer-orders/${orderId}/status`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({ status }),
                },
            );

            const data = await response.json();
            if (data.status === 'success') {
                toast.success(`Order marked as ${status}`);
                fetchOrders();
                if (onRefresh) onRefresh();
            } else {
                toast.error(data.message || 'Failed to update order');
            }
        } catch (error) {
            console.error('Failed to update order:', error);
            toast.error('Failed to update order');
        }
    };

    const addToPOS = async (order: CustomerOrder) => {
        try {
            if (onAddItemsToPOS) {
                onAddItemsToPOS(order.table_name, order.items, order.customer_name, order.customer_notes);
            }

            // Delete the customer order after adding to POS
            const response = await fetch(
                `/pos-restaurant/customer-orders/${order.id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                }
            );

            const data = await response.json();

            if (data.status === 'success') {
                toast.success(`Order added to ${order.table_name} and removed from queue`);
                fetchOrders(); // Refresh the orders list
            } else {
                toast.error(data.message || 'Failed to remove order from queue');
            }
        } catch (error) {
            console.error('Failed to add order to POS:', error);
            toast.error('Order added but failed to remove from queue');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
            case 'active':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending':
                return 'New Order';
            case 'active':
                return 'In Progress';
            case 'completed':
                return 'Completed';
            default:
                return status;
        }
    };

    return (
        <Card className="overflow-hidden rounded-xl border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-3 dark:border-gray-600 dark:from-orange-900/20 dark:to-red-900/20">
                <CardTitle className="flex items-center justify-between text-base font-semibold text-gray-900 dark:text-white">
                    <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-orange-500" />
                        Customer Orders
                        {orders.length > 0 && (
                            <Badge className="bg-orange-600">
                                {orders.length}
                            </Badge>
                        )}
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={fetchOrders}
                        disabled={loading}
                        className="h-7 text-xs"
                    >
                        {loading ? 'Loading...' : 'Refresh'}
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                {orders.length === 0 ? (
                    <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                        <Bell className="mx-auto mb-2 h-12 w-12 opacity-50" />
                        <p className="text-sm">No pending customer orders</p>
                    </div>
                ) : (
                    <div className="max-h-96 space-y-3 overflow-y-auto">
                        {orders.map((order) => (
                            <Card
                                key={order.id}
                                className="border-orange-200 dark:border-orange-800"
                            >
                                <CardContent className="p-4">
                                    <div className="mb-3 flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {order.table_name}
                                                </span>
                                                <Badge
                                                    className={getStatusColor(
                                                        order.status,
                                                    )}
                                                >
                                                    {getStatusLabel(
                                                        order.status,
                                                    )}
                                                </Badge>
                                            </div>
                                            {order.customer_name && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {order.customer_name}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                                {new Date(
                                                    order.created_at,
                                                ).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                            ${Number(order.subtotal).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="mb-3 space-y-1">
                                        {order.items.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="flex justify-between text-sm"
                                            >
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    {item.quantity}x {item.name}
                                                </span>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    $
                                                    {(
                                                        item.price *
                                                        item.quantity
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {order.customer_notes && (
                                        <p className="mb-3 rounded bg-yellow-50 p-2 text-xs text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                                            Note: {order.customer_notes}
                                        </p>
                                    )}

                                    <div className="grid grid-cols-2 gap-2">
                                        {order.status === 'pending' && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        addToPOS(order)
                                                    }
                                                    className="bg-blue-600 text-xs hover:bg-blue-700"
                                                >
                                                    <Check className="mr-1 h-3 w-3" />
                                                    Add to POS
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        cancelOrder(order.id)
                                                    }
                                                    className="border-red-300 text-xs text-red-600 hover:bg-red-50"
                                                >
                                                    <X className="mr-1 h-3 w-3" />
                                                    Cancel
                                                </Button>
                                            </>
                                        )}
                                        {order.status === 'active' && (
                                            <Button
                                                size="sm"
                                                onClick={() =>
                                                    updateOrderStatus(
                                                        order.id,
                                                        'completed',
                                                    )
                                                }
                                                className="col-span-2 bg-green-600 text-xs hover:bg-green-700"
                                            >
                                                <Check className="mr-1 h-3 w-3" />
                                                Mark as Completed
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
