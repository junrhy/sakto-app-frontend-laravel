import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import axios from 'axios';
import {
    Check,
    ChefHat,
    Clock,
    ExternalLink,
    Printer,
    RefreshCw,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
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

interface KitchenTabProps {
    currency_symbol: string;
    clientIdentifier: string;
}

export const KitchenTab: React.FC<KitchenTabProps> = ({
    currency_symbol,
    clientIdentifier,
}) => {
    const [orders, setOrders] = useState<KitchenOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [orderToUpdate, setOrderToUpdate] = useState<KitchenOrder | null>(
        null,
    );

    // Fetch kitchen orders
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (statusFilter !== 'all') {
                params.status = statusFilter;
            }

            const response = await axios.get('/pos-restaurant/kitchen-orders', {
                params,
            });

            if (response.data && response.data.data) {
                setOrders(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch kitchen orders:', error);
            toast.error('Failed to load kitchen orders');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    // Initial fetch and auto-refresh
    useEffect(() => {
        fetchOrders();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchOrders, 30000);

        return () => clearInterval(interval);
    }, [statusFilter]); // Only depend on statusFilter, not fetchOrders

    // Update order status
    const updateStatus = useCallback(
        async (orderId: number, newStatus: string) => {
            try {
                await axios.put(`/fnb/kitchen-orders/${orderId}/status`, {
                    status: newStatus,
                });

                toast.success(`Order status updated to ${newStatus}`);
                fetchOrders();
            } catch (error) {
                console.error('Failed to update status:', error);
                toast.error('Failed to update order status');
            }
        },
        [fetchOrders],
    );

    // Handle quick ready with confirmation
    const handleQuickReady = useCallback((order: KitchenOrder) => {
        setOrderToUpdate(order);
        setShowConfirmDialog(true);
    }, []);

    // Confirm quick ready
    const confirmQuickReady = useCallback(async () => {
        if (orderToUpdate) {
            await updateStatus(orderToUpdate.id, 'ready');
            setShowConfirmDialog(false);
            setOrderToUpdate(null);
        }
    }, [orderToUpdate, updateStatus]);

    // Cancel quick ready
    const cancelQuickReady = useCallback(() => {
        setShowConfirmDialog(false);
        setOrderToUpdate(null);
    }, []);

    // Print kitchen order
    const printOrder = useCallback((order: KitchenOrder) => {
        const printWindow = window.open('', '', 'height=600,width=800');
        if (!printWindow) {
            toast.error('Please allow pop-ups to print orders');
            return;
        }

        const orderItemsDetails = order.items
            .map(
                (item) => `
            <tr>
                <td>${item.name}</td>
                <td style="text-align: center;">${item.quantity}</td>
            </tr>
        `,
            )
            .join('');

        const customerInfoSection = order.customer_name
            ? `
            <div class="customer-info">
                <h3>Customer Information</h3>
                <p><strong>Customer Name:</strong> ${order.customer_name}</p>
                ${order.customer_notes ? `<p><strong>Special Requests:</strong> ${order.customer_notes}</p>` : ''}
            </div>
        `
            : '';

        const printContent = `
            <html>
                <head>
                    <title>Kitchen Order ${order.order_number}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
                        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                        .customer-info { background-color: #fff3cd; border: 2px solid #ff9800; border-radius: 5px; padding: 15px; margin-bottom: 20px; }
                        .customer-info h3 { margin-top: 0; margin-bottom: 10px; color: #ff6f00; }
                        .customer-info p { margin: 5px 0; }
                        .order-details { margin-bottom: 20px; }
                        .order-details h3 { margin-bottom: 10px; color: #333; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f2f2f2; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>Kitchen Order</h2>
                        <p>Order Number: ${order.order_number}</p>
                        <p>Table Number: ${order.table_number}</p>
                        <p>Date: ${new Date(order.sent_at).toLocaleDateString()}</p>
                        <p>Time: ${new Date(order.sent_at).toLocaleTimeString()}</p>
                    </div>
                    ${customerInfoSection}
                    <div class="order-details">
                        <h3>Order Items</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th style="text-align: center;">Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orderItemsDetails}
                            </tbody>
                        </table>
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }, []);

    // Get status badge color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
            case 'preparing':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'ready':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    // Get status icon
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return '🟡';
            case 'preparing':
                return '🔵';
            case 'ready':
                return '🟢';
            default:
                return '⚪';
        }
    };

    return (
        <div className="space-y-6">
            <Card className="border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50 dark:border-gray-600 dark:from-orange-900/30 dark:to-amber-900/30">
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ChefHat className="h-5 w-5 text-orange-500" />
                            <span className="text-gray-900 dark:text-white">
                                Kitchen Orders
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="w-[180px] border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent className="border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700">
                                    <SelectItem
                                        value="all"
                                        className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                    >
                                        All Orders
                                    </SelectItem>
                                    <SelectItem
                                        value="pending"
                                        className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                    >
                                        Pending
                                    </SelectItem>
                                    <SelectItem
                                        value="preparing"
                                        className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                    >
                                        Preparing
                                    </SelectItem>
                                    <SelectItem
                                        value="ready"
                                        className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                    >
                                        Ready
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={() => {
                                    window.open(
                                        `/fnb/kitchen-display/${clientIdentifier}`,
                                        '_blank',
                                        'width=1200,height=800,scrollbars=yes,resizable=yes',
                                    );
                                }}
                                variant="outline"
                                size="sm"
                                className="min-h-[44px] touch-manipulation border-blue-300 bg-white text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:bg-gray-700 dark:text-blue-300 dark:hover:bg-blue-900/20"
                            >
                                <ExternalLink className="mr-1 h-4 w-4" />
                                Kitchen Display
                            </Button>
                            <Button
                                onClick={() => {
                                    window.open(
                                        `/fnb/customer-display/${clientIdentifier}`,
                                        '_blank',
                                        'width=1200,height=800,scrollbars=yes,resizable=yes',
                                    );
                                }}
                                variant="outline"
                                size="sm"
                                className="min-h-[44px] touch-manipulation border-green-300 bg-white text-green-700 hover:bg-green-50 dark:border-green-600 dark:bg-gray-700 dark:text-green-300 dark:hover:bg-green-900/20"
                            >
                                <ExternalLink className="mr-1 h-4 w-4" />
                                Customer Display
                            </Button>
                            <Button
                                onClick={fetchOrders}
                                disabled={loading}
                                variant="outline"
                                size="sm"
                                className="min-h-[44px] min-w-[44px] touch-manipulation border-gray-300 bg-white text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                            >
                                <RefreshCw
                                    className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                                />
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {loading && orders.length === 0 ? (
                        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                            <RefreshCw className="mx-auto h-8 w-8 animate-spin" />
                            <p className="mt-2">Loading orders...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                            <ChefHat className="mx-auto h-12 w-12" />
                            <p className="mt-2">No orders to display</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {orders.map((order) => (
                                <Card
                                    key={order.id}
                                    className="flex flex-col border border-gray-200 transition-all hover:shadow-md dark:border-gray-600 dark:bg-gray-800"
                                >
                                    <CardContent className="flex-1 p-3">
                                        {/* Compact Order Header */}
                                        <div className="mb-2 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">
                                                    {getStatusIcon(
                                                        order.status,
                                                    )}
                                                </span>
                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                                        {order.order_number}
                                                    </h3>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        Table{' '}
                                                        {order.table_number}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span
                                                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}
                                                >
                                                    {order.status
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        order.status.slice(1)}
                                                </span>
                                                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                                    {new Date(
                                                        order.sent_at,
                                                    ).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Compact Customer Info */}
                                        {order.customer_name && (
                                            <div className="mb-2 rounded border border-orange-200 bg-orange-50 p-2 dark:border-orange-700 dark:bg-orange-900/20">
                                                <p className="text-xs font-medium text-orange-800 dark:text-orange-200">
                                                    <strong>Customer:</strong>{' '}
                                                    {order.customer_name}
                                                </p>
                                                {order.customer_notes && (
                                                    <p className="mt-0.5 text-xs text-orange-700 dark:text-orange-300">
                                                        <strong>Notes:</strong>{' '}
                                                        {order.customer_notes}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* Enhanced Order Items */}
                                        <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                                            <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                Items:
                                            </h4>
                                            <div className="space-y-1">
                                                {order.items.map(
                                                    (item, idx) => (
                                                        <div
                                                            key={`${order.id}-${item.id}-${idx}`}
                                                            className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm dark:bg-gray-600 dark:text-white"
                                                        >
                                                            <span className="font-semibold">
                                                                {item.quantity}x{' '}
                                                                {item.name}
                                                            </span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {
                                                                    currency_symbol
                                                                }
                                                                {item.price}
                                                            </span>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>

                                    {/* Touch-friendly Action Buttons in Footer */}
                                    <CardFooter className="border-t border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                                        <div className="flex w-full flex-wrap gap-2">
                                            {order.status === 'pending' && (
                                                <Button
                                                    onClick={() =>
                                                        updateStatus(
                                                            order.id,
                                                            'preparing',
                                                        )
                                                    }
                                                    size="sm"
                                                    className="min-h-[44px] min-w-[44px] touch-manipulation bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                                                >
                                                    <Clock className="mr-1 h-4 w-4" />
                                                    Prepare
                                                </Button>
                                            )}
                                            {order.status === 'preparing' && (
                                                <Button
                                                    onClick={() =>
                                                        updateStatus(
                                                            order.id,
                                                            'ready',
                                                        )
                                                    }
                                                    size="sm"
                                                    className="min-h-[44px] min-w-[44px] touch-manipulation bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
                                                >
                                                    <Check className="mr-1 h-4 w-4" />
                                                    Ready
                                                </Button>
                                            )}
                                            {order.status === 'pending' && (
                                                <Button
                                                    onClick={() =>
                                                        handleQuickReady(order)
                                                    }
                                                    size="sm"
                                                    variant="outline"
                                                    className="min-h-[44px] min-w-[44px] touch-manipulation border-green-600 px-3 py-2 text-sm text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/20"
                                                >
                                                    Ready
                                                </Button>
                                            )}
                                            <Button
                                                onClick={() =>
                                                    printOrder(order)
                                                }
                                                size="sm"
                                                variant="outline"
                                                className="min-h-[44px] min-w-[44px] touch-manipulation border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                                            >
                                                <Printer className="mr-1 h-4 w-4" />
                                                Print
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <Dialog
                open={showConfirmDialog}
                onOpenChange={setShowConfirmDialog}
            >
                <DialogContent className="border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-white">
                            Mark Order as Ready
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                            Are you sure you want to mark order{' '}
                            <strong>{orderToUpdate?.order_number}</strong> as
                            ready?
                            {orderToUpdate?.status === 'pending' && (
                                <span className="mt-2 block text-amber-600 dark:text-amber-400">
                                    This will skip the preparing step and mark
                                    it as ready immediately.
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={cancelQuickReady}
                            className="min-h-[44px] min-w-[44px] touch-manipulation border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmQuickReady}
                            className="min-h-[44px] min-w-[44px] touch-manipulation bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                        >
                            <Check className="mr-2 h-4 w-4" />
                            Mark as Ready
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
