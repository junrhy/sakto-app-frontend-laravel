import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
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
    total_amount?: number | string;
    amount?: number | string;
    total_formatted?: string;
    amount_formatted?: string;
    created_at?: string;
    ordered_at?: string;
    items?: Array<unknown>;
}

interface ProductOrderHistoryProps {
    orders: ProductOrderItem[];
    title?: string;
    emptyMessage?: string;
}

export function ProductOrderHistory({
    orders,
    title = 'Order History',
    emptyMessage = 'No order history available yet.',
}: ProductOrderHistoryProps) {
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
                                    Status
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
                                const statusLabel = coerceToString(
                                    order.order_status ?? order.status,
                                );
                                const totalLabel =
                                    coerceToString(order.total_formatted) ??
                                    coerceToString(order.amount_formatted) ??
                                    coerceToString(order.total_amount) ??
                                    coerceToString(order.amount) ??
                                    '—';
                                const dateValue = order.created_at ?? order.ordered_at;

                                return (
                                    <TableRow
                                        key={`marketplace-order-${orderNumber}`}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {orderNumber}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {statusLabel ?? 'Unknown'}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {totalLabel}
                                        </TableCell>
                                        <TableCell className="text-right text-gray-900 dark:text-white">
                                            {dateValue
                                                ? formatDateTimeForDisplay(dateValue, {
                                                      month: 'short',
                                                      day: 'numeric',
                                                      year: 'numeric',
                                                  })
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
