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
import { Edit, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface Member {
    id: string;
    name: string;
}

interface Claim {
    id: string;
    member_id: string;
    claim_type: string;
    amount: number;
    date_of_service: string;
    hospital_name: string;
    diagnosis: string;
    status: string;
    documentation: string[];
}

interface Props {
    claims: Claim[];
    members: Member[];
    appCurrency: {
        code: string;
        symbol: string;
    };
}

export default function ClaimsList({ claims, members, appCurrency }: Props) {
    const [sortField, setSortField] = useState<keyof Claim>('date_of_service');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const handleSort = (field: keyof Claim) => {
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const sortedClaims = [...claims].sort((a, b) => {
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

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved':
                return 'bg-green-500';
            case 'pending':
                return 'bg-yellow-500';
            case 'rejected':
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
                            onClick={() => handleSort('date_of_service')}
                        >
                            Service Date {sortField === 'date_of_service' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead 
                            className="cursor-pointer"
                            onClick={() => handleSort('claim_type')}
                        >
                            Type {sortField === 'claim_type' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead 
                            className="cursor-pointer"
                            onClick={() => handleSort('amount')}
                        >
                            Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                        </TableHead>
                        <TableHead>Hospital</TableHead>
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
                    {sortedClaims.map((claim) => (
                        <TableRow key={claim.id}>
                            <TableCell>
                                {format(new Date(claim.date_of_service), 'MMM d, yyyy')}
                            </TableCell>
                            <TableCell className="font-medium">
                                {getMemberName(claim.member_id)}
                            </TableCell>
                            <TableCell className="capitalize">
                                {claim.claim_type}
                            </TableCell>
                            <TableCell>
                                {appCurrency.symbol}{claim.amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                                {claim.hospital_name}
                            </TableCell>
                            <TableCell>
                                <Badge className={getStatusColor(claim.status)}>
                                    {claim.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
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