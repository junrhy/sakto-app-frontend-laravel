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

    return (
        <Card>
            <CardHeader>
                <CardTitle>Group Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Group Name</TableHead>
                            <TableHead className="text-right">Total Contributions</TableHead>
                            <TableHead className="text-right">Total Claims</TableHead>
                            <TableHead className="text-right">Net Balance</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedGroups.map(({ group, total_contribution, total_claims, net_balance }) => (
                            <TableRow key={group}>
                                <TableCell className="font-medium">{group}</TableCell>
                                <TableCell className="text-right">
                                    {appCurrency.symbol}{total_contribution.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    {appCurrency.symbol}{total_claims.toLocaleString()}
                                </TableCell>
                                <TableCell className={`text-right ${net_balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {appCurrency.symbol}{net_balance.toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
} 