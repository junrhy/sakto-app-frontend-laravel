import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { formatDateTimeForDisplay } from '@/Pages/Public/Community/utils/dateUtils';
import { ProductOrderItem } from './ProductOrderHistory';

interface ProductOrdersTableProps {
    open: boolean;
    onOpenChange: (value: boolean) => void;
    productName: string;
    orders: ProductOrderItem[];
}

export function ProductOrdersTable({
    open,
    onOpenChange,
    productName,
    orders,
}: ProductOrdersTableProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Orders for {productName}
                    </DialogTitle>
                </DialogHeader>

                {orders.length === 0 ? (
                    <div className="py-6 text-sm text-gray-500 dark:text-gray-400">
                        No orders found for this product yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
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
                                {orders.map((order, index) => (
                                    <TableRow
                                        key={`product-order-${order.id ?? index}`}
                                    >
                                        <TableCell className="text-sm text-gray-900 dark:text-gray-100">
                                            {order.order_number ??
                                                order.reference ??
                                                `Order-${index + 1}`}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-900 dark:text-gray-100">
                                            {order.order_status ??
                                                order.status ??
                                                'unknown'}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-900 dark:text-gray-100">
                                            {order.total_formatted ??
                                                order.amount_formatted ??
                                                order.total_amount ??
                                                order.amount ??
                                                '—'}
                                        </TableCell>
                                        <TableCell className="text-right text-sm text-gray-900 dark:text-gray-100">
                                            {order.created_at ||
                                            order.ordered_at
                                                ? formatDateTimeForDisplay(
                                                      order.created_at ??
                                                          order.ordered_at ??
                                                          '',
                                                      {
                                                          month: 'short',
                                                          day: 'numeric',
                                                          year: 'numeric',
                                                      },
                                                  )
                                                : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
