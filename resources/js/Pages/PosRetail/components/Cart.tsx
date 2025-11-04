import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
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
import { OrderItem } from '../types';

interface CartProps {
    orderItems: OrderItem[];
    appCurrency: any;
    canEdit: boolean;
    canDelete: boolean;
    onUpdateQuantity: (id: number, quantity: number) => void;
    onRemoveItem: (id: number) => void;
    onCompleteSale: () => void;
    subtotal: number;
    discountAmount?: number;
    appliedDiscount?: any;
    totalAmount: number;
}

export default function Cart({
    orderItems,
    appCurrency,
    canEdit,
    canDelete,
    onUpdateQuantity,
    onRemoveItem,
    onCompleteSale,
    subtotal,
    discountAmount = 0,
    appliedDiscount,
    totalAmount,
}: CartProps) {
    return (
        <Card className="flex h-full w-full flex-col border-gray-200 dark:border-gray-600">
            <CardHeader className="flex-shrink-0 pb-3">
                <CardTitle className="text-lg">Cart</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-3">
                <div className="h-full overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-700">
                                <TableHead className="h-8 px-2 text-xs text-gray-900 dark:text-white">
                                    Item
                                </TableHead>
                                <TableHead className="h-8 px-2 text-xs text-gray-900 dark:text-white">
                                    Qty
                                </TableHead>
                                <TableHead className="h-8 px-2 text-xs text-gray-900 dark:text-white">
                                    Total
                                </TableHead>
                                {canDelete && (
                                    <TableHead className="h-8 px-2 text-xs text-gray-900 dark:text-white">
                                        Action
                                    </TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orderItems.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={canDelete ? 5 : 4}
                                        className="text-center text-gray-500 dark:text-gray-400"
                                    >
                                        No items in cart
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orderItems.map((item, index) => (
                                    <TableRow
                                        key={
                                            item.variant_id
                                                ? `variant-${item.variant_id}-${item.product_id}-${index}`
                                                : `product-${item.id}-${index}`
                                        }
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <TableCell className="px-2 py-1.5 text-xs text-gray-900 dark:text-white">
                                            <div className="line-clamp-2">
                                                {item.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-2 py-1.5 text-gray-900 dark:text-white">
                                            {canEdit ? (
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-6 w-6 p-0"
                                                        onClick={() =>
                                                            onUpdateQuantity(
                                                                item.variant_id ||
                                                                    item.id,
                                                                item.quantity -
                                                                    1,
                                                            )
                                                        }
                                                    >
                                                        -
                                                    </Button>
                                                    <span className="min-w-[2rem] text-center text-xs">
                                                        {item.quantity}
                                                    </span>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-6 w-6 p-0"
                                                        onClick={() =>
                                                            onUpdateQuantity(
                                                                item.variant_id ||
                                                                    item.id,
                                                                item.quantity +
                                                                    1,
                                                            )
                                                        }
                                                    >
                                                        +
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-xs">
                                                    {item.quantity}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-2 py-1.5 text-xs font-semibold text-gray-900 dark:text-white">
                                            {appCurrency.symbol}
                                            {(
                                                item.price * item.quantity
                                            ).toFixed(2)}
                                        </TableCell>
                                        {canDelete && (
                                            <TableCell className="px-2 py-1.5 text-gray-900 dark:text-white">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="h-6 px-2 text-xs"
                                                    onClick={() =>
                                                        onRemoveItem(
                                                            item.variant_id ||
                                                                item.id,
                                                        )
                                                    }
                                                >
                                                    ×
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <CardFooter className="flex-shrink-0 flex-col gap-2 border-t border-gray-200 pt-3 dark:border-gray-600">
                <div className="w-full space-y-1">
                    <div className="flex w-full items-center justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">
                            Subtotal:
                        </span>
                        <span className="text-gray-900 dark:text-white">
                            {appCurrency.symbol}
                            {subtotal.toFixed(2)}
                        </span>
                    </div>
                    {discountAmount > 0 && appliedDiscount && (
                        <div className="flex w-full items-center justify-between text-xs text-green-600 dark:text-green-400">
                            <span>Discount ({appliedDiscount.name}):</span>
                            <span>
                                -{appCurrency.symbol}
                                {discountAmount.toFixed(2)}
                            </span>
                        </div>
                    )}
                    <div className="flex w-full items-center justify-between border-t border-gray-200 pt-1 dark:border-gray-600">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                            Total:
                        </span>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {appCurrency.symbol}
                            {totalAmount.toFixed(2)}
                        </div>
                    </div>
                </div>
                {canEdit && (
                    <Button
                        onClick={onCompleteSale}
                        disabled={orderItems.length === 0}
                        className="w-full bg-green-600 font-semibold text-white shadow-md transition-all duration-200 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                    >
                        Complete Sale
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
