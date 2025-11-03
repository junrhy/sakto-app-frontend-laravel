import { Button } from '@/Components/ui/button';
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
import type { Loan, InstallmentOption } from '../types';
import { LOAN_DURATIONS, INSTALLMENT_OPTIONS } from '../constants';
import { calculateInstallmentAmount, formatAmount } from '../utils';

interface ValidationErrors {
    start_date: string;
    end_date: string;
    status: string;
    borrower_name: string;
    amount: string;
    interest_rate: string;
}

interface LoanFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentLoan: Loan | null;
    validationErrors: ValidationErrors;
    dateError: string;
    installmentAmount: string;
    appCurrency: any;
    onLoanChange: (loan: Partial<Loan>) => void;
    onValidationErrorChange: (errors: Partial<ValidationErrors>) => void;
    onDateErrorChange: (error: string) => void;
    onInstallmentAmountChange: (amount: string) => void;
    onDurationChange: (days: number | null) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export function LoanFormDialog({
    open,
    onOpenChange,
    currentLoan,
    validationErrors,
    dateError,
    installmentAmount,
    appCurrency,
    onLoanChange,
    onValidationErrorChange,
    onDateErrorChange,
    onInstallmentAmountChange,
    onDurationChange,
    onSubmit,
}: LoanFormDialogProps) {
    if (!currentLoan) return null;

    const getDurationValue = () => {
        if (!currentLoan.start_date || !currentLoan.end_date) return '';
        const startDate = new Date(currentLoan.start_date);
        const endDate = new Date(currentLoan.end_date);
        const diffDays = Math.round(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        const matchingDuration = LOAN_DURATIONS.find((d) => d.days === diffDays);
        return matchingDuration ? diffDays.toString() : 'null';
    };

    const handleInstallmentFrequencyChange = (
        value: InstallmentOption['value'] | 'none',
    ) => {
        if (value === 'none') {
            onInstallmentAmountChange('0');
            onLoanChange({
                installment_frequency: null,
                installment_amount: null,
            });
        } else if (
            currentLoan.total_balance &&
            currentLoan.start_date &&
            currentLoan.end_date
        ) {
            const amount = calculateInstallmentAmount(
                parseFloat(currentLoan.total_balance),
                currentLoan.start_date,
                currentLoan.end_date,
                value,
            );
            onInstallmentAmountChange(amount.toFixed(2));
            onLoanChange({
                installment_frequency: value,
                installment_amount: amount.toFixed(2),
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-[95vw] flex-col overflow-hidden sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>
                        {currentLoan.id ? 'Edit Loan' : 'Add Loan'}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
                    <div className="min-h-0 flex-1 overflow-y-auto">
                        <div className="grid gap-3 py-4">
                            {/* Row 1: Borrower Name, Amount, Interest Rate */}
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-1">
                                    <Label htmlFor="borrowerName">
                                        Borrower Name{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="borrowerName"
                                        value={currentLoan.borrower_name || ''}
                                        onChange={(e) => {
                                            onValidationErrorChange({
                                                borrower_name: '',
                                            });
                                            onLoanChange({
                                                borrower_name: e.target.value,
                                            });
                                        }}
                                        className={
                                            validationErrors.borrower_name
                                                ? 'border-red-500'
                                                : ''
                                        }
                                    />
                                    {validationErrors.borrower_name && (
                                        <p className="text-sm text-red-500">
                                            {validationErrors.borrower_name}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="amount">
                                        Amount{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={currentLoan.amount || ''}
                                        onChange={(e) => {
                                            onValidationErrorChange({ amount: '' });
                                            onLoanChange({ amount: e.target.value });
                                        }}
                                        className={
                                            validationErrors.amount
                                                ? 'border-red-500'
                                                : ''
                                        }
                                    />
                                    {validationErrors.amount && (
                                        <p className="text-sm text-red-500">
                                            {validationErrors.amount}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="interestRate">
                                        Interest Rate{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="interestRate"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={currentLoan.interest_rate || ''}
                                        onChange={(e) => {
                                            onValidationErrorChange({
                                                interest_rate: '',
                                            });
                                            onLoanChange({
                                                interest_rate: e.target.value,
                                            });
                                        }}
                                        className={
                                            validationErrors.interest_rate
                                                ? 'border-red-500'
                                                : ''
                                        }
                                    />
                                    {validationErrors.interest_rate && (
                                        <p className="text-sm text-red-500">
                                            {validationErrors.interest_rate}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Row 2: Interest Type, Frequency, Duration */}
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-1">
                                    <Label htmlFor="interestType">
                                        Interest Type
                                    </Label>
                                    <Select
                                        value={currentLoan.interest_type || 'fixed'}
                                        onValueChange={(value: 'fixed' | 'compounding') =>
                                            onLoanChange({
                                                interest_type: value,
                                                frequency:
                                                    currentLoan.frequency || 'monthly',
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select interest type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fixed">
                                                Fixed Interest
                                            </SelectItem>
                                            <SelectItem value="compounding">
                                                Compounding Interest
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="frequency">
                                        Frequency{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={currentLoan.frequency || 'monthly'}
                                        onValueChange={(
                                            value:
                                                | 'daily'
                                                | 'monthly'
                                                | 'quarterly'
                                                | 'annually',
                                        ) => onLoanChange({ frequency: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select frequency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="quarterly">
                                                Quarterly
                                            </SelectItem>
                                            <SelectItem value="annually">
                                                Annually
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="duration">
                                        Duration{' '}
                                        <span className="text-xs text-gray-500">
                                            (Quick select)
                                        </span>
                                    </Label>
                                    <Select
                                        value={getDurationValue()}
                                        onValueChange={(value) =>
                                            onDurationChange(
                                                value === 'null' ? null : parseInt(value),
                                            )
                                        }
                                        disabled={!currentLoan.start_date}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select loan duration" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LOAN_DURATIONS.map((duration) => (
                                                <SelectItem
                                                    key={duration.label}
                                                    value={
                                                        duration.days?.toString() ?? 'null'
                                                    }
                                                >
                                                    {duration.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {!currentLoan.start_date && (
                                        <p className="text-xs text-gray-500">
                                            Set start date first
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Row 3: Start Date, End Date, Status */}
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-1">
                                    <Label htmlFor="startDate">
                                        Start Date{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={currentLoan.start_date || ''}
                                        onChange={(e) => {
                                            onDateErrorChange('');
                                            onValidationErrorChange({ start_date: '' });
                                            const newStartDate = e.target.value;
                                            
                                            // If end date exists, maintain the same duration
                                            if (newStartDate && currentLoan.end_date && currentLoan.start_date) {
                                                const startDate = new Date(newStartDate);
                                                const oldStartDate = new Date(currentLoan.start_date);
                                                const oldEndDate = new Date(currentLoan.end_date);
                                                
                                                // Calculate the difference in days
                                                const diffDays = Math.round(
                                                    (oldEndDate.getTime() - oldStartDate.getTime()) / (1000 * 60 * 60 * 24)
                                                );
                                                
                                                // Apply the same duration from new start date
                                                const newEndDate = new Date(startDate);
                                                newEndDate.setDate(newEndDate.getDate() + diffDays);
                                                
                                                onLoanChange({
                                                    start_date: newStartDate,
                                                    end_date: newEndDate.toISOString().split('T')[0],
                                                });
                                            } else {
                                                // Just update start date, let user set end date manually or use Duration
                                                onLoanChange({ start_date: newStartDate });
                                            }
                                        }}
                                        className={
                                            validationErrors.start_date
                                                ? 'border-red-500'
                                                : ''
                                        }
                                    />
                                    {validationErrors.start_date && (
                                        <p className="text-sm text-red-500">
                                            {validationErrors.start_date}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="endDate">
                                        End Date{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={currentLoan.end_date || ''}
                                        onChange={(e) => {
                                            onDateErrorChange('');
                                            onValidationErrorChange({ end_date: '' });
                                            onLoanChange({ end_date: e.target.value });
                                        }}
                                        className={
                                            validationErrors.end_date || dateError
                                                ? 'border-red-500'
                                                : ''
                                        }
                                    />
                                    {validationErrors.end_date && (
                                        <p className="text-sm text-red-500">
                                            {validationErrors.end_date}
                                        </p>
                                    )}
                                    {dateError && (
                                        <p className="text-sm text-red-500">
                                            {dateError}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="status">
                                        Status{' '}
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Select
                                        value={currentLoan.status || ''}
                                        onValueChange={(
                                            value: 'active' | 'paid' | 'defaulted',
                                        ) => {
                                            onValidationErrorChange({ status: '' });
                                            onLoanChange({ status: value });
                                        }}
                                    >
                                        <SelectTrigger
                                            className={
                                                validationErrors.status ? 'border-red-500' : ''
                                            }
                                        >
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="defaulted">
                                                Defaulted
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {validationErrors.status && (
                                        <p className="text-sm text-red-500">
                                            {validationErrors.status}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Row 4: Installment Frequency */}
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-1 md:col-span-2 lg:col-span-1">
                                    <Label htmlFor="installmentFrequency">
                                        Installment Frequency
                                    </Label>
                                    <Select
                                        value={currentLoan.installment_frequency || ''}
                                        onValueChange={handleInstallmentFrequencyChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select frequency (optional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                No installments
                                            </SelectItem>
                                            {INSTALLMENT_OPTIONS.map((option) => (
                                                <SelectItem
                                                    key={option.value}
                                                    value={option.value}
                                                >
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Installment Amount Display - Full Width (when shown) */}
                            {currentLoan.installment_frequency && (
                                <div className="space-y-1">
                                    <Label>Installment Amount</Label>
                                    <div className="rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-medium">
                                                    {formatAmount(
                                                        currentLoan.installment_amount ||
                                                            installmentAmount,
                                                        appCurrency,
                                                    )}
                                                </span>
                                                <span className="ml-2 text-sm text-gray-500">
                                                    per{' '}
                                                    {currentLoan.installment_frequency.replace(
                                                        '-',
                                                        ' ',
                                                    )}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {(() => {
                                                    const option =
                                                        INSTALLMENT_OPTIONS.find(
                                                            (opt) =>
                                                                opt.value ===
                                                                currentLoan.installment_frequency,
                                                        );
                                                    if (!option) return null;
                                                    const totalDays = Math.ceil(
                                                        (new Date(
                                                            currentLoan.end_date,
                                                        ).getTime() -
                                                            new Date(
                                                                currentLoan.start_date,
                                                            ).getTime()) /
                                                            (1000 * 60 * 60 * 24),
                                                    );
                                                    const numberOfInstallments =
                                                        Math.ceil(
                                                            totalDays /
                                                                option.daysInterval,
                                                        );
                                                    return `${numberOfInstallments} installments total`;
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="flex-shrink-0 border-t border-gray-200 pt-4 dark:border-gray-700">
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

