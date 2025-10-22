import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    Check,
    CheckCircle,
    ChefHat,
    Clock,
    Eye,
    Play,
    RefreshCw,
    X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface KitchenOrder {
    id: number;
    order_number: string;
    table_number: string;
    customer_name?: string | null;
    customer_notes?: string | null;
    items: Array<{
        id: number;
        name: string;
        quantity: number;
        price: number;
    }>;
    status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    sent_at: string;
    prepared_at?: string | null;
    ready_at?: string | null;
    completed_at?: string | null;
    created_at: string;
}

interface KitchenDisplayProps {
    clientIdentifier: string;
    kitchenOrders: KitchenOrder[];
    error?: string;
}

export const KitchenDisplay: React.FC<KitchenDisplayProps> = ({
    clientIdentifier,
    kitchenOrders,
    error,
}) => {
    const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<KitchenOrder | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Auto-refresh every 10 seconds for kitchen display
    useEffect(() => {
        const interval = setInterval(() => {
            // Only reload if dialog is not open
            if (!isDialogOpen) {
                window.location.reload();
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [isDialogOpen]);

    const updateOrderStatus = async (orderId: number, newStatus: string) => {
        setUpdatingStatus(orderId);
        try {
            const response = await fetch(
                `/fnb/kitchen-orders/${orderId}/status`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({ status: newStatus }),
                },
            );

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            const result = await response.json();
            toast.success('Order status updated successfully');

            // Reload the page to get updated data
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Failed to update order status');
        } finally {
            setUpdatingStatus(null);
        }
    };

    const openFocusView = (order: KitchenOrder) => {
        setSelectedOrder(order);
        setIsDialogOpen(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
            case 'preparing':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
            case 'ready':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
            case 'completed':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-4 w-4" />;
            case 'preparing':
                return <RefreshCw className="h-4 w-4" />;
            case 'ready':
                return <Check className="h-4 w-4" />;
            case 'completed':
                return <Check className="h-4 w-4" />;
            case 'cancelled':
                return <Clock className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString();
    };

    const calculateTotal = (items: KitchenOrder['items']) => {
        return items.reduce(
            (total, item) => total + Number(item.price) * item.quantity,
            0,
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <ChefHat className="h-8 w-8 text-orange-600" />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Kitchen Display
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Orders grouped by status
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            Total: {kitchenOrders.length} orders
                        </div>
                        <Button
                            onClick={() => window.location.reload()}
                            variant="outline"
                            size="sm"
                            className="flex items-center space-x-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            <span>Refresh</span>
                        </Button>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                    Error loading kitchen orders
                                </h3>
                                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                    {error}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Columns */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Pending Column */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                            <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-yellow-600" />
                                <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                                    Pending
                                </h2>
                            </div>
                            <span className="rounded-full bg-yellow-200 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">
                                {
                                    kitchenOrders.filter(
                                        (order) => order.status === 'pending',
                                    ).length
                                }
                            </span>
                        </div>
                        <div className="space-y-3">
                            {kitchenOrders
                                .filter((order) => order.status === 'pending')
                                .map((order) => (
                                    <Card
                                        key={order.id}
                                        className="border-2 border-gray-200 transition-all hover:shadow-lg dark:border-gray-600"
                                    >
                                        <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50 dark:border-gray-600 dark:from-orange-900/20 dark:to-amber-900/20">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                                                    #{order.order_number}
                                                </CardTitle>
                                                <div
                                                    className={`flex items-center space-x-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}
                                                >
                                                    {getStatusIcon(
                                                        order.status,
                                                    )}
                                                    <span className="capitalize">
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                                Table: {order.table_number}
                                            </div>
                                            {order.customer_name && (
                                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                                    Customer:{' '}
                                                    {order.customer_name}
                                                </div>
                                            )}
                                        </CardHeader>
                                        <CardContent className="p-4">
                                            <div className="space-y-3">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    Sent:{' '}
                                                    {formatTime(order.sent_at)}
                                                </div>

                                                <div className="space-y-2">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        Items:
                                                    </h4>
                                                    {order.items.map(
                                                        (item, index) => (
                                                            <div
                                                                key={`${order.id}-${item.id}-${index}`}
                                                                className="flex justify-between text-sm"
                                                            >
                                                                <span className="text-gray-700 dark:text-gray-300">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                    x{' '}
                                                                    {item.name}
                                                                </span>
                                                                <span className="font-medium text-gray-900 dark:text-white">
                                                                    $
                                                                    {(
                                                                        Number(item.price) *
                                                                        item.quantity
                                                                    ).toFixed(
                                                                        2,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>

                                                <div className="border-t border-gray-200 pt-2 dark:border-gray-600">
                                                    <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                                                        <span>Total:</span>
                                                        <span>
                                                            $
                                                            {calculateTotal(
                                                                order.items,
                                                            ).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {order.customer_notes && (
                                                    <div className="rounded-md bg-yellow-50 p-2 dark:bg-yellow-900/20">
                                                        <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                                            <strong>
                                                                Note:
                                                            </strong>{' '}
                                                            {
                                                                order.customer_notes
                                                            }
                                                        </p>
                                                    </div>
                                                )}

                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-center p-4 pt-0">
                                            <Button
                                                onClick={() =>
                                                    updateOrderStatus(
                                                        order.id,
                                                        'preparing',
                                                    )
                                                }
                                                disabled={
                                                    updatingStatus ===
                                                    order.id
                                                }
                                                size="sm"
                                                className="bg-blue-600 text-white hover:bg-blue-700 px-8 py-2"
                                            >
                                                {updatingStatus ===
                                                order.id ? (
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Play className="mr-1 h-4 w-4" />
                                                        Start Preparing
                                                    </>
                                                )}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                        </div>
                    </div>

                    {/* Preparing Column */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                            <div className="flex items-center space-x-2">
                                <RefreshCw className="h-5 w-5 text-blue-600" />
                                <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                                    Preparing
                                </h2>
                            </div>
                            <span className="rounded-full bg-blue-200 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                                {
                                    kitchenOrders.filter(
                                        (order) => order.status === 'preparing',
                                    ).length
                                }
                            </span>
                        </div>
                        <div className="space-y-3">
                            {kitchenOrders
                                .filter((order) => order.status === 'preparing')
                                .map((order) => (
                                    <Card
                                        key={order.id}
                                        className="border-2 border-blue-200 transition-all hover:shadow-lg dark:border-blue-600"
                                    >
                                        <CardHeader className="border-b border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:border-blue-600 dark:from-blue-900/20 dark:to-indigo-900/20">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                                                    #{order.order_number}
                                                </CardTitle>
                                                <div className="flex items-center space-x-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-800 dark:text-blue-200">
                                                    <RefreshCw className="h-3 w-3" />
                                                    <span className="capitalize">
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                                Table: {order.table_number}
                                            </div>
                                            {order.customer_name && (
                                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                                    Customer:{' '}
                                                    {order.customer_name}
                                                </div>
                                            )}
                                        </CardHeader>
                                        <CardContent className="p-4">
                                            <div className="space-y-3">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    Sent:{' '}
                                                    {formatTime(order.sent_at)}
                                                </div>

                                                <div className="space-y-2">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        Items:
                                                    </h4>
                                                    {order.items.map(
                                                        (item, index) => (
                                                            <div
                                                                key={`${order.id}-${item.id}-${index}`}
                                                                className="flex justify-between text-sm"
                                                            >
                                                                <span className="text-gray-700 dark:text-gray-300">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                    x{' '}
                                                                    {item.name}
                                                                </span>
                                                                <span className="font-medium text-gray-900 dark:text-white">
                                                                    $
                                                                    {(
                                                                        Number(item.price) *
                                                                        item.quantity
                                                                    ).toFixed(
                                                                        2,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>

                                                <div className="border-t border-gray-200 pt-2 dark:border-gray-600">
                                                    <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                                                        <span>Total:</span>
                                                        <span>
                                                            $
                                                            {calculateTotal(
                                                                order.items,
                                                            ).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {order.customer_notes && (
                                                    <div className="rounded-md bg-yellow-50 p-2 dark:bg-yellow-900/20">
                                                        <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                                            <strong>
                                                                Note:
                                                            </strong>{' '}
                                                            {
                                                                order.customer_notes
                                                            }
                                                        </p>
                                                    </div>
                                                )}

                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex gap-2 p-4 pt-0">
                                            <Button
                                                onClick={() =>
                                                    updateOrderStatus(
                                                        order.id,
                                                        'ready',
                                                    )
                                                }
                                                disabled={
                                                    updatingStatus ===
                                                    order.id
                                                }
                                                size="sm"
                                                className="flex-1 bg-green-600 text-white hover:bg-green-700"
                                            >
                                                {updatingStatus ===
                                                order.id ? (
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <CheckCircle className="mr-1 h-4 w-4" />
                                                        Mark Ready
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                onClick={() => openFocusView(order)}
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                <Eye className="mr-1 h-4 w-4" />
                                                Focus View
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                        </div>
                    </div>

                    {/* Ready Column */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                            <div className="flex items-center space-x-2">
                                <Check className="h-5 w-5 text-green-600" />
                                <h2 className="text-lg font-semibold text-green-800 dark:text-green-200">
                                    Ready
                                </h2>
                            </div>
                            <span className="rounded-full bg-green-200 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-800 dark:text-green-200">
                                {
                                    kitchenOrders.filter(
                                        (order) => order.status === 'ready',
                                    ).length
                                }
                            </span>
                        </div>
                        <div className="space-y-3">
                            {kitchenOrders
                                .filter((order) => order.status === 'ready')
                                .map((order) => (
                                    <Card
                                        key={order.id}
                                        className="border-2 border-green-200 transition-all hover:shadow-lg dark:border-green-600"
                                    >
                                        <CardHeader className="border-b border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:border-green-600 dark:from-green-900/20 dark:to-emerald-900/20">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                                                    #{order.order_number}
                                                </CardTitle>
                                                <div className="flex items-center space-x-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-800 dark:text-green-200">
                                                    <Check className="h-3 w-3" />
                                                    <span className="capitalize">
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                                Table: {order.table_number}
                                            </div>
                                            {order.customer_name && (
                                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                                    Customer:{' '}
                                                    {order.customer_name}
                                                </div>
                                            )}
                                        </CardHeader>
                                        <CardContent className="p-4">
                                            <div className="space-y-3">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    Sent:{' '}
                                                    {formatTime(order.sent_at)}
                                                </div>

                                                <div className="space-y-2">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        Items:
                                                    </h4>
                                                    {order.items.map(
                                                        (item, index) => (
                                                            <div
                                                                key={`${order.id}-${item.id}-${index}`}
                                                                className="flex justify-between text-sm"
                                                            >
                                                                <span className="text-gray-700 dark:text-gray-300">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                    x{' '}
                                                                    {item.name}
                                                                </span>
                                                                <span className="font-medium text-gray-900 dark:text-white">
                                                                    $
                                                                    {(
                                                                        Number(item.price) *
                                                                        item.quantity
                                                                    ).toFixed(
                                                                        2,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>

                                                <div className="border-t border-gray-200 pt-2 dark:border-gray-600">
                                                    <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                                                        <span>Total:</span>
                                                        <span>
                                                            $
                                                            {calculateTotal(
                                                                order.items,
                                                            ).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {order.customer_notes && (
                                                    <div className="rounded-md bg-yellow-50 p-2 dark:bg-yellow-900/20">
                                                        <p className="text-xs text-yellow-800 dark:text-yellow-200">
                                                            <strong>
                                                                Note:
                                                            </strong>{' '}
                                                            {
                                                                order.customer_notes
                                                            }
                                                        </p>
                                                    </div>
                                                )}

                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex gap-2 p-4 pt-0">
                                            <Button
                                                onClick={() =>
                                                    updateOrderStatus(
                                                        order.id,
                                                        'completed',
                                                    )
                                                }
                                                disabled={
                                                    updatingStatus ===
                                                    order.id
                                                }
                                                size="sm"
                                                className="flex-1 bg-gray-600 text-white hover:bg-gray-700"
                                            >
                                                {updatingStatus ===
                                                order.id ? (
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Check className="mr-1 h-4 w-4" />
                                                        Complete
                                                    </>
                                                )}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                {kitchenOrders.length === 0 && (
                    <div className="flex h-64 items-center justify-center">
                        <div className="text-center">
                            <ChefHat className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-gray-500 dark:text-gray-400">
                                No orders to display
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Custom backdrop overlay */}
            {isDialogOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40" />
            )}
            
            {/* Focus View Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 shadow-2xl z-50">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <Eye className="h-5 w-5" />
                            <span>Order Focus View - #{selectedOrder?.order_number}</span>
                        </DialogTitle>
                    </DialogHeader>
                    
                    {selectedOrder && (
                        <div className="space-y-6">
                            {/* Order Header */}
                            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Order Details</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Table: {selectedOrder.table_number}
                                        </p>
                                        {selectedOrder.customer_name && (
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                Customer: {selectedOrder.customer_name}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Sent: {formatTime(selectedOrder.sent_at)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className={`inline-flex items-center space-x-1 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                                            {getStatusIcon(selectedOrder.status)}
                                            <span className="capitalize">{selectedOrder.status}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Order Items</h3>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={`${selectedOrder.id}-${item.id}-${index}`} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-600">
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    Quantity: {item.quantity}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    ${(Number(item.price) * item.quantity).toFixed(2)}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                                    ${Number(item.price).toFixed(2)} each
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="border-t border-gray-200 pt-4 dark:border-gray-600">
                                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                                    <span>Total:</span>
                                    <span>${calculateTotal(selectedOrder.items).toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Customer Notes */}
                            {selectedOrder.customer_notes && (
                                <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Special Instructions</h4>
                                    <p className="mt-1 text-yellow-700 dark:text-yellow-300">{selectedOrder.customer_notes}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-center pt-4">
                                <Button
                                    onClick={() => updateOrderStatus(selectedOrder.id, 'ready')}
                                    disabled={updatingStatus === selectedOrder.id}
                                    className="bg-green-600 text-white hover:bg-green-700 px-8 py-2"
                                >
                                    {updatingStatus === selectedOrder.id ? (
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                    )}
                                    Mark Ready
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default KitchenDisplay;
