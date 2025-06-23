import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';

interface Member {
    id: string;
    name: string;
    group: string;
    contribution_amount: number;
    contribution_frequency: string;
    membership_start_date: string;
    total_contribution: number;
}

interface Contribution {
    id: string;
    member_id: string;
    amount: number;
    payment_date: string;
}

interface Props {
    members: Member[];
    contributions: Contribution[];
    appCurrency: {
        code: string;
        symbol: string;
    };
}

export default function MissingContributionsList({ members, contributions, appCurrency }: Props) {
    const formatCurrency = (amount: number) => {
        // Ensure amount is a number and handle any string conversion
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numericAmount)) return `${appCurrency.symbol}0`;
        return `${appCurrency.symbol}${numericAmount.toLocaleString()}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getExpectedContributions = (member: Member) => {
        const startDate = new Date(member.membership_start_date);
        const now = new Date();
        const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
        
        switch (member.contribution_frequency) {
            case 'monthly':
                return Math.max(0, monthsDiff);
            case 'quarterly':
                return Math.max(0, Math.floor(monthsDiff / 3));
            case 'annually':
                return Math.max(0, Math.floor(monthsDiff / 12));
            default:
                return 0;
        }
    };

    const getMissingContributions = (member: Member) => {
        const expected = getExpectedContributions(member);
        const actual = contributions.filter(c => c.member_id === member.id).length;
        return Math.max(0, expected - actual);
    };

    const getMissingAmount = (member: Member) => {
        return getMissingContributions(member) * member.contribution_amount;
    };

    const membersWithMissingContributions = members
        .filter(member => getMissingContributions(member) > 0)
        .sort((a, b) => getMissingAmount(b) - getMissingAmount(a));

    const totalMissingAmount = membersWithMissingContributions.reduce((sum, member) => sum + getMissingAmount(member), 0);

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Members with Missing Contributions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {membersWithMissingContributions.length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Missing Amount</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {formatCurrency(totalMissingAmount)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Missing per Member</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {formatCurrency(membersWithMissingContributions.length > 0 ? 
                                totalMissingAmount / membersWithMissingContributions.length : 0
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Missing Contributions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Missing Contributions ({membersWithMissingContributions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b dark:border-gray-700">
                                    <th className="text-left py-3 px-4 font-medium">Member</th>
                                    <th className="text-left py-3 px-4 font-medium">Group</th>
                                    <th className="text-left py-3 px-4 font-medium">Contribution Amount</th>
                                    <th className="text-left py-3 px-4 font-medium">Frequency</th>
                                    <th className="text-left py-3 px-4 font-medium">Membership Start</th>
                                    <th className="text-left py-3 px-4 font-medium">Missing Count</th>
                                    <th className="text-left py-3 px-4 font-medium">Missing Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {membersWithMissingContributions.map((member) => (
                                    <tr key={member.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="py-3 px-4">
                                            <div className="font-medium">{member.name}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-sm">{member.group || 'No Group'}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-blue-600 dark:text-blue-400">
                                                {formatCurrency(member.contribution_amount)}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <Badge variant="outline">{member.contribution_frequency}</Badge>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="text-sm">{formatDate(member.membership_start_date)}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-red-600 dark:text-red-400">
                                                {getMissingContributions(member)}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-orange-600 dark:text-orange-400">
                                                {formatCurrency(getMissingAmount(member))}
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