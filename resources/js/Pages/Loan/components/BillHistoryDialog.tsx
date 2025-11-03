import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { AlertCircle, CheckCircle, FileText, MoreVertical, XCircle } from 'lucide-react';
import type { Bill, Loan } from '../types';
import { formatAmount } from '../utils';

interface BillHistoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentLoan: Loan | null;
    bills: Bill[];
    billFilter: 'all' | 'pending' | 'paid' | 'overdue';
    appCurrency: any;
    canEdit: boolean;
    canDelete: boolean;
    onBillFilterChange: (filter: 'all' | 'pending' | 'paid' | 'overdue') => void;
    onShowBillDetails: (bill: Bill) => void;
    onBillStatusUpdate: (billId: number, update: { status: 'pending' | 'paid' | 'overdue'; note?: string }) => void;
    onDeleteBill: (billId: number) => void;
}

export function BillHistoryDialog({
    open,
    onOpenChange,
    currentLoan,
    bills,
    billFilter,
    appCurrency,
    canEdit,
    canDelete,
    onBillFilterChange,
    onShowBillDetails,
    onBillStatusUpdate,
    onDeleteBill,
}: BillHistoryDialogProps) {
    const filteredBills = bills.filter((bill) => {
        if (!currentLoan || bill.loan_id !== currentLoan.id) return false;
        if (billFilter === 'all') return true;
        return bill.status === billFilter;
    });

    const statusConfig = {
        paid: {
            color: 'bg-green-100 text-green-800',
            icon: CheckCircle,
        },
        overdue: {
            color: 'bg-red-100 text-red-800',
            icon: XCircle,
        },
        pending: {
            color: 'bg-yellow-100 text-yellow-800',
            icon: AlertCircle,
        },
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-[95vw] flex-col overflow-hidden sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl">
                <DialogHeader>
                    <DialogTitle>
                        Bill History - {currentLoan?.borrower_name}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto">
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={billFilter === 'all' ? 'default' : 'outline'}
                            onClick={() => onBillFilterChange('all')}
                            size="sm"
                        >
                            All
                        </Button>
                        <Button
                            variant={billFilter === 'pending' ? 'default' : 'outline'}
                            onClick={() => onBillFilterChange('pending')}
                            size="sm"
                        >
                            Pending
                        </Button>
                        <Button
                            variant={billFilter === 'paid' ? 'default' : 'outline'}
                            onClick={() => onBillFilterChange('paid')}
                            size="sm"
                        >
                            Paid
                        </Button>
                        <Button
                            variant={billFilter === 'overdue' ? 'default' : 'outline'}
                            onClick={() => onBillFilterChange('overdue')}
                            size="sm"
                        >
                            Overdue
                        </Button>
                    </div>

                    <div className="text-sm text-gray-500">
                        Total Bills:{' '}
                        {bills.filter((bill) => bill.loan_id === currentLoan?.id)
                            .length}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Created At</TableHead>
                                <TableHead className="w-[60px]">Bill #</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Amount Due</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Note</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredBills.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="py-4 text-center"
                                >
                                    No bills found for this loan
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredBills.map((bill) => {
                                const status = bill.status || 'pending';
                                const StatusIcon =
                                    statusConfig[status]?.icon || AlertCircle;

                                const createdDate = new Date(bill.created_at);
                                const formattedCreatedAt = createdDate.toLocaleString(
                                    'en-US',
                                    {
                                        month: 'long',
                                        year: 'numeric',
                                    },
                                );

                                return (
                                    <TableRow key={bill.id}>
                                        <TableCell>{formattedCreatedAt}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                <span className="font-mono">
                                                    #{String(bill.bill_number).padStart(
                                                        4,
                                                        '0',
                                                    )}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(
                                                bill.due_date,
                                            ).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">
                                                {formatAmount(
                                                    bill.total_amount_due,
                                                    appCurrency,
                                                )}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                {status
                                                    ? status
                                                          .charAt(0)
                                                          .toUpperCase() +
                                                      status.slice(1)
                                                    : 'Unknown'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-[200px] truncate text-sm text-gray-600 dark:text-gray-400">
                                                {bill.note || '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            onShowBillDetails(bill)
                                                        }
                                                    >
                                                        View Details
                                                    </DropdownMenuItem>
                                                    {canEdit && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                onBillStatusUpdate(
                                                                    bill.id,
                                                                    {
                                                                        status: 'paid',
                                                                    },
                                                                )
                                                            }
                                                            disabled={
                                                                bill.status === 'paid'
                                                            }
                                                        >
                                                            Mark as Paid
                                                        </DropdownMenuItem>
                                                    )}
                                                    {canEdit && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                onBillStatusUpdate(
                                                                    bill.id,
                                                                    {
                                                                        status: 'overdue',
                                                                    },
                                                                )
                                                            }
                                                            disabled={
                                                                bill.status === 'overdue'
                                                            }
                                                        >
                                                            Mark as Overdue
                                                        </DropdownMenuItem>
                                                    )}
                                                    {canDelete && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                onDeleteBill(bill.id)
                                                            }
                                                            className="text-red-600 dark:text-red-400"
                                                        >
                                                            Delete Bill
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                        </TableBody>
                        </Table>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

