import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { Edit, Trash2, Search, Calendar } from 'lucide-react';
import { format, startOfYear, endOfYear, subYears } from 'date-fns';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import EditContributionDialog from './EditContributionDialog';
import { Input } from '@/Components/ui/input';
import { Calendar as DatePicker } from '@/Components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { cn } from '@/lib/utils';

interface Member {
    id: string;
    name: string;
}

interface Contribution {
    id: string;
    member_id: string;
    amount: number | string;
    payment_date: string;
    payment_method: string;
    reference_number: string;
}

interface Props {
    contributions: Contribution[];
    members: Member[];
    appCurrency: {
        code: string;
        symbol: string;
    };
}

export default function ContributionsList({ contributions, members, appCurrency }: Props) {
    const [sortField, setSortField] = useState<keyof Contribution>('payment_date');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState<Date>(startOfYear(subYears(new Date(), 10)));
    const [endDate, setEndDate] = useState<Date>(endOfYear(new Date()));

    const handleSort = (field: keyof Contribution) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleDelete = (memberId: string, contributionId: string) => {
        if (window.confirm('Are you sure you want to delete this contribution? This action cannot be undone.')) {
            router.delete(`/health-insurance/contributions/${memberId}/${contributionId}`, {
                onSuccess: () => {
                    toast.success('Contribution deleted successfully');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                },
                onError: () => {
                    toast.error('Failed to delete contribution');
                }
            });
        }
    };

    const handleEdit = (contribution: Contribution) => {
        setSelectedContribution(contribution);
        setIsEditDialogOpen(true);
    };

    const handleContributionUpdate = (updatedContribution: Contribution) => {
        const updatedContributions = contributions.map(contribution =>
            contribution.id === updatedContribution.id ? updatedContribution : contribution
        );
        // Update the parent component's state if needed
        // This will be handled by the page refresh after the API call
    };

    const getMemberName = (memberId: string) => {
        const member = members.find(m => m.id === memberId);
        return member ? member.name : 'Unknown Member';
    };

    const sortedContributions = [...contributions].sort((a, b) => {
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

    const filteredContributions = sortedContributions.filter(contribution => {
        const searchLower = searchQuery.toLowerCase();
        const memberName = getMemberName(contribution.member_id)?.toLowerCase() || '';
        const paymentMethod = contribution.payment_method?.toLowerCase() || '';
        const referenceNumber = contribution.reference_number?.toLowerCase() || '';
        const paymentDate = new Date(contribution.payment_date);
        
        const matchesSearch = (
            memberName.includes(searchLower) ||
            paymentMethod.includes(searchLower) ||
            referenceNumber.includes(searchLower)
        );

        const matchesDateRange = (!startDate || paymentDate >= startDate) && 
                                (!endDate || paymentDate <= endDate);

        return matchesSearch && matchesDateRange;
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search contributions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-[240px] justify-start text-left font-normal",
                                        !startDate && "text-muted-foreground",
                                        startDate && "border-primary bg-primary/5"
                                    )}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {startDate ? format(startDate, "PPP") : "Start date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <DatePicker
                                    mode="single"
                                    selected={startDate}
                                    onSelect={(date) => date && setStartDate(date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <span className="text-muted-foreground font-medium">to</span>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-[240px] justify-start text-left font-normal",
                                        !endDate && "text-muted-foreground",
                                        endDate && "border-primary bg-primary/5"
                                    )}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {endDate ? format(endDate, "PPP") : "End date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
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
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Reset to current year
                        </Button>
                    )}
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead 
                                className="cursor-pointer"
                                onClick={() => handleSort('payment_date')}
                            >
                                Payment Date {sortField === 'payment_date' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </TableHead>
                            <TableHead>Member</TableHead>
                            <TableHead 
                                className="cursor-pointer"
                                onClick={() => handleSort('amount')}
                            >
                                Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </TableHead>
                            <TableHead 
                                className="cursor-pointer"
                                onClick={() => handleSort('payment_method')}
                            >
                                Payment Method {sortField === 'payment_method' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </TableHead>
                            <TableHead>Reference Number</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredContributions.map((contribution) => (
                            <TableRow key={contribution.id}>
                                <TableCell>
                                    {format(new Date(contribution.payment_date), 'MMM d, yyyy')}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {getMemberName(contribution.member_id)}
                                </TableCell>
                                <TableCell>
                                    {appCurrency.symbol}{Number(contribution.amount).toFixed(2)}
                                </TableCell>
                                <TableCell className="capitalize">
                                    {contribution.payment_method.replace('_', ' ')}
                                </TableCell>
                                <TableCell>
                                    {contribution.reference_number}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(contribution)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => handleDelete(contribution.member_id, contribution.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <EditContributionDialog
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                contribution={selectedContribution}
                appCurrency={appCurrency}
                onContributionUpdated={handleContributionUpdate}
            />
        </div>
    );
} 