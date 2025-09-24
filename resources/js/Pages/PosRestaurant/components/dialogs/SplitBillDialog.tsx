import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import React, { useMemo, useState } from 'react';
import { OrderItem } from '../../types';

interface SplitBillDialogProps {
    isOpen: boolean;
    onClose: () => void;
    orderItems: OrderItem[];
    tableNumber: string;
    totalAmount: number;
    discountAmount: number;
    finalTotal: number;
    currency_symbol: string;
}

export const SplitBillDialog: React.FC<SplitBillDialogProps> = ({
    isOpen,
    onClose,
    orderItems,
    tableNumber,
    totalAmount,
    discountAmount,
    finalTotal,
    currency_symbol,
}) => {
    const [splitMethod, setSplitMethod] = useState<'amount' | 'item'>('amount');
    const [splitAmount, setSplitAmount] = useState<number>(2);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const selectedItemsTotal = useMemo(() => {
        if (splitMethod === 'item') {
            return orderItems
                .filter((item) => selectedItems.includes(item.id))
                .reduce((total, item) => total + item.price * item.quantity, 0);
        }
        return finalTotal;
    }, [orderItems, selectedItems, splitMethod, finalTotal]);

    const amountPerPerson = useMemo(() => {
        return selectedItemsTotal / splitAmount;
    }, [selectedItemsTotal, splitAmount]);

    const handleItemSelection = (itemId: number, checked: boolean) => {
        if (checked) {
            setSelectedItems((prev) => [...prev, itemId]);
        } else {
            setSelectedItems((prev) => prev.filter((id) => id !== itemId));
        }
    };

    const handleSelectAllItems = (checked: boolean) => {
        if (checked) {
            setSelectedItems(orderItems.map((item) => item.id));
        } else {
            setSelectedItems([]);
        }
    };

    const printSplitBill = () => {
        const printWindow = window.open('', '', 'height=600,width=800');
        if (!printWindow) {
            alert('Please allow pop-ups to print bills');
            return;
        }

        const orderItemsDetails = orderItems
            .map((item) => {
                const isSelected =
                    splitMethod === 'item'
                        ? selectedItems.includes(item.id)
                        : true;
                return `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${currency_symbol}${item.price}</td>
                    <td>${currency_symbol}${item.price * item.quantity}</td>
                    <td>${isSelected ? '✓' : '✗'}</td>
                </tr>
            `;
            })
            .join('');

        const printContent = `
            <html>
                <head>
                    <title>Split Bill</title>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 20px;
                            line-height: 1.6;
                        }
                        .header {
                            text-align: center;
                            border-bottom: 2px solid #333;
                            padding-bottom: 10px;
                            margin-bottom: 20px;
                        }
                        .bill-details {
                            margin-bottom: 20px;
                        }
                        .bill-details h3 {
                            margin-bottom: 10px;
                            color: #333;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 20px;
                        }
                        th, td {
                            border: 1px solid #ddd;
                            padding: 8px;
                            text-align: left;
                        }
                        th {
                            background-color: #f2f2f2;
                            font-weight: bold;
                        }
                        .total-section {
                            border-top: 2px solid #333;
                            padding-top: 10px;
                            margin-top: 20px;
                        }
                        .split-details {
                            background-color: #f9f9f9;
                            padding: 15px;
                            border-radius: 5px;
                            margin-top: 20px;
                        }
                        .amount-per-person {
                            font-size: 1.2em;
                            font-weight: bold;
                            color: #2c5aa0;
                            text-align: center;
                            margin-top: 10px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>Split Bill</h2>
                        <p>Table Number: ${tableNumber}</p>
                        <p>Date: ${new Date().toLocaleDateString()}</p>
                        <p>Time: ${new Date().toLocaleTimeString()}</p>
                    </div>

                    <div class="bill-details">
                        <h3>Order Items</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                    <th>Selected</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${orderItemsDetails}
                            </tbody>
                        </table>
                    </div>

                    <div class="total-section">
                        <p><strong>Subtotal: ${currency_symbol}${totalAmount}</strong></p>
                        <p><strong>Discount: ${currency_symbol}${discountAmount}</strong></p>
                        <p><strong>Total Amount: ${currency_symbol}${finalTotal}</strong></p>
                    </div>

                    <div class="split-details">
                        <h3>Split Details</h3>
                        <p><strong>Split Method:</strong> ${splitMethod === 'amount' ? 'Split by Amount' : 'Split by Selected Items'}</p>
                        <p><strong>Number of People:</strong> ${splitAmount}</p>
                        <p><strong>Amount to Split:</strong> ${currency_symbol}${selectedItemsTotal}</p>
                        <div class="amount-per-person">
                            Amount per Person: ${currency_symbol}${amountPerPerson.toFixed(2)}
                        </div>
                    </div>
                </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    const handleClose = () => {
        setSplitMethod('amount');
        setSplitAmount(2);
        setSelectedItems([]);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Split Bill</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <div className="space-y-4">
                        <div>
                            <Label>Split Method</Label>
                            <Select
                                value={splitMethod}
                                onValueChange={(value: 'amount' | 'item') =>
                                    setSplitMethod(value)
                                }
                            >
                                <SelectTrigger className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700">
                                    <SelectItem
                                        value="amount"
                                        className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                    >
                                        Split by Amount
                                    </SelectItem>
                                    <SelectItem
                                        value="item"
                                        className="text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                                    >
                                        Split by Selected Items
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="splitAmount">
                                Number of People
                            </Label>
                            <Input
                                id="splitAmount"
                                type="number"
                                min="2"
                                value={splitAmount}
                                onChange={(e) =>
                                    setSplitAmount(
                                        parseInt(e.target.value) || 2,
                                    )
                                }
                                className="border border-gray-300 bg-white text-gray-900 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                            />
                        </div>

                        {splitMethod === 'item' && (
                            <div>
                                <Label>Select Items to Split</Label>
                                <div className="mt-2 max-h-60 space-y-2 overflow-y-auto">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            checked={
                                                selectedItems.length ===
                                                    orderItems.length &&
                                                orderItems.length > 0
                                            }
                                            onCheckedChange={
                                                handleSelectAllItems
                                            }
                                        />
                                        <Label className="text-sm font-medium">
                                            Select All
                                        </Label>
                                    </div>
                                    {orderItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                checked={selectedItems.includes(
                                                    item.id,
                                                )}
                                                onCheckedChange={(checked) =>
                                                    handleItemSelection(
                                                        item.id,
                                                        checked as boolean,
                                                    )
                                                }
                                            />
                                            <Label className="text-sm">
                                                {item.name} - {currency_symbol}
                                                {item.price} x {item.quantity} ={' '}
                                                {currency_symbol}
                                                {item.price * item.quantity}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                            <h4 className="mb-2 font-semibold">
                                Split Summary
                            </h4>
                            <p>
                                Amount to Split: {currency_symbol}
                                {selectedItemsTotal}
                            </p>
                            <p>Number of People: {splitAmount}</p>
                            <p className="text-lg font-semibold">
                                Amount per Person: {currency_symbol}
                                {amountPerPerson.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={printSplitBill}
                        disabled={
                            splitMethod === 'item' && selectedItems.length === 0
                        }
                    >
                        Split Bill
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
