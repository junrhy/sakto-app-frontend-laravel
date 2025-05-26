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
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

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

    const handleSort = (field: keyof Member) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
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
                    {sortedMembers.map((member) => (
                        <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.name}</TableCell>
                            <TableCell>
                                {format(new Date(member.membership_start_date), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell>
                                {appCurrency.symbol}{member.contribution_amount.toFixed(2)}
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
                                        onClick={() => onMemberSelect(member)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-700"
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
} 