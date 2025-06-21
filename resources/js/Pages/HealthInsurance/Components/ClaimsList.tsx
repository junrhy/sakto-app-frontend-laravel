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
    amount: number | string;
    date_of_service: string;
    hospital_name: string;
    diagnosis: string;
    status: string;
}

interface Props {
    claims: Claim[];
    members: Member[];
    appCurrency: {
        code: string;
        symbol: string;
    };
}

export default function ClaimsList({ claims, members, appCurrency }: Props) {
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
                return 'bg-green-500';
            case 'pending':
                return 'bg-yellow-500';
            case 'rejected':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground dark:text-gray-400" />
                    <Input
                        placeholder="Search by member name, claim type, hospital, diagnosis, or status..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 h-10 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-3">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-[240px] justify-start text-left font-normal h-10 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700",
                                        !startDate && "text-muted-foreground dark:text-gray-400",
                                        startDate && "border-primary bg-primary/5 dark:border-blue-500 dark:bg-blue-500/10"
                                    )}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "PPP") : "Start date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 dark:bg-gray-800 dark:border-gray-700" align="start">
                                <DatePicker
                                    mode="single"
                                    selected={startDate}
                                    onSelect={(date) => date && setStartDate(date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <span className="text-muted-foreground dark:text-gray-400 font-medium">to</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-[240px] justify-start text-left font-normal h-10 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700",
                                        !endDate && "text-muted-foreground dark:text-gray-400",
                                        endDate && "border-primary bg-primary/5 dark:border-blue-500 dark:bg-blue-500/10"
                                    )}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "PPP") : "End date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 dark:bg-gray-800 dark:border-gray-700" align="start">
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
                            className="text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-200 h-10"
                        >
                            Reset to current year
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-lg border bg-card dark:bg-gray-900 dark:border-gray-700">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-muted/50 dark:border-gray-700 dark:hover:bg-gray-800/50">
                            <TableHead 
                                className="cursor-pointer font-semibold dark:text-gray-300"
                                onClick={() => handleSort('date_of_service')}
                            >
                                <div className="flex items-center gap-2">
                                    Service Date
                                    {sortField === 'date_of_service' && (
                                        <span className="text-muted-foreground dark:text-gray-400">
                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="font-semibold dark:text-gray-300">Member</TableHead>
                            <TableHead 
                                className="cursor-pointer font-semibold dark:text-gray-300"
                                onClick={() => handleSort('claim_type')}
                            >
                                <div className="flex items-center gap-2">
                                    Type
                                    {sortField === 'claim_type' && (
                                        <span className="text-muted-foreground dark:text-gray-400">
                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </div>
                            </TableHead>
                            <TableHead 
                                className="cursor-pointer font-semibold dark:text-gray-300"
                                onClick={() => handleSort('amount')}
                            >
                                <div className="flex items-center gap-2">
                                    Amount
                                    {sortField === 'amount' && (
                                        <span className="text-muted-foreground dark:text-gray-400">
                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="font-semibold dark:text-gray-300">Hospital</TableHead>
                            <TableHead 
                                className="cursor-pointer font-semibold dark:text-gray-300"
                                onClick={() => handleSort('status')}
                            >
                                <div className="flex items-center gap-2">
                                    Status
                                    {sortField === 'status' && (
                                        <span className="text-muted-foreground dark:text-gray-400">
                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </div>
                            </TableHead>
                            <TableHead className="font-semibold text-right dark:text-gray-300">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredClaims.length === 0 ? (
                            <TableRow className="dark:border-gray-700">
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground dark:text-gray-400">
                                    No claims found
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredClaims.map((claim) => (
                                <TableRow key={claim.id} className="hover:bg-muted/50 dark:border-gray-700 dark:hover:bg-gray-800/50">
                                    <TableCell className="font-medium dark:text-gray-200">
                                        {format(new Date(claim.date_of_service), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell className="font-medium dark:text-gray-200">
                                        {getMemberName(claim.member_id)}
                                    </TableCell>
                                    <TableCell className="capitalize dark:text-gray-300">
                                        {claim.claim_type}
                                    </TableCell>
                                    <TableCell className="font-medium dark:text-gray-200">
                                        {appCurrency.symbol}{Number(claim.amount).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="dark:text-gray-300">
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
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(claim.member_id, claim.id)}
                                                className="hover:bg-muted dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                                onClick={() => handleDelete(claim.member_id, claim.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
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