import { Button } from '@/Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
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
import { Trash } from 'lucide-react';
import type { Loan, Payment } from '../types';
import { formatAmount } from '../utils';

interface PaymentHistoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentLoan: Loan | null;
    payments: Payment[];
    appCurrency: any;
    canDelete: boolean;
    onDeletePayment: (payment: Payment) => void;
}

export function PaymentHistoryDialog({
    open,
    onOpenChange,
    currentLoan,
    payments,
    appCurrency,
    canDelete,
    onDeletePayment,
}: PaymentHistoryDialogProps) {
    const loanPayments = payments.filter(
        (payment) => currentLoan && payment.loan_id === currentLoan.id,
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-[95vw] flex-col overflow-hidden sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>
                        Payment History - {currentLoan?.borrower_name}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto">
                    <div className="overflow-x-auto">
                        <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {loanPayments && loanPayments.length > 0 ? (
                            loanPayments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>
                                        {payment.payment_date
                                            ? new Date(
                                                  payment.payment_date,
                                              ).toLocaleDateString()
                                            : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {formatAmount(
                                            payment.amount,
                                            appCurrency,
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {canDelete && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    onDeletePayment(payment)
                                                }
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={3}
                                    className="text-center"
                                >
                                    No payment records found
                                </TableCell>
                            </TableRow>
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

