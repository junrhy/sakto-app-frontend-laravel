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
    Trash2,
    UtensilsCrossed,
} from 'lucide-react';
import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { MenuItem, OrderItem, Table as TableType } from '../types';
import { usePosApi } from '../hooks/usePosApi';

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
    // New props for table order persistence
    onLoadTableOrder?: (tableName: string) => Promise<void>;
    onSaveTableOrder?: (tableName: string, orderData: any) => Promise<void>;
    onCompleteTableOrder?: (tableName: string) => Promise<void>;
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
    onLoadTableOrder,
    onSaveTableOrder,
    onCompleteTableOrder,
}) => {
    const api = usePosApi();
    
    // State to store all active orders with their totals
    const [allActiveOrders, setAllActiveOrders] = useState<Array<{
        table_name: string;
        total_amount: number;
        item_count: number;
    }>>([]);

    // Fetch all active orders on mount only
    useEffect(() => {
        const fetchActiveOrders = async () => {
            const orders = await api.getAllActiveOrders();
            if (orders && orders.orders) {
                setAllActiveOrders(orders.orders);
            }
        };
        fetchActiveOrders();
    }, [api]); // Only fetch on mount

    // Get total for a specific table
    const getTableTotal = useCallback((tableName: string) => {
        // If it's the current table, use the current orderItems
        if (tableName === tableNumber && orderItems.length > 0) {
            return orderItems.reduce(
                (total, item) => total + item.price * item.quantity,
                0,
            );
        }
        // Otherwise, get from allActiveOrders
        const order = allActiveOrders.find(o => o.table_name === tableName);
        return order ? Number(order.total_amount) : 0;
    }, [tableNumber, orderItems, allActiveOrders]);
    
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

    // Calculate total for current selected table
    const currentTableTotal = useMemo(() => {
        if (!tableNumber || orderItems.length === 0) return 0;
        return orderItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0,
        );
    }, [tableNumber, orderItems]);

    // Auto-save order when items change
    useEffect(() => {
        if (tableNumber && orderItems.length > 0) {
            const orderData = {
                table_name: tableNumber,
                items: orderItems,
                discount: discount,
                discount_type: discountType,
                subtotal: orderItems.reduce((total, item) => total + (item.price * item.quantity), 0),
                total_amount: currentTableTotal
            };
            
            console.log('Auto-save triggered for table:', tableNumber, 'Items:', orderItems.length);
            
            // Auto-save with debounce
            const timeoutId = setTimeout(async () => {
                console.log('Saving order data:', orderData);
                if (onSaveTableOrder) {
                    await onSaveTableOrder(tableNumber, orderData);
                } else {
                    const saved = await api.saveTableOrder(orderData);
                    console.log('Save result:', saved);
                }
                // Refresh active orders after save
                const orders = await api.getAllActiveOrders();
                if (orders && orders.orders) {
                    setAllActiveOrders(orders.orders);
                }
            }, 1000);

            return () => clearTimeout(timeoutId);
        }
    }, [orderItems, tableNumber, discount, discountType, currentTableTotal, onSaveTableOrder, api]);

    // Load table order when table changes
    const handleTableChange = useCallback(async (newTableName: string) => {
        // Save current order before switching
        if (tableNumber && orderItems.length > 0) {
            const orderData = {
                table_name: tableNumber,
                items: orderItems,
                discount: discount,
                discount_type: discountType,
                subtotal: orderItems.reduce((total, item) => total + (item.price * item.quantity), 0),
                total_amount: currentTableTotal
            };
            
            if (onSaveTableOrder) {
                await onSaveTableOrder(tableNumber, orderData);
            } else {
                await api.saveTableOrder(orderData);
            }
        }

        // Switch to new table
        onSetTableNumber(newTableName);

        // Load order for new table
        if (onLoadTableOrder) {
            await onLoadTableOrder(newTableName);
        } else {
            const response = await api.getTableOrder(newTableName);
            if (response && response.items) {
                // This would need to be handled by the parent component
                // to update the orderItems state
            }
        }
        
        // Refresh active orders after switching
        const orders = await api.getAllActiveOrders();
        if (orders && orders.orders) {
            setAllActiveOrders(orders.orders);
        }
    }, [tableNumber, orderItems, discount, discountType, currentTableTotal, onSetTableNumber, onSaveTableOrder, onLoadTableOrder, api]);

    // Enhanced complete order handler
    const handleCompleteOrder = useCallback(async () => {
        if (onCompleteTableOrder && tableNumber) {
            await onCompleteTableOrder(tableNumber);
        } else if (tableNumber) {
            await api.completeTableOrder(tableNumber);
        }
        onCompleteOrder();
    }, [tableNumber, onCompleteTableOrder, api, onCompleteOrder]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
                {/* Tables List */}
                <Card className="overflow-hidden rounded-xl border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 lg:col-span-1">
                    <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-2 dark:border-gray-600 dark:from-purple-900/20 dark:to-pink-900/20">
                        <CardTitle className="flex items-center text-sm font-semibold text-gray-900 dark:text-white">
                            <Calculator className="mr-1.5 h-3.5 w-3.5 text-purple-500" />
                            Select Table
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                        <div className="space-y-1.5">
                            {tables.map((table) => (
                                <button
                                    key={table.id}
                                    onClick={() => handleTableChange(table.name)}
                                    className={`w-full rounded-md border p-2.5 text-left transition-all duration-200 ${
                                        tableNumber === table.name
                                            ? 'border-purple-500 bg-purple-50 shadow-sm dark:border-purple-400 dark:bg-purple-900/30'
                                            : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-purple-500/50 dark:hover:bg-purple-900/10'
                                    }`}
                                >
                                    <div className="flex flex-col">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {table.name}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getTableTotal(table.name) > 0 && (
                                                    <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                                                        {currency_symbol}{getTableTotal(table.name).toFixed(2)}
                                                    </div>
                                                )}
                                                {tableNumber === table.name && (
                                                    <Check className="h-4 w-4 flex-shrink-0 text-purple-500 dark:text-purple-400" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                                            {table.seats} seats
                                            {table.joined_with && ' • Joined'}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Menu Items */}
                <Card className="overflow-hidden rounded-xl border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
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
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                            {categoryFilteredMenuItems.map((item: MenuItem) => (
                                <Button
                                    key={item.id}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onAddItemToOrder(item);
                                    }}
                                    className="group flex h-auto touch-manipulation flex-col items-center rounded-lg border border-gray-200 bg-white p-3 text-gray-900 shadow-sm transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
                                    type="button"
                                >
                                    <img
                                        src={
                                            item.image || '/images/no-image.jpg'
                                        }
                                        alt={item.name}
                                        width={80}
                                        height={80}
                                        className="mb-2 rounded"
                                    />
                                    <span className="text-center text-sm">
                                        {item.name}
                                    </span>
                                    <span className="text-sm font-semibold">
                                        {currency_symbol}
                                        {item.price}
                                    </span>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Current Order */}
                <Card className="overflow-hidden rounded-xl border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
                    <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 dark:border-gray-600 dark:from-green-900/20 dark:to-emerald-900/20">
                        <CardTitle className="flex items-center text-base font-semibold text-gray-900 dark:text-white">
                            <ShoppingCart className="mr-2 h-4 w-4 text-green-500" />
                            Order
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
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
                                                className="h-8 w-8 p-0"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Checkout Section */}
                <Card className="overflow-hidden rounded-xl border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 lg:col-span-1">
                    <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 dark:border-gray-600 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <CardTitle className="flex items-center text-base font-semibold text-gray-900 dark:text-white">
                            <Calculator className="mr-2 h-4 w-4 text-blue-500" />
                            Checkout
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        {/* Discount Section */}
                        <div className="space-y-3">
                            <div>
                                <Label htmlFor="discountType" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Discount Type
                                </Label>
                                <Select
                                    value={discountType}
                                    onValueChange={onSetDiscountType}
                                >
                                    <SelectTrigger className="mt-1 w-full border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
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
                            <div>
                                <Label htmlFor="discount" className="text-sm font-medium text-gray-700 dark:text-gray-300">Discount</Label>
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
                                    className="mt-1 w-full border border-gray-300 bg-white text-gray-900 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                                />
                            </div>
                        </div>

                        {/* Total Section */}
                        <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-600">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Subtotal:
                                </span>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {currency_symbol}
                                    {totalAmount}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Discount:
                                </span>
                                <span className="font-semibold text-red-600 dark:text-red-400">
                                    {currency_symbol}
                                    {discountAmount}
                                </span>
                            </div>
                            <div className="-mx-6 flex items-center justify-between bg-blue-50 px-6 py-3 dark:bg-blue-900/20">
                                <span className="font-bold text-gray-900 dark:text-white">
                                    Total:
                                </span>
                                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {currency_symbol}
                                    {finalTotal}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid w-full grid-cols-1 gap-3">
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
                                    onClick={handleCompleteOrder}
                                    className="flex min-h-[48px] w-full items-center justify-center rounded-lg bg-gradient-to-r from-red-500 to-red-600 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-red-600 hover:to-red-700 hover:shadow-md"
                                >
                                    <Check className="mr-2 h-4 w-4" />
                                    Complete Order
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
