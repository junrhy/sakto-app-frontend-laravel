import React, { useMemo, useCallback } from 'react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Plus, Minus, Printer, QrCode, Calculator, UtensilsCrossed, ShoppingCart, Check } from "lucide-react";
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
            ? menuItems.filter(item => item.category === selectedCategory)
            : menuItems;
    }, [menuItems, selectedCategory]);

    const totalAmount = useMemo(() => 
        orderItems.reduce((total, item) => total + item.price * item.quantity, 0), 
        [orderItems]
    );

    const calculateDiscount = useCallback((amount: number) => {
        if (discountType === 'percentage') {
            return (amount * discount) / 100;
        } else {
            return discount;
        }
    }, [discount, discountType]);

    const discountAmount = useMemo(() => 
        calculateDiscount(totalAmount), 
        [totalAmount, calculateDiscount]
    );

    const finalTotal = useMemo(() => 
        totalAmount - discountAmount, 
        [totalAmount, discountAmount]
    );

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Point of Sale</h2>
                        <p className="text-gray-600 dark:text-gray-400">Manage orders and process payments</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Table</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{tableNumber || 'Not Selected'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Menu Items */}
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-b border-gray-200 dark:border-gray-600">
                        <CardTitle className="text-gray-900 dark:text-white flex items-center">
                            <UtensilsCrossed className="w-5 h-5 mr-2 text-blue-500" />
                            Menu Items
                        </CardTitle>
                    </CardHeader>
                <CardContent className="p-6">
                    <div className="mb-4">
                        <Select onValueChange={onSetSelectedCategory}>
                            <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                <SelectItem value="Main" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">Main Dishes</SelectItem>
                                <SelectItem value="Side" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">Side Dishes</SelectItem>
                                <SelectItem value="Drink" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">Drinks</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {categoryFilteredMenuItems.map((item: MenuItem) => (
                            <Button
                                key={item.id}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onAddItemToOrder(item);
                                }}
                                className="group h-auto flex flex-col items-center p-4 touch-manipulation bg-white hover:bg-blue-50 dark:bg-gray-700 dark:hover:bg-blue-900/20 text-gray-900 dark:text-white rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                                type="button"
                            >
                                <img 
                                    src={item.image || '/images/no-image.jpg'} 
                                    alt={item.name} 
                                    width={100} 
                                    height={100} 
                                    className="mb-2 rounded" 
                                />
                                <span className="text-center">{item.name}</span>
                                <span>{currency_symbol}{item.price}</span>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Current Order */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-gray-200 dark:border-gray-600">
                    <CardTitle className="text-gray-900 dark:text-white flex items-center">
                        <ShoppingCart className="w-5 h-5 mr-2 text-green-500" />
                        Current Order
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="mb-6">
                        <Label htmlFor="tableNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Select Table</Label>
                        <Select value={tableNumber} onValueChange={onSetTableNumber}>
                            <SelectTrigger className="text-lg p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 rounded-lg shadow-sm focus:shadow-md transition-all">
                                <SelectValue placeholder="Select a table" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                {tables.map((table) => (
                                    <SelectItem 
                                        key={table.id} 
                                        value={table.name} 
                                        className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600"
                                    >
                                        {table.name} {table.joined_with ? '(Joined)' : ''} - {table.seats} seats
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-700">
                                <TableHead className="text-gray-900 dark:text-white">Item</TableHead>
                                <TableHead className="text-gray-900 dark:text-white">Quantity</TableHead>
                                <TableHead className="text-gray-900 dark:text-white">Price</TableHead>
                                <TableHead className="text-gray-900 dark:text-white">Total</TableHead>
                                <TableHead className="text-gray-900 dark:text-white">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orderItems.map((item) => (
                                <TableRow key={item.id} className="border-gray-200 dark:border-gray-600">
                                    <TableCell className="text-gray-900 dark:text-white">{item.name}</TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        <div className="flex items-center space-x-2">
                                            <Button size="sm" onClick={() => onUpdateItemQuantity(item.id, item.quantity - 1)}>
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <span className="text-lg text-gray-900 dark:text-white">{item.quantity}</span>
                                            <Button size="sm" onClick={() => onUpdateItemQuantity(item.id, item.quantity + 1)}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">{currency_symbol}{item.price}</TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">{currency_symbol}{(item.price * item.quantity)}</TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        <Button variant="destructive" size="sm" onClick={() => onRemoveItemFromOrder(item.id)}>
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
                                <Label htmlFor="discountType">Discount Type</Label>
                                <Select value={discountType} onValueChange={onSetDiscountType}>
                                    <SelectTrigger className="w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                                        <SelectItem value="percentage" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">Percentage</SelectItem>
                                        <SelectItem value="fixed" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600">Fixed Amount</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-1/3">
                                <Label htmlFor="discount">Discount</Label>
                                <Input
                                    id="discount"
                                    type="number"
                                    value={discount}
                                    onChange={(e) => onSetDiscount(Number(e.target.value))}
                                    placeholder={discountType === 'percentage' ? "%" : "$"}
                                    className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
                
                <CardFooter className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 border-t border-gray-200 dark:border-gray-600 p-4">
                    <div className="w-80 space-y-2 mr-2">
                        <div className="flex justify-between items-center py-1">
                            <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">Subtotal:</span>
                            <span className="text-gray-900 dark:text-white font-semibold">{currency_symbol}{totalAmount}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                            <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">Discount:</span>
                            <span className="text-red-600 dark:text-red-400 font-semibold">{currency_symbol}{discountAmount}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 -mx-3">
                            <span className="font-bold text-gray-900 dark:text-white">Total:</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">{currency_symbol}{finalTotal}</span>
                        </div>
                    </div>
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                        <Button 
                            onClick={onPrintBill} 
                            disabled={orderItems.length === 0} 
                            className="w-full text-sm py-3 bg-gray-600 hover:bg-gray-700 text-white flex items-center justify-center rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Print Bill
                        </Button>
                        <Button 
                            onClick={onShowQRCode} 
                            disabled={orderItems.length === 0} 
                            className="w-full text-sm py-3 bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                        >
                            <QrCode className="mr-2 h-4 w-4" />
                            Show QR Code
                        </Button>
                        <Button 
                            onClick={onSplitBill} 
                            disabled={orderItems.length === 0} 
                            className="w-full text-sm py-3 bg-green-500 hover:bg-green-600 text-white flex items-center justify-center rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                        >
                            <Calculator className="mr-2 h-4 w-4" />
                            Split Bill
                        </Button>
                        <Button 
                            onClick={onPrintKitchenOrder} 
                            disabled={orderItems.length === 0} 
                            className="w-full text-sm py-3 bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center rounded-lg shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Kitchen Order
                        </Button>
                        {orderItems.length > 0 && (
                            <Button 
                                onClick={onCompleteOrder} 
                                className="w-full sm:col-span-2 text-sm py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white flex items-center justify-center rounded-lg shadow-sm hover:shadow-md transition-all duration-200 font-semibold min-h-[48px]"
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
