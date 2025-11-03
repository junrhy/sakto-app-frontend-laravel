import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Card, CardContent } from '@/Components/ui/card';
import { formatCbuAmount } from '../utils';
import type { CbuFund, CbuHistory } from '../types';

interface HistoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedFund: CbuFund | null;
    fundHistory: CbuHistory[];
    isLoading: boolean;
    appCurrency: any;
}

export function HistoryDialog({
    open,
    onOpenChange,
    selectedFund,
    fundHistory,
    isLoading,
    appCurrency,
}: HistoryDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-[95vw] flex-col overflow-hidden sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>
                        Transaction History - {selectedFund?.name}
                    </DialogTitle>
                    <DialogDescription>
                        View all transactions for this CBU fund
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto">
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="py-4 text-center">
                                Loading history...
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
                                                    Amount
                                                </TableHead>
                                                <TableHead className="text-gray-900 dark:text-white">
                                                    Date
                                                </TableHead>
                                                <TableHead className="text-gray-900 dark:text-white">
                                                    Notes
                                                </TableHead>
                                                <TableHead className="text-gray-900 dark:text-white">
                                                    Created At
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {fundHistory.length > 0 ? (
                                                fundHistory.map((item) => (
                                                    <TableRow
                                                        key={`${item.type}-${item.id}`}
                                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    >
                                                        <TableCell className="text-gray-900 dark:text-white">
                                                            <span
                                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                                    item.type ===
                                                                    'contribution'
                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                        : item.type ===
                                                                          'withdrawal'
                                                                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                                }`}
                                                            >
                                                                {item.type ===
                                                                'contribution'
                                                                    ? 'Contribution'
                                                                    : item.type ===
                                                                      'withdrawal'
                                                                      ? 'Withdrawal'
                                                                      : 'Dividend'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-gray-900 dark:text-white">
                                                            <span
                                                                className={
                                                                    item.type ===
                                                                    'withdrawal'
                                                                        ? 'text-red-600 dark:text-red-400'
                                                                        : item.type ===
                                                                          'contribution'
                                                                          ? 'text-green-600 dark:text-green-400'
                                                                          : 'text-blue-600 dark:text-blue-400'
                                                                }
                                                            >
                                                                {item.type ===
                                                                'withdrawal'
                                                                    ? '-'
                                                                    : '+'}
                                                                {formatCbuAmount(
                                                                    item.amount,
                                                                    appCurrency,
                                                                )}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-gray-900 dark:text-white">
                                                            {new Date(
                                                                item.date,
                                                            ).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell className="text-gray-900 dark:text-white">
                                                            {item.notes || '-'}
                                                        </TableCell>
                                                        <TableCell className="text-gray-900 dark:text-white">
                                                            {new Date(
                                                                item.created_at,
                                                            ).toLocaleDateString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={5}
                                                        className="py-4 text-center text-gray-900 dark:text-white"
                                                    >
                                                        No transaction history
                                                        found
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

