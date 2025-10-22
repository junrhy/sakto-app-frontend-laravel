import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import axios from 'axios';
import { CheckCircle, ChefHat, Clock, RefreshCw } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface CustomerOrder {
    id: number;
    order_number: string;
    table_number: string;
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
}

export const CustomerDisplay: React.FC = () => {
    const [orders, setOrders] = useState<CustomerOrder[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch active kitchen orders for customer display
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('/pos-restaurant/kitchen-orders', {
                params: {
                    status: 'pending,preparing,ready', // Only show active orders
                },
            });

            if (response.data && response.data.data) {
                setOrders(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch and auto-refresh
    useEffect(() => {
        fetchOrders();

        // Auto-refresh every 15 seconds for customer display
        const interval = setInterval(fetchOrders, 15000);

        return () => clearInterval(interval);
    }, []); // Empty dependency array - fetchOrders is stable

    // Get status display info
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    icon: '⏳',
                    text: 'Order Received',
                    color: 'text-amber-600',
                    bgColor: 'bg-amber-50',
                    borderColor: 'border-amber-200',
                };
            case 'preparing':
                return {
                    icon: '👨‍🍳',
                    text: 'Preparing',
                    color: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-200',
                };
            case 'ready':
                return {
                    icon: '✅',
                    text: 'Ready for Pickup',
                    color: 'text-green-600',
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-200',
                };
            default:
                return {
                    icon: '❓',
                    text: 'Unknown',
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                };
        }
    };

    // Get time elapsed
    const getTimeElapsed = (sentAt: string) => {
        const sent = new Date(sentAt);
        const now = new Date();
        const diff = now.getTime() - sent.getTime();
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        }
        return `${seconds}s`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 dark:from-gray-900 dark:to-gray-800">
            <div className="mx-auto max-w-6xl">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mb-4 flex items-center justify-center gap-3">
                        <ChefHat className="h-12 w-12 text-blue-600" />
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                                Order Status
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Track your order progress
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <RefreshCw
                            className={`h-4 w-4 text-gray-500 ${loading ? 'animate-spin' : ''}`}
                        />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Auto-refreshing every 15 seconds
                        </span>
                    </div>
                </div>

                {/* Orders Display */}
                {loading && orders.length === 0 ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="text-center">
                            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-gray-500" />
                            <p className="mt-2 text-gray-500 dark:text-gray-400">
                                Loading orders...
                            </p>
                        </div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="text-center">
                            <ChefHat className="mx-auto h-16 w-16 text-gray-400" />
                            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                                No active orders
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                                Orders will appear here when placed
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {orders.map((order) => {
                            const statusInfo = getStatusInfo(order.status);

                            return (
                                <Card
                                    key={order.id}
                                    className={`border-2 ${statusInfo.borderColor} ${statusInfo.bgColor} transition-all hover:shadow-lg`}
                                >
                                    <CardHeader className="text-center">
                                        <CardTitle className="flex flex-col items-center gap-2">
                                            <span className="text-4xl">
                                                {statusInfo.icon}
                                            </span>
                                            <div>
                                                <h3
                                                    className={`text-xl font-bold ${statusInfo.color}`}
                                                >
                                                    {statusInfo.text}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Order #{order.order_number}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Table {order.table_number}
                                                </p>
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-center">
                                        {/* Order Items */}
                                        <div className="mb-4 rounded-lg bg-white/50 p-3 dark:bg-gray-800/50">
                                            <h4 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                Your Order:
                                            </h4>
                                            <ul className="space-y-1">
                                                {order.items.map(
                                                    (item, idx) => (
                                                        <li
                                                            key={idx}
                                                            className="flex justify-between text-sm text-gray-900 dark:text-white"
                                                        >
                                                            <span>
                                                                {item.quantity}x{' '}
                                                                {item.name}
                                                            </span>
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>

                                        {/* Status Timeline */}
                                        <div className="space-y-2">
                                            <div
                                                className={`flex items-center justify-center gap-2 ${order.status === 'pending' ? statusInfo.color : 'text-gray-400'}`}
                                            >
                                                <Clock className="h-4 w-4" />
                                                <span className="text-sm">
                                                    Order Received
                                                </span>
                                                {order.status === 'pending' && (
                                                    <CheckCircle className="h-4 w-4" />
                                                )}
                                            </div>

                                            <div
                                                className={`flex items-center justify-center gap-2 ${order.status === 'preparing' ? statusInfo.color : 'text-gray-400'}`}
                                            >
                                                <ChefHat className="h-4 w-4" />
                                                <span className="text-sm">
                                                    Preparing
                                                </span>
                                                {order.status ===
                                                    'preparing' && (
                                                    <CheckCircle className="h-4 w-4" />
                                                )}
                                            </div>

                                            <div
                                                className={`flex items-center justify-center gap-2 ${order.status === 'ready' ? statusInfo.color : 'text-gray-400'}`}
                                            >
                                                <CheckCircle className="h-4 w-4" />
                                                <span className="text-sm">
                                                    Ready for Pickup
                                                </span>
                                                {order.status === 'ready' && (
                                                    <CheckCircle className="h-4 w-4" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Time Info */}
                                        <div className="mt-4 text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Order placed{' '}
                                                {getTimeElapsed(order.sent_at)}{' '}
                                                ago
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Footer */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Thank you for your order! Please wait for your order to
                        be ready.
                    </p>
                </div>
            </div>
        </div>
    );
};
