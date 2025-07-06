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

        // Filter members based on search query for calendar view
        const filteredMembers = members.filter(member => {
            if (!searchQuery.trim()) return true;
            return member.name.toLowerCase().includes(searchQuery.toLowerCase());
        });

        const renderMonthlyTable = () => {
            // Filter members to only show those with monthly or quarterly frequency
            const monthlyMembers = filteredMembers.filter(member => 
                member.contribution_frequency.toLowerCase() === 'monthly' || 
                member.contribution_frequency.toLowerCase() === 'quarterly'
            );

            if (monthlyMembers.length === 0) {
                return (
                    <div className="mb-8 p-4">
                        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Monthly/Quarterly Contributions</h3>
                        <p className="text-slate-500 dark:text-slate-400">No members with monthly or quarterly contribution frequency found.</p>
                    </div>
                );
            }

            return (
                <div className="mb-8 p-4">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Monthly/Quarterly Contributions</h3>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/50">
                                    <TableHead className="sticky left-0 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold">Member Name</TableHead>
                                    <TableHead className="sticky left-0 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold">Frequency</TableHead>
                                    {months.map(month => (
                                        <TableHead key={month.toISOString()} className="min-w-[120px] text-slate-700 dark:text-slate-200 font-semibold">
                                            {format(month, 'MMM yyyy')}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {monthlyMembers.map((member) => (
                                    <TableRow key={member.id} className="border-slate-200 dark:border-slate-700 dark:bg-slate-900/30 hover:dark:bg-slate-800/50 transition-colors">
                                        <TableCell className="font-medium sticky left-0 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                                            {member.name}
                                        </TableCell>
                                        <TableCell className="capitalize sticky left-0 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                                            {member.contribution_frequency}
                                        </TableCell>
                                        {months.map(month => {
                                            const monthContributions = contributions.filter(contribution => {
                                                try {
                                                    const contributionDate = new Date(contribution.payment_date);
                                                    if (isNaN(contributionDate.getTime())) return false;
                                                    
                                                    return (
                                                        contribution.member_id === member.id &&
                                                        contributionDate.getMonth() === month.getMonth() &&
                                                        contributionDate.getFullYear() === month.getFullYear()
                                                    );
                                                } catch (error) {
                                                    console.error('Error processing contribution date:', error);
                                                    return false;
                                                }
                                            });
                                            
                                            const totalAmount = monthContributions.reduce((sum, c) => {
                                                try {
                                                    return sum + Number(c.amount || 0);
                                                } catch (error) {
                                                    console.error('Error calculating amount:', error);
                                                    return sum;
                                                }
                                            }, 0);
                                            
                                            return (
                                                <TableCell 
                                                    key={month.toISOString()}
                                                    className={`text-center ${monthContributions.length > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-slate-50 dark:bg-slate-800'}`}
                                                >
                                                    {monthContributions.length > 0 ? (
                                                        <div className="space-y-1">
                                                            <div className="text-green-600 dark:text-green-400">✓</div>
                                                            <div className="text-xs text-slate-600 dark:text-slate-400">
                                                                {appCurrency.symbol}{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                                {monthContributions.length} payment{monthContributions.length > 1 ? 's' : ''}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-slate-400 dark:text-slate-500">-</div>
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
            const annualMembers = filteredMembers.filter(member => 
                member.contribution_frequency.toLowerCase() === 'annually'
            );

            if (annualMembers.length === 0) {
                return (
                    <div className="mb-8 p-4">
                        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Annual Contributions</h3>
                        <p className="text-slate-500 dark:text-slate-400">No members with annual contribution frequency found.</p>
                    </div>
                );
            }

            return (
                <div className="mb-8 p-4">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Annual Contributions</h3>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/50">
                                    <TableHead className="sticky left-0 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold">Member Name</TableHead>
                                    <TableHead className="sticky left-0 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold">Frequency</TableHead>
                                    {years.map(year => (
                                        <TableHead key={year} className="min-w-[120px] text-slate-700 dark:text-slate-200 font-semibold">
                                            {year}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {annualMembers.map((member) => (
                                    <TableRow key={member.id} className="border-slate-200 dark:border-slate-700 dark:bg-slate-900/30 hover:dark:bg-slate-800/50 transition-colors">
                                        <TableCell className="font-medium sticky left-0 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                                            {member.name}
                                        </TableCell>
                                        <TableCell className="capitalize sticky left-0 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                                            {member.contribution_frequency}
                                        </TableCell>
                                        {years.map(year => {
                                            const yearContributions = contributions.filter(contribution => {
                                                try {
                                                    const contributionDate = new Date(contribution.payment_date);
                                                    if (isNaN(contributionDate.getTime())) return false;
                                                    
                                                    return (
                                                        contribution.member_id === member.id &&
                                                        contributionDate.getFullYear() === year
                                                    );
                                                } catch (error) {
                                                    console.error('Error processing contribution date:', error);
                                                    return false;
                                                }
                                            });
                                            
                                            const totalAmount = yearContributions.reduce((sum, c) => {
                                                try {
                                                    return sum + Number(c.amount || 0);
                                                } catch (error) {
                                                    console.error('Error calculating amount:', error);
                                                    return sum;
                                                }
                                            }, 0);
                                            
                                            return (
                                                <TableCell 
                                                    key={year}
                                                    className={`text-center ${yearContributions.length > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-slate-50 dark:bg-slate-800'}`}
                                                >
                                                    {yearContributions.length > 0 ? (
                                                        <div className="space-y-1">
                                                            <div className="text-green-600 dark:text-green-400">✓</div>
                                                            <div className="text-xs text-slate-600 dark:text-slate-400">
                                                                {appCurrency.symbol}{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                                {yearContributions.length} payment{yearContributions.length > 1 ? 's' : ''}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-slate-400 dark:text-slate-500">-</div>
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
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                        <Input
                            placeholder="Search contributions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-slate-400 dark:focus:ring-slate-500"
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
                                                "w-[240px] justify-start text-left font-normal border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700",
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
                                                "w-[240px] justify-start text-left font-normal border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700",
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
                                    className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                                >
                                    Reset to current year
                                </Button>
                                                        )}
                        </div>
                    )}
                </div>
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'table' | 'calendar')}>
                    <TabsList className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <TabsTrigger 
                            value="table"
                            className="text-slate-700 dark:text-slate-300 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm transition-all duration-200"
                        >
                            <TableIcon className="h-4 w-4 mr-2" />
                            Table
                        </TabsTrigger>
                        <TabsTrigger 
                            value="calendar"
                            className="text-slate-700 dark:text-slate-300 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm transition-all duration-200"
                        >
                            <Calendar className="h-4 w-4 mr-2" />
                            Calendar
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900/50">
                {viewMode === 'table' ? (
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/50">
                                <TableHead 
                                    className="cursor-pointer text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold"
                                    onClick={() => handleSort('payment_date')}
                                >
                                    Payment Date {sortField === 'payment_date' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </TableHead>
                                <TableHead className="text-slate-700 dark:text-slate-200 font-semibold">Member</TableHead>
                                <TableHead 
                                    className="cursor-pointer text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold"
                                    onClick={() => handleSort('amount')}
                                >
                                    Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </TableHead>
                                <TableHead 
                                    className="cursor-pointer text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold"
                                    onClick={() => handleSort('payment_method')}
                                >
                                    Payment Method {sortField === 'payment_method' && (sortDirection === 'asc' ? '↑' : '↓')}
                                </TableHead>
                                <TableHead className="text-slate-700 dark:text-slate-200 font-semibold">Reference Number</TableHead>
                                <TableHead className="text-slate-700 dark:text-slate-200 font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredContributions.map((contribution) => {
                                try {
                                    const paymentDate = new Date(contribution.payment_date);
                                    const isValidDate = !isNaN(paymentDate.getTime());
                                    
                                    return (
                                        <TableRow key={contribution.id} className="border-slate-200 dark:border-slate-700 dark:bg-slate-900/30 hover:dark:bg-slate-800/50 transition-colors">
                                            <TableCell className="text-slate-700 dark:text-slate-300">
                                                {isValidDate ? format(paymentDate, 'MMM d, yyyy') : 'Invalid Date'}
                                            </TableCell>
                                            <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                                                {getMemberName(contribution.member_id)}
                                            </TableCell>
                                            <TableCell className="text-slate-700 dark:text-slate-300">
                                                <span className="text-blue-600 dark:text-blue-300 font-semibold">
                                                    {appCurrency.symbol}{Number(contribution.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </TableCell>
                                            <TableCell className="capitalize text-slate-700 dark:text-slate-300">
                                                {(contribution.payment_method || '').replace('_', ' ')}
                                            </TableCell>
                                            <TableCell className="text-slate-700 dark:text-slate-300">
                                                {contribution.reference_number || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(contribution)}
                                                        className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-orange-300 dark:hover:text-orange-200 dark:hover:bg-orange-900/20 transition-all duration-200"
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