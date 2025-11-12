import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Head, Link } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { formatDateTimeForDisplay } from '@/Pages/Public/Community/utils/dateUtils';
import type { CommunityCurrency, LendingRecord } from '../Communities/types';

interface LendingRecordsSectionProps {
    id?: string;
    records: LendingRecord[];
    projectIdentifier?: string;
    ownerIdentifier?: string;
    appCurrency?: CommunityCurrency | null;
    emptyMessage?: string;
}

interface LendingPayment {
    id: number | string;
    amount: number;
    payment_date?: string | null;
    reference_number?: string | null;
    method?: string | null;
}

interface LendingBill {
    id: number | string;
    amount: number;
    due_date?: string | null;
    status?: string | null;
}

export interface LendingRecordWithDetails extends LendingRecord {
    payments?: LendingPayment[];
    bills?: LendingBill[];
}

const formatAmount = (
    value: number | string | undefined,
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

export function LendingRecordsSection({
    id = 'lending-records',
    records,
    projectIdentifier,
    ownerIdentifier,
    appCurrency,
    emptyMessage = 'No lending records found.',
}: LendingRecordsSectionProps) {
    const items = Array.isArray(records) ? records : [];

    return (
        <section id={id} className="space-y-4">
            <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Lending Records
                    </CardTitle>
                    <CardDescription>
                        Active and historical loans matched to your profile information.
                    </CardDescription>
                </CardHeader>
                {items.length === 0 ? (
                    <CardContent className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50/70 p-8 text-center text-gray-500 dark:border-gray-600 dark:bg-gray-900/40 dark:text-gray-400">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {emptyMessage}
                        </p>
                        <p className="text-xs">
                            We could not find any lending records that match your profile details.
                        </p>
                    </CardContent>
                ) : (
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 dark:bg-gray-700">
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Loan
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Original Amount
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Balance
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Interest Rate
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Term
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Period
                                    </TableHead>
                                    <TableHead className="text-gray-900 dark:text-white">
                                        Details
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((record) => (
                                    <TableRow
                                        key={record.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <TableCell className="text-gray-900 dark:text-white">
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {record.borrower_name ?? 'Unnamed Borrower'}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    Loan ID: {record.id}
                                                </span>
                                                {(record.contact_number ?? '').trim() !== '' && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Contact: {record.contact_number}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            <div className="flex flex-col">
                                                <span>{record.status ?? '—'}</span>
                                                {record.interest_type && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {record.interest_type} interest
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {formatAmount(record.amount, appCurrency)}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            <div className="flex flex-col">
                                                <span>
                                                    {formatAmount(record.total_balance, appCurrency)}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    Paid:{' '}
                                                    {formatAmount(record.paid_amount, appCurrency)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {formatPercent(record.interest_rate)}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            <div className="flex flex-col">
                                                <span>
                                                    {formatDateTimeForDisplay(
                                                        record.start_date ?? null,
                                                        {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        },
                                                    )}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    to{' '}
                                                    {formatDateTimeForDisplay(
                                                        record.end_date ?? null,
                                                        {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                        },
                                                    )}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            <div className="flex flex-col">
                                                <span>{record.frequency ?? '—'}</span>
                                                {record.installment_frequency && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Installment: {record.installment_frequency}
                                                    </span>
                                                )}
                                                {record.installment_amount && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatAmount(
                                                            record.installment_amount,
                                                            appCurrency,
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {projectIdentifier && ownerIdentifier ? (
                                                <Link
                                                    href={route(
                                                        'customer.projects.lending.show',
                                                        {
                                                            project: projectIdentifier,
                                                            owner: ownerIdentifier,
                                                            loan: record.id,
                                                        },
                                                    )}
                                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                >
                                                    View
                                                </Link>
                                            ) : (
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    –
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                )}
            </Card>
        </section>
    );
}

type OwnerSummary = {
    id: number | string;
    name?: string | null;
    slug?: string | null;
    identifier?: string | null;
    project_identifier?: string | null;
};

export interface LendingIndexProps extends PageProps {
    project: string;
    owner: OwnerSummary;
    records: LendingRecordWithDetails[];
    appCurrency?: CommunityCurrency | null;
    error?: string | null;
    emptyMessage?: string;
    backUrl?: string;
}

export default function LendingIndex({
    auth,
    project,
    owner,
    records,
    appCurrency,
    error,
    emptyMessage,
    backUrl,
}: LendingIndexProps) {
    const ownerName = owner?.name ?? 'Lending Partner';
    const ownerIdentifier =
        owner.slug ?? owner.identifier ?? String(owner.id);

    const loansTotal = records.length;
    const activeLoans = records.filter((loan) => loan.status === 'active').length;

    return (
        <CustomerLayout
            auth={auth}
            title={`Lending Records – ${ownerName}`}
            header={
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Lending Records
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Loans and repayment activity for {ownerName}.
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
            <Head title={`Lending Records – ${ownerName}`} />

            <div className="space-y-6">
                {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-700/70 dark:bg-red-900/20 dark:text-red-300">
                        {error}
                    </div>
                )}

                <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Partner Overview
                        </CardTitle>
                        <CardDescription>
                            Project: <span className="font-semibold">{project}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Partner
                            </p>
                            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                {ownerName}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Identifier
                            </p>
                            <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                                {ownerIdentifier}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Total Loans
                            </p>
                            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                {loansTotal}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Active Loans
                            </p>
                            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                {activeLoans}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <LendingRecordsSection
                    id="lending-records"
                    records={records}
                    projectIdentifier={project}
                    ownerIdentifier={ownerIdentifier}
                    appCurrency={appCurrency}
                    emptyMessage={emptyMessage}
                />
            </div>
        </CustomerLayout>
    );
}


