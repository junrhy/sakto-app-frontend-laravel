import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Edit, Eye, Trash2 } from 'lucide-react';

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
    appCurrency: {
        code: string;
        symbol: string;
    };
}

export default function MembersList({ members, onMemberSelect, appCurrency }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [groupFilter, setGroupFilter] = useState('all');

    const filteredMembers = members.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.contact_number.includes(searchTerm) ||
            member.group?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
        const matchesGroup = groupFilter === 'all' || member.group === groupFilter;
        
        return matchesSearch && matchesStatus && matchesGroup;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'inactive':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const getBalanceColor = (balance: number) => {
        if (balance >= 0) {
            return 'text-green-600 dark:text-green-400';
        }
        return 'text-red-600 dark:text-red-400';
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

    const groups = [...new Set(members.map(member => member.group).filter(Boolean))];

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col gap-4">
                <div className="flex-1">
                    <Input
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full"
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={groupFilter} onValueChange={setGroupFilter}>
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue placeholder="Filter by group" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Groups</SelectItem>
                            {groups.map(group => (
                                <SelectItem key={group} value={group}>{group}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold">{members.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
                            {members.filter(m => m.status === 'active').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Contributions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(members.reduce((sum, m) => sum + m.total_contribution, 0))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Claims</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {formatCurrency(members.reduce((sum, m) => sum + m.total_claims_amount, 0))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Members Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Members ({filteredMembers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="border-b dark:border-gray-700">
                                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-sm">Name</th>
                                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-sm">Contact</th>
                                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-sm">Group</th>
                                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-sm">Status</th>
                                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-sm">Contributions</th>
                                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-sm">Claims</th>
                                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-sm">Balance</th>
                                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMembers.map((member) => (
                                    <tr key={member.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="py-3 px-2 sm:px-4">
                                            <div>
                                                <div className="font-medium text-sm">{member.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatDate(member.date_of_birth)} • {member.gender}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-2 sm:px-4">
                                            <div className="text-xs sm:text-sm">{member.contact_number}</div>
                                        </td>
                                        <td className="py-3 px-2 sm:px-4">
                                            <div className="text-xs sm:text-sm">{member.group || '-'}</div>
                                        </td>
                                        <td className="py-3 px-2 sm:px-4">
                                            <Badge className={getStatusColor(member.status)}>
                                                <span className="text-xs">{member.status}</span>
                                            </Badge>
                                        </td>
                                        <td className="py-3 px-2 sm:px-4">
                                            <div className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">
                                                {formatCurrency(member.total_contribution)}
                                            </div>
                                        </td>
                                        <td className="py-3 px-2 sm:px-4">
                                            <div className="text-xs sm:text-sm font-medium text-purple-600 dark:text-purple-400">
                                                {formatCurrency(member.total_claims_amount)}
                                            </div>
                                        </td>
                                        <td className="py-3 px-2 sm:px-4">
                                            <div className={`text-xs sm:text-sm font-medium ${getBalanceColor(member.net_balance)}`}>
                                                {formatCurrency(member.net_balance)}
                                            </div>
                                        </td>
                                        <td className="py-3 px-2 sm:px-4">
                                            <div className="flex gap-1 sm:gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onMemberSelect(member)}
                                                    className="h-8 w-8 sm:h-9 sm:w-auto p-0 sm:px-3"
                                                >
                                                    <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    <span className="hidden sm:inline ml-1">Edit</span>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 