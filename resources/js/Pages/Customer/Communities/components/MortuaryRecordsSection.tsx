import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Link } from '@inertiajs/react';
import { formatDateTimeForDisplay } from '@/Pages/Public/Community/utils/dateUtils';
import { CommunityCurrency, MortuaryRecord } from '../types';

interface MortuaryRecordsSectionProps {
    id: string;
    records: MortuaryRecord[];
    communityIdentifier: string;
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
    communityIdentifier,
    appCurrency,
    emptyMessage = 'No mortuary records found.',
}: MortuaryRecordsSectionProps) {
    const items = Array.isArray(records) ? records : [];

    return (
        <section id={id} className="space-y-4">
            <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Mortuary Records
                    </CardTitle>
                    <CardDescription>
                        Coverage and contribution information associated with your membership.
                    </CardDescription>
                </CardHeader>
                {items.length === 0 ? (
                    <CardContent className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50/70 p-8 text-center text-gray-500 dark:border-gray-600 dark:bg-gray-900/40 dark:text-gray-400">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {emptyMessage}
                        </p>
                        <p className="text-xs">
                            We could not find any mortuary records that match your profile details.
                        </p>
                    </CardContent>
                ) : (
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
                                                        {record.contribution_frequency ?? 'N/A'}
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
                                                <div className="flex items-center justify-between gap-2">
                                                    <span>{contributionsCount}</span>
                                                    <Link
                                                        href={route(
                                                            'customer.communities.mortuary.contributions',
                                                            {
                                                                community:
                                                                    communityIdentifier,
                                                                member: record.id,
                                                            },
                                                        )}
                                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    >
                                                        View
                                                    </Link>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span>{claimsCount}</span>
                                                    <Link
                                                        href={route(
                                                            'customer.communities.mortuary.claims',
                                                            {
                                                                community:
                                                                    communityIdentifier,
                                                                member: record.id,
                                                            },
                                                        )}
                                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    >
                                                        View
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                )}
            </Card>
        </section>
    );
}

