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
    const normalizeItems = (order: ProductOrderItem) => {
        let rawItems = order.items ?? order.order_items ?? [];

        if (typeof rawItems === 'string') {
            try {
                rawItems = JSON.parse(rawItems);
            } catch {
                rawItems = [];
            }
        }

        if (
            rawItems &&
            typeof rawItems === 'object' &&
            !Array.isArray(rawItems)
        ) {
            rawItems = Object.values(rawItems);
        }

        if (!Array.isArray(rawItems)) {
            return [];
        }

        return rawItems;
    };

    const getOrderItems = (order: ProductOrderItem) => {
        const rawItems = normalizeItems(order);

        return rawItems.map((item, index) => {
            const typed = item as Record<string, any>;
            const attributes = typed?.attributes;
            let attributeLabel = '';
            if (attributes && typeof attributes === 'object') {
                attributeLabel = Object.entries(attributes)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(' • ');
            } else if (typed?.variant_name) {
                attributeLabel = typed.variant_name;
            }

            return {
                id: typed.id ?? index,
                name:
                    typed.product_name ??
                    typed.name ??
                    typed.title ??
                    `Item ${index + 1}`,
                attributes: attributeLabel,
                quantity: typed.quantity ?? typed.qty ?? 1,
                price:
                    typed.price_formatted ??
                    typed.amount_formatted ??
                    typed.total_formatted ??
                    typed.price ??
                    typed.amount ??
                    null,
            };
        });
    };

    const formatItemPrice = (price: any) => {
        if (price === null || price === undefined) {
            return '';
        }

        if (typeof price === 'string' && price.trim() !== '') {
            const numeric = Number.parseFloat(price);
            if (!Number.isNaN(numeric)) {
                return `₱${numeric.toFixed(2)}`;
            }
            return price;
        }

        if (typeof price === 'number' && !Number.isNaN(price)) {
            return `₱${price.toFixed(2)}`;
        }

        return `${price}`;
    };

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
                                    <>
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
                                        {getOrderItems(order).length > 0 && (
                                            <TableRow className="bg-gray-50/60 dark:bg-gray-800/60">
                                                <TableCell
                                                    colSpan={4}
                                                    className="p-4"
                                                >
                                                    <div className="space-y-3">
                                                        {getOrderItems(
                                                            order,
                                                        ).map((item) => (
                                                            <div
                                                                key={`${order.id}-item-${item.id}`}
                                                                className="flex flex-col gap-2 border-b border-dashed border-gray-200 pb-3 last:border-b-0 last:pb-0 dark:border-gray-700"
                                                            >
                                                                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                            {
                                                                                item.name
                                                                            }
                                                                        </p>
                                                                        {item.attributes && (
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                                {
                                                                                    item.attributes
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-sm text-gray-700 dark:text-gray-200">
                                                                        Qty:{' '}
                                                                        {
                                                                            item.quantity
                                                                        }
                                                                    </div>
                                                                </div>
                                                                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                    {formatItemPrice(
                                                                        item.price,
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
