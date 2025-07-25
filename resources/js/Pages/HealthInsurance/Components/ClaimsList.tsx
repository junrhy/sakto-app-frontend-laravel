import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Edit, Trash2, Search, Calendar } from 'lucide-react';
import { format, startOfYear, endOfYear, subYears } from 'date-fns';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import EditClaimDialog from './EditClaimDialog';
import { Input } from '@/Components/ui/input';
import { Calendar as DatePicker } from '@/Components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { cn } from '@/lib/utils';

interface Member {
    id: string;
    name: string;
}

interface Claim {
    id: string;
    member_id: string;
    claim_type: string;
    amount: number;
    date_of_service: string;
    hospital_name: string;
    diagnosis: string;
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

export default function ClaimsList({ claims, members, onClaimSubmit, canEdit, canDelete, appCurrency }: Props) {
    const [sortField, setSortField] = useState<keyof Claim>('date_of_service');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState<Date>(startOfYear(subYears(new Date(), 10)));
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
        if (window.confirm('Are you sure you want to delete this claim? This action cannot be undone.')) {
            router.delete(`/health-insurance/claims/${memberId}/${claimId}`, {
                onSuccess: () => {
                    toast.success('Claim deleted successfully');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                },
                onError: () => {
                    toast.error('Failed to delete claim');
                }
            });
        }
    };

    const handleEdit = (memberId: string, claimId: string) => {
        const claim = claims.find(c => c.id === claimId);
        if (claim) {
            setSelectedClaim(claim);
        }
    };

    const getMemberName = (memberId: string) => {
        const member = members.find(m => m.id === memberId);
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

    const filteredClaims = sortedClaims.filter(claim => {
        const searchLower = searchQuery.toLowerCase();
        const memberName = getMemberName(claim.member_id).toLowerCase();
        const claimDate = new Date(claim.date_of_service);
        
        const matchesSearch = (
            memberName.includes(searchLower) ||
            claim.claim_type.toLowerCase().includes(searchLower) ||
            claim.hospital_name.toLowerCase().includes(searchLower) ||
            claim.diagnosis.toLowerCase().includes(searchLower) ||
            claim.status.toLowerCase().includes(searchLower)
        );

        const matchesDateRange = (!startDate || claimDate >= startDate) && 
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <Input
                        placeholder="Search by member name, claim type, hospital, diagnosis, or status..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 h-10 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-slate-400 dark:focus:ring-slate-500"
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-3">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-[240px] justify-start text-left font-normal h-10 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700",
                                        !startDate && "text-slate-500 dark:text-slate-400",
                                        startDate && "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-500/10"
                                    )}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "PPP") : "Start date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" align="start">
                                <DatePicker
                                    mode="single"
                                    selected={startDate}
                                    onSelect={(date) => date && setStartDate(date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">to</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-[240px] justify-start text-left font-normal h-10 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700",
                                        !endDate && "text-slate-500 dark:text-slate-400",
                                        endDate && "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-500/10"
                                    )}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "PPP") : "End date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" align="start">
                                <DatePicker
                                    mode="single"
                                    selected={endDate}
                                    onSelect={(date) => date && setEndDate(date)}
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
                            className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 h-10"
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
                                className="cursor-pointer text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold"
                                onClick={() => handleSort('date_of_service')}
                            >
                                <div className="flex items-center gap-2">
                                    Date of Service
                                    {sortField === 'date_of_service' && (
                                        <span className="text-slate-500 dark:text-slate-400">
                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-200 font-semibold">Member</TableHead>
                            <TableHead 
                                className="cursor-pointer text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold"
                                onClick={() => handleSort('claim_type')}
                            >
                                <div className="flex items-center gap-2">
                                    Claim Type
                                    {sortField === 'claim_type' && (
                                        <span className="text-slate-500 dark:text-slate-400">
                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </div>
                            </TableHead>
                            <TableHead 
                                className="cursor-pointer text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold"
                                onClick={() => handleSort('amount')}
                            >
                                <div className="flex items-center gap-2">
                                    Amount
                                    {sortField === 'amount' && (
                                        <span className="text-slate-500 dark:text-slate-400">
                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-200 font-semibold">Hospital</TableHead>
                            <TableHead 
                                className="cursor-pointer text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold"
                                onClick={() => handleSort('status')}
                            >
                                <div className="flex items-center gap-2">
                                    Status
                                    {sortField === 'status' && (
                                        <span className="text-slate-500 dark:text-slate-400">
                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="text-slate-700 dark:text-slate-200 font-semibold text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredClaims.length === 0 ? (
                            <TableRow className="border-slate-200 dark:border-slate-700">
                                <TableCell colSpan={7} className="h-24 text-center text-slate-500 dark:text-slate-400">
                                    No claims found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredClaims.map((claim) => (
                                <TableRow key={claim.id} className="border-slate-200 dark:border-slate-700 dark:bg-slate-900/30 hover:dark:bg-slate-800/50 transition-colors">
                                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                                        {format(new Date(claim.date_of_service), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                                        {getMemberName(claim.member_id)}
                                    </TableCell>
                                    <TableCell className="capitalize text-slate-700 dark:text-slate-300">
                                        {claim.claim_type}
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-700 dark:text-slate-300">
                                        <span className="text-blue-600 dark:text-blue-300 font-semibold">
                                            {appCurrency.symbol}{Number(claim.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-slate-700 dark:text-slate-300">
                                        {claim.hospital_name}
                                    </TableCell>
                                    <TableCell>
                                        <Badge 
                                            className={cn(
                                                "capitalize",
                                                getStatusColor(claim.status)
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
                                                    onClick={() => handleEdit(claim.member_id, claim.id)}
                                                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {canDelete && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-orange-300 dark:hover:text-orange-200 dark:hover:bg-orange-900/20 transition-all duration-200"
                                                    onClick={() => handleDelete(claim.member_id, claim.id)}
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

            {selectedClaim && (
                <EditClaimDialog
                    claim={selectedClaim}
                    members={members}
                    appCurrency={appCurrency}
                    onClose={() => setSelectedClaim(null)}
                />
            )}
        </div>
    );
} 