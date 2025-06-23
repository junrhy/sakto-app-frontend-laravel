import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';

interface Member {
    id: string;
    name: string;
    group: string;
    contribution_amount: number;
    contribution_frequency: string;
    total_contribution: number;
    status: string;
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

export default function GroupContributionsList({ members, contributions, appCurrency }: Props) {
    const formatCurrency = (amount: number) => {
        // Ensure amount is a number and handle any string conversion
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numericAmount)) return `${appCurrency.symbol}0`;
        return `${appCurrency.symbol}${numericAmount.toLocaleString()}`;
    };

    const getGroupStats = () => {
        const groups = [...new Set(members.map(m => m.group).filter(Boolean))];
        
        return groups.map(group => {
            const groupMembers = members.filter(m => m.group === group);
            const groupContributions = contributions.filter(c => 
                groupMembers.some(m => m.id === c.member_id)
            );
            
            const totalMembers = groupMembers.length;
            const activeMembers = groupMembers.filter(m => m.status === 'active').length;
            const totalContributions = groupContributions.reduce((sum, c) => sum + c.amount, 0);
            const averageContribution = groupContributions.length > 0 ? 
                totalContributions / groupContributions.length : 0;
            
            return {
                name: group,
                totalMembers,
                activeMembers,
                totalContributions,
                averageContribution,
                contributionCount: groupContributions.length
            };
        }).sort((a, b) => b.totalContributions - a.totalContributions);
    };

    const groupStats = getGroupStats();
    const totalGroups = groupStats.length;
    const totalMembers = groupStats.reduce((sum, g) => sum + g.totalMembers, 0);
    const totalContributions = groupStats.reduce((sum, g) => sum + g.totalContributions, 0);

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Groups</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {totalGroups}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {totalMembers}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Contributions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {formatCurrency(totalContributions)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Average per Group</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {formatCurrency(totalGroups > 0 ? totalContributions / totalGroups : 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Groups Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Contributions by Group ({totalGroups})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b dark:border-gray-700">
                                    <th className="text-left py-3 px-4 font-medium">Group</th>
                                    <th className="text-left py-3 px-4 font-medium">Members</th>
                                    <th className="text-left py-3 px-4 font-medium">Active Members</th>
                                    <th className="text-left py-3 px-4 font-medium">Total Contributions</th>
                                    <th className="text-left py-3 px-4 font-medium">Average Contribution</th>
                                    <th className="text-left py-3 px-4 font-medium">Contribution Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupStats.map((group) => (
                                    <tr key={group.name} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="py-3 px-4">
                                            <div className="font-medium">{group.name}</div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{group.totalMembers}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {((group.totalMembers / totalMembers) * 100).toFixed(1)}%
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-green-600 dark:text-green-400">
                                                    {group.activeMembers}
                                                </span>
                                                <Badge variant="outline" className="text-xs">
                                                    {group.totalMembers > 0 ? 
                                                        ((group.activeMembers / group.totalMembers) * 100).toFixed(1) : 0}%
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-blue-600 dark:text-blue-400">
                                                    {formatCurrency(group.totalContributions)}
                                                </span>
                                                <Badge variant="outline" className="text-xs">
                                                    {totalContributions > 0 ? 
                                                        ((group.totalContributions / totalContributions) * 100).toFixed(1) : 0}%
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-purple-600 dark:text-purple-400">
                                                {formatCurrency(group.averageContribution)}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-orange-600 dark:text-orange-400">
                                                {group.contributionCount}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Group Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupStats.map((group) => (
                    <Card key={group.name}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{group.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Members:</span>
                                <span className="font-medium">{group.totalMembers}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Active:</span>
                                <span className="font-medium text-green-600 dark:text-green-400">
                                    {group.activeMembers}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Total Contributions:</span>
                                <span className="font-medium text-blue-600 dark:text-blue-400">
                                    {formatCurrency(group.totalContributions)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Average:</span>
                                <span className="font-medium text-purple-600 dark:text-purple-400">
                                    {formatCurrency(group.averageContribution)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Count:</span>
                                <span className="font-medium text-orange-600 dark:text-orange-400">
                                    {group.contributionCount}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
} 