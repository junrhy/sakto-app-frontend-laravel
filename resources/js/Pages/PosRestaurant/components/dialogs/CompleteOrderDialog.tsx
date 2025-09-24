import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import React from 'react';
import { OrderItem } from '../../types';

interface CompleteOrderDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    orderItems: OrderItem[];
    tableNumber: string;
    totalAmount: number;
    discountAmount: number;
    finalTotal: number;
    currency_symbol: string;
}

export const CompleteOrderDialog: React.FC<CompleteOrderDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    orderItems,
    tableNumber,
    totalAmount,
    discountAmount,
    finalTotal,
    currency_symbol,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Complete Order</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                        <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
                            Order Summary
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">
                                    Table:
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {tableNumber}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-300">
                                    Total Items:
                                </span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {orderItems.length}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-600">
                                    <th className="py-2 text-left text-gray-600 dark:text-gray-300">
                                        Item
                                    </th>
                                    <th className="py-2 text-right text-gray-600 dark:text-gray-300">
                                        Qty
                                    </th>
                                    <th className="py-2 text-right text-gray-600 dark:text-gray-300">
                                        Price
                                    </th>
                                    <th className="py-2 text-right text-gray-600 dark:text-gray-300">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderItems.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-b border-gray-100 dark:border-gray-700"
                                    >
                                        <td className="py-2 text-gray-900 dark:text-white">
                                            {item.name}
                                        </td>
                                        <td className="py-2 text-right text-gray-900 dark:text-white">
                                            {item.quantity}
                                        </td>
                                        <td className="py-2 text-right text-gray-900 dark:text-white">
                                            {currency_symbol}
                                            {item.price}
                                        </td>
                                        <td className="py-2 text-right text-gray-900 dark:text-white">
                                            {currency_symbol}
                                            {item.price * item.quantity}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="space-y-2 rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">
                                Subtotal:
                            </span>
                            <span className="text-gray-900 dark:text-white">
                                {currency_symbol}
                                {totalAmount}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">
                                Discount:
                            </span>
                            <span className="text-gray-900 dark:text-white">
                                {currency_symbol}
                                {discountAmount}
                            </span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-semibold dark:border-gray-600">
                            <span className="text-gray-900 dark:text-white">
                                Total Amount:
                            </span>
                            <span className="text-gray-900 dark:text-white">
                                {currency_symbol}
                                {finalTotal}
                            </span>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="bg-gray-700 text-white hover:bg-gray-600"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className="bg-blue-500 text-white hover:bg-blue-600"
                    >
                        Confirm Order
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
