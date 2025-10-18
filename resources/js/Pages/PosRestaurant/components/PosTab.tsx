import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Calculator,
    Check,
    Minus,
    Plus,
    Printer,
    QrCode,
    ShoppingCart,
    UtensilsCrossed,
} from 'lucide-react';
import React, { useCallback, useMemo } from 'react';
import { MenuItem, OrderItem, Table as TableType } from '../types';

interface PosTabProps {
    menuItems: MenuItem[];
    orderItems: OrderItem[];
    tableNumber: string;
    selectedCategory: string | null;
    discount: number;
    discountType: 'percentage' | 'fixed';
    currency_symbol: string;
    tables: TableType[];
    onAddItemToOrder: (item: MenuItem) => void;
    onUpdateItemQuantity: (itemId: number, quantity: number) => void;
    onRemoveItemFromOrder: (itemId: number) => void;
    onSetTableNumber: (value: string) => void;
    onSetSelectedCategory: (value: string) => void;
    onSetDiscount: (value: number) => void;
    onSetDiscountType: (value: 'percentage' | 'fixed') => void;
    onPrintBill: () => void;
    onShowQRCode: () => void;
    onCompleteOrder: () => void;
    onSplitBill: () => void;
    onPrintKitchenOrder: () => void;
}

export const PosTab: React.FC<PosTabProps> = ({
    menuItems,
    orderItems,
    tableNumber,
    selectedCategory,
    discount,
    discountType,
    currency_symbol,
    tables,
    onAddItemToOrder,
    onUpdateItemQuantity,
    onRemoveItemFromOrder,
    onSetTableNumber,
    onSetSelectedCategory,
    onSetDiscount,
    onSetDiscountType,
    onPrintBill,
    onShowQRCode,
    onCompleteOrder,
    onSplitBill,
    onPrintKitchenOrder,
}) => {
    const categoryFilteredMenuItems = useMemo(() => {
        if (!Array.isArray(menuItems)) return [];

        return selectedCategory
            ? menuItems.filter((item) => item.category === selectedCategory)
            : menuItems;
    }, [menuItems, selectedCategory]);

    const totalAmount = useMemo(
        () =>
            orderItems.reduce(
                (total, item) => total + item.price * item.quantity,
                0,
            ),
        [orderItems],
    );

    const calculateDiscount = useCallback(
        (amount: number) => {
            if (discountType === 'percentage') {
                return (amount * discount) / 100;
            } else {
                return discount;
            }
        },
        [discount, discountType],
    );

    const discountAmount = useMemo(
        () => calculateDiscount(totalAmount),
        [totalAmount, calculateDiscount],
    );

    const finalTotal = useMemo(
        () => totalAmount - discountAmount,
        [totalAmount, discountAmount],
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Menu Items */}
                <Card className="overflow-hidden rounded-xl border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 dark:border-gray-600 dark:from-gray-700 dark:to-gray-600">
                        <CardTitle className="flex items-center text-base font-semibold text-gray-900 dark:text-white">
                            <UtensilsCrossed className="mr-2 h-4 w-4 text-blue-500" />
                            Menu Items
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="mb-4">
                            <Select onValueChange={onSetSelectedCategory}>
                                <SelectTrigger className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700">
                                    <SelectItem
                                        value="Main"
                                        className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                    >
                                        Main Dishes
                                    </SelectItem>
                                    <SelectItem
                                        value="Side"
                                        className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                    >
                                        Side Dishes
                                    </SelectItem>
                                    <SelectItem
                                        value="Drink"
                                        className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                    >
                                        Drinks
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                            {categoryFilteredMenuItems.map((item: MenuItem) => (
                                <Button
                                    key={item.id}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onAddItemToOrder(item);
                                    }}
                                    className="group flex h-auto touch-manipulation flex-col items-center rounded-xl border border-gray-200 bg-white p-4 text-gray-900 shadow-sm transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
                                    type="button"
                                >
                                    <img
                                        src={
                                            item.image || '/images/no-image.jpg'
                                        }
                                        alt={item.name}
                                        width={100}
                                        height={100}
                                        className="mb-2 rounded"
                                    />
                                    <span className="text-center">
                                        {item.name}
                                    </span>
                                    <span>
                                        {currency_symbol}
                                        {item.price}
                                    </span>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Current Order */}
                <Card className="overflow-hidden rounded-xl border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 dark:border-gray-600 dark:from-green-900/20 dark:to-emerald-900/20">
                        <CardTitle className="flex items-center text-base font-semibold text-gray-900 dark:text-white">
                            <ShoppingCart className="mr-2 h-4 w-4 text-green-500" />
                            Current Order
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="mb-6">
                            <Label
                                htmlFor="tableNumber"
                                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                                Select Table
                            </Label>
                            <Select
                                value={tableNumber}
                                onValueChange={onSetTableNumber}
                            >
                                <SelectTrigger className="rounded-lg border border-gray-300 bg-white p-3 text-lg text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400">
                                    <SelectValue placeholder="Select a table" />
                                </SelectTrigger>
                                <SelectContent className="border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700">
                                    {tables.map((table) => (
                                        <SelectItem
                                            key={table.id}
                                            value={table.name}
                                            className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                        >
                                            {table.name}{' '}
                                            {table.joined_with
                                                ? '(Joined)'
                                                : ''}{' '}
                                            - {table.seats} seats
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 dark:bg-gray-700">
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Item
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Quantity
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Price
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Total
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orderItems.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        className="border-gray-200 dark:border-gray-600"
                                    >
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {item.name}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        onUpdateItemQuantity(
                                                            item.id,
                                                            item.quantity - 1,
                                                        )
                                                    }
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="text-lg text-gray-900 dark:text-white">
                                                    {item.quantity}
                                                </span>
                                                <Button
                                                    size="sm"
                                                    onClick={() =>
                                                        onUpdateItemQuantity(
                                                            item.id,
                                                            item.quantity + 1,
                                                        )
                                                    }
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {currency_symbol}
                                            {item.price}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {currency_symbol}
                                            {item.price * item.quantity}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    onRemoveItemFromOrder(
                                                        item.id,
                                                    )
                                                }
                                            >
                                                Remove
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Discount Section */}
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-4">
                                <div className="w-1/3">
                                    <Label htmlFor="discountType">
                                        Discount Type
                                    </Label>
                                    <Select
                                        value={discountType}
                                        onValueChange={onSetDiscountType}
                                    >
                                        <SelectTrigger className="w-full border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700">
                                            <SelectItem
                                                value="percentage"
                                                className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                            >
                                                Percentage
                                            </SelectItem>
                                            <SelectItem
                                                value="fixed"
                                                className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                            >
                                                Fixed Amount
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-1/3">
                                    <Label htmlFor="discount">Discount</Label>
                                    <Input
                                        id="discount"
                                        type="number"
                                        value={discount}
                                        onChange={(e) =>
                                            onSetDiscount(
                                                Number(e.target.value),
                                            )
                                        }
                                        placeholder={
                                            discountType === 'percentage'
                                                ? '%'
                                                : '$'
                                        }
                                        className="w-full border border-gray-300 bg-white text-gray-900 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-4 dark:border-gray-600 dark:from-gray-700 dark:to-gray-600">
                        <div className="mr-2 w-80 space-y-2">
                            <div className="flex items-center justify-between py-1">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Subtotal:
                                </span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {currency_symbol}
                                    {totalAmount}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-1">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Discount:
                                </span>
                                <span className="font-semibold text-red-600 dark:text-red-400">
                                    {currency_symbol}
                                    {discountAmount}
                                </span>
                            </div>
                            <div className="-mx-3 flex items-center justify-between rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-900/20">
                                <span className="font-bold text-gray-900 dark:text-white">
                                    Total:
                                </span>
                                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {currency_symbol}
                                    {finalTotal}
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                            <Button
                                onClick={onPrintBill}
                                disabled={orderItems.length === 0}
                                className="flex min-h-[48px] w-full items-center justify-center rounded-lg bg-gray-600 py-3 text-sm text-white shadow-sm transition-all duration-200 hover:bg-gray-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Print Bill
                            </Button>
                            <Button
                                onClick={onShowQRCode}
                                disabled={orderItems.length === 0}
                                className="flex min-h-[48px] w-full items-center justify-center rounded-lg bg-blue-500 py-3 text-sm text-white shadow-sm transition-all duration-200 hover:bg-blue-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <QrCode className="mr-2 h-4 w-4" />
                                Show QR Code
                            </Button>
                            <Button
                                onClick={onSplitBill}
                                disabled={orderItems.length === 0}
                                className="flex min-h-[48px] w-full items-center justify-center rounded-lg bg-green-500 py-3 text-sm text-white shadow-sm transition-all duration-200 hover:bg-green-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Calculator className="mr-2 h-4 w-4" />
                                Split Bill
                            </Button>
                            <Button
                                onClick={onPrintKitchenOrder}
                                disabled={orderItems.length === 0}
                                className="flex min-h-[48px] w-full items-center justify-center rounded-lg bg-orange-500 py-3 text-sm text-white shadow-sm transition-all duration-200 hover:bg-orange-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Kitchen Order
                            </Button>
                            {orderItems.length > 0 && (
                                <Button
                                    onClick={onCompleteOrder}
                                    className="flex min-h-[48px] w-full items-center justify-center rounded-lg bg-gradient-to-r from-red-500 to-red-600 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-red-600 hover:to-red-700 hover:shadow-md sm:col-span-2"
                                >
                                    <Check className="mr-2 h-4 w-4" />
                                    Complete Order
                                </Button>
                            )}
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};
