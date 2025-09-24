import { Button } from '@/Components/ui/button';
import { Calendar as DatePicker } from '@/Components/ui/calendar';
import { Input } from '@/Components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import {
    eachMonthOfInterval,
    endOfMonth,
    endOfYear,
    format,
    startOfMonth,
    startOfYear,
    subYears,
} from 'date-fns';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Edit,
    Search,
    Table as TableIcon,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import EditContributionDialog from './EditContributionDialog';

interface Member {
    id: string;
    name: string;
    contribution_frequency: string;
    group: string;
}

interface Contribution {
    id: string;
    member_id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    reference_number: string;
    created_at?: string;
}

interface Props {
    contributions: Contribution[];
    members: Member[];
    onContributionAdd: (contribution: Omit<Contribution, 'created_at'>) => void;
    onBulkContributionsAdded: (
        contributions: Omit<Contribution, 'created_at'>[],
    ) => void;
    canEdit: boolean;
    canDelete: boolean;
    appCurrency: {
        code: string;
        symbol: string;
    };
}

export default function ContributionsList({
    contributions,
    members,
    onContributionAdd,
    onBulkContributionsAdded,
    canEdit,
    canDelete,
    appCurrency,
}: Props) {
    const [sortField, setSortField] =
        useState<keyof Contribution>('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedContribution, setSelectedContribution] =
        useState<Contribution | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState<Date>(
        startOfYear(subYears(new Date(), 10)),
    );
    const [endDate, setEndDate] = useState<Date>(endOfYear(new Date()));
    const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Calendar pagination state
    const [calendarCurrentPage, setCalendarCurrentPage] = useState(1);
    const [calendarItemsPerPage, setCalendarItemsPerPage] = useState(10);

    // Group filter state
    const [selectedGroup, setSelectedGroup] = useState<string>('all');

    const handleSort = (field: keyof Contribution) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleDelete = (memberId: string, contributionId: string) => {
        if (
            window.confirm(
                'Are you sure you want to delete this contribution? This action cannot be undone.',
            )
        ) {
            router.delete(
                `/mortuary/contributions/${memberId}/${contributionId}`,
                {
                    onSuccess: () => {
                        toast.success('Contribution deleted successfully');
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    },
                    onError: () => {
                        toast.error('Failed to delete contribution');
                    },
                },
            );
        }
    };

    const handleEdit = (contribution: Contribution) => {
        setSelectedContribution(contribution);
        setIsEditDialogOpen(true);
    };

    const handleContributionUpdate = (updatedContribution: Contribution) => {
        const updatedContributions = contributions.map((contribution) =>
            contribution.id === updatedContribution.id
                ? updatedContribution
                : contribution,
        );
        // Update the parent component's state if needed
        // This will be handled by the page refresh after the API call
    };

    const getMemberName = (memberId: string) => {
        const member = members.find((m) => m.id === memberId);
        return member ? member.name : 'Unknown Member';
    };

    const getMemberGroup = (memberId: string) => {
        const member = members.find((m) => m.id === memberId);
        return member ? member.group : '';
    };

    // Get unique groups from members
    const getUniqueGroups = () => {
        const groups = members
            .map((member) => member.group)
            .filter((group) => group && group.trim() !== '');
        return [...new Set(groups)].sort();
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
                return sortDirection === 'asc'
                    ? aValue - bValue
                    : bValue - aValue;
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

    const filteredContributions = sortedContributions.filter((contribution) => {
        try {
            const searchLower = searchQuery.toLowerCase();
            const memberName =
                getMemberName(contribution.member_id)?.toLowerCase() || '';
            const paymentMethod =
                contribution.payment_method?.toLowerCase() || '';
            const referenceNumber =
                contribution.reference_number?.toLowerCase() || '';
            const memberGroup =
                getMemberGroup(contribution.member_id)?.toLowerCase() || '';

            const paymentDate = new Date(contribution.payment_date);
            if (isNaN(paymentDate.getTime())) {
                console.warn(
                    'Invalid payment date:',
                    contribution.payment_date,
                );
                return false;
            }

            const matchesSearch =
                memberName.includes(searchLower) ||
                paymentMethod.includes(searchLower) ||
                referenceNumber.includes(searchLower) ||
                memberGroup.includes(searchLower);

            const matchesDateRange =
                (!startDate || paymentDate >= startDate) &&
                (!endDate || paymentDate <= endDate);

            const matchesGroup =
                selectedGroup === 'all' ||
                getMemberGroup(contribution.member_id) === selectedGroup;

            return matchesSearch && matchesDateRange && matchesGroup;
        } catch (error) {
            console.error('Error filtering contribution:', error, contribution);
            return false;
        }
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredContributions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedContributions = filteredContributions.slice(
        startIndex,
        endIndex,
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    // Calendar pagination handlers
    const handleCalendarPageChange = (page: number) => {
        setCalendarCurrentPage(page);
    };

    const handleCalendarItemsPerPageChange = (newItemsPerPage: number) => {
        setCalendarItemsPerPage(newItemsPerPage);
        setCalendarCurrentPage(1); // Reset to first page when changing items per page
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
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="flex items-center space-x-4 text-sm text-slate-700 dark:text-slate-300">
                    <span>
                        Showing {startIndex + 1} to{' '}
                        {Math.min(endIndex, filteredContributions.length)} of{' '}
                        {filteredContributions.length} contributions
                    </span>
                    <span className="text-slate-400">|</span>
                    <span>Items per page:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) =>
                            handleItemsPerPageChange(Number(e.target.value))
                        }
                        className="rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
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
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className="h-8 w-8 border-slate-300 p-0 text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="h-8 w-8 border-slate-300 p-0 text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-1">
                            {getPageNumbers().map((page, index) => (
                                <div key={index}>
                                    {page === '...' ? (
                                        <span className="px-2 py-1 text-slate-500 dark:text-slate-400">
                                            ...
                                        </span>
                                    ) : (
                                        <Button
                                            variant={
                                                currentPage === page
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            onClick={() =>
                                                handlePageChange(page as number)
                                            }
                                            className={`h-8 w-8 p-0 ${
                                                currentPage === page
                                                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                                                    : 'border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
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
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 border-slate-300 p-0 text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 border-slate-300 p-0 text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    const renderCalendarPagination = (
        totalMembers: number,
        currentMembers: any[],
    ) => {
        const totalCalendarPages = Math.ceil(
            totalMembers / calendarItemsPerPage,
        );
        const calendarStartIndex =
            (calendarCurrentPage - 1) * calendarItemsPerPage;
        const calendarEndIndex = calendarStartIndex + calendarItemsPerPage;

        if (totalCalendarPages <= 1) return null;

        const getPageNumbers = () => {
            const pages = [];
            const maxVisiblePages = 5;

            if (totalCalendarPages <= maxVisiblePages) {
                for (let i = 1; i <= totalCalendarPages; i++) {
                    pages.push(i);
                }
            } else {
                if (calendarCurrentPage <= 3) {
                    for (let i = 1; i <= 4; i++) {
                        pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalCalendarPages);
                } else if (calendarCurrentPage >= totalCalendarPages - 2) {
                    pages.push(1);
                    pages.push('...');
                    for (
                        let i = totalCalendarPages - 3;
                        i <= totalCalendarPages;
                        i++
                    ) {
                        pages.push(i);
                    }
                } else {
                    pages.push(1);
                    pages.push('...');
                    for (
                        let i = calendarCurrentPage - 1;
                        i <= calendarCurrentPage + 1;
                        i++
                    ) {
                        pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalCalendarPages);
                }
            }

            return pages;
        };

        return (
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="flex items-center space-x-4 text-sm text-slate-700 dark:text-slate-300">
                    <span>
                        Showing {calendarStartIndex + 1} to{' '}
                        {Math.min(calendarEndIndex, totalMembers)} of{' '}
                        {totalMembers} members
                    </span>
                    <span className="text-slate-400">|</span>
                    <span>Items per page:</span>
                    <select
                        value={calendarItemsPerPage}
                        onChange={(e) =>
                            handleCalendarItemsPerPageChange(
                                Number(e.target.value),
                            )
                        }
                        className="rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>

                {totalCalendarPages > 1 && (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCalendarPageChange(1)}
                            disabled={calendarCurrentPage === 1}
                            className="h-8 w-8 border-slate-300 p-0 text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                handleCalendarPageChange(
                                    calendarCurrentPage - 1,
                                )
                            }
                            disabled={calendarCurrentPage === 1}
                            className="h-8 w-8 border-slate-300 p-0 text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-1">
                            {getPageNumbers().map((page, index) => (
                                <div key={index}>
                                    {page === '...' ? (
                                        <span className="px-2 py-1 text-slate-500 dark:text-slate-400">
                                            ...
                                        </span>
                                    ) : (
                                        <Button
                                            variant={
                                                calendarCurrentPage === page
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            size="sm"
                                            onClick={() =>
                                                handleCalendarPageChange(
                                                    page as number,
                                                )
                                            }
                                            className={`h-8 w-8 p-0 ${
                                                calendarCurrentPage === page
                                                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                                                    : 'border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
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
                            onClick={() =>
                                handleCalendarPageChange(
                                    calendarCurrentPage + 1,
                                )
                            }
                            disabled={
                                calendarCurrentPage === totalCalendarPages
                            }
                            className="h-8 w-8 border-slate-300 p-0 text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                handleCalendarPageChange(totalCalendarPages)
                            }
                            disabled={
                                calendarCurrentPage === totalCalendarPages
                            }
                            className="h-8 w-8 border-slate-300 p-0 text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    const renderCalendarView = () => {
        // Get all months from 10 years ago to current month
        const currentDate = new Date();
        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(currentDate.getFullYear() - 10);

        const months = eachMonthOfInterval({
            start: startOfMonth(tenYearsAgo),
            end: endOfMonth(currentDate),
        });

        // Get all years for annual view - calculate from 10 years ago to current year
        const currentYear = new Date().getFullYear();
        const earliestYear = currentYear - 10; // Default to 10 years ago
        const years: number[] = [];

        for (let year = earliestYear; year <= currentYear; year++) {
            years.push(year);
        }

        // Filter members based on search query and group for calendar view
        const filteredMembers = members.filter((member) => {
            const matchesSearch =
                !searchQuery.trim() ||
                member.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesGroup =
                selectedGroup === 'all' || member.group === selectedGroup;
            return matchesSearch && matchesGroup;
        });

        const renderMonthlyTable = () => {
            // Filter members to only show those with monthly or quarterly frequency
            const monthlyMembers = filteredMembers.filter(
                (member) =>
                    member.contribution_frequency.toLowerCase() === 'monthly' ||
                    member.contribution_frequency.toLowerCase() === 'quarterly',
            );

            if (monthlyMembers.length === 0) {
                return (
                    <div className="mb-8 p-4">
                        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Monthly/Quarterly Contributions
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            No members with monthly or quarterly contribution
                            frequency found.
                        </p>
                    </div>
                );
            }

            // Paginate monthly members
            const monthlyStartIndex =
                (calendarCurrentPage - 1) * calendarItemsPerPage;
            const monthlyEndIndex = monthlyStartIndex + calendarItemsPerPage;
            const paginatedMonthlyMembers = monthlyMembers.slice(
                monthlyStartIndex,
                monthlyEndIndex,
            );

            return (
                <div className="mb-8 p-4">
                    <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Monthly/Quarterly Contributions
                    </h3>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/50">
                                    <TableHead className="sticky left-0 bg-white font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                        Member Name
                                    </TableHead>
                                    <TableHead className="sticky left-0 bg-white font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                        Group
                                    </TableHead>
                                    <TableHead className="sticky left-0 bg-white font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                        Frequency
                                    </TableHead>
                                    {months.map((month) => (
                                        <TableHead
                                            key={month.toISOString()}
                                            className="min-w-[120px] font-semibold text-slate-700 dark:text-slate-200"
                                        >
                                            {format(month, 'MMM yyyy')}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedMonthlyMembers.map((member) => (
                                    <TableRow
                                        key={member.id}
                                        className="border-slate-200 transition-colors dark:border-slate-700 dark:bg-slate-900/30 hover:dark:bg-slate-800/50"
                                    >
                                        <TableCell className="sticky left-0 bg-white font-medium text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                                            {member.name}
                                        </TableCell>
                                        <TableCell className="sticky left-0 bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                            {member.group || '-'}
                                        </TableCell>
                                        <TableCell className="sticky left-0 bg-white capitalize text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                            {member.contribution_frequency}
                                        </TableCell>
                                        {months.map((month) => {
                                            const monthContributions =
                                                contributions.filter(
                                                    (contribution) => {
                                                        try {
                                                            const contributionDate =
                                                                new Date(
                                                                    contribution.payment_date,
                                                                );
                                                            if (
                                                                isNaN(
                                                                    contributionDate.getTime(),
                                                                )
                                                            )
                                                                return false;

                                                            return (
                                                                contribution.member_id ===
                                                                    member.id &&
                                                                contributionDate.getMonth() ===
                                                                    month.getMonth() &&
                                                                contributionDate.getFullYear() ===
                                                                    month.getFullYear()
                                                            );
                                                        } catch (error) {
                                                            console.error(
                                                                'Error processing contribution date:',
                                                                error,
                                                            );
                                                            return false;
                                                        }
                                                    },
                                                );

                                            const totalAmount =
                                                monthContributions.reduce(
                                                    (sum, c) => {
                                                        try {
                                                            return (
                                                                sum +
                                                                Number(
                                                                    c.amount ||
                                                                        0,
                                                                )
                                                            );
                                                        } catch (error) {
                                                            console.error(
                                                                'Error calculating amount:',
                                                                error,
                                                            );
                                                            return sum;
                                                        }
                                                    },
                                                    0,
                                                );

                                            return (
                                                <TableCell
                                                    key={month.toISOString()}
                                                    className={`text-center ${monthContributions.length > 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-slate-50 dark:bg-slate-800'}`}
                                                >
                                                    {monthContributions.length >
                                                    0 ? (
                                                        <div className="space-y-1">
                                                            <div className="text-green-600 dark:text-green-400">
                                                                ✓
                                                            </div>
                                                            <div className="text-xs text-slate-600 dark:text-slate-400">
                                                                {
                                                                    appCurrency.symbol
                                                                }
                                                                {totalAmount.toLocaleString(
                                                                    'en-US',
                                                                    {
                                                                        minimumFractionDigits: 2,
                                                                        maximumFractionDigits: 2,
                                                                    },
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                                {
                                                                    monthContributions.length
                                                                }{' '}
                                                                payment
                                                                {monthContributions.length >
                                                                1
                                                                    ? 's'
                                                                    : ''}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="text-slate-400 dark:text-slate-500">
                                                            -
                                                        </div>
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {renderCalendarPagination(
                        monthlyMembers.length,
                        paginatedMonthlyMembers,
                    )}
                </div>
            );
        };

        const renderAnnualTable = () => {
            // Filter members to only show those with annual frequency
            const annualMembers = filteredMembers.filter(
                (member) =>
                    member.contribution_frequency.toLowerCase() === 'annually',
            );

            if (annualMembers.length === 0) {
                return (
                    <div className="p-4">
                        <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                            Annual Contributions
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400">
                            No members with annual contribution frequency found.
                        </p>
                    </div>
                );
            }

            // Paginate annual members
            const annualStartIndex =
                (calendarCurrentPage - 1) * calendarItemsPerPage;
            const annualEndIndex = annualStartIndex + calendarItemsPerPage;
            const paginatedAnnualMembers = annualMembers.slice(
                annualStartIndex,
                annualEndIndex,
            );

            return (
                <div className="p-4">
                    <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                        Annual Contributions
                    </h3>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/50">
                                    <TableHead className="sticky left-0 bg-white font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                        Member Name
                                    </TableHead>
                                    <TableHead className="sticky left-0 bg-white font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                        Group
                                    </TableHead>
                                    <TableHead className="sticky left-0 bg-white font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                                        Frequency
                                    </TableHead>
                                    {years.map((year) => (
                                        <TableHead
                                            key={year}
                                            className="min-w-[120px] font-semibold text-slate-700 dark:text-slate-200"
                                        >
                                            {year}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedAnnualMembers.map((member) => (
                                    <TableRow
                                        key={member.id}
                                        className="border-slate-200 transition-colors dark:border-slate-700 dark:bg-slate-900/30 hover:dark:bg-slate-800/50"
                                    >
                                        <TableCell className="sticky left-0 bg-white font-medium text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                                            {member.name}
                                        </TableCell>
                                        <TableCell className="sticky left-0 bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                            {member.group || '-'}
                                        </TableCell>
                                        <TableCell className="sticky left-0 bg-white capitalize text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                            {member.contribution_frequency}
                                        </TableCell>
                                        {years.map((year) => {
                                            const yearContributions =
                                                contributions.filter(
                                                    (contribution) => {
                                                        try {
                                                            const contributionDate =
                                                                new Date(
                                                                    contribution.payment_date,
                                                                );
                                                            if (
                                                                isNaN(
                                                                    contributionDate.getTime(),
                                                                )
                                                            )
                                                                return false;

                                                            return (
                                                                contribution.member_id ===
                                                                    member.id &&
                                                                contributionDate.getFullYear() ===
                                                                    year
                                                            );
                                                        } catch (error) {
                                                            console.error(
                                                                'Error processing contribution date:',
                                                                error,
                                                            );
                                                            return false;
                                                        }
                                                    },
                                                );

                                            const totalAmount =
                                                yearContributions.reduce(
                                                    (sum, c) => {
                                                        try {
                                                            return (
                                                                sum +
                                                                Number(
                                                                    c.amount ||
                                                                        0,
                                                                )
                                                            );
                                                        } catch (error) {
                                                            console.error(
                                                                'Error calculating amount:',
                                                                error,
                                                            );
                                                            return sum;
                                                        }
                                                    },
                                                    0,
                                                );

                                            return (
                                                <TableCell
                                                    key={year}
                                                    className="text-center text-slate-700 dark:text-slate-300"
                                                >
                                                    {totalAmount > 0 ? (
                                                        <div className="text-sm">
                                                            <div className="font-medium text-blue-600 dark:text-blue-300">
                                                                {
                                                                    appCurrency.symbol
                                                                }
                                                                {totalAmount.toLocaleString(
                                                                    'en-US',
                                                                    {
                                                                        minimumFractionDigits: 2,
                                                                        maximumFractionDigits: 2,
                                                                    },
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                                {
                                                                    yearContributions.length
                                                                }{' '}
                                                                payment
                                                                {yearContributions.length !==
                                                                1
                                                                    ? 's'
                                                                    : ''}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 dark:text-slate-500">
                                                            -
                                                        </span>
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {renderCalendarPagination(
                        annualMembers.length,
                        paginatedAnnualMembers,
                    )}
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
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                        <Input
                            placeholder="Search contributions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-slate-300 bg-white pl-8 text-slate-900 placeholder-slate-500 focus:border-slate-400 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-slate-500 dark:focus:ring-slate-500"
                        />
                    </div>

                    {/* Group Filter */}
                    <div className="flex items-center gap-2">
                        <label className="whitespace-nowrap text-sm font-medium text-slate-700 dark:text-slate-300">
                            Group:
                        </label>
                        <Select
                            value={selectedGroup}
                            onValueChange={setSelectedGroup}
                        >
                            <SelectTrigger className="w-[180px] border-slate-300 text-slate-900 dark:border-slate-600 dark:text-slate-200">
                                <SelectValue placeholder="All Groups" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Groups</SelectItem>
                                {getUniqueGroups().map((group) => (
                                    <SelectItem key={group} value={group}>
                                        {group}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {viewMode === 'table' && (
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="flex items-center gap-2">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                'w-[240px] justify-start border-slate-300 text-left font-normal text-slate-900 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700',
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
                                                'w-[240px] justify-start border-slate-300 text-left font-normal text-slate-900 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700',
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
                                    className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                                >
                                    Reset to current year
                                </Button>
                            )}
                        </div>
                    )}
                </div>
                <Tabs
                    value={viewMode}
                    onValueChange={(value) =>
                        setViewMode(value as 'table' | 'calendar')
                    }
                >
                    <TabsList className="border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                        <TabsTrigger
                            value="table"
                            className="text-slate-700 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:text-slate-300 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-slate-100"
                        >
                            <TableIcon className="mr-2 h-4 w-4" />
                            Table
                        </TabsTrigger>
                        <TabsTrigger
                            value="calendar"
                            className="text-slate-700 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:text-slate-300 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-slate-100"
                        >
                            <Calendar className="mr-2 h-4 w-4" />
                            Calendar
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900/50">
                {viewMode === 'table' ? (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/50">
                                    <TableHead
                                        className="cursor-pointer font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                                        onClick={() => handleSort('created_at')}
                                    >
                                        Created At{' '}
                                        {sortField === 'created_at' &&
                                            (sortDirection === 'asc'
                                                ? '↑'
                                                : '↓')}
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                                        onClick={() =>
                                            handleSort('payment_date')
                                        }
                                    >
                                        Payment Date{' '}
                                        {sortField === 'payment_date' &&
                                            (sortDirection === 'asc'
                                                ? '↑'
                                                : '↓')}
                                    </TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">
                                        Member
                                    </TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">
                                        Group
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                                        onClick={() => handleSort('amount')}
                                    >
                                        Amount{' '}
                                        {sortField === 'amount' &&
                                            (sortDirection === 'asc'
                                                ? '↑'
                                                : '↓')}
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                                        onClick={() =>
                                            handleSort('payment_method')
                                        }
                                    >
                                        Payment Method{' '}
                                        {sortField === 'payment_method' &&
                                            (sortDirection === 'asc'
                                                ? '↑'
                                                : '↓')}
                                    </TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">
                                        Reference Number
                                    </TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedContributions.map((contribution) => {
                                    try {
                                        const paymentDate = new Date(
                                            contribution.payment_date,
                                        );
                                        const createdDate = new Date(
                                            contribution.created_at || '',
                                        );
                                        const isValidPaymentDate = !isNaN(
                                            paymentDate.getTime(),
                                        );
                                        const isValidCreatedDate = !isNaN(
                                            createdDate.getTime(),
                                        );

                                        return (
                                            <TableRow
                                                key={contribution.id}
                                                className="border-slate-200 transition-colors dark:border-slate-700 dark:bg-slate-900/30 hover:dark:bg-slate-800/50"
                                            >
                                                <TableCell className="text-slate-700 dark:text-slate-300">
                                                    {isValidCreatedDate
                                                        ? format(
                                                              createdDate,
                                                              'MMM d, yyyy HH:mm',
                                                          )
                                                        : 'Invalid Date'}
                                                </TableCell>
                                                <TableCell className="text-slate-700 dark:text-slate-300">
                                                    {isValidPaymentDate
                                                        ? format(
                                                              paymentDate,
                                                              'MMM d, yyyy',
                                                          )
                                                        : 'Invalid Date'}
                                                </TableCell>
                                                <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                                                    {getMemberName(
                                                        contribution.member_id,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-slate-700 dark:text-slate-300">
                                                    {getMemberGroup(
                                                        contribution.member_id,
                                                    ) || '-'}
                                                </TableCell>
                                                <TableCell className="text-slate-700 dark:text-slate-300">
                                                    <span className="font-semibold text-blue-600 dark:text-blue-300">
                                                        {appCurrency.symbol}
                                                        {Number(
                                                            contribution.amount ||
                                                                0,
                                                        ).toLocaleString(
                                                            'en-US',
                                                            {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2,
                                                            },
                                                        )}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="capitalize text-slate-700 dark:text-slate-300">
                                                    {(
                                                        contribution.payment_method ||
                                                        ''
                                                    ).replace('_', ' ')}
                                                </TableCell>
                                                <TableCell className="text-slate-700 dark:text-slate-300">
                                                    {contribution.reference_number ||
                                                        '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        {canEdit && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        contribution,
                                                                    )
                                                                }
                                                                className="text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
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
                                                                        contribution.member_id,
                                                                        contribution.id,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    } catch (error) {
                                        console.error(
                                            'Error rendering contribution row:',
                                            error,
                                            contribution,
                                        );
                                        return null;
                                    }
                                })}
                            </TableBody>
                        </Table>
                        {renderPagination()}
                    </>
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
