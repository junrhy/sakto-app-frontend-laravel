import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
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
    ChevronDown,
    ChevronRight,
    Clock,
    CreditCard,
    Minus,
    Plus,
    Printer,
    QrCode,
    RefreshCw,
    ShoppingCart,
    Trash2,
    UtensilsCrossed,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { usePosApi } from '../hooks/usePosApi';
import { MenuItem, OrderItem, Reservation, Table as TableType } from '../types';
import { CustomerOrdersPanel } from './CustomerOrdersPanel';
import { PaymentDialog } from './PaymentDialog';

interface PosTabProps {
    menuItems: MenuItem[];
    orderItems: OrderItem[];
    tableNumber: string;
    selectedCategory: string | null;
    discount: number;
    discountType: 'percentage' | 'fixed';
    serviceCharge: number;
    serviceChargeType: 'percentage' | 'fixed';
    currency_symbol: string;
    tables: TableType[];
    tableSchedules?: Array<{
        id: number;
        tableId: number;
        scheduleDate: string; // ISO date string or date part
        timeslots: string[];
        status: 'available' | 'unavailable' | 'joined';
        joinedWith?: string | null;
    }>;
    reservations?: Reservation[];
    onAddItemToOrder: (item: MenuItem) => void;
    onUpdateItemQuantity: (itemId: number, quantity: number) => void;
    onRemoveItemFromOrder: (itemId: number) => void;
    onSetTableNumber: (value: string) => void;
    onSetSelectedCategory: (value: string) => void;
    onSetDiscount: (value: number) => void;
    onSetDiscountType: (value: 'percentage' | 'fixed') => void;
    onSetServiceCharge: (value: number) => void;
    onSetServiceChargeType: (value: 'percentage' | 'fixed') => void;
    customerName: string;
    customerNotes: string;
    onSetCustomerName: (value: string) => void;
    onSetCustomerNotes: (value: string) => void;
    showCheckout: boolean;
    onSetShowCheckout: (value: boolean) => void;
    onPrintBill: () => void;
    onShowQRCode: () => void;
    onCompleteOrder: () => void;
    onSplitBill: () => void;
    onPrintKitchenOrder: () => void;
    // New props for table order persistence
    onLoadTableOrder?: (tableName: string) => Promise<void>;
    onSaveTableOrder?: (tableName: string, orderData: any) => Promise<void>;
    onCompleteTableOrder?: (
        tableName: string,
        paymentData?: {
            payment_amount: number;
            payment_method: 'cash' | 'card';
            change: number;
        },
    ) => Promise<void>;
}

export const PosTab: React.FC<PosTabProps> = ({
    menuItems,
    orderItems,
    tableNumber,
    selectedCategory,
    discount,
    discountType,
    serviceCharge,
    serviceChargeType,
    customerName,
    customerNotes,
    currency_symbol,
    tables,
    tableSchedules = [],
    reservations = [],
    onAddItemToOrder,
    onUpdateItemQuantity,
    onRemoveItemFromOrder,
    onSetTableNumber,
    onSetSelectedCategory,
    onSetDiscount,
    onSetDiscountType,
    onSetServiceCharge,
    onSetServiceChargeType,
    onSetCustomerName,
    onSetCustomerNotes,
    showCheckout,
    onSetShowCheckout,
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
    const [allActiveOrders, setAllActiveOrders] = useState<
        Array<{
            table_name: string;
            total_amount: number;
            item_count: number;
        }>
    >([]);

    // State for payment dialog
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);

    // Fetch all active orders on mount only
    useEffect(() => {
        const fetchActiveOrders = async () => {
            const orders = await api.getAllActiveOrders();
            if (orders && orders.orders) {
                setAllActiveOrders(orders.orders);
            }
        };

        // Fetch immediately on mount
        fetchActiveOrders();
    }, []); // Empty dependency array - only run on mount

    // Manual refresh function
    const handleRefreshOrders = useCallback(async () => {
        const orders = await api.getAllActiveOrders();
        if (orders && orders.orders) {
            setAllActiveOrders(orders.orders);
        }
    }, [api]);

    // Get total for a specific table
    const getTableTotal = useCallback(
        (tableName: string) => {
            // If it's the current table, use the current orderItems
            if (tableName === tableNumber && orderItems.length > 0) {
                return orderItems.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0,
                );
            }
            // Otherwise, get from allActiveOrders
            const order = allActiveOrders.find(
                (o) => o.table_name === tableName,
            );
            return order ? Number(order.total_amount) : 0;
        },
        [tableNumber, orderItems, allActiveOrders],
    );

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

    const calculateServiceCharge = useCallback(
        (amount: number) => {
            if (serviceChargeType === 'percentage') {
                return (amount * serviceCharge) / 100;
            } else {
                return serviceCharge;
            }
        },
        [serviceCharge, serviceChargeType],
    );

    const discountAmount = useMemo(
        () => calculateDiscount(totalAmount),
        [totalAmount, calculateDiscount],
    );

    const serviceChargeAmount = useMemo(
        () => calculateServiceCharge(totalAmount),
        [totalAmount, calculateServiceCharge],
    );

    const finalTotal = useMemo(
        () => totalAmount - discountAmount + serviceChargeAmount,
        [totalAmount, discountAmount, serviceChargeAmount],
    );
    // Resolve current table id by name
    const currentTableId = useMemo(() => {
        const t = tables.find((t) => t.name === tableNumber);
        if (!t) return null;
        const id = typeof t.id === 'number' ? t.id : parseInt(String(t.id));
        return Number.isNaN(id) ? null : id;
    }, [tables, tableNumber]);

    // Build today's date (YYYY-MM-DD)
    const todayDate = useMemo(() => {
        const today = new Date();
        const y = today.getFullYear();
        const m = String(today.getMonth() + 1).padStart(2, '0');
        const d = String(today.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }, []);

    // Get today's schedules for selected table
    const todaysSchedules = useMemo(() => {
        if (!currentTableId || !Array.isArray(tableSchedules))
            return [] as typeof tableSchedules;
        return tableSchedules.filter((s) => {
            const schedDate = s.scheduleDate.split('T')[0];
            return s.tableId === currentTableId && schedDate === todayDate;
        });
    }, [currentTableId, tableSchedules, todayDate]);

    // Get today's reservations for selected table
    const todaysReservations = useMemo(() => {
        if (!currentTableId || !Array.isArray(reservations))
            return [] as typeof reservations;
        return reservations.filter((r) => {
            const resDate = r.date.split('T')[0];
            return (
                r.tableId === currentTableId &&
                resDate === todayDate &&
                r.status !== 'cancelled'
            );
        });
    }, [currentTableId, reservations, todayDate]);

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
        if (tableNumber) {
            const orderData = {
                table_name: tableNumber,
                items: orderItems,
                discount: discount,
                discount_type: discountType,
                service_charge: serviceCharge,
                service_charge_type: serviceChargeType,
                customer_name: customerName || null,
                customer_notes: customerNotes || null,
                subtotal: orderItems.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0,
                ),
                total_amount: finalTotal,
            };

            // Auto-save with debounce
            const timeoutId = setTimeout(async () => {
                if (onSaveTableOrder) {
                    await onSaveTableOrder(tableNumber, orderData);
                } else {
                    await api.saveTableOrder(orderData);
                }
            }, 1000);

            return () => clearTimeout(timeoutId);
        }
    }, [
        orderItems,
        tableNumber,
        discount,
        discountType,
        serviceCharge,
        serviceChargeType,
        customerName,
        customerNotes,
        finalTotal,
        onSaveTableOrder,
        api,
    ]);

    // Load table order when table changes
    const handleTableChange = useCallback(
        async (newTableName: string) => {
            // Save current order before switching
            if (tableNumber && orderItems.length > 0) {
                const orderData = {
                    table_name: tableNumber,
                    items: orderItems,
                    discount: discount,
                    discount_type: discountType,
                    service_charge: serviceCharge,
                    service_charge_type: serviceChargeType,
                    customer_name: customerName || null,
                    customer_notes: customerNotes || null,
                    subtotal: orderItems.reduce(
                        (total, item) => total + item.price * item.quantity,
                        0,
                    ),
                    total_amount: finalTotal,
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
        },
        [
            tableNumber,
            orderItems,
            discount,
            discountType,
            serviceCharge,
            serviceChargeType,
            customerName,
            customerNotes,
            finalTotal,
            onSetTableNumber,
            onSaveTableOrder,
            onLoadTableOrder,
            api,
        ],
    );

    // Open payment dialog instead of completing directly
    const handleOpenPaymentDialog = useCallback(() => {
        setShowPaymentDialog(true);
    }, []);

    // Handle adding customer order items to POS
    const handleAddCustomerOrderToPOS = useCallback(
        (
            tableName: string,
            items: Array<{
                id: number;
                name: string;
                quantity: number;
                price: number;
            }>,
            newCustomerName?: string | null,
            newCustomerNotes?: string | null,
        ) => {
            // Switch to the specified table
            onSetTableNumber(tableName);

            // Add items to the order
            items.forEach((item) => {
                const menuItem = menuItems.find((mi) => mi.id === item.id);
                if (menuItem) {
                    // Add item multiple times based on quantity
                    for (let i = 0; i < item.quantity; i++) {
                        onAddItemToOrder(menuItem);
                    }
                }
            });

            // Save customer information to order
            if (newCustomerName) {
                onSetCustomerName(newCustomerName);
            }
            if (newCustomerNotes && newCustomerNotes.trim()) {
                // Concatenate customer notes if there are existing notes
                const existingNotes = customerNotes; // From component props
                const trimmedNewNotes = newCustomerNotes.trim();
                
                // Check if this note already exists to avoid duplicates
                if (!existingNotes || !existingNotes.includes(trimmedNewNotes)) {
                    const concatenatedNotes = existingNotes && existingNotes.trim()
                        ? `${existingNotes} | ${trimmedNewNotes}` 
                        : trimmedNewNotes;
                    onSetCustomerNotes(concatenatedNotes);
                }
                // If note already exists, don't update (avoid duplicates)
            }
        },
        [menuItems, onSetTableNumber, onAddItemToOrder, onSetCustomerName, onSetCustomerNotes, customerNotes],
    );

    // Handle payment confirmation
    const handlePaymentConfirm = useCallback(
        async (paymentAmount: number, paymentMethod: 'cash' | 'card') => {
            if (onCompleteTableOrder && tableNumber) {
                await onCompleteTableOrder(tableNumber, {
                    payment_amount: paymentAmount,
                    payment_method: paymentMethod,
                    change: paymentAmount - finalTotal,
                });
            } else if (tableNumber) {
                await api.completeTableOrder(tableNumber, {
                    payment_amount: paymentAmount,
                    payment_method: paymentMethod,
                    change: paymentAmount - finalTotal,
                });
            }
            onCompleteOrder();
            setShowPaymentDialog(false);
            // Refresh active orders after completing
            handleRefreshOrders();
        },
        [
            tableNumber,
            finalTotal,
            onCompleteTableOrder,
            api,
            onCompleteOrder,
            handleRefreshOrders,
        ],
    );

    return (
        <div className="space-y-6">
            <div
                className={`grid grid-cols-1 gap-4 ${showCheckout ? 'lg:grid-cols-5' : 'lg:grid-cols-6'}`}
            >
                {/* Tables List - Hidden when checkout is shown */}
                {!showCheckout && (
                    <Card className="overflow-hidden rounded-xl border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 lg:col-span-1">
                        <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-2 dark:border-gray-600 dark:from-purple-900/20 dark:to-pink-900/20">
                            <CardTitle className="flex items-center justify-between text-sm font-semibold text-gray-900 dark:text-white">
                                <div className="flex items-center">
                                    <Calculator className="mr-1.5 h-3.5 w-3.5 text-purple-500" />
                                    Select Table
                                </div>
                                <button
                                    onClick={handleRefreshOrders}
                                    className="rounded p-1 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                                    title="Refresh table totals"
                                >
                                    <RefreshCw className="h-3.5 w-3.5 text-purple-500" />
                                </button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-2">
                            <div className="space-y-1.5">
                                {tables.map((table) => (
                                    <button
                                        key={table.id}
                                        onClick={() =>
                                            handleTableChange(table.name)
                                        }
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
                                                    {getTableTotal(table.name) >
                                                        0 && (
                                                        <div className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                                                            {currency_symbol}
                                                            {getTableTotal(
                                                                table.name,
                                                            ).toFixed(2)}
                                                        </div>
                                                    )}
                                                    {tableNumber ===
                                                        table.name && (
                                                        <Check className="h-4 w-4 flex-shrink-0 text-purple-500 dark:text-purple-400" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                                                {table.seats} seats
                                                {table.joined_with &&
                                                    ' • Joined'}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Menu Items */}
                <Card
                    className={`overflow-hidden rounded-xl border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 ${showCheckout ? 'lg:col-span-1' : 'lg:col-span-2'}`}
                >
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
                                        if (!tableNumber) {
                                            toast.error('Please select a table first');
                                            return;
                                        }
                                        onAddItemToOrder(item);
                                    }}
                                    disabled={!tableNumber}
                                    className="group flex h-auto touch-manipulation flex-col items-center rounded-lg border border-gray-200 bg-white p-3 text-gray-900 shadow-sm transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:bg-white disabled:hover:shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:border-blue-500 dark:hover:bg-blue-900/20 dark:disabled:hover:border-gray-600 dark:disabled:hover:bg-gray-700"
                                    type="button"
                                    title={!tableNumber ? 'Select a table first' : `Add ${item.name}`}
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
                        <CardTitle className="flex items-center justify-between text-base font-semibold text-gray-900 dark:text-white">
                            <div className="flex items-center">
                                <ShoppingCart className="mr-2 h-4 w-4 text-green-500" />
                                Order
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={onShowQRCode}
                                    className="rounded p-1.5 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                    title="Show QR Code"
                                >
                                    <QrCode className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={onPrintKitchenOrder}
                                    disabled={orderItems.length === 0}
                                    className="rounded p-1.5 text-orange-600 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:text-orange-400 dark:hover:bg-orange-900/30"
                                    title="Kitchen Order"
                                >
                                    <Printer className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        if (!tableNumber) {
                                            toast.error('Please select a table first');
                                            return;
                                        }
                                        onSetShowCheckout(!showCheckout);
                                    }}
                                    disabled={!tableNumber && !showCheckout}
                                    className="flex items-center gap-1 rounded px-2 py-1 text-sm font-medium text-green-600 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:text-green-400 dark:hover:bg-green-900/30"
                                    title={
                                        !tableNumber && !showCheckout
                                            ? 'Select a table first'
                                            : showCheckout
                                              ? 'Hide Checkout'
                                              : 'Show Checkout'
                                    }
                                >
                                    {showCheckout ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                    Checkout
                                </button>
                            </div>
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
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    console.log(
                                                        'Removing item:',
                                                        item.id,
                                                        item.name,
                                                    );
                                                    onRemoveItemFromOrder(
                                                        item.id,
                                                    );
                                                }}
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

                {/* Checkout Section or Today's Schedule (mutually exclusive) */}
                {showCheckout && (
                    <Card className="overflow-hidden rounded-xl border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 lg:col-span-2">
                        <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 dark:border-gray-600 dark:from-blue-900/20 dark:to-indigo-900/20">
                            <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
                                <Calculator className="mr-2 h-4 w-4 text-blue-500" />
                                Checkout
                                {tableNumber && (
                                    <span className="rounded-md bg-blue-100 px-2 py-0.5 text-sm font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                        {tableNumber}
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 p-6">
                            {/* Discount Section - Single Row */}
                            <div className="grid grid-cols-12 items-center gap-2">
                                <Label className="col-span-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Discount
                                </Label>
                                <Select
                                    value={discountType}
                                    onValueChange={onSetDiscountType}
                                >
                                    <SelectTrigger className="col-span-4 h-8 border-gray-300 bg-white text-xs text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent className="border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700">
                                        <SelectItem
                                            value="percentage"
                                            className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                        >
                                            %
                                        </SelectItem>
                                        <SelectItem
                                            value="fixed"
                                            className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                        >
                                            Fixed
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    id="discount"
                                    type="number"
                                    value={discount}
                                    onChange={(e) =>
                                        onSetDiscount(Number(e.target.value))
                                    }
                                    placeholder={
                                        discountType === 'percentage'
                                            ? '%'
                                            : currency_symbol
                                    }
                                    className="col-span-5 h-8 border border-gray-300 bg-white text-xs text-gray-900 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                                />
                            </div>

                            {/* Service Charge Section - Single Row */}
                            <div className="grid grid-cols-12 items-center gap-2">
                                <Label className="col-span-3 text-xs font-medium text-gray-700 dark:text-gray-300">
                                    Service
                                </Label>
                                <Select
                                    value={serviceChargeType}
                                    onValueChange={onSetServiceChargeType}
                                >
                                    <SelectTrigger className="col-span-4 h-8 border-gray-300 bg-white text-xs text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent className="border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700">
                                        <SelectItem
                                            value="percentage"
                                            className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                        >
                                            %
                                        </SelectItem>
                                        <SelectItem
                                            value="fixed"
                                            className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                        >
                                            Fixed
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input
                                    id="serviceCharge"
                                    type="number"
                                    value={serviceCharge}
                                    onChange={(e) =>
                                        onSetServiceCharge(
                                            Number(e.target.value),
                                        )
                                    }
                                    placeholder={
                                        serviceChargeType === 'percentage'
                                            ? '%'
                                            : currency_symbol
                                    }
                                    className="col-span-5 h-8 border border-gray-300 bg-white text-xs text-gray-900 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                                />
                            </div>

                            {/* Total Section */}
                            <div className="space-y-2 border-t border-gray-200 pt-3 dark:border-gray-600">
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
                                        -{currency_symbol}
                                        {discountAmount.toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Service Charge:
                                    </span>
                                    <span className="font-semibold text-green-600 dark:text-green-400">
                                        +{currency_symbol}
                                        {serviceChargeAmount.toFixed(2)}
                                    </span>
                                </div>
                                <div className="-mx-6 flex items-center justify-between bg-blue-50 px-6 py-3 dark:bg-blue-900/20">
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        Total:
                                    </span>
                                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                        {currency_symbol}
                                        {finalTotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid w-full grid-cols-3 gap-2">
                                <Button
                                    onClick={onPrintBill}
                                    disabled={orderItems.length === 0}
                                    className="flex min-h-[48px] w-full items-center justify-center rounded-lg bg-gray-600 py-2 text-xs text-white shadow-sm transition-all duration-200 hover:bg-gray-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Printer className="mr-1 h-4 w-4" />
                                    Print
                                </Button>
                                <Button
                                    onClick={onSplitBill}
                                    disabled={orderItems.length === 0}
                                    className="flex min-h-[48px] w-full items-center justify-center rounded-lg bg-green-500 py-2 text-xs text-white shadow-sm transition-all duration-200 hover:bg-green-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <Calculator className="mr-1 h-4 w-4" />
                                    Split
                                </Button>
                                <Button
                                    onClick={handleOpenPaymentDialog}
                                    disabled={orderItems.length === 0}
                                    className="flex min-h-[48px] w-full items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-green-600 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <CreditCard className="mr-1 h-4 w-4" />
                                    Pay
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {!showCheckout &&
                    (todaysSchedules.length > 0 ||
                        todaysReservations.length > 0 ||
                        customerName) && (
                        <Card className="overflow-hidden rounded-xl border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 lg:col-span-1">
                            <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 dark:border-gray-600 dark:from-blue-900/20 dark:to-indigo-900/20">
                                <CardTitle className="flex items-center justify-between text-base font-semibold text-gray-900 dark:text-white">
                                    <div className="flex items-center">
                                        <Calculator className="mr-2 h-4 w-4 text-blue-500" />
                                        {customerName
                                            ? 'Order Info & Schedule'
                                            : "Today's Schedule"}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 p-4">
                                {/* Customer Info Section */}
                                {customerName && (
                                    <div className="rounded-lg border-2 border-orange-300 bg-orange-50 p-3 dark:border-orange-600 dark:bg-orange-900/20">
                                        <div className="mb-1 flex items-center gap-2">
                                            <span className="text-xs font-semibold uppercase text-orange-700 dark:text-orange-400">
                                                Customer Order
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            <strong>Customer:</strong>{' '}
                                            {customerName}
                                        </p>
                                        {customerNotes && (
                                            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                                <strong>Special Requests:</strong>{' '}
                                                {customerNotes}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Today's Schedules */}
                                {todaysSchedules.map((sched) => (
                                    <div
                                        key={`sched-${sched.id}`}
                                        className="rounded-md border border-gray-200 p-3 dark:border-gray-700"
                                    >
                                        <div className="mb-2 flex items-center justify-between text-xs">
                                            <span className="text-gray-600 dark:text-gray-300">
                                                {sched.timeslots.map((t) => (
                                                    <span
                                                        key={`${sched.id}-${t}`}
                                                        className="rounded border border-gray-200 bg-white px-2 py-0.5 text-[11px] text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                                                    >
                                                        {new Date(
                                                            `2000-01-01T${t}`,
                                                        ).toLocaleTimeString(
                                                            'en-US',
                                                            {
                                                                hour: 'numeric',
                                                                minute: '2-digit',
                                                                hour12: true,
                                                            },
                                                        )}
                                                    </span>
                                                ))}
                                            </span>
                                            <span
                                                className={`rounded-full px-2 py-0.5 font-medium ${
                                                    sched.status === 'available'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : sched.status ===
                                                            'unavailable'
                                                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                }`}
                                            >
                                                {sched.status === 'joined'
                                                    ? 'Joined'
                                                    : sched.status
                                                          .charAt(0)
                                                          .toUpperCase() +
                                                      sched.status.slice(1)}
                                            </span>
                                        </div>
                                        {sched.status === 'joined' &&
                                            sched.joinedWith && (
                                                <div className="mb-2 text-[11px] text-blue-700 dark:text-blue-300">
                                                    With: {sched.joinedWith}
                                                </div>
                                            )}
                                    </div>
                                ))}

                                {/* Today's Reservations */}
                                {todaysReservations.map((reservation) => (
                                    <div
                                        key={`res-${reservation.id}`}
                                        className="rounded-md border border-orange-200 bg-orange-50 p-3 dark:border-orange-700 dark:bg-orange-900/20"
                                    >
                                        <div className="mb-2 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-orange-800 dark:text-orange-200">
                                                    {reservation.name}
                                                </span>
                                                <span className="text-orange-600 dark:text-orange-300">
                                                    ({reservation.guests}{' '}
                                                    guests)
                                                </span>
                                            </div>
                                            <span
                                                className={`rounded-full px-2 py-0.5 font-medium ${
                                                    reservation.status ===
                                                    'confirmed'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                                }`}
                                            >
                                                {reservation.status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    reservation.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className="text-xs text-orange-700 dark:text-orange-300">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(
                                                    `2000-01-01T${reservation.time}`,
                                                ).toLocaleTimeString('en-US', {
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                    hour12: true,
                                                })}
                                            </div>
                                            {reservation.contact && (
                                                <div className="mt-1 text-orange-600 dark:text-orange-400">
                                                    📞 {reservation.contact}
                                                </div>
                                            )}
                                            {reservation.notes && (
                                                <div className="mt-1 text-orange-600 dark:text-orange-400">
                                                    📝 {reservation.notes}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
            </div>

            {/* Customer Orders Panel */}
            <CustomerOrdersPanel
                onAddItemsToPOS={handleAddCustomerOrderToPOS}
                onRefresh={handleRefreshOrders}
            />

            {/* Payment Dialog */}
            <PaymentDialog
                isOpen={showPaymentDialog}
                onClose={() => setShowPaymentDialog(false)}
                onConfirm={handlePaymentConfirm}
                totalAmount={finalTotal}
                currencySymbol={currency_symbol}
                subtotal={totalAmount}
                discountAmount={discountAmount}
                serviceChargeAmount={serviceChargeAmount}
            />
        </div>
    );
};
