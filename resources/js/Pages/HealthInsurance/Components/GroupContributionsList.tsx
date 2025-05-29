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
        <Card className="shadow-lg">
            <CardHeader className="bg-gray-50 border-b">
                <CardTitle className="text-xl font-semibold text-gray-800">Group Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-semibold text-gray-700">Group Name</TableHead>
                            <TableHead className="font-semibold text-gray-700 text-right">Total Contributions</TableHead>
                            <TableHead className="font-semibold text-gray-700 text-right">Total Claims</TableHead>
                            <TableHead className="font-semibold text-gray-700 text-right">Net Balance</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedGroups.map(({ group, total_contribution, total_claims, net_balance }) => (
                            <TableRow key={group} className="hover:bg-gray-50">
                                <TableCell className="font-medium text-gray-800">{group}</TableCell>
                                <TableCell className="text-right font-medium">
                                    {appCurrency.symbol}{total_contribution.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {appCurrency.symbol}{total_claims.toLocaleString()}
                                </TableCell>
                                <TableCell className={`text-right font-medium ${net_balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {appCurrency.symbol}{net_balance.toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow className="bg-gray-50 hover:bg-gray-100">
                            <TableCell className="font-bold text-gray-900">Total</TableCell>
                            <TableCell className="text-right font-bold text-gray-900">
                                {appCurrency.symbol}{grandTotal.total_contribution.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-bold text-gray-900">
                                {appCurrency.symbol}{grandTotal.total_claims.toLocaleString()}
                            </TableCell>
                            <TableCell className={`text-right font-bold ${grandTotal.net_balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {appCurrency.symbol}{grandTotal.net_balance.toLocaleString()}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
} 