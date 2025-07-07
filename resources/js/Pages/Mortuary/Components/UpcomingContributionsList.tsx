import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { format } from 'date-fns';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Member {
    id: string;
    name: string;
    contribution_amount: number;
    contribution_frequency: string;
    membership_start_date: string;
    group: string;
    status: string;
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
}

export default function UpcomingContributionsList({ members, contributions, appCurrency }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('all');
    const [monthlyPage, setMonthlyPage] = useState(1);
    const [quarterlyPage, setQuarterlyPage] = useState(1);
    const [annualPage, setAnnualPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const getNextContributionDate = (member: Member) => {
        const lastContribution = contributions
            .filter(c => c.member_id === member.id)
            .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())[0];

        const startDate = lastContribution 
            ? new Date(lastContribution.payment_date)
            : new Date(member.membership_start_date);

        const currentDate = new Date();
        let nextDate = new Date(startDate);

        // Keep adding intervals until we find a date that's in the future
        while (nextDate <= currentDate) {
            switch (member.contribution_frequency.toLowerCase()) {
                case 'monthly':
                    nextDate.setMonth(nextDate.getMonth() + 1);
                    break;
                case 'quarterly':
                    nextDate.setMonth(nextDate.getMonth() + 3);
                    break;
                case 'annually':
                    nextDate.setFullYear(nextDate.getFullYear() + 1);
                    break;
                default:
                    return null;
            }
        }

        return nextDate;
    };

    const upcomingContributions = members
        .filter(member => member.status === 'active')
        .map(member => ({
            ...member,
            nextContributionDate: getNextContributionDate(member)
        }))
        .filter(member => member.nextContributionDate)
        .sort((a, b) => a.nextContributionDate!.getTime() - b.nextContributionDate!.getTime());

    // Filter by search query and group
    const filterContributions = (contributions: typeof upcomingContributions) => {
        let filtered = contributions;
        
        if (searchQuery) {
            filtered = filtered.filter(member => 
                member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (member.group && member.group.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }
        
        if (selectedGroup !== 'all') {
            filtered = filtered.filter(member => member.group === selectedGroup);
        }
        
        return filtered;
    };

    const calculateTotalContributions = (contributions: typeof upcomingContributions) => {
        return Number(contributions.reduce((total, member) => total + Number(member.contribution_amount), 0));
    };

    const monthlyContributions = filterContributions(
        upcomingContributions.filter(member => member.contribution_frequency.toLowerCase() === 'monthly')
    );
    const quarterlyContributions = filterContributions(
        upcomingContributions.filter(member => member.contribution_frequency.toLowerCase() === 'quarterly')
    );
    const annualContributions = filterContributions(
        upcomingContributions.filter(member => member.contribution_frequency.toLowerCase() === 'annually')
    );

    // Get unique groups for filter dropdown
    const groups = ['all', ...Array.from(new Set(upcomingContributions.map(m => m.group).filter(Boolean)))].sort();

    // Reset to first page when search query or group changes
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setMonthlyPage(1);
        setQuarterlyPage(1);
        setAnnualPage(1);
    };

    const handleGroupChange = (group: string) => {
        setSelectedGroup(group);
        setMonthlyPage(1);
        setQuarterlyPage(1);
        setAnnualPage(1);
    };

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setMonthlyPage(1);
        setQuarterlyPage(1);
        setAnnualPage(1);
    };

    const renderPagination = (contributions: typeof upcomingContributions, currentPage: number, setCurrentPage: (page: number) => void, frequency: string) => {
        const totalPages = Math.ceil(contributions.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

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
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center space-x-4 text-sm text-gray-700 dark:text-gray-300">
                    <span>
                        Showing {startIndex + 1} to {Math.min(endIndex, contributions.length)} of {contributions.length} {frequency} contributions
                    </span>
                    <span className="text-gray-400">|</span>
                    <span>Items per page:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
                
                {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        <div className="flex items-center gap-1">
                            {getPageNumbers().map((page, index) => (
                                <div key={index}>
                                    {page === '...' ? (
                                        <span className="px-2 py-1 text-gray-500 dark:text-gray-400">...</span>
                                    ) : (
                                        <Button
                                            variant={currentPage === page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setCurrentPage(page as number)}
                                            className={`h-8 w-8 p-0 ${
                                                currentPage === page 
                                                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                                                    : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
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
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    const ContributionTable = ({ 
        contributions, 
        title, 
        currentPage, 
        setCurrentPage, 
        frequency 
    }: { 
        contributions: typeof upcomingContributions, 
        title: string, 
        currentPage: number, 
        setCurrentPage: (page: number) => void, 
        frequency: string 
    }) => {
        const totalPages = Math.ceil(contributions.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentContributions = contributions.slice(startIndex, endIndex);

        return (
            <div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg overflow-hidden dark:border dark:border-gray-800">
                <div className="p-4 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-900/50 dark:border-gray-800">
                                <TableHead className="font-semibold dark:text-gray-200">Member Name</TableHead>
                                <TableHead className="font-semibold dark:text-gray-200">Group</TableHead>
                                <TableHead className="font-semibold dark:text-gray-200">Contribution Amount</TableHead>
                                <TableHead className="font-semibold dark:text-gray-200">Next Contribution Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentContributions.map((member) => (
                                <TableRow key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 dark:border-gray-800 transition-colors duration-200">
                                    <TableCell className="font-medium dark:text-gray-100">{member.name}</TableCell>
                                    <TableCell className="dark:text-gray-200">
                                        {member.group || 'No Group'}
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium text-blue-600 dark:text-blue-400">
                                            {formatCurrency(member.contribution_amount, appCurrency.symbol)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {member.nextContributionDate && 
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {format(member.nextContributionDate, 'MMM dd, yyyy')}
                                            </span>
                                        }
                                    </TableCell>
                                </TableRow>
                            ))}
                            {currentContributions.length === 0 && (
                                <TableRow className="dark:border-gray-800">
                                    <TableCell colSpan={4} className="text-center text-muted-foreground dark:text-gray-400 py-4">
                                        No matching contributions found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {renderPagination(contributions, currentPage, setCurrentPage, frequency)}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-950 rounded-lg shadow-lg dark:border dark:border-gray-800">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Upcoming Contributions</h2>
                    <div className="flex items-center gap-4 min-w-[400px]">
                        <Input
                            type="search"
                            placeholder="Search by member name or group..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 dark:placeholder-gray-500 focus:dark:border-blue-500 focus:dark:ring-blue-500/20"
                        />
                    </div>
                </div>
                
                {/* Group Filter */}
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Filter by Group:
                    </label>
                    <Select value={selectedGroup} onValueChange={handleGroupChange}>
                        <SelectTrigger className="w-64 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {groups.map((group) => (
                                <SelectItem key={group} value={group} className="text-lg py-3">
                                    {group === 'all' ? 'All Groups' : group}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg dark:border dark:border-gray-800">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Upcoming</div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(calculateTotalContributions(upcomingContributions), appCurrency.symbol)}
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg dark:border dark:border-gray-800">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Monthly Total</div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(calculateTotalContributions(monthlyContributions), appCurrency.symbol)}
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg dark:border dark:border-gray-800">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Quarterly Total</div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(calculateTotalContributions(quarterlyContributions), appCurrency.symbol)}
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg dark:border dark:border-gray-800">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Annual Total</div>
                        <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            {formatCurrency(calculateTotalContributions(annualContributions), appCurrency.symbol)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {monthlyContributions.length > 0 && (
                    <ContributionTable 
                        contributions={monthlyContributions} 
                        title="Monthly Contributions" 
                        currentPage={monthlyPage}
                        setCurrentPage={setMonthlyPage}
                        frequency="monthly"
                    />
                )}
                {quarterlyContributions.length > 0 && (
                    <ContributionTable 
                        contributions={quarterlyContributions} 
                        title="Quarterly Contributions" 
                        currentPage={quarterlyPage}
                        setCurrentPage={setQuarterlyPage}
                        frequency="quarterly"
                    />
                )}
                {annualContributions.length > 0 && (
                    <ContributionTable 
                        contributions={annualContributions} 
                        title="Annual Contributions" 
                        currentPage={annualPage}
                        setCurrentPage={setAnnualPage}
                        frequency="annual"
                    />
                )}
                {monthlyContributions.length === 0 && quarterlyContributions.length === 0 && annualContributions.length === 0 && (
                    <div className="text-center text-muted-foreground dark:text-gray-400 py-12 bg-gray-50 dark:bg-gray-900 rounded-lg dark:border dark:border-gray-800">
                        No upcoming contributions found
                    </div>
                )}
            </div>
        </div>
    );
} 