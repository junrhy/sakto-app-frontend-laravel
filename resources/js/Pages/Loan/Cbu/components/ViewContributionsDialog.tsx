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
import type { CbuFund, CbuContribution } from '../types';

interface ViewContributionsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedFund: CbuFund | null;
    contributions: CbuContribution[];
    isLoading: boolean;
    appCurrency: any;
}

export function ViewContributionsDialog({
    open,
    onOpenChange,
    selectedFund,
    contributions,
    isLoading,
    appCurrency,
}: ViewContributionsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-[95vw] flex-col overflow-hidden sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>
                        Contributions for {selectedFund?.name}
                    </DialogTitle>
                    <DialogDescription>
                        View all contributions made to this CBU fund
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto">
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="py-4 text-center">
                                Loading contributions...
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
                                                    Contribution Date
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
                                            {contributions &&
                                            contributions.length > 0 ? (
                                                contributions.map(
                                                    (contribution) => (
                                                        <TableRow
                                                            key={contribution.id}
                                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                                        >
                                                            <TableCell className="text-gray-900 dark:text-white">
                                                                {formatCbuAmount(
                                                                    contribution.amount,
                                                                    appCurrency,
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-gray-900 dark:text-white">
                                                                {new Date(
                                                                    contribution.contribution_date,
                                                                ).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell className="text-gray-900 dark:text-white">
                                                                {contribution.notes ||
                                                                    '-'}
                                                            </TableCell>
                                                            <TableCell className="text-gray-900 dark:text-white">
                                                                {new Date(
                                                                    contribution.created_at,
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
                                                        No contributions found
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

