import { Button } from '@/Components/ui/button';
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
import { Trash2 } from 'lucide-react';
import React from 'react';
import { HistoryType, Patient } from '../types';
import { formatCurrency, formatDate, formatDateTime } from '../utils';

interface HistoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
    historyType: HistoryType;
    isLoading: boolean;
    currency: string;
    canDelete: boolean;
    onDeleteBill: (patientId: string, billId: number) => void;
    onDeletePayment: (patientId: string, paymentId: number) => void;
    onDeleteCheckup: (patientId: string, checkupId: number) => void;
}

export const HistoryDialog: React.FC<HistoryDialogProps> = ({
    isOpen,
    onClose,
    patient,
    historyType,
    isLoading,
    currency,
    canDelete,
    onDeleteBill,
    onDeletePayment,
    onDeleteCheckup,
}) => {
    if (!patient) return null;

    const renderBillHistory = () => (
        <Table>
            <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-700">
                    <TableHead className="text-gray-900 dark:text-white">
                        Bill #
                    </TableHead>
                    <TableHead className="text-gray-900 dark:text-white">
                        Date
                    </TableHead>
                    <TableHead className="text-gray-900 dark:text-white">
                        Details
                    </TableHead>
                    <TableHead className="text-gray-900 dark:text-white">
                        Amount ({currency})
                    </TableHead>
                    <TableHead className="text-right text-gray-900 dark:text-white">
                        Actions
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {patient.bills?.length === 0 ? (
                    <TableRow>
                        <TableCell
                            colSpan={5}
                            className="text-center text-gray-600 dark:text-gray-400"
                        >
                            No bills found
                        </TableCell>
                    </TableRow>
                ) : (
                    patient.bills?.map((bill) => (
                        <TableRow
                            key={bill.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <TableCell className="text-gray-900 dark:text-white">
                                {bill.bill_number}
                            </TableCell>
                            <TableCell className="text-gray-900 dark:text-white">
                                {formatDate(bill.bill_date)}
                            </TableCell>
                            <TableCell className="text-gray-900 dark:text-white">
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {bill.bill_details}
                                    </span>
                                    {bill.bill_status && (
                                        <span className="text-xs text-gray-400 dark:text-gray-500">
                                            Status: {bill.bill_status}
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="text-gray-900 dark:text-white">
                                {formatCurrency(
                                    parseFloat(bill.bill_amount),
                                    currency,
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                {canDelete && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                            onDeleteBill(patient.id, bill.id)
                                        }
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );

    const renderPaymentHistory = () => (
        <Table>
            <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-700">
                    <TableHead className="text-gray-900 dark:text-white">
                        Date
                    </TableHead>
                    <TableHead className="text-gray-900 dark:text-white">
                        Amount ({currency})
                    </TableHead>
                    <TableHead className="text-gray-900 dark:text-white">
                        Method
                    </TableHead>
                    <TableHead className="text-gray-900 dark:text-white">
                        Notes
                    </TableHead>
                    <TableHead className="text-right text-gray-900 dark:text-white">
                        Actions
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {patient.payments?.length === 0 ? (
                    <TableRow>
                        <TableCell
                            colSpan={5}
                            className="text-center text-gray-600 dark:text-gray-400"
                        >
                            No payments found
                        </TableCell>
                    </TableRow>
                ) : (
                    patient.payments?.map((payment) => (
                        <TableRow
                            key={payment.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <TableCell className="text-gray-900 dark:text-white">
                                {formatDate(payment.payment_date)}
                            </TableCell>
                            <TableCell className="text-gray-900 dark:text-white">
                                {formatCurrency(
                                    parseFloat(payment.payment_amount),
                                    currency,
                                )}
                            </TableCell>
                            <TableCell className="capitalize text-gray-900 dark:text-white">
                                {payment.payment_method}
                            </TableCell>
                            <TableCell className="text-gray-900 dark:text-white">
                                {payment.payment_notes}
                            </TableCell>
                            <TableCell className="text-right">
                                {canDelete && (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                            onDeletePayment(
                                                patient.id,
                                                payment.id,
                                            )
                                        }
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    );

    const renderCheckupHistory = () => (
        <Table>
            <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-700">
                    <TableHead className="text-gray-900 dark:text-white">
                        Date
                    </TableHead>
                    <TableHead className="text-gray-900 dark:text-white">
                        Diagnosis
                    </TableHead>
                    <TableHead className="text-gray-900 dark:text-white">
                        Treatment
                    </TableHead>
                    <TableHead className="text-gray-900 dark:text-white">
                        Notes
                    </TableHead>
                    <TableHead className="text-right text-gray-900 dark:text-white">
                        Actions
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {patient.checkups?.map((checkup) => (
                    <TableRow
                        key={checkup.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        <TableCell className="text-gray-900 dark:text-white">
                            {formatDateTime(checkup.checkup_date)}
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-white">
                            {checkup.diagnosis}
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-white">
                            {checkup.treatment}
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-white">
                            {checkup.notes}
                        </TableCell>
                        <TableCell className="text-right">
                            {canDelete && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() =>
                                        onDeleteCheckup(patient.id, checkup.id)
                                    }
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    const getTitle = () => {
        switch (historyType) {
            case 'bill':
                return `Bill History - ${patient.name}`;
            case 'payment':
                return `Payment History - ${patient.name}`;
            case 'checkup':
                return `Checkup History - ${patient.name}`;
            default:
                return 'History';
        }
    };

    const renderContent = () => {
        switch (historyType) {
            case 'bill':
                return renderBillHistory();
            case 'payment':
                return renderPaymentHistory();
            case 'checkup':
                return renderCheckupHistory();
            default:
                return null;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-white">
                        {getTitle()}
                    </DialogTitle>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-4 text-gray-600 dark:text-gray-400">
                            Loading history...
                        </div>
                    ) : (
                        renderContent()
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
