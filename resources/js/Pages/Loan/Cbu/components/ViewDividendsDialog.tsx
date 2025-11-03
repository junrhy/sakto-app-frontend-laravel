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
import type { CbuDividend, CbuFund } from '../types';
import { formatCbuAmount } from '../utils';

interface ViewDividendsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedFund: CbuFund | null;
    dividends: CbuDividend[];
    isLoading: boolean;
    appCurrency: any;
}

export function ViewDividendsDialog({
    open,
    onOpenChange,
    selectedFund,
    dividends,
    isLoading,
    appCurrency,
}: ViewDividendsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-[95vw] flex-col overflow-hidden sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>
                        Dividends for {selectedFund?.name}
                    </DialogTitle>
                    <DialogDescription>
                        View all dividends paid to this CBU fund
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto">
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="py-4 text-center">
                                Loading dividends...
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
                                                    Dividend Date
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
                                            {dividends &&
                                            dividends.length > 0 ? (
                                                dividends.map((dividend) => (
                                                    <TableRow
                                                        key={dividend.id}
                                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                                    >
                                                        <TableCell className="text-gray-900 dark:text-white">
                                                            {formatCbuAmount(
                                                                dividend.amount,
                                                                appCurrency,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-gray-900 dark:text-white">
                                                            {new Date(
                                                                dividend.dividend_date,
                                                            ).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell className="text-gray-900 dark:text-white">
                                                            {dividend.notes ||
                                                                '-'}
                                                        </TableCell>
                                                        <TableCell className="text-gray-900 dark:text-white">
                                                            {new Date(
                                                                dividend.created_at,
                                                            ).toLocaleDateString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={4}
                                                        className="py-4 text-center text-gray-900 dark:text-white"
                                                    >
                                                        No dividends found
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
