import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { formatDateTimeForDisplay } from '@/Pages/Public/Community/utils/dateUtils';
import { CommunityCurrency, LendingRecord } from '../types';

interface LendingRecordsSectionProps {
    id: string;
    records: LendingRecord[];
    appCurrency?: CommunityCurrency | null;
    emptyMessage?: string;
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

export function LendingRecordsSection({
    id,
    records,
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
                        Active and historical loans that matched your contact details.
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
                                            {record.interest_rate !== undefined &&
                                            record.interest_rate !== null
                                                ? `${record.interest_rate}%`
                                                : '—'}
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

