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
import { format, addMonths, addQuarters, addYears, isBefore, isAfter, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { Plus, Table as TableIcon, Calendar, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter } from 'lucide-react';
import AddContributionDialog from './AddContributionDialog';
import { Tabs, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';

interface Member {
    id: string;
    name: string;
    date_of_birth: string;
    gender: string;
    contact_number: string;
    address: string;
    membership_start_date: string;
    contribution_amount: number;
    contribution_frequency: string;
    status: string;
    group: string;
}

interface Contribution {
    id: string;
    member_id: string;
    payment_date: string;
}

interface Props {
    members: Member[];
    contributions: Contribution[];
    appCurrency: {
        code: string;
        symbol: string;
    };
    onContributionAdded: (contribution: any) => void;
}

export default function MissingContributionsList({ members, contributions, appCurrency, onContributionAdded }: Props) {
    const [isAddContributionOpen, setIsAddContributionOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [viewMode, setViewMode] = useState<'summary' | 'calendar'>('summary');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [selectedGroup, setSelectedGroup] = useState<string>('all');

    const getExpectedContributionDates = (member: Member) => {
        const startDate = new Date(member.membership_start_date);
        const today = new Date();
        const dates: Date[] = [];
        let currentDate = startDate;

        while (isBefore(currentDate, today)) {
            dates.push(new Date(currentDate));
            
            switch (member.contribution_frequency) {
                case 'monthly':
                    currentDate = addMonths(currentDate, 1);
                    break;
                case 'quarterly':
                    currentDate = addQuarters(currentDate, 1);
                    break;
                case 'annually':
                    currentDate = addYears(currentDate, 1);
                    break;
            }
        }

        return dates;
    };

    const getMissingContributions = (member: Member) => {
        const expectedDates = getExpectedContributionDates(member);
        const memberContributions = contributions.filter(c => c.member_id === member.id);
        
        return expectedDates.filter(expectedDate => {
            const hasContribution = memberContributions.some(contribution => {
                const contributionDate = new Date(contribution.payment_date);
                if (member.contribution_frequency === 'annually') {
                    return contributionDate.getFullYear() === expectedDate.getFullYear();
                }
                return (
                    contributionDate.getMonth() === expectedDate.getMonth() &&
                    contributionDate.getFullYear() === expectedDate.getFullYear()
                );
            });
            return !hasContribution;
        });
    };

    const handleAddContribution = (member: Member) => {
        setSelectedMember(member);
        setIsAddContributionOpen(true);
    };

    const membersWithMissingContributions = members
        .map(member => ({
            ...member,
            missingContributions: getMissingContributions(member)
        }))
        .filter(member => member.missingContributions.length > 0)
        .sort((a, b) => b.missingContributions.length - a.missingContributions.length);

    // Get unique groups for filter dropdown
    const groups = ['all', ...Array.from(new Set(membersWithMissingContributions.map(m => m.group).filter(Boolean)))].sort();

    const filteredMembers = membersWithMissingContributions.filter(member => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = (
            member.name.toLowerCase().includes(searchLower) ||
            member.contribution_frequency.toLowerCase().includes(searchLower) ||
            member.status.toLowerCase().includes(searchLower)
        );
        const matchesGroup = selectedGroup === 'all' || member.group === selectedGroup;
        
        return matchesSearch && matchesGroup;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

    // Reset to first page when search query or group filter changes
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    const handleGroupChange = (value: string) => {
        setSelectedGroup(value);
        setCurrentPage(1);
    };

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const getPageNumbers = () => {
            const pages = [];
            const maxVisiblePages = 5;
            
            if (totalPages <= maxVisiblePages) {
                for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                if (currentPage <= 3) {
                    for (let i = 1; i <= 4; i++) {
                        pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages);
                } else if (currentPage >= totalPages - 2) {
                    pages.push(1);
                    pages.push('...');
                    for (let i = totalPages - 3; i <= totalPages; i++) {
                        pages.push(i);
                    }
                } else {
                    pages.push(1);
                    pages.push('...');
                    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                        pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages);
                }
            }
            
            return pages;
        };

        return (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="text-sm text-slate-700 dark:text-slate-300">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredMembers.length)} of {filteredMembers.length} members
                </div>
                
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                        {getPageNumbers().map((page, index) => (
                            <div key={index}>
                                {page === '...' ? (
                                    <span className="px-2 py-1 text-slate-500 dark:text-slate-400">...</span>
                                ) : (
                                    <Button
                                        variant={currentPage === page ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => goToPage(page as number)}
                                        className={`h-8 w-8 p-0 ${
                                            currentPage === page 
                                                ? "bg-blue-600 text-white hover:bg-blue-700" 
                                                : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                        }`}
                                    >
                                        {page}
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };

    const renderSummaryView = () => (
        <div>
            <Table>
                <TableHeader>
                    <TableRow className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/50">
                        <TableHead className="text-slate-700 dark:text-slate-200 font-semibold">Member Name</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-200 font-semibold">Group</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-200 font-semibold">Contribution Frequency</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-200 font-semibold">Expected Amount</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-200 font-semibold">Start Date</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-200 font-semibold">Missing Contributions</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-200 font-semibold">Total Due</TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-200 font-semibold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedMembers.map((member) => (
                        <TableRow key={member.id} className="border-slate-200 dark:border-slate-700 dark:bg-slate-900/30 hover:dark:bg-slate-800/50 transition-colors">
                            <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                                {member.name}
                            </TableCell>
                            <TableCell className="text-slate-700 dark:text-slate-300">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    {member.group || 'Ungrouped'}
                                </span>
                            </TableCell>
                            <TableCell className="capitalize text-slate-700 dark:text-slate-300">
                                {member.contribution_frequency}
                            </TableCell>
                            <TableCell className="text-slate-700 dark:text-slate-300">
                                <span className="text-blue-600 dark:text-blue-300 font-semibold">
                                    {appCurrency.symbol}{Number(member.contribution_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </TableCell>
                            <TableCell className="text-slate-700 dark:text-slate-300">
                                {format(new Date(member.membership_start_date), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <span className="text-red-600 dark:text-orange-300 font-medium">
                                        {member.missingContributions.length} payments
                                    </span>
                                    <Button
                                        variant="link"
                                        size="sm"
                                        onClick={() => setViewMode('calendar')}
                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200 transition-colors duration-200"
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </TableCell>
                            <TableCell className="font-medium text-red-600 dark:text-orange-300">
                                {appCurrency.symbol}{(Number(member.contribution_amount) * member.missingContributions.length).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAddContribution(member)}
                                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Contribution
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {renderPagination()}
        </div>
    );

    const renderCalendarView = () => {
        // Get all months from the earliest membership start date to current month
        const earliestStartDate = new Date(Math.min(...members.map(m => new Date(m.membership_start_date).getTime())));
        const months = eachMonthOfInterval({
            start: startOfMonth(earliestStartDate),
            end: endOfMonth(new Date())
        });

        // Get all years for annual view
        const years = Array.from(
            new Set(
                months.map(month => month.getFullYear())
            )
        ).sort();

        // Group members by contribution frequency
        const monthlyMembers = filteredMembers.filter(m => m.contribution_frequency === 'monthly');
        const quarterlyMembers = filteredMembers.filter(m => m.contribution_frequency === 'quarterly');
        const annualMembers = filteredMembers.filter(m => m.contribution_frequency === 'annually');

        const renderMonthlyTable = (members: typeof filteredMembers, title: string) => {
            if (members.length === 0) return null;

            return (
                <div className="mb-8 p-4">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">{title}</h3>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/50">
                                    <TableHead className="sticky left-0 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold">Member Name</TableHead>
                                    <TableHead className="sticky left-[200px] bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold">Group</TableHead>
                                    {months.map(month => (
                                        <TableHead key={month.toISOString()} className="min-w-[120px] text-slate-700 dark:text-slate-200 font-semibold">
                                            {format(month, 'MMM yyyy')}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map((member) => (
                                    <TableRow key={member.id} className="border-slate-200 dark:border-slate-700 dark:bg-slate-900/30 hover:dark:bg-slate-800/50 transition-colors">
                                        <TableCell className="font-medium sticky left-0 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                                            {member.name}
                                        </TableCell>
                                        <TableCell className="sticky left-[200px] bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                {member.group || 'Ungrouped'}
                                            </span>
                                        </TableCell>
                                        {months.map(month => {
                                            const hasContribution = member.missingContributions.some(
                                                date => date.getMonth() === month.getMonth() && 
                                                       date.getFullYear() === month.getFullYear()
                                            );
                                            const isBeforeStart = isBefore(month, new Date(member.membership_start_date));
                                            
                                            return (
                                                <TableCell 
                                                    key={month.toISOString()}
                                                    className={`text-center ${hasContribution ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'} ${isBeforeStart ? 'bg-slate-50 dark:bg-slate-800' : ''}`}
                                                >
                                                    {!isBeforeStart && (
                                                        <>
                                                            {hasContribution ? (
                                                                <div className="space-y-1">
                                                                    <div className="text-red-600 dark:text-red-400">✗</div>
                                                                    <div className="text-xs text-slate-600 dark:text-slate-400">
                                                                        Missing
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-1">
                                                                    <div className="text-green-600 dark:text-green-400">✓</div>
                                                                    <div className="text-xs text-slate-600 dark:text-slate-400">
                                                                        {appCurrency.symbol}{Number(member.contribution_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
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

        const renderAnnualTable = (members: typeof filteredMembers) => {
            if (members.length === 0) return null;

            return (
                <div className="mb-8 p-4">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Annual Contributions</h3>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/50">
                                    <TableHead className="sticky left-0 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold">Member Name</TableHead>
                                    <TableHead className="sticky left-[200px] bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold">Group</TableHead>
                                    {years.map(year => (
                                        <TableHead key={year} className="min-w-[120px] text-slate-700 dark:text-slate-200 font-semibold">
                                            {year}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map((member) => (
                                    <TableRow key={member.id} className="border-slate-200 dark:border-slate-700 dark:bg-slate-900/30 hover:dark:bg-slate-800/50 transition-colors">
                                        <TableCell className="font-medium sticky left-0 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                                            {member.name}
                                        </TableCell>
                                        <TableCell className="sticky left-[200px] bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                                {member.group || 'Ungrouped'}
                                            </span>
                                        </TableCell>
                                        {years.map(year => {
                                            const hasContribution = member.missingContributions.some(
                                                date => date.getFullYear() === year
                                            );
                                            const isBeforeStart = year < new Date(member.membership_start_date).getFullYear();
                                            
                                            return (
                                                <TableCell 
                                                    key={year}
                                                    className={`text-center ${hasContribution ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'} ${isBeforeStart ? 'bg-slate-50 dark:bg-slate-800' : ''}`}
                                                >
                                                    {!isBeforeStart && (
                                                        <>
                                                            {hasContribution ? (
                                                                <div className="space-y-1">
                                                                    <div className="text-red-600 dark:text-red-400">✗</div>
                                                                    <div className="text-xs text-slate-600 dark:text-slate-400">
                                                                        Missing
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-1">
                                                                    <div className="text-green-600 dark:text-green-400">✓</div>
                                                                    <div className="text-xs text-slate-600 dark:text-slate-400">
                                                                        {appCurrency.symbol}{Number(member.contribution_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
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
                {renderMonthlyTable(monthlyMembers, 'Monthly Contributions')}
                {renderMonthlyTable(quarterlyMembers, 'Quarterly Contributions')}
                {renderAnnualTable(annualMembers)}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                        <Input
                            placeholder="Search members..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="pl-8 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-slate-400 dark:focus:ring-slate-500"
                        />
                    </div>
                    <div className="w-full sm:w-48">
                        <Select value={selectedGroup} onValueChange={handleGroupChange}>
                            <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-slate-400 dark:focus:ring-slate-500">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Filter by group" />
                            </SelectTrigger>
                            <SelectContent>
                                {groups.map((group) => (
                                    <SelectItem key={group} value={group}>
                                        {group === 'all' ? 'All Groups' : group}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'summary' | 'calendar')}>
                    <TabsList className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <TabsTrigger 
                            value="summary"
                            className="text-slate-700 dark:text-slate-300 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm transition-all duration-200"
                        >
                            <TableIcon className="h-4 w-4 mr-2" />
                            Summary
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
                {viewMode === 'summary' ? renderSummaryView() : renderCalendarView()}
            </div>

            <AddContributionDialog
                open={isAddContributionOpen}
                onOpenChange={setIsAddContributionOpen}
                members={members}
                appCurrency={appCurrency}
                onContributionAdded={onContributionAdded}
                selectedMember={selectedMember}
            />
        </div>
    );
} 