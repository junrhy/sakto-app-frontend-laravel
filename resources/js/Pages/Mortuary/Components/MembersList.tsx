import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Edit,
    Eye,
    List,
    Search,
    Trash2,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Contribution {
    id: string;
    member_id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    reference_number: string;
}

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
    total_contribution: number;
    total_claims_amount: number;
    net_balance: number;
    contributions: Contribution[];
}

interface Props {
    members: Member[];
    onMemberSelect: (member: Member) => void;
    onMemberUpdate: (member: Member) => void;
    onAddMember: () => void;
    canEdit: boolean;
    canDelete: boolean;
    appCurrency: {
        code: string;
        symbol: string;
    };
}

export default function MembersList({
    members,
    onMemberSelect,
    onMemberUpdate,
    onAddMember,
    canEdit,
    canDelete,
    appCurrency,
}: Props) {
    const [sortField, setSortField] = useState<keyof Member>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'group'>('list');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedGroup, setSelectedGroup] = useState<string>('all');
    const [groupCurrentPage, setGroupCurrentPage] = useState(1);
    const [groupItemsPerPage, setGroupItemsPerPage] = useState(10);

    const handleSort = (field: keyof Member) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleDelete = (memberId: string) => {
        if (
            window.confirm(
                'Are you sure you want to delete this member? This action cannot be undone.',
            )
        ) {
            router.delete(`/mortuary/members/${memberId}`, {
                onSuccess: () => {
                    toast.success('Member deleted successfully');
                    // Add delay before reloading to show toast
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500); // 1.5 seconds delay
                },
                onError: () => {
                    toast.error('Failed to delete member');
                },
            });
        }
    };

    const sortedMembers = [...members].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (sortField === 'net_balance') {
            const aNetBalance = a.total_contribution - a.total_claims_amount;
            const bNetBalance = b.total_contribution - b.total_claims_amount;
            return sortDirection === 'asc'
                ? aNetBalance - bNetBalance
                : bNetBalance - aNetBalance;
        }

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

    const filteredMembers = sortedMembers.filter((member) => {
        const searchLower = searchQuery.toLowerCase();

        return (
            member.name.toLowerCase().includes(searchLower) ||
            member.contribution_frequency.toLowerCase().includes(searchLower) ||
            member.status.toLowerCase().includes(searchLower) ||
            member.contact_number.toLowerCase().includes(searchLower) ||
            member.address.toLowerCase().includes(searchLower)
        );
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentMembers = filteredMembers.slice(startIndex, endIndex);

    // Reset to first page when search query changes
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
        setGroupCurrentPage(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1);
    };

    const handleGroupPageChange = (page: number) => {
        setGroupCurrentPage(page);
    };

    const handleGroupItemsPerPageChange = (newItemsPerPage: number) => {
        setGroupItemsPerPage(newItemsPerPage);
        setGroupCurrentPage(1);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:text-white';
            case 'inactive':
                return 'bg-rose-500 hover:bg-rose-600 text-white dark:bg-rose-600 dark:hover:bg-rose-700 dark:text-white';
            default:
                return 'bg-slate-500 hover:bg-slate-600 text-white dark:bg-slate-600 dark:hover:bg-slate-700 dark:text-white';
        }
    };

    const groupedMembers = filteredMembers.reduce(
        (acc, member) => {
            const group = member.group || 'Ungrouped';
            if (!acc[group]) {
                acc[group] = [];
            }
            acc[group].push(member);
            return acc;
        },
        {} as Record<string, typeof filteredMembers>,
    );

    // Get unique group names for the filter dropdown
    const groupNames = Object.keys(groupedMembers).sort();

    // Filter groups based on selected group
    const filteredGroupedMembers =
        selectedGroup === 'all'
            ? groupedMembers
            : { [selectedGroup]: groupedMembers[selectedGroup] || [] };

    // Group pagination logic
    const getGroupPaginationData = () => {
        if (selectedGroup === 'all') {
            return {
                totalPages: 0,
                startIndex: 0,
                endIndex: 0,
                currentGroupMembers: [],
            };
        }

        const groupMembers = groupedMembers[selectedGroup] || [];
        const totalPages = Math.ceil(groupMembers.length / groupItemsPerPage);
        const startIndex = (groupCurrentPage - 1) * groupItemsPerPage;
        const endIndex = startIndex + groupItemsPerPage;
        const currentGroupMembers = groupMembers.slice(startIndex, endIndex);

        return { totalPages, startIndex, endIndex, currentGroupMembers };
    };

    const {
        totalPages: groupTotalPages,
        startIndex: groupStartIndex,
        endIndex: groupEndIndex,
        currentGroupMembers,
    } = getGroupPaginationData();

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
            <div className="flex items-center justify-between px-2 py-4">
                <div className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300">
                    <span>
                        Showing {startIndex + 1} to{' '}
                        {Math.min(endIndex, filteredMembers.length)} of{' '}
                        {filteredMembers.length} members
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

                <div className="flex items-center space-x-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 border-slate-300 p-0 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 border-slate-300 p-0 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {getPageNumbers().map((page, index) => (
                        <div key={index}>
                            {page === '...' ? (
                                <span className="px-3 py-2 text-slate-500 dark:text-slate-400">
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
                                            : 'border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {page}
                                </Button>
                            )}
                        </div>
                    ))}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 border-slate-300 p-0 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 border-slate-300 p-0 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };

    const renderGroupPagination = () => {
        if (selectedGroup === 'all' || groupTotalPages <= 1) return null;

        const getPageNumbers = () => {
            const pages = [];
            const maxVisiblePages = 5;

            if (groupTotalPages <= maxVisiblePages) {
                for (let i = 1; i <= groupTotalPages; i++) {
                    pages.push(i);
                }
            } else {
                if (groupCurrentPage <= 3) {
                    for (let i = 1; i <= 4; i++) {
                        pages.push(i);
                    }
                    pages.push('...');
                    pages.push(groupTotalPages);
                } else if (groupCurrentPage >= groupTotalPages - 2) {
                    pages.push(1);
                    pages.push('...');
                    for (
                        let i = groupTotalPages - 3;
                        i <= groupTotalPages;
                        i++
                    ) {
                        pages.push(i);
                    }
                } else {
                    pages.push(1);
                    pages.push('...');
                    for (
                        let i = groupCurrentPage - 1;
                        i <= groupCurrentPage + 1;
                        i++
                    ) {
                        pages.push(i);
                    }
                    pages.push('...');
                    pages.push(groupTotalPages);
                }
            }

            return pages;
        };

        const groupMembers = groupedMembers[selectedGroup] || [];

        return (
            <div className="flex items-center justify-between px-2 py-4">
                <div className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300">
                    <span>
                        Showing {groupStartIndex + 1} to{' '}
                        {Math.min(groupEndIndex, groupMembers.length)} of{' '}
                        {groupMembers.length} members in {selectedGroup}
                    </span>
                    <span className="text-slate-400">|</span>
                    <span>Items per page:</span>
                    <select
                        value={groupItemsPerPage}
                        onChange={(e) =>
                            handleGroupItemsPerPageChange(
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

                <div className="flex items-center space-x-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGroupPageChange(1)}
                        disabled={groupCurrentPage === 1}
                        className="h-8 w-8 border-slate-300 p-0 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            handleGroupPageChange(groupCurrentPage - 1)
                        }
                        disabled={groupCurrentPage === 1}
                        className="h-8 w-8 border-slate-300 p-0 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {getPageNumbers().map((page, index) => (
                        <div key={index}>
                            {page === '...' ? (
                                <span className="px-3 py-2 text-slate-500 dark:text-slate-400">
                                    ...
                                </span>
                            ) : (
                                <Button
                                    variant={
                                        groupCurrentPage === page
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() =>
                                        handleGroupPageChange(page as number)
                                    }
                                    className={`h-8 w-8 p-0 ${
                                        groupCurrentPage === page
                                            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                                            : 'border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    {page}
                                </Button>
                            )}
                        </div>
                    ))}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            handleGroupPageChange(groupCurrentPage + 1)
                        }
                        disabled={groupCurrentPage === groupTotalPages}
                        className="h-8 w-8 border-slate-300 p-0 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGroupPageChange(groupTotalPages)}
                        disabled={groupCurrentPage === groupTotalPages}
                        className="h-8 w-8 border-slate-300 p-0 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    };

    const renderListView = () => (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900/50">
            <Table>
                <TableHeader>
                    <TableRow className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/50 hover:dark:bg-slate-800/70">
                        <TableHead
                            className="cursor-pointer font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                            onClick={() => handleSort('name')}
                        >
                            Name{' '}
                            {sortField === 'name' &&
                                (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                            className="cursor-pointer font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                            onClick={() => handleSort('membership_start_date')}
                        >
                            Start Date{' '}
                            {sortField === 'membership_start_date' &&
                                (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                            className="cursor-pointer font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                            onClick={() => handleSort('contribution_amount')}
                        >
                            Premium{' '}
                            {sortField === 'contribution_amount' &&
                                (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                            className="cursor-pointer font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                            onClick={() => handleSort('contribution_frequency')}
                        >
                            Frequency{' '}
                            {sortField === 'contribution_frequency' &&
                                (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                            className="cursor-pointer font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                            onClick={() => handleSort('total_contribution')}
                        >
                            Total Contribution{' '}
                            {sortField === 'total_contribution' &&
                                (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                            className="cursor-pointer font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                            onClick={() => handleSort('total_claims_amount')}
                        >
                            Total Claims{' '}
                            {sortField === 'total_claims_amount' &&
                                (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                            className="cursor-pointer font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                            onClick={() => handleSort('net_balance')}
                        >
                            Net Balance{' '}
                            {sortField === 'net_balance' &&
                                (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead
                            className="cursor-pointer font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
                            onClick={() => handleSort('status')}
                        >
                            Status{' '}
                            {sortField === 'status' &&
                                (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700 dark:text-slate-200">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentMembers.map((member) => (
                        <TableRow
                            key={member.id}
                            className="border-slate-200 transition-colors dark:border-slate-700 dark:bg-slate-900/30 hover:dark:bg-slate-800/50"
                        >
                            <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                                {member.name}
                            </TableCell>
                            <TableCell className="text-slate-700 dark:text-slate-300">
                                {format(
                                    new Date(member.membership_start_date),
                                    'MMM d, yyyy',
                                )}
                            </TableCell>
                            <TableCell className="font-mono text-slate-700 dark:text-slate-300">
                                <span className="font-semibold text-blue-600 dark:text-blue-300">
                                    {appCurrency.symbol}
                                    {Number(
                                        member.contribution_amount,
                                    ).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                            </TableCell>
                            <TableCell className="capitalize text-slate-700 dark:text-slate-300">
                                {member.contribution_frequency}
                            </TableCell>
                            <TableCell className="font-mono text-slate-700 dark:text-slate-300">
                                <span className="font-semibold text-blue-600 dark:text-blue-300">
                                    {appCurrency.symbol}
                                    {Number(
                                        member.total_contribution,
                                    ).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                            </TableCell>
                            <TableCell className="font-mono text-slate-700 dark:text-slate-300">
                                <span className="font-semibold text-blue-600 dark:text-blue-300">
                                    {appCurrency.symbol}
                                    {Number(
                                        member.total_claims_amount,
                                    ).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span
                                    className={`font-mono font-semibold ${Number(member.total_contribution) - Number(member.total_claims_amount) < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                                >
                                    {appCurrency.symbol}
                                    {(
                                        Number(member.total_contribution) -
                                        Number(member.total_claims_amount)
                                    ).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </span>
                            </TableCell>
                            <TableCell>
                                <Badge
                                    className={getStatusColor(member.status)}
                                >
                                    {member.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            window.open(
                                                `/mortuary/members/${member.id}/public`,
                                                '_blank',
                                            )
                                        }
                                        className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    {canEdit && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                onMemberSelect(member)
                                            }
                                            className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
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
                                                handleDelete(member.id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {renderPagination()}
        </div>
    );

    const renderGroupView = () => (
        <div className="space-y-6">
            {/* Group Filter */}
            <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Filter by Group:
                </label>
                <select
                    value={selectedGroup}
                    onChange={(e) => {
                        setSelectedGroup(e.target.value);
                        setGroupCurrentPage(1); // Reset to first page when changing groups
                    }}
                    className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-400 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-500"
                >
                    <option value="all">
                        All Groups ({filteredMembers.length} members)
                    </option>
                    {groupNames.map((groupName) => (
                        <option key={groupName} value={groupName}>
                            {groupName} (
                            {groupedMembers[groupName]?.length || 0} members)
                        </option>
                    ))}
                </select>
            </div>

            {Object.entries(filteredGroupedMembers).map(([group, members]) => (
                <div key={group} className="space-y-3">
                    <h3 className="border-b border-slate-200 pb-2 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:text-slate-100">
                        {group}
                    </h3>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900/50">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/50">
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">
                                        Name
                                    </TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">
                                        Start Date
                                    </TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">
                                        Premium
                                    </TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">
                                        Frequency
                                    </TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">
                                        Total Contribution
                                    </TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">
                                        Total Claims
                                    </TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">
                                        Net Balance
                                    </TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">
                                        Status
                                    </TableHead>
                                    <TableHead className="font-semibold text-slate-700 dark:text-slate-200">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(selectedGroup === 'all'
                                    ? members
                                    : currentGroupMembers
                                ).map((member) => (
                                    <TableRow
                                        key={member.id}
                                        className="border-slate-200 transition-colors dark:border-slate-700 dark:bg-slate-900/30 hover:dark:bg-slate-800/50"
                                    >
                                        <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                                            {member.name}
                                        </TableCell>
                                        <TableCell className="text-slate-700 dark:text-slate-300">
                                            {format(
                                                new Date(
                                                    member.membership_start_date,
                                                ),
                                                'MMM d, yyyy',
                                            )}
                                        </TableCell>
                                        <TableCell className="font-mono text-slate-700 dark:text-slate-300">
                                            <span className="font-semibold text-blue-600 dark:text-blue-300">
                                                {appCurrency.symbol}
                                                {Number(
                                                    member.contribution_amount,
                                                ).toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </span>
                                        </TableCell>
                                        <TableCell className="capitalize text-slate-700 dark:text-slate-300">
                                            {member.contribution_frequency}
                                        </TableCell>
                                        <TableCell className="font-mono text-slate-700 dark:text-slate-300">
                                            <span className="font-semibold text-blue-600 dark:text-blue-300">
                                                {appCurrency.symbol}
                                                {Number(
                                                    member.total_contribution,
                                                ).toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-mono text-slate-700 dark:text-slate-300">
                                            <span className="font-semibold text-blue-600 dark:text-blue-300">
                                                {appCurrency.symbol}
                                                {Number(
                                                    member.total_claims_amount,
                                                ).toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`font-mono font-semibold ${Number(member.total_contribution) - Number(member.total_claims_amount) < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                                            >
                                                {appCurrency.symbol}
                                                {(
                                                    Number(
                                                        member.total_contribution,
                                                    ) -
                                                    Number(
                                                        member.total_claims_amount,
                                                    )
                                                ).toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={getStatusColor(
                                                    member.status,
                                                )}
                                            >
                                                {member.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        window.open(
                                                            `/mortuary/members/${member.id}/public`,
                                                            '_blank',
                                                        )
                                                    }
                                                    className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {canEdit && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            onMemberSelect(
                                                                member,
                                                            )
                                                        }
                                                        className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
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
                                                                member.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {renderGroupPagination()}
                    </div>
                </div>
            ))}

            {/* Show message when no groups match the filter */}
            {Object.keys(filteredGroupedMembers).length === 0 && (
                <div className="py-8 text-center">
                    <p className="text-slate-500 dark:text-slate-400">
                        No members found in the selected group.
                    </p>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <Input
                        placeholder="Search members..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="border-slate-300 bg-white pl-8 text-slate-900 placeholder-slate-500 focus:border-slate-400 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-400 dark:focus:border-slate-500 dark:focus:ring-slate-500"
                    />
                </div>
                <Tabs
                    value={viewMode}
                    onValueChange={(value) =>
                        setViewMode(value as 'list' | 'group')
                    }
                >
                    <TabsList className="border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                        <TabsTrigger
                            value="list"
                            className="text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:text-slate-300 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-slate-100"
                        >
                            <List className="mr-2 h-4 w-4" />
                            List View
                        </TabsTrigger>
                        <TabsTrigger
                            value="group"
                            className="text-slate-700 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm dark:text-slate-300 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-slate-100"
                        >
                            <Users className="mr-2 h-4 w-4" />
                            Group View
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            {viewMode === 'list' ? renderListView() : renderGroupView()}
        </div>
    );
}
