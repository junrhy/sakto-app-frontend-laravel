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
import { Edit, Trash2, Search, Calendar, Table as TableIcon } from 'lucide-react';
import { format, startOfYear, endOfYear, subYears, eachMonthOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import EditContributionDialog from './EditContributionDialog';
import { Input } from '@/Components/ui/input';
import { Calendar as DatePicker } from '@/Components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/Components/ui/tabs';

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
    const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');

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

    const renderCalendarView = () => {
        // Get all months from the earliest contribution date to current month
        const earliestContributionDate = contributions.length > 0 
            ? new Date(Math.min(...contributions.map(c => new Date(c.payment_date).getTime())))
            : new Date();
        const months = eachMonthOfInterval({
            start: startOfMonth(earliestContributionDate),
            end: endOfMonth(new Date())
        });

        // Get all years for annual view
        const years = Array.from(
            new Set(
                months.map(month => month.getFullYear())
            )
        ).sort();

        const renderMonthlyTable = () => {
            return (
                <div className="mb-8 p-4">
                    <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Monthly Contributions</h3>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="dark:border-gray-700">
                                    <TableHead className="sticky left-0 bg-white dark:bg-gray-900 dark:text-gray-300">Member Name</TableHead>
                                    {months.map(month => (
                                        <TableHead key={month.toISOString()} className="min-w-[120px] dark:text-gray-300">
                                            {format(month, 'MMM yyyy')}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map((member) => (
                                    <TableRow key={member.id} className="dark:border-gray-700">
                                        <TableCell className="font-medium sticky left-0 bg-white dark:bg-gray-900 dark:text-gray-200">
                                            {member.name}
                                        </TableCell>
                                        {months.map(month => {
                                            const monthContributions = contributions.filter(contribution => {
                                                const contributionDate = new Date(contribution.payment_date);
                                                return (
                                                    contribution.member_id === member.id &&
                                                    contributionDate.getMonth() === month.getMonth() &&
                                                    contributionDate.getFullYear() === month.getFullYear()
                                                );
                                            });
                                            
                                            return (
                                                <TableCell 
                                                    key={month.toISOString()}
                                                    className={`text-center ${monthContributions.length > 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}
                                                >
                                                    {monthContributions.length > 0 ? (
                                                        <div className="space-y-1">
                                                            <div className="text-green-600 dark:text-green-400">✓</div>
                                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                                {appCurrency.symbol}{monthContributions.reduce((sum, c) => sum + Number(c.amount), 0).toFixed(2)}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {monthContributions.length} payment{monthContributions.length > 1 ? 's' : ''}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-gray-400 dark:text-gray-500">-</div>
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            );
        };

        const renderAnnualTable = () => {
            return (
                <div className="mb-8 p-4">
                    <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Annual Contributions</h3>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="dark:border-gray-700">
                                    <TableHead className="sticky left-0 bg-white dark:bg-gray-900 dark:text-gray-300">Member Name</TableHead>
                                    {years.map(year => (
                                        <TableHead key={year} className="min-w-[120px] dark:text-gray-300">
                                            {year}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map((member) => (
                                    <TableRow key={member.id} className="dark:border-gray-700">
                                        <TableCell className="font-medium sticky left-0 bg-white dark:bg-gray-900 dark:text-gray-200">
                                            {member.name}
                                        </TableCell>
                                        {years.map(year => {
                                            const yearContributions = contributions.filter(contribution => {
                                                const contributionDate = new Date(contribution.payment_date);
                                                return (
                                                    contribution.member_id === member.id &&
                                                    contributionDate.getFullYear() === year
                                                );
                                            });
                                            
                                            return (
                                                <TableCell 
                                                    key={year}
                                                    className={`text-center ${yearContributions.length > 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}
                                                >
                                                    {yearContributions.length > 0 ? (
                                                        <div className="space-y-1">
                                                            <div className="text-green-600 dark:text-green-400">✓</div>
                                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                                {appCurrency.symbol}{yearContributions.reduce((sum, c) => sum + Number(c.amount), 0).toFixed(2)}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {yearContributions.length} payment{yearContributions.length > 1 ? 's' : ''}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-gray-400 dark:text-gray-500">-</div>
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            );
        };

        return (
            <div className="space-y-6 p-4">
                {renderMonthlyTable()}
                {renderAnnualTable()}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground dark:text-gray-400" />
                        <Input
                            placeholder="Search contributions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
                        />
                    </div>
                    {viewMode === 'table' && (
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex items-center gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-[240px] justify-start text-left font-normal dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700",
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
                                                "w-[240px] justify-start text-left font-normal dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700",
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
                                    className="text-muted-foreground hover:text-foreground dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    Reset to current year
                                </Button>
                            )}
                        </div>
                    )}
                </div>
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'table' | 'calendar')}>
                    <TabsList className="dark:bg-gray-800">
                        <TabsTrigger 
                            value="table"
                            className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100"
                        >
                            <TableIcon className="h-4 w-4 mr-2" />
                            Table
                        </TabsTrigger>
                        <TabsTrigger 
                            value="calendar"
                            className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100"
                        >
                            <Calendar className="h-4 w-4 mr-2" />
                            Calendar
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            
            <div className="rounded-md border dark:border-gray-700">
                {viewMode === 'table' ? (
                    <Table>
                        <TableHeader>
                            <TableRow className="dark:border-gray-700">
                                <TableHead 
                                    className="cursor-pointer dark:text-gray-300"
                                    onClick={() => handleSort('payment_date')}
                                >
                                    Payment Date {sortField === 'payment_date' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </TableHead>
                                <TableHead className="dark:text-gray-300">Member</TableHead>
                                <TableHead 
                                    className="cursor-pointer dark:text-gray-300"
                                    onClick={() => handleSort('amount')}
                                >
                                    Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </TableHead>
                                <TableHead 
                                    className="cursor-pointer dark:text-gray-300"
                                    onClick={() => handleSort('payment_method')}
                                >
                                    Payment Method {sortField === 'payment_method' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </TableHead>
                                <TableHead className="dark:text-gray-300">Reference Number</TableHead>
                                <TableHead className="dark:text-gray-300">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredContributions.map((contribution) => (
                                <TableRow key={contribution.id} className="dark:border-gray-700">
                                    <TableCell className="dark:text-gray-300">
                                        {format(new Date(contribution.payment_date), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell className="font-medium dark:text-gray-200">
                                        {getMemberName(contribution.member_id)}
                                    </TableCell>
                                    <TableCell className="dark:text-gray-300">
                                        {appCurrency.symbol}{Number(contribution.amount).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="capitalize dark:text-gray-300">
                                        {contribution.payment_method.replace('_', ' ')}
                                    </TableCell>
                                    <TableCell className="dark:text-gray-300">
                                        {contribution.reference_number}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(contribution)}
                                                className="dark:text-gray-300 dark:hover:text-gray-100"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
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
                ) : (
                    renderCalendarView()
                )}
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