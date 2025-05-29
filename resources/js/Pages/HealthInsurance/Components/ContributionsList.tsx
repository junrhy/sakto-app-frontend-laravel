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
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Member {
    id: string;
    name: string;
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

    const handleSort = (field: keyof Contribution) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedContributions = [...contributions].sort((a, b) => {
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

    const getMemberName = (memberId: string) => {
        const member = members.find(m => m.id === memberId);
        return member ? member.name : 'Unknown Member';
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead 
                            className="cursor-pointer"
                            onClick={() => handleSort('payment_date')}
                        >
                            Payment Date {sortField === 'payment_date' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead 
                            className="cursor-pointer"
                            onClick={() => handleSort('amount')}
                        >
                            Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead 
                            className="cursor-pointer"
                            onClick={() => handleSort('payment_method')}
                        >
                            Payment Method {sortField === 'payment_method' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead>Reference Number</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedContributions.map((contribution) => (
                        <TableRow key={contribution.id}>
                            <TableCell>
                                {format(new Date(contribution.payment_date), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="font-medium">
                                {getMemberName(contribution.member_id)}
                            </TableCell>
                            <TableCell>
                                {appCurrency.symbol}{Number(contribution.amount).toFixed(2)}
                            </TableCell>
                            <TableCell className="capitalize">
                                {contribution.payment_method.replace('_', ' ')}
                            </TableCell>
                            <TableCell>
                                {contribution.reference_number}
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
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