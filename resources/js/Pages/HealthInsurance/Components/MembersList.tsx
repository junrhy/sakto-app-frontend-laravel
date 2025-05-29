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
import { Edit, Trash2, Search, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Input } from '@/Components/ui/input';

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
}

interface Props {
    members: Member[];
    onMemberSelect: (member: Member) => void;
    appCurrency: {
        code: string;
        symbol: string;
    };
}

export default function MembersList({ members, onMemberSelect, appCurrency }: Props) {
    const [sortField, setSortField] = useState<keyof Member>('name');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchQuery, setSearchQuery] = useState('');

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

    return (
        <div className="space-y-4">
            <div className="mb-4">
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>
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
                                Contribution {sortField === 'contribution_amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </TableHead>
                            <TableHead 
                                className="cursor-pointer"
                                onClick={() => handleSort('contribution_frequency')}
                            >
                                Frequency {sortField === 'contribution_frequency' && (sortDirection === 'asc' ? '↑' : '↓')}
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
    );
} 