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
import { Edit, Trash2, Search, Eye, List, Users } from 'lucide-react';
import { format } from 'date-fns';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Input } from '@/Components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/Components/ui/tabs';

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
    members: (Member & {
        contributions: Contribution[];
    })[];
    onMemberSelect: (member: Member & {
        contributions: Contribution[];
    }) => void;
    appCurrency: {
        code: string;
        symbol: string;
    };
}

export default function MembersList({ members, onMemberSelect, appCurrency }: Props) {
    const [sortField, setSortField] = useState<keyof Member>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'group'>('list');

    const handleSort = (field: keyof Member) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleDelete = (memberId: string) => {
        if (window.confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
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
                }
            });
        }
    };

    const sortedMembers = [...members].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (sortField === 'net_balance') {
            const aNetBalance = a.total_contribution - a.total_claims_amount;
            const bNetBalance = b.total_contribution - b.total_claims_amount;
            return sortDirection === 'asc' ? aNetBalance - bNetBalance : bNetBalance - aNetBalance;
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

    const filteredMembers = sortedMembers.filter(member => {
        const searchLower = searchQuery.toLowerCase();
        
        return (
            member.name.toLowerCase().includes(searchLower) ||
            member.contribution_frequency.toLowerCase().includes(searchLower) ||
            member.status.toLowerCase().includes(searchLower) ||
            member.contact_number.toLowerCase().includes(searchLower) ||
            member.address.toLowerCase().includes(searchLower)
        );
    });

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

    const groupedMembers = filteredMembers.reduce((acc, member) => {
        const group = member.group || 'Ungrouped';
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(member);
        return acc;
    }, {} as Record<string, typeof filteredMembers>);

    const renderListView = () => (
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900/50">
            <Table>
                <TableHeader>
                    <TableRow className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/50 hover:dark:bg-slate-800/70">
                        <TableHead 
                            className="cursor-pointer text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold"
                            onClick={() => handleSort('name')}
                        >
                            Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead 
                            className="cursor-pointer text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold"
                            onClick={() => handleSort('membership_start_date')}
                        >
                            Start Date {sortField === 'membership_start_date' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead 
                            className="cursor-pointer text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold"
                            onClick={() => handleSort('contribution_amount')}
                        >
                            Premium {sortField === 'contribution_amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead 
                            className="cursor-pointer text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold"
                            onClick={() => handleSort('contribution_frequency')}
                        >
                            Frequency {sortField === 'contribution_frequency' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead 
                            className="cursor-pointer text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold"
                            onClick={() => handleSort('total_contribution')}
                        >
                            Total Contribution {sortField === 'total_contribution' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead 
                            className="cursor-pointer text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold"
                            onClick={() => handleSort('total_claims_amount')}
                        >
                            Total Claims {sortField === 'total_claims_amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead 
                            className="cursor-pointer text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold"
                            onClick={() => handleSort('net_balance')}
                        >
                            Net Balance {sortField === 'net_balance' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead 
                            className="cursor-pointer text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-semibold"
                            onClick={() => handleSort('status')}
                        >
                            Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead className="text-slate-700 dark:text-slate-200 font-semibold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredMembers.map((member) => (
                        <TableRow key={member.id} className="border-slate-200 dark:border-slate-700 dark:bg-slate-900/30 hover:dark:bg-slate-800/50 transition-colors">
                            <TableCell className="font-medium text-slate-900 dark:text-slate-100">{member.name}</TableCell>
                            <TableCell className="text-slate-700 dark:text-slate-300">
                                {format(new Date(member.membership_start_date), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="text-slate-700 dark:text-slate-300 font-mono">
                                <span className="text-blue-600 dark:text-blue-300 font-semibold">
                                    {appCurrency.symbol}{Number(member.contribution_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </TableCell>
                            <TableCell className="capitalize text-slate-700 dark:text-slate-300">
                                {member.contribution_frequency}
                            </TableCell>
                            <TableCell className="text-slate-700 dark:text-slate-300 font-mono">
                                <span className="text-blue-600 dark:text-blue-300 font-semibold">
                                    {appCurrency.symbol}{Number(member.total_contribution).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </TableCell>
                            <TableCell className="text-slate-700 dark:text-slate-300 font-mono">
                                <span className="text-blue-600 dark:text-blue-300 font-semibold">
                                    {appCurrency.symbol}{Number(member.total_claims_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </TableCell>
                            <TableCell>
                                <span className={`font-mono font-semibold ${Number(member.total_contribution) - Number(member.total_claims_amount) < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                    {appCurrency.symbol}{(Number(member.total_contribution) - Number(member.total_claims_amount)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </TableCell>
                            <TableCell>
                                <Badge className={getStatusColor(member.status)}>
                                    {member.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => window.open(`/mortuary/members/${member.id}/public`, '_blank')}
                                        className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onMemberSelect(member)}
                                        className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-orange-300 dark:hover:text-orange-200 dark:hover:bg-orange-900/20 transition-all duration-200"
                                        onClick={() => handleDelete(member.id)}
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
    );

    const renderGroupView = () => (
        <div className="space-y-6">
            {Object.entries(groupedMembers).map(([group, members]) => (
                <div key={group} className="space-y-3">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">{group}</h3>
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900/50">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-slate-200 dark:border-slate-700 dark:bg-slate-800/50">
                                    <TableHead className="text-slate-700 dark:text-slate-200 font-semibold">Name</TableHead>
                                    <TableHead className="text-slate-700 dark:text-slate-200 font-semibold">Start Date</TableHead>
                                    <TableHead className="text-slate-700 dark:text-slate-200 font-semibold">Premium</TableHead>
                                    <TableHead className="text-slate-700 dark:text-slate-200 font-semibold">Frequency</TableHead>
                                    <TableHead className="text-slate-700 dark:text-slate-200 font-semibold">Total Contribution</TableHead>
                                    <TableHead className="text-slate-700 dark:text-slate-200 font-semibold">Total Claims</TableHead>
                                    <TableHead className="text-slate-700 dark:text-slate-200 font-semibold">Net Balance</TableHead>
                                    <TableHead className="text-slate-700 dark:text-slate-200 font-semibold">Status</TableHead>
                                    <TableHead className="text-slate-700 dark:text-slate-200 font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map((member) => (
                                    <TableRow key={member.id} className="border-slate-200 dark:border-slate-700 dark:bg-slate-900/30 hover:dark:bg-slate-800/50 transition-colors">
                                        <TableCell className="font-medium text-slate-900 dark:text-slate-100">{member.name}</TableCell>
                                        <TableCell className="text-slate-700 dark:text-slate-300">
                                            {format(new Date(member.membership_start_date), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell className="text-slate-700 dark:text-slate-300 font-mono">
                                            <span className="text-blue-600 dark:text-blue-300 font-semibold">
                                                {appCurrency.symbol}{Number(member.contribution_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </TableCell>
                                        <TableCell className="capitalize text-slate-700 dark:text-slate-300">
                                            {member.contribution_frequency}
                                        </TableCell>
                                        <TableCell className="text-slate-700 dark:text-slate-300 font-mono">
                                            <span className="text-blue-600 dark:text-blue-300 font-semibold">
                                                {appCurrency.symbol}{Number(member.total_contribution).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-slate-700 dark:text-slate-300 font-mono">
                                            <span className="text-blue-600 dark:text-blue-300 font-semibold">
                                                {appCurrency.symbol}{Number(member.total_claims_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`font-mono font-semibold ${Number(member.total_contribution) - Number(member.total_claims_amount) < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                {appCurrency.symbol}{(Number(member.total_contribution) - Number(member.total_claims_amount)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(member.status)}>
                                                {member.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => window.open(`/mortuary/members/${member.id}/public`, '_blank')}
                                                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onMemberSelect(member)}
                                                    className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-orange-300 dark:hover:text-orange-200 dark:hover:bg-orange-900/20 transition-all duration-200"
                                                    onClick={() => handleDelete(member.id)}
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
                </div>
            ))}
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <Input
                        placeholder="Search members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:border-slate-400 dark:focus:border-slate-500 focus:ring-slate-400 dark:focus:ring-slate-500"
                    />
                </div>
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'group')}>
                    <TabsList className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <TabsTrigger 
                            value="list"
                            className="text-slate-700 dark:text-slate-300 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm"
                        >
                            <List className="h-4 w-4 mr-2" />
                            List View
                        </TabsTrigger>
                        <TabsTrigger 
                            value="group"
                            className="text-slate-700 dark:text-slate-300 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-sm"
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Group View
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
            {viewMode === 'list' ? renderListView() : renderGroupView()}
        </div>
    );
} 