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
            router.delete(`/health-insurance/members/${memberId}`, {
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
                return 'bg-green-500';
            case 'inactive':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
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
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead 
                            className="cursor-pointer"
                            onClick={() => handleSort('name')}
                        >
                            Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead 
                            className="cursor-pointer"
                            onClick={() => handleSort('membership_start_date')}
                        >
                            Start Date {sortField === 'membership_start_date' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead 
                            className="cursor-pointer"
                            onClick={() => handleSort('contribution_amount')}
                        >
                            Premium {sortField === 'contribution_amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead 
                            className="cursor-pointer"
                            onClick={() => handleSort('contribution_frequency')}
                        >
                            Frequency {sortField === 'contribution_frequency' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead 
                            className="cursor-pointer"
                            onClick={() => handleSort('total_contribution')}
                        >
                            Total Contribution {sortField === 'total_contribution' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead 
                            className="cursor-pointer"
                            onClick={() => handleSort('total_claims_amount')}
                        >
                            Total Claims {sortField === 'total_claims_amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead 
                            className="cursor-pointer"
                            onClick={() => handleSort('net_balance')}
                        >
                            Net Balance {sortField === 'net_balance' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead 
                            className="cursor-pointer"
                            onClick={() => handleSort('status')}
                        >
                            Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredMembers.map((member) => (
                        <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>
                                {format(new Date(member.membership_start_date), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>
                                {appCurrency.symbol}{Number(member.contribution_amount).toFixed(2)}
                            </TableCell>
                            <TableCell className="capitalize">
                                {member.contribution_frequency}
                            </TableCell>
                            <TableCell>
                                {appCurrency.symbol}{Number(member.total_contribution).toFixed(2)}
                            </TableCell>
                            <TableCell>
                                {appCurrency.symbol}{Number(member.total_claims_amount).toFixed(2)}
                            </TableCell>
                            <TableCell>
                                <span className={Number(member.total_contribution) - Number(member.total_claims_amount) < 0 ? 'text-red-500' : ''}>
                                    {appCurrency.symbol}{(Number(member.total_contribution) - Number(member.total_claims_amount)).toFixed(2)}
                                </span>
                            </TableCell>
                            <TableCell>
                                <Badge className={getStatusColor(member.status)}>
                                    {member.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => window.open(`/health-insurance/members/${member.id}/public`, '_blank')}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onMemberSelect(member)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700"
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
                <div key={group} className="space-y-2">
                    <h3 className="text-lg font-semibold">{group}</h3>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Start Date</TableHead>
                                    <TableHead>Premium</TableHead>
                                    <TableHead>Frequency</TableHead>
                                    <TableHead>Total Contribution</TableHead>
                                    <TableHead>Total Claims</TableHead>
                                    <TableHead>Net Balance</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map((member) => (
                                    <TableRow key={member.id}>
                                        <TableCell className="font-medium">{member.name}</TableCell>
                                        <TableCell>
                                            {format(new Date(member.membership_start_date), 'MMM d, yyyy')}
                                        </TableCell>
                                        <TableCell>
                                            {appCurrency.symbol}{Number(member.contribution_amount).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="capitalize">
                                            {member.contribution_frequency}
                                        </TableCell>
                                        <TableCell>
                                            {appCurrency.symbol}{Number(member.total_contribution).toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            {appCurrency.symbol}{Number(member.total_claims_amount).toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <span className={Number(member.total_contribution) - Number(member.total_claims_amount) < 0 ? 'text-red-500' : ''}>
                                                {appCurrency.symbol}{(Number(member.total_contribution) - Number(member.total_claims_amount)).toFixed(2)}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(member.status)}>
                                                {member.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => window.open(`/health-insurance/members/${member.id}/public`, '_blank')}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onMemberSelect(member)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700"
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
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'group')}>
                    <TabsList>
                        <TabsTrigger value="list">
                            <List className="h-4 w-4 mr-2" />
                            List View
                        </TabsTrigger>
                        <TabsTrigger value="group">
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