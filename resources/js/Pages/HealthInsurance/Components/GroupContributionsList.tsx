import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

interface Member {
    id: string;
    name: string;
    group: string;
    total_contribution: number;
    total_claims_amount: number;
}

interface Props {
    members: Member[];
    appCurrency: {
        code: string;
        symbol: string;
    };
}

// Function to generate a consistent color based on group name
const getGroupColor = (groupName: string) => {
    const colors = [
        'text-blue-600 dark:text-blue-400',
        'text-green-600 dark:text-green-400',
        'text-purple-600 dark:text-purple-400',
        'text-orange-600 dark:text-orange-400',
        'text-pink-600 dark:text-pink-400',
        'text-indigo-600 dark:text-indigo-400',
        'text-teal-600 dark:text-teal-400',
        'text-red-600 dark:text-red-400',
        'text-yellow-600 dark:text-yellow-400',
        'text-cyan-600 dark:text-cyan-400',
        'text-emerald-600 dark:text-emerald-400',
        'text-violet-600 dark:text-violet-400',
        'text-amber-600 dark:text-amber-400',
        'text-rose-600 dark:text-rose-400',
        'text-sky-600 dark:text-sky-400',
    ];
    
    // Generate a hash from the group name to get consistent color
    let hash = 0;
    for (let i = 0; i < groupName.length; i++) {
        const char = groupName.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Use absolute value and modulo to get index
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};

export default function GroupContributionsList({ members, appCurrency }: Props) {
    // Calculate totals per group
    const groupStats = members.reduce((acc, member) => {
        const group = member.group || 'Ungrouped';
        if (!acc[group]) {
            acc[group] = {
                total_contribution: 0,
                total_claims: 0
            };
        }
        acc[group].total_contribution += member.total_contribution;
        acc[group].total_claims += member.total_claims_amount;
        return acc;
    }, {} as Record<string, { total_contribution: number; total_claims: number }>);

    // Convert to array and sort by total contribution
    const sortedGroups = Object.entries(groupStats)
        .map(([group, stats]) => ({
            group,
            ...stats,
            net_balance: stats.total_contribution - stats.total_claims
        }))
        .sort((a, b) => b.total_contribution - a.total_contribution);

    // Calculate totals across all groups
    const grandTotal = sortedGroups.reduce((acc, group) => ({
        total_contribution: acc.total_contribution + group.total_contribution,
        total_claims: acc.total_claims + group.total_claims,
        net_balance: acc.net_balance + group.net_balance
    }), { total_contribution: 0, total_claims: 0, net_balance: 0 });

    return (
        <Card className="shadow-lg dark:bg-gray-900 dark:border-gray-700">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">Group Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 dark:bg-gray-900">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent dark:border-gray-700">
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Group Name</TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-right">Total Contributions</TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-right">Total Claims</TableHead>
                            <TableHead className="font-semibold text-gray-700 dark:text-gray-300 text-right">Net Balance</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedGroups.map(({ group, total_contribution, total_claims, net_balance }) => (
                            <TableRow key={group} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:border-gray-700">
                                <TableCell className={`font-medium ${getGroupColor(group)}`}>{group}</TableCell>
                                <TableCell className="text-right font-medium dark:text-gray-100">
                                    {appCurrency.symbol}{total_contribution.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right font-medium dark:text-gray-100">
                                    {appCurrency.symbol}{total_claims.toLocaleString()}
                                </TableCell>
                                <TableCell className={`text-right font-medium ${net_balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                    {appCurrency.symbol}{net_balance.toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700">
                            <TableCell className="font-bold text-gray-900 dark:text-gray-100">Total</TableCell>
                            <TableCell className="text-right font-bold text-gray-900 dark:text-gray-100">
                                {appCurrency.symbol}{grandTotal.total_contribution.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-bold text-gray-900 dark:text-gray-100">
                                {appCurrency.symbol}{grandTotal.total_claims.toLocaleString()}
                            </TableCell>
                            <TableCell className={`text-right font-bold ${grandTotal.net_balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                {appCurrency.symbol}{grandTotal.net_balance.toLocaleString()}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
} 