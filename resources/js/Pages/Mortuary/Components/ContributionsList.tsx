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
    contribution_frequency: string;
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
            router.delete(`/mortuary/contributions/${memberId}/${contributionId}`, {
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
        try {
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

            // Handle mixed types or invalid values
            const aNum = Number(aValue) || 0;
            const bNum = Number(bValue) || 0;
            return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        } catch (error) {
            console.error('Error sorting contributions:', error);
            return 0;
        }
    });

    const filteredContributions = sortedContributions.filter(contribution => {
        try {
            const searchLower = searchQuery.toLowerCase();
            const memberName = getMemberName(contribution.member_id)?.toLowerCase() || '';
            const paymentMethod = contribution.payment_method?.toLowerCase() || '';
            const referenceNumber = contribution.reference_number?.toLowerCase() || '';
            
            const paymentDate = new Date(contribution.payment_date);
            if (isNaN(paymentDate.getTime())) {
                console.warn('Invalid payment date:', contribution.payment_date);
                return false;
            }
            
            const matchesSearch = (
                memberName.includes(searchLower) ||
                paymentMethod.includes(searchLower) ||
                referenceNumber.includes(searchLower)
            );

            const matchesDateRange = (!startDate || paymentDate >= startDate) && 
                                    (!endDate || paymentDate <= endDate);

            return matchesSearch && matchesDateRange;
        } catch (error) {
            console.error('Error filtering contribution:', error, contribution);
            return false;
        }
    });

    const renderCalendarView = () => {
        // Get all months from 10 years ago to current month
        const currentDate = new Date();
        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(currentDate.getFullYear() - 10);

        const months = eachMonthOfInterval({
            start: startOfMonth(tenYearsAgo),
            end: endOfMonth(currentDate)
        });

        // Get all years for annual view - calculate from 10 years ago to current year
        const currentYear = new Date().getFullYear();
        const earliestYear = currentYear - 10; // Default to 10 years ago
        const years: number[] = [];
        
        for (let year = earliestYear; year <= currentYear; year++) {
            years.push(year);
        }

        const renderMonthlyTable = () => {
            // Filter members to only show those with monthly or quarterly frequency
            const monthlyMembers = members.filter(member => 
                member.contribution_frequency.toLowerCase() === 'monthly' || 
                member.contribution_frequency.toLowerCase() === 'quarterly'
            );

            if (monthlyMembers.length === 0) {
                return (
                    <div className="mb-8 p-4">
                        <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Monthly/Quarterly Contributions</h3>
                        <p className="text-gray-500 dark:text-gray-400">No members with monthly or quarterly contribution frequency found.</p>
                    </div>
                );
            }

            return (
                <div className="mb-8 p-4">
                    <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Monthly/Quarterly Contributions</h3>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="dark:border-gray-700">
                                    <TableHead className="sticky left-0 bg-white dark:bg-gray-900 dark:text-gray-300">Member Name</TableHead>
                                    <TableHead className="sticky left-0 bg-white dark:bg-gray-900 dark:text-gray-300">Frequency</TableHead>
                                    {months.map(month => (
                                        <TableHead key={month.toISOString()} className="min-w-[120px] dark:text-gray-300">
                                            {format(month, 'MMM yyyy')}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {monthlyMembers.map(member => (
                                    <TableRow key={member.id} className="dark:border-gray-700">
                                        <TableCell className="sticky left-0 bg-white dark:bg-gray-900 font-medium dark:text-gray-200">
                                            {member.name}
                                        </TableCell>
                                        <TableCell className="sticky left-0 bg-white dark:bg-gray-900 capitalize dark:text-gray-300">
                                            {member.contribution_frequency}
                                        </TableCell>
                                        {months.map(month => {
                                            const monthContributions = contributions.filter(contribution => {
                                                if (contribution.member_id !== member.id) return false;
                                                const contributionDate = new Date(contribution.payment_date);
                                                return contributionDate.getMonth() === month.getMonth() && 
                                                       contributionDate.getFullYear() === month.getFullYear();
                                            });
                                            
                                            const totalAmount = monthContributions.reduce((sum, c) => sum + Number(c.amount || 0), 0);
                                            
                                            return (
                                                <TableCell key={month.toISOString()} className="text-center dark:text-gray-300">
                                                    {totalAmount > 0 ? (
                                                        <div className="text-sm">
                                                            <div className="font-medium">{appCurrency.symbol}{totalAmount.toFixed(2)}</div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {monthContributions.length} payment{monthContributions.length !== 1 ? 's' : ''}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 dark:text-gray-500">-</span>
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
            // Filter members to only show those with annual frequency
            const annualMembers = members.filter(member => 
                member.contribution_frequency.toLowerCase() === 'annually'
            );

            if (annualMembers.length === 0) {
                return (
                    <div className="p-4">
                        <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Annual Contributions</h3>
                        <p className="text-gray-500 dark:text-gray-400">No members with annual contribution frequency found.</p>
                    </div>
                );
            }

            return (
                <div className="p-4">
                    <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Annual Contributions</h3>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="dark:border-gray-700">
                                    <TableHead className="sticky left-0 bg-white dark:bg-gray-900 dark:text-gray-300">Member Name</TableHead>
                                    {years.map(year => (
                                        <TableHead key={year} className="min-w-[100px] dark:text-gray-300">
                                            {year}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {annualMembers.map(member => (
                                    <TableRow key={member.id} className="dark:border-gray-700">
                                        <TableCell className="sticky left-0 bg-white dark:bg-gray-900 font-medium dark:text-gray-200">
                                            {member.name}
                                        </TableCell>
                                        {years.map(year => {
                                            const yearContributions = contributions.filter(contribution => {
                                                if (contribution.member_id !== member.id) return false;
                                                const contributionDate = new Date(contribution.payment_date);
                                                return contributionDate.getFullYear() === year;
                                            });
                                            
                                            const totalAmount = yearContributions.reduce((sum, c) => sum + Number(c.amount || 0), 0);
                                            
                                            return (
                                                <TableCell key={year} className="text-center dark:text-gray-300">
                                                    {totalAmount > 0 ? (
                                                        <div className="text-sm">
                                                            <div className="font-medium">{appCurrency.symbol}{totalAmount.toFixed(2)}</div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {yearContributions.length} payment{yearContributions.length !== 1 ? 's' : ''}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 dark:text-gray-500">-</span>
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
            <div className="space-y-6">
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
                            {filteredContributions.map((contribution) => {
                                try {
                                    const paymentDate = new Date(contribution.payment_date);
                                    const isValidDate = !isNaN(paymentDate.getTime());
                                    
                                    return (
                                        <TableRow key={contribution.id} className="dark:border-gray-700">
                                            <TableCell className="dark:text-gray-300">
                                                {isValidDate ? format(paymentDate, 'MMM d, yyyy') : 'Invalid Date'}
                                            </TableCell>
                                            <TableCell className="font-medium dark:text-gray-200">
                                                {getMemberName(contribution.member_id)}
                                            </TableCell>
                                            <TableCell className="dark:text-gray-300">
                                                {appCurrency.symbol}{Number(contribution.amount || 0).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="capitalize dark:text-gray-300">
                                                {(contribution.payment_method || '').replace('_', ' ')}
                                            </TableCell>
                                            <TableCell className="dark:text-gray-300">
                                                {contribution.reference_number || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(contribution)}
                                                        className="hover:bg-muted dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
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
                                    );
                                } catch (error) {
                                    console.error('Error rendering contribution row:', error, contribution);
                                    return null;
                                }
                            })}
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