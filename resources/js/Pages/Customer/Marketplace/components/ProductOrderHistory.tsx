import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { formatDateTimeForDisplay } from '@/Pages/Public/Community/utils/dateUtils';
import { coerceToString } from '../../Communities/utils/communityCollections';

export interface ProductOrderItem {
    id?: number | string;
    order_number?: string;
    reference?: string;
    order_status?: string;
    status?: string;
    payment_status?: string;
    total_amount?: number | string;
    amount?: number | string;
    total_formatted?: string;
    amount_formatted?: string;
    created_at?: string;
    ordered_at?: string;
    items?: Array<unknown>;
    order_items?: Array<unknown>;
}

interface ProductOrderHistoryProps {
    orders: ProductOrderItem[];
    title?: string;
    emptyMessage?: string;
    projectIdentifier?: string;
    ownerIdentifier?: string | number;
    appCurrency?: {
        symbol?: string;
        decimal_separator?: string;
        thousands_separator?: string;
    } | null;
}

const statusBadgeVariant = (status: string): string => {
    const normalizedStatus = status?.toLowerCase() ?? '';
    switch (normalizedStatus) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        case 'confirmed':
        case 'paid':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        case 'processing':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
        case 'shipped':
            return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
        case 'delivered':
            return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case 'cancelled':
        case 'failed':
            return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        case 'refunded':
        case 'partially_refunded':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
};

const formatPrice = (
    value: number | string | null | undefined,
    currency?: {
        symbol?: string;
        decimal_separator?: string;
        thousands_separator?: string;
    } | null,
): string => {
    if (value === null || value === undefined) {
        return '—';
    }

    const symbol = currency?.symbol ?? '₱';
    const decimalSeparator = currency?.decimal_separator ?? '.';
    const thousandsSeparator = currency?.thousands_separator ?? ',';

    const numeric =
        typeof value === 'string' ? Number.parseFloat(value) : Number(value);

    if (Number.isNaN(numeric)) {
        return '—';
    }

    const [whole, fraction = '00'] = numeric.toFixed(2).split('.');
    const formattedWhole = whole.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        thousandsSeparator,
    );

    return `${symbol}${formattedWhole}${decimalSeparator}${fraction}`;
};

export function ProductOrderHistory({
    orders,
    title = 'Order History',
    emptyMessage = 'No order history available yet.',
    projectIdentifier,
    ownerIdentifier,
    appCurrency,
}: ProductOrderHistoryProps) {
    const getItemsCount = (order: ProductOrderItem): number => {
        const items = order.items ?? order.order_items ?? [];
        if (!Array.isArray(items)) {
            return 0;
        }
        return items.length;
    };

    const getOrderStatus = (order: ProductOrderItem): string => {
        return (
            coerceToString(order.order_status) ??
            coerceToString(order.status) ??
            'unknown'
        );
    };

    const getPaymentStatus = (order: ProductOrderItem): string | null => {
        return coerceToString(order.payment_status) ?? null;
    };

    const getTotalAmount = (order: ProductOrderItem): string => {
        if (order.total_formatted) {
            return order.total_formatted;
        }
        if (order.amount_formatted) {
            return order.amount_formatted;
        }
        return formatPrice(order.total_amount ?? order.amount, appCurrency);
    };

    return (
        <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {orders.length === 0 ? (
                    <div className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {emptyMessage}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-700">
                                <TableHead className="text-gray-900 dark:text-white">
                                    Order #
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Order Status
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Payment Status
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Items
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Total
                                </TableHead>
                                <TableHead className="text-right text-gray-900 dark:text-white">
                                    Date
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order, index) => {
                                const orderNumber =
                                    coerceToString(order.order_number) ??
                                    coerceToString(order.reference) ??
                                    `Order-${index + 1}`;
                                const orderStatus = getOrderStatus(order);
                                const paymentStatus = getPaymentStatus(order);
                                const itemsCount = getItemsCount(order);
                                const totalAmount = getTotalAmount(order);
                                const dateValue =
                                    order.created_at ?? order.ordered_at;

                                return (
                                    <TableRow
                                        key={`marketplace-order-${order.id ?? orderNumber}`}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <TableCell className="text-gray-900 dark:text-white">
                                            <div className="font-medium">
                                            {orderNumber}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            <Badge
                                                className={statusBadgeVariant(
                                                    orderStatus,
                                                )}
                                            >
                                                {orderStatus
                                                    .replace(/_/g, ' ')
                                                    .replace(
                                                        /\b\w/g,
                                                        (l) =>
                                                            l.toUpperCase(),
                                                    )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {paymentStatus ? (
                                                <Badge
                                                    className={statusBadgeVariant(
                                                        paymentStatus,
                                                    )}
                                                >
                                                    {paymentStatus
                                                        .replace(/_/g, ' ')
                                                        .replace(
                                                            /\b\w/g,
                                                            (l) =>
                                                                l.toUpperCase(),
                                                        )}
                                                </Badge>
                                            ) : (
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            <span className="text-sm">
                                                {itemsCount} item
                                                {itemsCount !== 1 ? 's' : ''}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            <span className="font-medium">
                                                {totalAmount}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right text-gray-900 dark:text-white">
                                            {dateValue
                                                ? formatDateTimeForDisplay(
                                                      dateValue,
                                                      {
                                                          month: 'short',
                                                          day: 'numeric',
                                                          year: 'numeric',
                                                          hour: 'numeric',
                                                          minute: '2-digit',
                                                      },
                                                  )
                                                : '—'}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
