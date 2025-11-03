import { Card, CardContent } from '@/Components/ui/card';
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
import type { CbuFund, CbuWithdrawal } from '../types';
import { formatCbuAmount } from '../utils';

interface ViewWithdrawalsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedFund: CbuFund | null;
    withdrawals: CbuWithdrawal[];
    isLoading: boolean;
    appCurrency: any;
}

export function ViewWithdrawalsDialog({
    open,
    onOpenChange,
    selectedFund,
    withdrawals,
    isLoading,
    appCurrency,
}: ViewWithdrawalsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-[95vw] flex-col overflow-hidden sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>
                        Withdrawals for {selectedFund?.name}
                    </DialogTitle>
                    <DialogDescription>
                        View all withdrawals made from this CBU fund
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto">
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="py-4 text-center">
                                Loading withdrawals...
                            </div>
                        ) : (
                            <Card>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50 dark:bg-gray-700">
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
                                            {withdrawals &&
                                            withdrawals.length > 0 ? (
                                                withdrawals.map(
                                                    (withdrawal) => (
                                                        <TableRow
                                                            key={withdrawal.id}
                                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                                        >
                                                            <TableCell className="text-gray-900 dark:text-white">
                                                                {formatCbuAmount(
                                                                    withdrawal.amount,
                                                                    appCurrency,
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-gray-900 dark:text-white">
                                                                {new Date(
                                                                    withdrawal.date,
                                                                ).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell className="text-gray-900 dark:text-white">
                                                                {withdrawal.notes ||
                                                                    '-'}
                                                            </TableCell>
                                                            <TableCell className="text-gray-900 dark:text-white">
                                                                {new Date(
                                                                    withdrawal.created_at,
                                                                ).toLocaleDateString()}
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={4}
                                                        className="py-4 text-center text-gray-900 dark:text-white"
                                                    >
                                                        No withdrawals found
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
