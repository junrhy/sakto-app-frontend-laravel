import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { useState } from 'react';

interface Member {
    id: string;
    name: string;
    group: string;
    total_contribution: number;
    total_claims_amount: number;
    contribution_frequency: string;
}

interface Props {
    members: Member[];
    contributions?: Contribution[];
    appCurrency: {
        code: string;
        symbol: string;
    };
}

interface Contribution {
    id: string;
    member_id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    reference_number: string;
    created_at?: string;
}

// Function to generate a consistent color based on group name
const getGroupColor = (groupName: string) => {
    const colors = [
        'text-blue-600 dark:text-blue-400',
        'text-red-600 dark:text-red-400',
        'text-green-600 dark:text-green-400',
        'text-purple-600 dark:text-purple-400',
        'text-orange-600 dark:text-orange-400',
        'text-teal-600 dark:text-teal-400',
        'text-pink-600 dark:text-pink-400',
        'text-indigo-600 dark:text-indigo-400',
        'text-yellow-600 dark:text-yellow-400',
        'text-emerald-600 dark:text-emerald-400',
        'text-violet-600 dark:text-violet-400',
        'text-cyan-600 dark:text-cyan-400',
        'text-rose-600 dark:text-rose-400',
        'text-lime-600 dark:text-lime-400',
        'text-amber-600 dark:text-amber-400',
        'text-sky-600 dark:text-sky-400',
        'text-fuchsia-600 dark:text-fuchsia-400',
        'text-slate-600 dark:text-slate-400',
        'text-zinc-600 dark:text-zinc-400',
        'text-neutral-600 dark:text-neutral-400',
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

// Function to get background color for the square
const getGroupBgColor = (groupName: string) => {
    const colors = [
        'bg-blue-600 dark:bg-blue-400',
        'bg-red-600 dark:bg-red-400',
        'bg-green-600 dark:bg-green-400',
        'bg-purple-600 dark:bg-purple-400',
        'bg-orange-600 dark:bg-orange-400',
        'bg-teal-600 dark:bg-teal-400',
        'bg-pink-600 dark:bg-pink-400',
        'bg-indigo-600 dark:bg-indigo-400',
        'bg-yellow-600 dark:bg-yellow-400',
        'bg-emerald-600 dark:bg-emerald-400',
        'bg-violet-600 dark:bg-violet-400',
        'bg-cyan-600 dark:bg-cyan-400',
        'bg-rose-600 dark:bg-rose-400',
        'bg-lime-600 dark:bg-lime-400',
        'bg-amber-600 dark:bg-amber-400',
        'bg-sky-600 dark:bg-sky-400',
        'bg-fuchsia-600 dark:bg-fuchsia-400',
        'bg-slate-600 dark:bg-slate-400',
        'bg-zinc-600 dark:bg-zinc-400',
        'bg-neutral-600 dark:bg-neutral-400',
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

export default function GroupContributionsList({ members, contributions = [], appCurrency }: Props) {
    const [filterText, setFilterText] = useState('');

    // Helper function to get the earliest payment date within the current period for a member
    const getEarliestPaymentInCurrentPeriod = (memberId: string, contributionFrequency: string) => {
        const memberContributions = contributions.filter(c => c.member_id === memberId);
        if (memberContributions.length === 0) return { date: new Date('9999-12-31'), period: 'No payments' };
        
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentQuarter = Math.floor(currentMonth / 3);
        
        let periodStart: Date;
        let periodEnd: Date;
        let periodLabel: string;
        
        switch (contributionFrequency.toLowerCase()) {
            case 'monthly':
                periodStart = new Date(currentYear, currentMonth, 1);
                periodEnd = new Date(currentYear, currentMonth + 1, 0);
                periodLabel = 'this month';
                break;
            case 'quarterly':
                const quarterStartMonth = currentQuarter * 3;
                periodStart = new Date(currentYear, quarterStartMonth, 1);
                periodEnd = new Date(currentYear, quarterStartMonth + 3, 0);
                periodLabel = `Q${currentQuarter + 1} ${currentYear}`;
                break;
            case 'annually':
                periodStart = new Date(currentYear, 0, 1);
                periodEnd = new Date(currentYear, 11, 31);
                periodLabel = 'this year';
                break;
            default:
                // If frequency is unknown, use all contributions
                periodStart = new Date('1900-01-01');
                periodEnd = new Date('9999-12-31');
                periodLabel = 'all time';
        }
        
        // Filter contributions within the current period
        const periodContributions = memberContributions.filter(contribution => {
            const paymentDate = new Date(contribution.payment_date);
            return paymentDate >= periodStart && paymentDate <= periodEnd;
        });
        
        if (periodContributions.length === 0) {
            return { date: new Date('9999-12-31'), period: `No payments in ${periodLabel}` };
        }
        
        // Find earliest payment in the period (use created_at for actual timestamp)
        const earliestContribution = periodContributions.reduce((earliest, contribution) => {
            const paymentDate = new Date(contribution.payment_date);
            const earliestPaymentDate = new Date(earliest.payment_date);
            return paymentDate < earliestPaymentDate ? contribution : earliest;
        }, periodContributions[0]);
        
        // Use created_at for the actual timestamp with time
        const actualTimestamp = new Date(earliestContribution.created_at || earliestContribution.payment_date);
        
        return { date: actualTimestamp, period: periodLabel };
    };
    


    // Calculate totals per group
    const groupStats = members.reduce((acc, member) => {
        const group = member.group || 'Ungrouped';
        if (!acc[group]) {
            acc[group] = {
                total_contribution: 0,
                total_claims: 0,
                member_count: 0
            };
        }
        acc[group].total_contribution += member.total_contribution;
        acc[group].total_claims += member.total_claims_amount;
        acc[group].member_count += 1;
        return acc;
    }, {} as Record<string, { total_contribution: number; total_claims: number; member_count: number }>);

    // Convert to array, filter, and sort by total contribution
    const sortedGroups = Object.entries(groupStats)
        .map(([group, stats]) => ({
            group,
            ...stats,
            net_balance: stats.total_contribution - stats.total_claims
        }))
        .filter(({ group }) => 
            filterText === '' || 
            group.toLowerCase().includes(filterText.toLowerCase())
        )
        .sort((a, b) => b.total_contribution - a.total_contribution);

    // Calculate totals across all groups
    const grandTotal = sortedGroups.reduce((acc, group) => ({
        total_contribution: acc.total_contribution + group.total_contribution,
        total_claims: acc.total_claims + group.total_claims,
        net_balance: acc.net_balance + group.net_balance
    }), { total_contribution: 0, total_claims: 0, net_balance: 0 });

    // Find top 10 highest contributors overall with payment date consideration
    const top10OverallContributors = members
        .map(member => {
            const memberContributions = contributions.filter(c => c.member_id === member.id);
            const paymentInfo = getEarliestPaymentInCurrentPeriod(member.id, member.contribution_frequency);
            return {
                member,
                name: member.name,
                group: member.group || 'Ungrouped',
                total_contribution: member.total_contribution,
                total_claims: member.total_claims_amount,
                contribution_count: memberContributions.length,
                earliest_payment_date: paymentInfo.date,
                payment_period: paymentInfo.period,
                hasCurrentPeriodPayment: paymentInfo.date.getFullYear() !== 9999
            };
        })
        .sort((a, b) => {
            // First priority: Members who have paid in current period (annual/monthly/quarterly)
            if (a.hasCurrentPeriodPayment !== b.hasCurrentPeriodPayment) {
                return b.hasCurrentPeriodPayment ? 1 : -1;
            }
            
            // Second priority: Total contribution (descending)
            if (b.total_contribution !== a.total_contribution) {
                return b.total_contribution - a.total_contribution;
            }
            
            // Third priority: Earliest payment date in current period (ascending - earlier is better)
            if (a.hasCurrentPeriodPayment && b.hasCurrentPeriodPayment) {
                return a.earliest_payment_date.getTime() - b.earliest_payment_date.getTime();
            }
            
            // If no current period payments, sort by total contribution only
            return 0;
        })
        .slice(0, 10)
        .map((item, index) => ({
            rank: index + 1,
            name: item.name,
            group: item.group,
            total_contribution: item.total_contribution,
            total_claims: item.total_claims,
            contribution_count: item.contribution_count,
            earliest_payment_date: item.earliest_payment_date,
            payment_period: item.payment_period
        }));

    // Find top 10 contributors per group with payment date consideration
    const top10PerGroup = Object.entries(groupStats).map(([groupName]) => {
        const groupMembers = members.filter(member => (member.group || 'Ungrouped') === groupName);
        if (groupMembers.length === 0) return null;
        
        const top10InGroup = groupMembers
            .map(member => {
                const memberContributions = contributions.filter(c => c.member_id === member.id);
                const paymentInfo = getEarliestPaymentInCurrentPeriod(member.id, member.contribution_frequency);
                return {
                    member,
                    name: member.name,
                    total_contribution: member.total_contribution,
                    total_claims: member.total_claims_amount,
                    contribution_count: memberContributions.length,
                    earliest_payment_date: paymentInfo.date,
                    payment_period: paymentInfo.period,
                    hasCurrentPeriodPayment: paymentInfo.date.getFullYear() !== 9999
                };
            })
            .sort((a, b) => {
                // First priority: Members who have paid in current period (annual/monthly/quarterly)
                if (a.hasCurrentPeriodPayment !== b.hasCurrentPeriodPayment) {
                    return b.hasCurrentPeriodPayment ? 1 : -1;
                }
                
                // Second priority: Total contribution (descending)
                if (b.total_contribution !== a.total_contribution) {
                    return b.total_contribution - a.total_contribution;
                }
                
                // Third priority: Earliest payment date in current period (ascending - earlier is better)
                if (a.hasCurrentPeriodPayment && b.hasCurrentPeriodPayment) {
                    return a.earliest_payment_date.getTime() - b.earliest_payment_date.getTime();
                }
                
                // If no current period payments, sort by total contribution only
                return 0;
            })
            .slice(0, 10)
            .map((item, index) => ({
                rank: index + 1,
                name: item.name,
                total_contribution: item.total_contribution,
                total_claims: item.total_claims,
                contribution_count: item.contribution_count,
                earliest_payment_date: item.earliest_payment_date,
                payment_period: item.payment_period
            }));
        
        return {
            group: groupName,
            contributors: top10InGroup
        };
    }).filter((group): group is NonNullable<typeof group> => group !== null);

    return (
        <div className="space-y-6">
            <Card className="shadow-lg dark:bg-gray-950 dark:border-gray-800">
                <CardHeader className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-800">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">Group Financial Summary</CardTitle>
                        <div className="flex items-center gap-2">
                            <Input
                                type="text"
                                placeholder="Filter groups..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                className="w-full sm:w-64 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 dark:bg-gray-950">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-200">Group Name</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-200 text-center">Members</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-200 text-right">Total Contributions</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-200 text-right">Total Claims</TableHead>
                                <TableHead className="font-semibold text-gray-700 dark:text-gray-200 text-right">Net Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedGroups.map(({ group, total_contribution, total_claims, net_balance }) => (
                                <TableRow key={group} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 dark:border-gray-800 transition-colors duration-200">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded-md ${getGroupBgColor(group)} shadow-sm`}></div>
                                            <span className={`${getGroupColor(group)} font-semibold text-lg tracking-wide`}>{group}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-medium text-gray-700 dark:text-gray-300">
                                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-sm font-semibold">
                                            {groupStats[group].member_count}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-blue-600 dark:text-blue-400">
                                        {appCurrency.symbol}{total_contribution.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-orange-600 dark:text-orange-400">
                                        {appCurrency.symbol}{total_claims.toLocaleString()}
                                    </TableCell>
                                    <TableCell className={`text-right font-medium ${net_balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                        {appCurrency.symbol}{net_balance.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 dark:border-gray-800">
                                <TableCell className="font-bold text-gray-900 dark:text-gray-100">Total</TableCell>
                                <TableCell className="text-center font-bold text-gray-900 dark:text-gray-100">
                                    <span className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full text-sm font-semibold">
                                        {members.length}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400">
                                    {appCurrency.symbol}{grandTotal.total_contribution.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right font-bold text-orange-600 dark:text-orange-400">
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

            {/* Highest Contributors Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Top 10 Overall Contributors */}
                <Card className="shadow-lg dark:bg-gray-950 dark:border-gray-800">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b dark:border-gray-800">
                        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                            Top 10 Overall Contributors
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2">
                            {top10OverallContributors.map((contributor) => (
                                <div key={`${contributor.name}-${contributor.group}`} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-1">
                                            {contributor.rank === 1 && (
                                                <span className="text-yellow-500 text-lg">⭐</span>
                                            )}
                                            <span className={`text-sm font-medium ${contributor.rank === 1 ? 'text-yellow-600 dark:text-yellow-400 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                                                #{contributor.rank}
                                            </span>
                                        </div>
                                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                            {appCurrency.symbol}{contributor.total_contribution.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">{contributor.name}</span>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">{contributor.group}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Contributions:</span>
                                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                                            {contributor.contribution_count} times
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Latest Payment ({contributor.payment_period}):</span>
                                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                            {contributor.earliest_payment_date.getFullYear() === 9999 ? 'No payments' : contributor.earliest_payment_date.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top 10 Contributors Per Group */}
                <Card className="shadow-lg dark:bg-gray-950 dark:border-gray-800">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b dark:border-gray-800">
                        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                            Top 10 Contributors Per Group
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2">
                            {top10PerGroup.map((groupData) => (
                                <div key={groupData.group} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-3 h-3 rounded-sm ${getGroupBgColor(groupData.group)}`}></div>
                                        <span className={`font-semibold ${getGroupColor(groupData.group)}`}>{groupData.group}</span>
                                    </div>
                                    <div className="ml-5 space-y-2">
                                        {groupData.contributors.map((contributor) => (
                                            <div key={`${groupData.group}-${contributor.name}`} className="space-y-1">
                                                <div className="flex justify-between items-center text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex items-center gap-1">
                                                            {contributor.rank === 1 && (
                                                                <span className="text-yellow-500 text-sm">⭐</span>
                                                            )}
                                                            <span className={`text-xs font-medium ${contributor.rank === 1 ? 'text-yellow-600 dark:text-yellow-400 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                                                                #{contributor.rank}
                                                            </span>
                                                        </div>
                                                        <span className="font-medium text-gray-900 dark:text-gray-100">{contributor.name}</span>
                                                    </div>
                                                    <span className="font-bold text-green-600 dark:text-green-400">
                                                        {appCurrency.symbol}{contributor.total_contribution.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs ml-4">
                                                    <span className="text-gray-500 dark:text-gray-400">Contributions:</span>
                                                    <span className="font-medium text-purple-600 dark:text-purple-400">
                                                        {contributor.contribution_count} times
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs ml-4">
                                                    <span className="text-gray-500 dark:text-gray-400">Latest Payment ({contributor.payment_period}):</span>
                                                    <span className="font-medium text-amber-600 dark:text-amber-400">
                                                        {contributor.earliest_payment_date.getFullYear() === 9999 ? 'No payments' : contributor.earliest_payment_date.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 