import { Badge } from '@/Components/ui/badge';
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
import { cn } from '@/lib/utils';
import type { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface OwnerSummary {
    id: number | string;
    name?: string | null;
    slug?: string | null;
    identifier?: string | null;
    project_identifier?: string | null;
}

interface Claim {
    id: string;
    claim_type?: string | null;
    amount: number;
    date_of_death?: string | null;
    deceased_name?: string | null;
    relationship_to_member?: string | null;
    cause_of_death?: string | null;
    status?: string | null;
    created_at?: string | null;
}

interface MemberSummary {
    id?: number | string;
    name?: string;
    status?: string;
    contribution_amount?: number | string;
    contribution_frequency?: string;
    group?: string | null;
}

interface CurrencySettings {
    code?: string;
    symbol?: string;
    decimal_separator?: string;
    thousands_separator?: string;
}

interface ClaimsPageProps extends PageProps {
    project: string;
    owner: OwnerSummary;
    member?: MemberSummary | null;
    claims: Claim[];
    appCurrency?: CurrencySettings | null;
    error?: string | null;
    backUrl: string;
}

const formatAmount = (
    amount: number | string | null | undefined,
    currency?: CurrencySettings | null,
) => {
    if (amount === null || amount === undefined) {
        return '—';
    }

    const numeric = Number.parseFloat(String(amount));

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

const formatDate = (value?: string | null, includeTime = false) => {
    if (!value) {
        return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    const options: Intl.DateTimeFormatOptions = includeTime
        ? {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          }
        : {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          };

    return new Intl.DateTimeFormat('en-US', options).format(date);
};

const formatStatus = (value?: string | null) => {
    if (!value) {
        return 'Unknown';
    }

    return value
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const claimTypeLabels: Record<string, string> = {
    funeral_service: 'Funeral Service',
    burial_plot: 'Burial Plot',
    transportation: 'Transportation',
    memorial_service: 'Memorial Service',
    other: 'Other',
};

const statusVariants: Record<string, string> = {
    pending:
        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200',
    approved:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200',
    rejected:
        'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200',
};

export default function MortuaryClaims({
    auth,
    owner,
    member,
    claims,
    appCurrency,
    error,
    backUrl,
}: ClaimsPageProps) {
    const ownerName = owner?.name ?? 'Mortuary Partner';
    const memberName = member?.name ?? 'Member';
    const hasClaims = claims.length > 0;

    return (
        <CustomerLayout
            auth={auth}
            title={`Mortuary Claims – ${memberName}`}
            header={
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Mortuary Claims
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Claim submissions filed for {ownerName}.
                        </p>
                    </div>
                    <Link
                        href={backUrl}
                        className="inline-flex items-center justify-center rounded-md border border-indigo-500 px-3 py-1 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-300 dark:hover:bg-indigo-400/10"
                    >
                        ← Back
                    </Link>
                </div>
            }
        >
            <Head title={`Mortuary Claims – ${memberName}`} />

            <div className="space-y-6">
                {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-700/70 dark:bg-red-900/20 dark:text-red-300">
                        {error}
                    </div>
                )}

                <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Member Overview
                        </CardTitle>
                        <CardDescription>
                            Member profile linked to these mortuary claims.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Member
                            </p>
                            <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                {memberName}
                            </p>
                            <div className="flex flex-wrap gap-2 pt-2">
                                <Badge
                                    variant="secondary"
                                    className={cn(
                                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
                                        member?.status === 'active' &&
                                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
                                        member?.status === 'inactive' &&
                                            'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                                    )}
                                >
                                    {member?.status
                                        ? member.status.toUpperCase()
                                        : 'STATUS UNKNOWN'}
                                </Badge>
                                {member?.group && (
                                    <Badge
                                        variant="outline"
                                        className="border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200"
                                    >
                                        Group: {member.group}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Contribution Amount
                                </p>
                                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                                    {formatAmount(
                                        member?.contribution_amount,
                                        appCurrency,
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Frequency
                                </p>
                                <p className="text-base font-semibold capitalize text-gray-900 dark:text-gray-100">
                                    {member?.contribution_frequency ?? '—'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800/80">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            Claim History
                        </CardTitle>
                        <CardDescription>
                            Submitted mortuary claims with their current status
                            and details.
                        </CardDescription>
                    </CardHeader>
                    {hasClaims ? (
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 dark:bg-gray-700">
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Claim Type
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Amount
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Date of Death
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Deceased
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Relationship
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Cause of Death
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Status
                                        </TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">
                                            Submitted On
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {claims.map((claim) => (
                                        <TableRow
                                            key={claim.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {claim.claim_type
                                                    ? (claimTypeLabels[
                                                          claim.claim_type
                                                      ] ??
                                                      formatStatus(
                                                          claim.claim_type,
                                                      ))
                                                    : '—'}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {formatAmount(
                                                    claim.amount,
                                                    appCurrency,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {formatDate(
                                                    claim.date_of_death,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {claim.deceased_name || '—'}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {claim.relationship_to_member ||
                                                    '—'}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {claim.cause_of_death || '—'}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                <Badge
                                                    className={cn(
                                                        'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
                                                        claim.status
                                                            ? (statusVariants[
                                                                  claim.status
                                                              ] ?? '')
                                                            : '',
                                                    )}
                                                >
                                                    {formatStatus(claim.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {formatDate(
                                                    claim.created_at,
                                                    true,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    ) : (
                        <CardContent>
                            <div className="rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-600 dark:border-gray-600 dark:bg-gray-900/40 dark:text-gray-300">
                                No claims have been submitted for this member
                                yet.
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>
        </CustomerLayout>
    );
}
