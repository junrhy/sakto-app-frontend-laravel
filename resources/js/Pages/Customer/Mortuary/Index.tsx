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
import type { CommunityCurrency, MortuaryRecord } from '../Communities/types';

export interface MortuaryRecordsSectionProps {
    id?: string;
    records: MortuaryRecord[];
    projectIdentifier?: string;
    ownerIdentifier?: string;
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
    id = 'mortuary-records',
    records,
    projectIdentifier,
    ownerIdentifier,
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
                            We could not find any mortuary records at this time.
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
                                                    {projectIdentifier && ownerIdentifier && (
                                                        <Link
                                                            href={route(
                                                                'customer.projects.mortuary.contributions',
                                                                {
                                                                    project: projectIdentifier,
                                                                    owner: ownerIdentifier,
                                                                    member: record.id,
                                                                },
                                                            )}
                                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                        >
                                                            View
                                                        </Link>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                <div className="flex items-center justify-between gap-2">
                                                    <span>{claimsCount}</span>
                                                    {projectIdentifier && ownerIdentifier && (
                                                        <Link
                                                            href={route(
                                                                'customer.projects.mortuary.claims',
                                                                {
                                                                    project: projectIdentifier,
                                                                    owner: ownerIdentifier,
                                                                    member: record.id,
                                                                },
                                                            )}
                                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                        >
                                                            View
                                                        </Link>
                                                    )}
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

type OwnerSummary = {
    id: number | string;
    name?: string | null;
    slug?: string | null;
    identifier?: string | null;
    project_identifier?: string | null;
};

export interface MortuaryIndexProps extends PageProps {
    project: string;
    owner: OwnerSummary;
    records: MortuaryRecord[];
    appCurrency?: CommunityCurrency | null;
    error?: string | null;
    emptyMessage?: string;
    backUrl?: string;
}

export default function MortuaryIndex({
    auth,
    project,
    owner,
    records,
    appCurrency,
    error,
    emptyMessage,
    backUrl,
}: MortuaryIndexProps) {
    const ownerName = owner?.name ?? 'Mortuary Partner';
    const ownerIdentifier =
        owner.slug ?? owner.identifier ?? String(owner.id);

    return (
        <CustomerLayout
            auth={auth}
            title={`Mortuary Members – ${ownerName}`}
            header={
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Mortuary Members
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Coverage records for {ownerName}.
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
            <Head title={`Mortuary Members – ${ownerName}`} />

            <div className="space-y-6">
                {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-700/70 dark:bg-red-900/20 dark:text-red-300">
                        {error}
                    </div>
                )}

                <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Partner Details
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
                    </CardContent>
                </Card>

                <MortuaryRecordsSection
                    id="mortuary-records"
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


