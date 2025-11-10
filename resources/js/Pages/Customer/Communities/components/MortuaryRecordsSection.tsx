import { Card, CardContent } from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { formatDateTimeForDisplay } from '@/Pages/Public/Community/utils/dateUtils';
import { CommunityCurrency, MortuaryRecord } from '../types';

interface MortuaryRecordsSectionProps {
    id: string;
    records: MortuaryRecord[];
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

export function MortuaryRecordsSection({
    id,
    records,
    appCurrency,
    emptyMessage = 'No mortuary records found.',
}: MortuaryRecordsSectionProps) {
    const items = Array.isArray(records) ? records : [];

    if (items.length === 0) {
        return (
            <section id={id} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Mortuary Records
                </h3>
                <Card>
                    <CardContent className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <p className="text-sm font-medium">{emptyMessage}</p>
                        <p className="mt-2 text-xs">
                            We could not find any mortuary records that match your
                            profile details.
                        </p>
                    </CardContent>
                </Card>
            </section>
        );
    }

    return (
        <section id={id} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Mortuary Records
            </h3>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-700">
                                <TableHead className="text-gray-900 dark:text-white">
                                    Member
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Status
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Member Since
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Contribution
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Contact
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Contributions
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Claims
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((record) => {
                                const contributionsCount =
                                    record.contributions?.length ?? 0;
                                const claimsCount = record.claims?.length ?? 0;

                                return (
                                    <TableRow
                                        key={record.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <TableCell className="text-gray-900 dark:text-white">
                                            <div className="flex flex-col">
                                                <span className="font-medium">
                                                    {record.name ?? 'Unnamed Member'}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    ID: {record.id}
                                                </span>
                                                {record.group && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        Group: {record.group}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {record.status ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {formatDateTimeForDisplay(
                                                record.membership_start_date ?? null,
                                                {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                },
                                            )}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            <div className="flex flex-col">
                                                <span>
                                                    {formatAmount(
                                                        record.contribution_amount,
                                                        appCurrency,
                                                    )}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {record.contribution_frequency ??
                                                        'N/A'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            <div className="flex flex-col">
                                                <span>
                                                    {record.contact_number ?? 'No contact'}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {record.gender ?? '—'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {contributionsCount}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {claimsCount}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </section>
    );
}

