import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';

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
    group: string;
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
    const [searchTerm, setSearchTerm] = useState('');
    const [memberFilter, setMemberFilter] = useState('all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');

    const filteredContributions = contributions.filter(contribution => {
        const member = members.find(m => m.id === contribution.member_id);
        const matchesSearch = member?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contribution.reference_number?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMember = memberFilter === 'all' || contribution.member_id === memberFilter;
        const matchesPaymentMethod = paymentMethodFilter === 'all' || contribution.payment_method === paymentMethodFilter;
        
        return matchesSearch && matchesMember && matchesPaymentMethod;
    });

    const formatCurrency = (amount: number) => {
        // Ensure amount is a number and handle any string conversion
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numericAmount)) return `${appCurrency.symbol}0`;
        return `${appCurrency.symbol}${numericAmount.toLocaleString()}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const paymentMethods = [...new Set(contributions.map(c => c.payment_method))];

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <Input
                        placeholder="Search contributions..."
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
                <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Filter by payment method" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        {paymentMethods.map(method => (
                            <SelectItem key={method} value={method}>{method}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Contributions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(contributions.reduce((sum, c) => sum + c.amount, 0))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(contributions
                                .filter(c => {
                                    const date = new Date(c.payment_date);
                                    const now = new Date();
                                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                                })
                                .reduce((sum, c) => sum + c.amount, 0)
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Count</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {contributions.length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Contributions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Contributions ({filteredContributions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b dark:border-gray-700">
                                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-sm">Member</th>
                                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-sm">Amount</th>
                                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-sm">Payment Date</th>
                                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-sm">Payment Method</th>
                                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-sm">Reference</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredContributions.map((contribution) => {
                                    const member = members.find(m => m.id === contribution.member_id);
                                    return (
                                        <tr key={contribution.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                            <td className="py-3 px-2 sm:px-4">
                                                <div>
                                                    <div className="font-medium text-sm">{member?.name || 'Unknown Member'}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {member?.group || 'No Group'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 sm:px-4">
                                                <div className="font-medium text-sm text-blue-600 dark:text-blue-400">
                                                    {formatCurrency(contribution.amount)}
                                                </div>
                                            </td>
                                            <td className="py-3 px-2 sm:px-4">
                                                <div className="text-xs sm:text-sm">{formatDate(contribution.payment_date)}</div>
                                            </td>
                                            <td className="py-3 px-2 sm:px-4">
                                                <Badge variant="outline" className="text-xs">
                                                    {contribution.payment_method}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-2 sm:px-4">
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {contribution.reference_number || '-'}
                                                </div>
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