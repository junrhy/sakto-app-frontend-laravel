import { useEffect, useState } from 'react';

interface OrderItem {
    product_id: number;
    variant_id: number | null;
    attributes: Record<string, string> | null;
    name: string;
    quantity: number;
    price: number;
    shipping_fee?: number;
    status: string;
    is_target_product?: boolean;
}

interface Order {
    id: number;
    contact_id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string | null;
    shipping_address: string;
    billing_address: string;
    order_items: OrderItem[];
    subtotal: string;
    tax_amount: string;
    shipping_fee: string;
    service_fee: string;
    discount_amount: string;
    total_amount: string;
    order_status:
        | 'pending'
        | 'processing'
        | 'shipped'
        | 'delivered'
        | 'cancelled'
        | 'refunded';
    payment_status:
        | 'pending'
        | 'paid'
        | 'failed'
        | 'refunded'
        | 'partially_refunded';
    payment_method: string;
    payment_reference: string | null;
    notes: string | null;
    paid_at: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    created_at: string;
    updated_at: string;
}

interface ProductOrderHistoryProps {
    contactId: number;
    appCurrency?: { code: string; symbol: string } | null;
    member: {
        id: number;
        identifier?: string;
    };
    orderHistory: any[];
}

export default function ProductOrderHistory({
    contactId,
    appCurrency,
    member,
    orderHistory,
}: ProductOrderHistoryProps) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
    const [cancellingOrder, setCancellingOrder] = useState(false);

    // Filter orders by contact_id when component mounts or contactId changes
    useEffect(() => {
        if (contactId && orderHistory && Array.isArray(orderHistory)) {
            const filteredOrders = orderHistory.filter(
                (order: any) => order && order.contact_id === contactId,
            );
            setOrders(filteredOrders);
        } else {
            setOrders([]);
        }
    }, [contactId, orderHistory]);

    const formatPrice = (price: number | string | null | undefined): string => {
        const symbol = appCurrency?.symbol || '$';

        // Handle null, undefined, or empty values
        if (price === null || price === undefined || price === '') {
            return `${symbol}0.00`;
        }

        // Convert to number and handle NaN
        const numericPrice =
            typeof price === 'string' ? parseFloat(price) : Number(price);

        if (isNaN(numericPrice)) {
            return `${symbol}0.00`;
        }

        return `${symbol}${numericPrice.toFixed(2)}`;
    };

    const formatDate = (dateString: string): string => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    // Format payment method
    const formatPaymentMethod = (method: string | null | undefined): string => {
        if (!method) return 'Not specified';

        switch (method.toLowerCase()) {
            case 'cash':
                return 'Cash';
            case 'card':
                return 'Credit/Debit Card';
            case 'bank_transfer':
                return 'Bank Transfer';
            case 'digital_wallet':
                return 'Digital Wallet';
            case 'cod':
                return 'Cash on Delivery';
            default:
                return (
                    method.charAt(0).toUpperCase() +
                    method.slice(1).replace(/_/g, ' ')
                );
        }
    };

    const getStatusColor = (status: string): string => {
        if (!status)
            return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';

        switch (status) {
            case 'pending':
                return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200';
            case 'processing':
                return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200';
            case 'shipped':
                return 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200';
            case 'delivered':
                return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
            case 'cancelled':
                return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200';
            case 'refunded':
                return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
            default:
                return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
        }
    };

    const getStatusLabel = (status: string): string => {
        if (!status) return 'Unknown';
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const canCancelOrder = (order: Order): boolean => {
        return ['pending', 'confirmed', 'processing'].includes(
            order.order_status,
        );
    };

    const handleOrderClick = (order: Order) => {
        setSelectedOrder(order);
        setShowOrderDetails(true);
    };

    const closeOrderDetails = () => {
        setShowOrderDetails(false);
        setSelectedOrder(null);
    };

    const handleCancelOrder = () => {
        setShowCancelConfirmation(true);
    };

    const confirmCancelOrder = async () => {
        if (!selectedOrder) return;

        setCancellingOrder(true);
        setError(null);

        try {
            // Get the current URL to extract the member identifier
            const currentPath = window.location.pathname;
            const pathParts = currentPath.split('/');
            const memberIdentifier = pathParts[pathParts.length - 1]; // Last part of the URL

            const response = await fetch(
                `/m/${memberIdentifier}/cancel-order/${selectedOrder.id}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                },
            );

            if (response.ok) {
                const result = await response.json();

                // Update the order in the local state
                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order.id === selectedOrder.id
                            ? { ...order, order_status: 'cancelled' }
                            : order,
                    ),
                );

                // Update the selected order
                setSelectedOrder((prev) =>
                    prev ? { ...prev, order_status: 'cancelled' } : null,
                );

                setShowCancelConfirmation(false);
                setShowOrderDetails(false);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to cancel order');
            }
        } catch (err) {
            setError('Network error occurred while cancelling order');
        } finally {
            setCancellingOrder(false);
        }
    };

    const closeCancelConfirmation = () => {
        setShowCancelConfirmation(false);
        setError(null);
    };

    // Get order item status color and label
    const getOrderItemStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
                    label: 'Pending',
                    icon: '⏳',
                };
            case 'confirmed':
                return {
                    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                    label: 'Confirmed',
                    icon: '✅',
                };
            case 'processing':
                return {
                    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
                    label: 'Processing',
                    icon: '⚙️',
                };
            case 'shipped':
                return {
                    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
                    label: 'Shipped',
                    icon: '📦',
                };
            case 'delivered':
                return {
                    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
                    label: 'Delivered',
                    icon: '🎉',
                };
            case 'cancelled':
                return {
                    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
                    label: 'Cancelled',
                    icon: '❌',
                };
            case 'refunded':
                return {
                    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
                    label: 'Refunded',
                    icon: '↩️',
                };
            case 'out_of_stock':
                return {
                    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
                    label: 'Out of Stock',
                    icon: '📦',
                };
            default:
                return {
                    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
                    label: status || 'Unknown',
                    icon: '❓',
                };
        }
    };

    if (loading) {
        return (
            <div className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/50">
                <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Order History
                </h2>
                <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">
                        Loading orders...
                    </span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/50">
                <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Order History
                </h2>
                <div className="py-12 text-center text-red-600 dark:text-red-400">
                    <svg
                        className="mx-auto mb-4 h-12 w-12 text-red-300 dark:text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                    </svg>
                    <p className="text-lg font-medium">Error loading orders</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/50">
                <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Order History
                </h2>
                <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <svg
                        className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                    </svg>
                    <p className="text-lg font-medium">No orders found</p>
                    <p className="text-sm">
                        You haven't placed any orders yet.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl bg-white p-8 shadow-sm dark:bg-gray-800 dark:shadow-gray-900/50">
            <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-gray-100">
                Order History
            </h2>

            <div className="space-y-4">
                {orders.map((order) => (
                    <div
                        key={order.id}
                        onClick={() => handleOrderClick(order)}
                        className="cursor-pointer rounded-lg border border-gray-200 p-3 transition-all hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:hover:border-gray-600 dark:hover:shadow-gray-900/50 sm:p-4"
                    >
                        <div className="mb-3 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0">
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    #{order.order_number || 'N/A'}
                                </span>
                                <span
                                    className={`w-fit rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.order_status)}`}
                                >
                                    {getStatusLabel(order.order_status)}
                                </span>
                            </div>
                            <div className="text-left sm:text-right">
                                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    {formatPrice(order.total_amount || 0)}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatDate(order.created_at || '')}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-1 text-sm text-gray-600 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                            <div>
                                <span className="font-medium">
                                    {order.order_items?.length || 0}
                                </span>{' '}
                                item
                                {(order.order_items?.length || 0) !== 1
                                    ? 's'
                                    : ''}
                            </div>
                            <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                                <span>
                                    Payment:{' '}
                                    {formatPaymentMethod(order.payment_method)}
                                </span>
                                <span>
                                    Shipping:{' '}
                                    {formatPrice(order.shipping_fee || 0)}
                                </span>
                                <span>
                                    Service:{' '}
                                    {formatPrice(order.service_fee || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Order Details Modal */}
            {showOrderDetails && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
                    <div className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white dark:bg-gray-800 sm:max-h-[90vh]">
                        <div className="border-b border-gray-200 p-4 dark:border-gray-700 sm:p-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 sm:text-lg">
                                    Order #{selectedOrder.order_number}
                                </h3>
                                <button
                                    onClick={closeOrderDetails}
                                    className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                >
                                    <svg
                                        className="h-5 w-5 sm:h-6 sm:w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
                            {/* Order Status */}
                            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Status
                                    </span>
                                    <div className="mt-1 flex items-center">
                                        <span
                                            className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(selectedOrder.order_status)}`}
                                        >
                                            {getStatusLabel(
                                                selectedOrder.order_status,
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Order Date
                                    </span>
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {formatDate(
                                            selectedOrder.created_at || '',
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div>
                                <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                    Shipping Address
                                </h4>
                                <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                    <div>
                                        {selectedOrder.shipping_address ||
                                            'N/A'}
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                                    Order Items
                                </h4>

                                {/* Status Summary */}
                                {selectedOrder.order_items &&
                                    selectedOrder.order_items.length > 0 && (
                                        <div className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                                            <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">
                                                Status Summary
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {(() => {
                                                    const statusCounts: Record<
                                                        string,
                                                        number
                                                    > = {};
                                                    selectedOrder.order_items.forEach(
                                                        (item: any) => {
                                                            const status =
                                                                item.status ||
                                                                'pending';
                                                            statusCounts[
                                                                status
                                                            ] =
                                                                (statusCounts[
                                                                    status
                                                                ] || 0) + 1;
                                                        },
                                                    );

                                                    return Object.entries(
                                                        statusCounts,
                                                    ).map(([status, count]) => {
                                                        const statusInfo =
                                                            getOrderItemStatusInfo(
                                                                status,
                                                            );
                                                        return (
                                                            <span
                                                                key={status}
                                                                className={`rounded-full border px-2 py-1 text-xs font-medium ${statusInfo.color}`}
                                                            >
                                                                <span className="mr-1">
                                                                    {
                                                                        statusInfo.icon
                                                                    }
                                                                </span>
                                                                {
                                                                    statusInfo.label
                                                                }
                                                                : {count}
                                                            </span>
                                                        );
                                                    });
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                <div className="space-y-3">
                                    {selectedOrder.order_items?.map(
                                        (item: any, index: number) => {
                                            const statusInfo =
                                                getOrderItemStatusInfo(
                                                    item.status || 'pending',
                                                );
                                            return (
                                                <div
                                                    key={`${item.product_id}-${index}`}
                                                    className={`rounded-lg p-3 ${
                                                        item.is_target_product
                                                            ? 'border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                                                            : 'bg-gray-50 dark:bg-gray-700'
                                                    }`}
                                                >
                                                    <div className="mb-2 flex items-start justify-between">
                                                        <div className="min-w-0 flex-1">
                                                            <div className="truncate font-medium text-gray-900 dark:text-gray-100">
                                                                {item.name ||
                                                                    'N/A'}
                                                            </div>
                                                        </div>
                                                        <div className="ml-3 flex flex-shrink-0 items-center">
                                                            <span
                                                                className={`rounded-full border px-2 py-1 text-xs font-medium ${statusInfo.color}`}
                                                            >
                                                                <span className="mr-1">
                                                                    {
                                                                        statusInfo.icon
                                                                    }
                                                                </span>
                                                                {
                                                                    statusInfo.label
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                                                Qty:{' '}
                                                                {item.quantity ||
                                                                    0}{' '}
                                                                ×{' '}
                                                                {formatPrice(
                                                                    item.price ||
                                                                        0,
                                                                )}
                                                            </div>
                                                            {item.shipping_fee &&
                                                                item.shipping_fee >
                                                                    0 && (
                                                                    <div className="text-sm text-blue-600 dark:text-blue-400">
                                                                        Shipping:{' '}
                                                                        {formatPrice(
                                                                            item.shipping_fee,
                                                                        )}
                                                                    </div>
                                                                )}
                                                            {item.attributes &&
                                                                Object.keys(
                                                                    item.attributes,
                                                                ).length >
                                                                    0 && (
                                                                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                                        {Object.entries(
                                                                            item.attributes,
                                                                        ).map(
                                                                            ([
                                                                                key,
                                                                                value,
                                                                            ]) => (
                                                                                <span
                                                                                    key={
                                                                                        key
                                                                                    }
                                                                                    className="mr-2"
                                                                                >
                                                                                    {
                                                                                        key
                                                                                    }

                                                                                    :{' '}
                                                                                    {String(
                                                                                        value,
                                                                                    )}
                                                                                </span>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                )}
                                                        </div>
                                                        <div className="ml-3 flex-shrink-0 text-right">
                                                            <div className="font-medium text-gray-900 dark:text-gray-100">
                                                                {formatPrice(
                                                                    (item.price ||
                                                                        0) *
                                                                        (item.quantity ||
                                                                            0),
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        },
                                    ) || (
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            No items found
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Subtotal
                                        </span>
                                        <span className="text-gray-900 dark:text-gray-100">
                                            {formatPrice(
                                                selectedOrder.subtotal || 0,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Shipping
                                        </span>
                                        <span className="text-gray-900 dark:text-gray-100">
                                            {formatPrice(
                                                selectedOrder.shipping_fee || 0,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Service Fee
                                        </span>
                                        <span className="text-gray-900 dark:text-gray-100">
                                            {formatPrice(
                                                selectedOrder.service_fee || 0,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Tax
                                        </span>
                                        <span className="text-gray-900 dark:text-gray-100">
                                            {formatPrice(
                                                selectedOrder.tax_amount || 0,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-semibold dark:border-gray-700">
                                        <span>Total</span>
                                        <span>
                                            {formatPrice(
                                                selectedOrder.total_amount || 0,
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {canCancelOrder(selectedOrder) && (
                                <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                                    <button
                                        onClick={handleCancelOrder}
                                        disabled={cancellingOrder}
                                        className="flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-600"
                                    >
                                        {cancellingOrder ? (
                                            <>
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                                Cancelling...
                                            </>
                                        ) : (
                                            <>
                                                <svg
                                                    className="mr-2 h-4 w-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                                Cancel Order
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Confirmation Modal */}
            {showCancelConfirmation && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
                    <div className="sm:max-h-auto max-h-[95vh] w-full max-w-md overflow-y-auto rounded-xl bg-white dark:bg-gray-800">
                        <div className="border-b border-gray-200 p-4 dark:border-gray-700 sm:p-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 sm:text-lg">
                                    Cancel Order
                                </h3>
                                <button
                                    onClick={closeCancelConfirmation}
                                    disabled={cancellingOrder}
                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 dark:text-gray-500 dark:hover:text-gray-300"
                                >
                                    <svg
                                        className="h-5 w-5 sm:h-6 sm:w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 p-4 sm:p-6">
                            <div className="text-center">
                                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50 sm:mb-4 sm:h-12 sm:w-12">
                                    <svg
                                        className="h-5 w-5 text-red-600 dark:text-red-400 sm:h-6 sm:w-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-base font-medium text-gray-900 dark:text-gray-100 sm:text-lg">
                                    Cancel Order #{selectedOrder.order_number}?
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    This action cannot be undone. The order will
                                    be marked as cancelled and any inventory
                                    will be restored.
                                </p>
                            </div>

                            {error && (
                                <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-3 sm:space-y-0">
                                <button
                                    onClick={closeCancelConfirmation}
                                    disabled={cancellingOrder}
                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    Keep Order
                                </button>
                                <button
                                    onClick={confirmCancelOrder}
                                    disabled={cancellingOrder}
                                    className="flex flex-1 items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-600"
                                >
                                    {cancellingOrder ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                            Cancelling...
                                        </>
                                    ) : (
                                        'Cancel Order'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
