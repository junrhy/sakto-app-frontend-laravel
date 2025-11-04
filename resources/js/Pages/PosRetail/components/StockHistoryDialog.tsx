import { Card, CardContent } from '@/Components/ui/card';
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
import { format } from 'date-fns';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StockTransaction {
    id: number;
    transaction_type: 'add' | 'remove' | 'adjustment';
    quantity: number;
    previous_quantity: number;
    new_quantity: number;
    reason: string | null;
    reference_number: string | null;
    performed_by: string | null;
    transaction_date: string;
}

interface Product {
    id: number;
    name: string;
    quantity: number;
}

interface StockHistoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
}

export default function StockHistoryDialog({
    open,
    onOpenChange,
    product,
}: StockHistoryDialogProps) {
    const [transactions, setTransactions] = useState<StockTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open && product) {
            fetchStockHistory();
        }
    }, [open, product]);

    const fetchStockHistory = async () => {
        if (!product) return;

        try {
            setIsLoading(true);
            // Fetch stock history using fetch API since Inertia doesn't handle JSON responses well
            const fetchResponse = await fetch(
                `/inventory/${product.id}/stock/history`,
                {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    credentials: 'same-origin',
                },
            );

            if (!fetchResponse.ok) {
                throw new Error('Failed to fetch stock history');
            }

            const data = await fetchResponse.json();
            if (data.status === 'success' && data.data?.transactions) {
                setTransactions(data.data.transactions);
            }
        } catch (error) {
            console.error('Failed to fetch stock history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'add':
                return <Plus className="h-4 w-4 text-green-600" />;
            case 'remove':
                return <Minus className="h-4 w-4 text-red-600" />;
            case 'adjustment':
                return <RotateCcw className="h-4 w-4 text-blue-600" />;
            default:
                return null;
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case 'add':
                return 'text-green-600 dark:text-green-400';
            case 'remove':
                return 'text-red-600 dark:text-red-400';
            case 'adjustment':
                return 'text-blue-600 dark:text-blue-400';
            default:
                return '';
        }
    };

    if (!product) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        Stock History - {product.name}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {/* Current Stock Info */}
                    <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Current Stock
                        </div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {product.quantity} units
                        </div>
                    </div>

                    {/* Transactions Table */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-gray-500 dark:text-gray-400">
                                Loading history...
                            </div>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-gray-500 dark:text-gray-400">
                                No stock transactions found
                            </div>
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50 dark:bg-gray-700">
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Type
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Date
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Previous
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Change
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                New Quantity
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Reason
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Reference
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Performed By
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.map((transaction) => (
                                            <TableRow
                                                key={transaction.id}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                <TableCell className="text-gray-900 dark:text-white">
                                                    <div className="flex items-center gap-2">
                                                        {getTransactionIcon(
                                                            transaction.transaction_type,
                                                        )}
                                                        <span
                                                            className={`capitalize ${getTransactionColor(
                                                                transaction.transaction_type,
                                                            )}`}
                                                        >
                                                            {
                                                                transaction.transaction_type
                                                            }
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-gray-900 dark:text-white">
                                                    {format(
                                                        new Date(
                                                            transaction.transaction_date,
                                                        ),
                                                        'MMM dd, yyyy HH:mm',
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-gray-900 dark:text-white">
                                                    {
                                                        transaction.previous_quantity
                                                    }
                                                </TableCell>
                                                <TableCell
                                                    className={`font-semibold ${getTransactionColor(
                                                        transaction.transaction_type,
                                                    )}`}
                                                >
                                                    {transaction.transaction_type ===
                                                    'remove'
                                                        ? '-'
                                                        : transaction.transaction_type ===
                                                            'add'
                                                          ? '+'
                                                          : ''}
                                                    {transaction.quantity}
                                                </TableCell>
                                                <TableCell className="font-semibold text-gray-900 dark:text-white">
                                                    {transaction.new_quantity}
                                                </TableCell>
                                                <TableCell className="text-gray-900 dark:text-white">
                                                    {transaction.reason ||
                                                        'N/A'}
                                                </TableCell>
                                                <TableCell className="text-gray-900 dark:text-white">
                                                    {transaction.reference_number ||
                                                        'N/A'}
                                                </TableCell>
                                                <TableCell className="text-gray-900 dark:text-white">
                                                    {transaction.performed_by ||
                                                        'N/A'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
