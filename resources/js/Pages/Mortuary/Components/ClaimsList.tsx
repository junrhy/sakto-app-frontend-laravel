import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Calendar as DatePicker } from '@/Components/ui/calendar';
import { Input } from '@/Components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { endOfYear, format, startOfYear, subYears } from 'date-fns';
import { Calendar, Edit, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Member {
    id: string;
    name: string;
}

interface Claim {
    id: string;
    member_id: string;
    claim_type: string;
    amount: number;
    date_of_death: string;
    deceased_name: string;
    relationship_to_member: string;
    cause_of_death: string;
    status: string;
}

interface Props {
    claims: Claim[];
    members: Member[];
    onClaimSubmit: (claim: Claim) => void;
    canEdit: boolean;
    canDelete: boolean;
    appCurrency: {
        code: string;
        symbol: string;
    };
}

export default function ClaimsList({
    claims,
    members,
    onClaimSubmit,
    canEdit,
    canDelete,
    appCurrency,
}: Props) {
    const [sortField, setSortField] = useState<keyof Claim>('date_of_death');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState<Date>(
        startOfYear(subYears(new Date(), 10)),
    );
    const [endDate, setEndDate] = useState<Date>(endOfYear(new Date()));

    const handleSort = (field: keyof Claim) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleDelete = (memberId: string, claimId: string) => {
        if (
            window.confirm(
                'Are you sure you want to delete this claim? This action cannot be undone.',
            )
        ) {
            router.delete(`/mortuary/claims/${memberId}/${claimId}`, {
                onSuccess: () => {
                    toast.success('Claim deleted successfully');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                },
                onError: () => {
                    toast.error('Failed to delete claim');
                },
            });
        }
    };

    const getMemberName = (memberId: string) => {
        const member = members.find((m) => m.id === memberId);
        return member ? member.name : 'Unknown Member';
    };

    const sortedClaims = [...claims].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortDirection === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return 0;
    });

    const filteredClaims = sortedClaims.filter((claim) => {
        const searchLower = searchQuery.toLowerCase();
        const memberName = getMemberName(claim.member_id).toLowerCase();
        const claimDate = new Date(claim.date_of_death);

        const matchesSearch =
            memberName.includes(searchLower) ||
            claim.claim_type.toLowerCase().includes(searchLower) ||
            claim.deceased_name.toLowerCase().includes(searchLower) ||
            claim.relationship_to_member.toLowerCase().includes(searchLower) ||
            claim.cause_of_death.toLowerCase().includes(searchLower) ||
            claim.status.toLowerCase().includes(searchLower);

        const matchesDateRange =
            (!startDate || claimDate >= startDate) &&
            (!endDate || claimDate <= endDate);

        return matchesSearch && matchesDateRange;
    });

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white';
            case 'pending':
                return 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white';
            case 'rejected':
                return 'bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 text-white';
            default:
                return 'bg-slate-500 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-700 text-white';
        }
    };

    const getClaimTypeColor = (claimType: string) => {
        switch (claimType.toLowerCase()) {
            case 'funeral_service':
                return 'bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white';
            case 'burial_plot':
                return 'bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700 text-white';
            case 'transportation':
                return 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white';
            case 'memorial_service':
                return 'bg-teal-500 hover:bg-teal-600 dark:bg-teal-600 dark:hover:bg-teal-700 text-white';
            default:
                return 'bg-slate-500 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-700 text-white';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <Input
                        placeholder="Search by member name, claim type, deceased name, relationship, cause of death, or status..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10 border-slate-300 bg-white pl-8 text-slate-900 placeholder-slate-500 focus:border-slate-400 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-slate-500 dark:focus:ring-slate-500"
                    />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="flex items-center gap-3">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'h-10 w-[240px] justify-start border-slate-300 text-left font-normal text-slate-900 transition-all duration-200 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700',
                                        !startDate &&
                                            'text-slate-500 dark:text-slate-400',
                                        startDate &&
                                            'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-500/10',
                                    )}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {startDate
                                        ? format(startDate, 'PPP')
                                        : 'Start date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto border-slate-200 bg-white p-0 dark:border-slate-700 dark:bg-slate-900"
                                align="start"
                            >
                                <DatePicker
                                    mode="single"
                                    selected={startDate}
                                    onSelect={(date) =>
                                        date && setStartDate(date)
                                    }
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <span className="font-medium text-slate-500 dark:text-slate-400">
                            to
                        </span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'h-10 w-[240px] justify-start border-slate-300 text-left font-normal text-slate-900 transition-all duration-200 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700',
                                        !endDate &&
                                            'text-slate-500 dark:text-slate-400',
                                        endDate &&
                                            'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-500/10',
                                    )}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {endDate
                                        ? format(endDate, 'PPP')
                                        : 'End date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto border-slate-200 bg-white p-0 dark:border-slate-700 dark:bg-slate-900"
                                align="start"
                            >
                                <DatePicker
                                    mode="single"
                                    selected={endDate}
                                    onSelect={(date) =>
                                        date && setEndDate(date)
                                    }
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    {(startDate || endDate) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setStartDate(startOfYear(new Date()));
                                setEndDate(endOfYear(new Date()));
                            }}
                            className="h-10 text-slate-500 transition-all duration-200 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            Reset to current year
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900/50">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/50">
                            <TableHead
                                className="cursor-pointer font-semibold text-slate-700 transition-colors duration-200 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                                onClick={() => handleSort('date_of_death')}
                            >
                                <div className="flex items-center gap-2">
                                    Date of Death
                                    {sortField === 'date_of_death' && (
                                        <span className="text-slate-500 dark:text-slate-400">
                                            {sortDirection === 'asc'
                                                ? '↑'
                                                : '↓'}
                                        </span>
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-200">
                                Member
                            </TableHead>
                            <TableHead className="font-semibold text-slate-700 dark:text-slate-200">
                                Deceased
                            </TableHead>
                            <TableHead
                                className="cursor-pointer font-semibold text-slate-700 transition-colors duration-200 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                                onClick={() => handleSort('claim_type')}
                            >
                                <div className="flex items-center gap-2">
                                    Claim Type
                                    {sortField === 'claim_type' && (
                                        <span className="text-slate-500 dark:text-slate-400">
                                            {sortDirection === 'asc'
                                                ? '↑'
                                                : '↓'}
                                        </span>
                                    )}
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer font-semibold text-slate-700 transition-colors duration-200 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                                onClick={() => handleSort('amount')}
                            >
                                <div className="flex items-center gap-2">
                                    Amount
                                    {sortField === 'amount' && (
                                        <span className="text-slate-500 dark:text-slate-400">
                                            {sortDirection === 'asc'
                                                ? '↑'
                                                : '↓'}
                                        </span>
                                    )}
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer font-semibold text-slate-700 transition-colors duration-200 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                                onClick={() => handleSort('status')}
                            >
                                <div className="flex items-center gap-2">
                                    Status
                                    {sortField === 'status' && (
                                        <span className="text-slate-500 dark:text-slate-400">
                                            {sortDirection === 'asc'
                                                ? '↑'
                                                : '↓'}
                                        </span>
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-200">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredClaims.length === 0 ? (
                            <TableRow className="border-slate-200 dark:border-slate-700">
                                <TableCell
                                    colSpan={7}
                                    className="h-24 text-center text-slate-500 dark:text-slate-400"
                                >
                                    No claims found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredClaims.map((claim) => (
                                <TableRow
                                    key={claim.id}
                                    className="border-slate-200 transition-colors duration-200 dark:border-slate-700 dark:bg-slate-900/30 hover:dark:bg-slate-800/50"
                                >
                                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                                        {format(
                                            new Date(claim.date_of_death),
                                            'MMM d, yyyy',
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                                        {getMemberName(claim.member_id)}
                                    </TableCell>
                                    <TableCell className="text-slate-700 dark:text-slate-300">
                                        <div>
                                            <div className="font-medium text-slate-900 dark:text-slate-100">
                                                {claim.deceased_name}
                                            </div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                                {claim.relationship_to_member}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={cn(
                                                'capitalize text-white shadow-sm',
                                                getClaimTypeColor(
                                                    claim.claim_type,
                                                ),
                                            )}
                                        >
                                            {claim.claim_type.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                                        <span className="font-semibold text-blue-600 dark:text-blue-300">
                                            {appCurrency.symbol}
                                            {Number(
                                                claim.amount,
                                            ).toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={cn(
                                                'capitalize text-white shadow-sm',
                                                getStatusColor(claim.status),
                                            )}
                                        >
                                            {claim.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {canEdit && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-blue-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/20 dark:hover:text-blue-200"
                                                    onClick={() =>
                                                        onClaimSubmit(claim)
                                                    }
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {canDelete && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700 dark:text-orange-300 dark:hover:bg-orange-900/20 dark:hover:text-orange-200"
                                                    onClick={() =>
                                                        handleDelete(
                                                            claim.member_id,
                                                            claim.id,
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
