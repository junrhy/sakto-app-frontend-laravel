import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';

interface Claim {
    id: string;
    member_id: string;
    claim_type: string;
    amount: number;
    date_of_death: string;
    deceased_name: string;
    relationship_to_member: string;
    cause_of_death: string;
    status: string;
}

interface Member {
    id: string;
    name: string;
    group: string;
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
    const [searchTerm, setSearchTerm] = useState('');
    const [memberFilter, setMemberFilter] = useState('all');
    const [claimTypeFilter, setClaimTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredClaims = claims.filter(claim => {
        const member = members.find(m => m.id === claim.member_id);
        const matchesSearch = member?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.deceased_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.relationship_to_member.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMember = memberFilter === 'all' || claim.member_id === memberFilter;
        const matchesClaimType = claimTypeFilter === 'all' || claim.claim_type === claimTypeFilter;
        const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
        
        return matchesSearch && matchesMember && matchesClaimType && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'approved':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'rejected':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const getClaimTypeColor = (claimType: string) => {
        switch (claimType) {
            case 'funeral_service':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'burial_plot':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            case 'transportation':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
            case 'memorial_service':
                return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const formatCurrency = (amount: number) => {
        // Ensure amount is a number and handle any string conversion
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numericAmount)) return `${appCurrency.symbol}0`;
        return `${appCurrency.symbol}${numericAmount.toLocaleString()}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const claimTypes = [...new Set(claims.map(c => c.claim_type))];

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <Input
                        placeholder="Search claims..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                </div>
                <Select value={memberFilter} onValueChange={setMemberFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by member" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Members</SelectItem>
                        {members.map(member => (
                            <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={claimTypeFilter} onValueChange={setClaimTypeFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by claim type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {claimTypes.map(type => (
                            <SelectItem key={type} value={type}>{type.replace('_', ' ')}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Claims</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {formatCurrency(claims.reduce((sum, c) => sum + c.amount, 0))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Claims</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {claims.filter(c => c.status === 'pending').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved Claims</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(claims
                                .filter(c => c.status === 'approved')
                                .reduce((sum, c) => sum + c.amount, 0)
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Claim</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(claims.length > 0 ? 
                                claims.reduce((sum, c) => sum + c.amount, 0) / claims.length : 0
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Claims Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Claims ({filteredClaims.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b dark:border-gray-700">
                                    <th className="text-left py-3 px-4 font-medium">Member</th>
                                    <th className="text-left py-3 px-4 font-medium">Deceased</th>
                                    <th className="text-left py-3 px-4 font-medium">Claim Type</th>
                                    <th className="text-left py-3 px-4 font-medium">Amount</th>
                                    <th className="text-left py-3 px-4 font-medium">Date of Death</th>
                                    <th className="text-left py-3 px-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClaims.map((claim) => {
                                    const member = members.find(m => m.id === claim.member_id);
                                    return (
                                        <tr key={claim.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="py-3 px-4">
                                                <div>
                                                    <div className="font-medium">{member?.name || 'Unknown Member'}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {member?.group || 'No Group'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div>
                                                    <div className="font-medium">{claim.deceased_name}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {claim.relationship_to_member}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge className={getClaimTypeColor(claim.claim_type)}>
                                                    {claim.claim_type.replace('_', ' ')}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-medium text-purple-600 dark:text-purple-400">
                                                    {formatCurrency(claim.amount)}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-sm">{formatDate(claim.date_of_death)}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge className={getStatusColor(claim.status)}>
                                                    {claim.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 