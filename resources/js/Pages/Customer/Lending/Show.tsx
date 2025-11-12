import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import { formatDateTimeForDisplay } from '@/Pages/Public/Community/utils/dateUtils';
import type { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import type { CommunityCurrency } from '../Communities/types';

interface OwnerSummary {
    id: number | string;
    name?: string | null;
    slug?: string | null;
    identifier?: string | null;
    project_identifier?: string | null;
}

interface LendingPayment {
    id: number | string;
    amount: number;
    payment_date?: string | null;
    reference_number?: string | null;
    method?: string | null;
    created_at?: string | null;
}

interface LendingBill {
    id: number | string;
    amount: number;
    due_date?: string | null;
    status?: string | null;
    created_at?: string | null;
}

interface LendingLoan {
    id: number | string;
    borrower_name?: string | null;
    status?: string | null;
    amount?: number | string | null;
    total_balance?: number | string | null;
    paid_amount?: number | string | null;
    interest_rate?: number | string | null;
    interest_type?: string | null;
    frequency?: string | null;
    installment_frequency?: string | null;
    installment_amount?: number | string | null;
    start_date?: string | null;
    end_date?: string | null;
    contact_number?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    total_interest?: number | string | null;
    principal_balance?: number | string | null;
}

interface LendingShowProps extends PageProps {
    project: string;
    owner: OwnerSummary;
    loan: LendingLoan | null;
    payments: LendingPayment[];
    bills: LendingBill[];
    appCurrency?: CommunityCurrency | null;
    error?: string | null;
    backUrl?: string;
}

const formatAmount = (
    value: number | string | undefined | null,
    currency?: CommunityCurrency | null,
): string => {
    if (value === undefined || value === null) {
        return '—';
    }

    const numeric =
        typeof value === 'string' ? Number.parseFloat(value) : Number(value);

    if (Number.isNaN(numeric)) {
        return '—';
    }

    const symbol = currency?.symbol ?? '₱';
    const decimal = currency?.decimal_separator ?? '.';
    const thousands = currency?.thousands_separator ?? ',';

    const [whole, fraction = '00'] = numeric.toFixed(2).split('.');
    const wholeWithSeparators = whole.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        thousands,
    );

    return `${symbol}${wholeWithSeparators}${decimal}${fraction}`;
};

const formatPercent = (value?: number | string | null): string => {
    if (value === null || value === undefined) {
        return '—';
    }

    const numeric =
        typeof value === 'string' ? Number.parseFloat(value) : Number(value);

    if (Number.isNaN(numeric)) {
        return '—';
    }

    return `${numeric}%`;
};

export default function LendingShow({
    auth,
    project,
    owner,
    loan,
    payments,
    bills,
    appCurrency,
    error,
    backUrl,
}: LendingShowProps) {
    const ownerName = owner?.name ?? 'Lending Partner';
    const memberName = loan?.borrower_name ?? 'Borrower';

    return (
        <CustomerLayout
            auth={auth}
            title={`Loan Details – ${memberName}`}
            header={
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Loan Details
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Comprehensive view of the loan under {ownerName}.
                        </p>
                    </div>
                    <Link
                        href={backUrl ?? route('customer.dashboard')}
                        className="inline-flex items-center justify-center rounded-md border border-indigo-500 px-3 py-1 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-300 dark:hover:bg-indigo-400/10"
                    >
                        ← Back
                    </Link>
                </div>
            }
        >
            <Head title={`Loan Details – ${memberName}`} />

            <div className="space-y-6">
                {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-700/70 dark:bg-red-900/20 dark:text-red-300">
                        {error}
                    </div>
                )}

                {loan ? (
                    <>
                        <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Loan Summary
                                </CardTitle>
                                <CardDescription>
                                    Project:{' '}
                                    <span className="font-semibold">
                                        {project}
                                    </span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Borrower
                                    </p>
                                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                        {memberName}
                                    </p>
                                    {loan.contact_number && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {loan.contact_number}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Status
                                    </p>
                                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                        {loan.status ?? '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Original Amount
                                    </p>
                                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                        {formatAmount(loan.amount, appCurrency)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Current Balance
                                    </p>
                                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                        {formatAmount(
                                            loan.total_balance,
                                            appCurrency,
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Paid:{' '}
                                        {formatAmount(
                                            loan.paid_amount,
                                            appCurrency,
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Interest Rate / Type
                                    </p>
                                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                        {formatPercent(loan.interest_rate)}{' '}
                                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                            ({loan.interest_type ?? '—'})
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Term
                                    </p>
                                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                        {formatDateTimeForDisplay(
                                            loan.start_date ?? null,
                                            {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            },
                                        )}{' '}
                                        –{' '}
                                        {formatDateTimeForDisplay(
                                            loan.end_date ?? null,
                                            {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                            },
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Payment Schedule
                                    </p>
                                    <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                        {loan.frequency ?? '—'}
                                    </p>
                                    {loan.installment_frequency && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Installment:{' '}
                                            {loan.installment_frequency}{' '}
                                            {loan.installment_amount
                                                ? `(${formatAmount(
                                                      loan.installment_amount,
                                                      appCurrency,
                                                  )})`
                                                : ''}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Payment History
                                </CardTitle>
                                <CardDescription>
                                    All recorded payments for this loan.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {payments.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50 dark:bg-gray-700">
                                                <TableHead className="text-gray-900 dark:text-white">
                                                    Payment Date
                                                </TableHead>
                                                <TableHead className="text-gray-900 dark:text-white">
                                                    Amount
                                                </TableHead>
                                                <TableHead className="text-gray-900 dark:text-white">
                                                    Method
                                                </TableHead>
                                                <TableHead className="text-gray-900 dark:text-white">
                                                    Reference
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {payments.map((payment) => (
                                                <TableRow
                                                    key={payment.id}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                                >
                                                    <TableCell className="text-gray-900 dark:text-white">
                                                        {formatDateTimeForDisplay(
                                                            payment.payment_date ??
                                                                null,
                                                            {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                            },
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-gray-900 dark:text-white">
                                                        {formatAmount(
                                                            payment.amount,
                                                            appCurrency,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-gray-900 dark:text-white">
                                                        {payment.method ?? '—'}
                                                    </TableCell>
                                                    <TableCell className="text-gray-900 dark:text-white">
                                                        {payment.reference_number ??
                                                            '—'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="p-6 text-sm text-gray-600 dark:text-gray-300">
                                        No payments have been recorded yet.
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="dark border border-gray-200 border-gray-700 shadow-sm dark:bg-gray-800/80">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Billing Schedule
                                </CardTitle>
                                <CardDescription>
                                    Generated loan bills and their status.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {bills.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50 dark:bg-gray-700">
                                                <TableHead className="text-gray-900 dark:text-white">
                                                    Due Date
                                                </TableHead>
                                                <TableHead className="text-gray-900 dark:text-white">
                                                    Amount
                                                </TableHead>
                                                <TableHead className="text-gray-900 dark:text-white">
                                                    Status
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {bills.map((bill) => (
                                                <TableRow
                                                    key={bill.id}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                                >
                                                    <TableCell className="text-gray-900 dark:text-white">
                                                        {formatDateTimeForDisplay(
                                                            bill.due_date ??
                                                                null,
                                                            {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                            },
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-gray-900 dark:text-white">
                                                        {formatAmount(
                                                            bill.amount,
                                                            appCurrency,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-gray-900 dark:text-white">
                                                        {bill.status ?? '—'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="p-6 text-sm text-gray-600 dark:text-gray-300">
                                        No scheduled bills found for this loan.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
                        <CardContent className="p-6 text-sm text-gray-600 dark:text-gray-300">
                            We couldn’t find that loan record. It may have been
                            removed or you might not have access.
                        </CardContent>
                    </Card>
                )}
            </div>
        </CustomerLayout>
    );
}
