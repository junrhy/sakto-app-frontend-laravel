import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

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
        hash = (hash << 5) - hash + char;
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
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
    }

    // Use absolute value and modulo to get index
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};

export default function GroupContributionsList({
    members,
    contributions = [],
    appCurrency,
}: Props) {
    const [filterText, setFilterText] = useState('');

    // Helper function to get the earliest payment date within the current period for a member
    const getEarliestPaymentInCurrentPeriod = (
        memberId: string,
        contributionFrequency: string,
    ) => {
        const memberContributions = contributions.filter(
            (c) => c.member_id === memberId,
        );
        if (memberContributions.length === 0)
            return { date: new Date('9999-12-31'), period: 'No payments' };

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
        const periodContributions = memberContributions.filter(
            (contribution) => {
                const paymentDate = new Date(contribution.payment_date);
                return paymentDate >= periodStart && paymentDate <= periodEnd;
            },
        );

        if (periodContributions.length === 0) {
            return {
                date: new Date('9999-12-31'),
                period: `No payments in ${periodLabel}`,
            };
        }

        // Find earliest payment in the period (use created_at for actual timestamp)
        const earliestContribution = periodContributions.reduce(
            (earliest, contribution) => {
                const paymentDate = new Date(contribution.payment_date);
                const earliestPaymentDate = new Date(earliest.payment_date);
                return paymentDate < earliestPaymentDate
                    ? contribution
                    : earliest;
            },
            periodContributions[0],
        );

        // Use created_at for the actual timestamp with time
        const actualTimestamp = new Date(
            earliestContribution.created_at ||
                earliestContribution.payment_date,
        );

        return { date: actualTimestamp, period: periodLabel };
    };

    // Calculate totals per group
    const groupStats = members.reduce(
        (acc, member) => {
            const group = member.group || 'Ungrouped';
            if (!acc[group]) {
                acc[group] = {
                    total_contribution: 0,
                    total_claims: 0,
                    member_count: 0,
                };
            }
            acc[group].total_contribution += member.total_contribution;
            acc[group].total_claims += member.total_claims_amount;
            acc[group].member_count += 1;
            return acc;
        },
        {} as Record<
            string,
            {
                total_contribution: number;
                total_claims: number;
                member_count: number;
            }
        >,
    );

    // Convert to array, filter, and sort by total contribution
    const sortedGroups = Object.entries(groupStats)
        .map(([group, stats]) => ({
            group,
            ...stats,
            net_balance: stats.total_contribution - stats.total_claims,
        }))
        .filter(
            ({ group }) =>
                filterText === '' ||
                group.toLowerCase().includes(filterText.toLowerCase()),
        )
        .sort((a, b) => b.total_contribution - a.total_contribution);

    // Calculate totals across all groups
    const grandTotal = sortedGroups.reduce(
        (acc, group) => ({
            total_contribution:
                acc.total_contribution + group.total_contribution,
            total_claims: acc.total_claims + group.total_claims,
            net_balance: acc.net_balance + group.net_balance,
        }),
        { total_contribution: 0, total_claims: 0, net_balance: 0 },
    );

    // Find top 10 highest contributors overall with payment date consideration
    const top10OverallContributors = members
        .map((member) => {
            const memberContributions = contributions.filter(
                (c) => c.member_id === member.id,
            );
            const paymentInfo = getEarliestPaymentInCurrentPeriod(
                member.id,
                member.contribution_frequency,
            );
            return {
                member,
                name: member.name,
                group: member.group || 'Ungrouped',
                total_contribution: member.total_contribution,
                total_claims: member.total_claims_amount,
                contribution_count: memberContributions.length,
                earliest_payment_date: paymentInfo.date,
                payment_period: paymentInfo.period,
                hasCurrentPeriodPayment:
                    paymentInfo.date.getFullYear() !== 9999,
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
                return (
                    a.earliest_payment_date.getTime() -
                    b.earliest_payment_date.getTime()
                );
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
            payment_period: item.payment_period,
        }));

    // Find top 10 contributors per group with payment date consideration
    const top10PerGroup = Object.entries(groupStats)
        .map(([groupName]) => {
            const groupMembers = members.filter(
                (member) => (member.group || 'Ungrouped') === groupName,
            );
            if (groupMembers.length === 0) return null;

            const top10InGroup = groupMembers
                .map((member) => {
                    const memberContributions = contributions.filter(
                        (c) => c.member_id === member.id,
                    );
                    const paymentInfo = getEarliestPaymentInCurrentPeriod(
                        member.id,
                        member.contribution_frequency,
                    );
                    return {
                        member,
                        name: member.name,
                        total_contribution: member.total_contribution,
                        total_claims: member.total_claims_amount,
                        contribution_count: memberContributions.length,
                        earliest_payment_date: paymentInfo.date,
                        payment_period: paymentInfo.period,
                        hasCurrentPeriodPayment:
                            paymentInfo.date.getFullYear() !== 9999,
                    };
                })
                .sort((a, b) => {
                    // First priority: Members who have paid in current period (annual/monthly/quarterly)
                    if (
                        a.hasCurrentPeriodPayment !== b.hasCurrentPeriodPayment
                    ) {
                        return b.hasCurrentPeriodPayment ? 1 : -1;
                    }

                    // Second priority: Total contribution (descending)
                    if (b.total_contribution !== a.total_contribution) {
                        return b.total_contribution - a.total_contribution;
                    }

                    // Third priority: Earliest payment date in current period (ascending - earlier is better)
                    if (
                        a.hasCurrentPeriodPayment &&
                        b.hasCurrentPeriodPayment
                    ) {
                        return (
                            a.earliest_payment_date.getTime() -
                            b.earliest_payment_date.getTime()
                        );
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
                    payment_period: item.payment_period,
                }));

            return {
                group: groupName,
                contributors: top10InGroup,
            };
        })
        .filter((group): group is NonNullable<typeof group> => group !== null);

    return (
        <div className="space-y-6">
            <Card className="shadow-lg dark:border-gray-700 dark:bg-gray-900">
                <CardHeader className="border-b bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                            Group Financial Summary
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Input
                                type="text"
                                placeholder="Filter groups..."
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                className="w-full border-gray-300 bg-white text-gray-900 placeholder-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 sm:w-64"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 dark:bg-gray-900">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Table Column */}
                        <div>
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent dark:border-gray-700">
                                        <TableHead className="font-semibold text-gray-700 dark:text-gray-300">
                                            Group Name
                                        </TableHead>
                                        <TableHead className="text-center font-semibold text-gray-700 dark:text-gray-300">
                                            Members
                                        </TableHead>
                                        <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">
                                            Total Contributions
                                        </TableHead>
                                        <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">
                                            Total Claims
                                        </TableHead>
                                        <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">
                                            Net Balance
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedGroups.map(
                                        ({
                                            group,
                                            total_contribution,
                                            total_claims,
                                            net_balance,
                                        }) => (
                                            <TableRow
                                                key={group}
                                                className="hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                                            >
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`h-4 w-4 rounded-md ${getGroupBgColor(group)} shadow-sm`}
                                                        ></div>
                                                        <span
                                                            className={`${getGroupColor(group)} text-lg font-semibold tracking-wide`}
                                                        >
                                                            {group}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center font-medium text-gray-700 dark:text-gray-300">
                                                    <span className="rounded-full bg-gray-100 px-2 py-1 text-sm font-semibold dark:bg-gray-800">
                                                        {
                                                            groupStats[group]
                                                                .member_count
                                                        }
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-blue-600 dark:text-blue-400">
                                                    {appCurrency.symbol}
                                                    {total_contribution.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-orange-600 dark:text-orange-400">
                                                    {appCurrency.symbol}
                                                    {total_claims.toLocaleString()}
                                                </TableCell>
                                                <TableCell
                                                    className={`text-right font-medium ${net_balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
                                                >
                                                    {appCurrency.symbol}
                                                    {net_balance.toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ),
                                    )}
                                    <TableRow className="bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700">
                                        <TableCell className="font-bold text-gray-900 dark:text-gray-100">
                                            Total
                                        </TableCell>
                                        <TableCell className="text-center font-bold text-gray-900 dark:text-gray-100">
                                            <span className="rounded-full bg-blue-100 px-2 py-1 text-sm font-semibold dark:bg-blue-900/30">
                                                {members.length}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-blue-600 dark:text-blue-400">
                                            {appCurrency.symbol}
                                            {grandTotal.total_contribution.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-orange-600 dark:text-orange-400">
                                            {appCurrency.symbol}
                                            {grandTotal.total_claims.toLocaleString()}
                                        </TableCell>
                                        <TableCell
                                            className={`text-right font-bold ${grandTotal.net_balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
                                        >
                                            {appCurrency.symbol}
                                            {grandTotal.net_balance.toLocaleString()}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>

                        {/* Chart Column */}
                        <div className="space-y-6">
                            {/* Bar Chart for Contributions vs Claims */}
                            <div>
                                <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100">
                                    Contributions vs Claims by Group
                                </h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={sortedGroups}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#374151"
                                        />
                                        <XAxis
                                            dataKey="group"
                                            angle={-45}
                                            textAnchor="end"
                                            height={80}
                                            tick={{
                                                fontSize: 12,
                                                fill: '#6B7280',
                                            }}
                                        />
                                        <YAxis
                                            tick={{
                                                fontSize: 12,
                                                fill: '#6B7280',
                                            }}
                                            tickFormatter={(value) =>
                                                `${appCurrency.symbol}${(value / 1000).toFixed(0)}k`
                                            }
                                        />
                                        <Tooltip
                                            formatter={(value: number) => [
                                                `${appCurrency.symbol}${value.toLocaleString()}`,
                                                '',
                                            ]}
                                            labelStyle={{ color: '#374151' }}
                                            contentStyle={{
                                                backgroundColor: '#F9FAFB',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '8px',
                                            }}
                                        />
                                        <Legend />
                                        <Bar
                                            dataKey="total_contribution"
                                            fill="#3B82F6"
                                            name="Contributions"
                                        />
                                        <Bar
                                            dataKey="total_claims"
                                            fill="#F59E0B"
                                            name="Claims"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Pie Chart for Net Balance Distribution */}
                            <div>
                                <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100">
                                    Net Balance Distribution
                                </h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={sortedGroups}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ group, net_balance }) =>
                                                `${group}: ${appCurrency.symbol}${net_balance.toLocaleString()}`
                                            }
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="net_balance"
                                        >
                                            {sortedGroups.map(
                                                (entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={
                                                            entry.net_balance >=
                                                            0
                                                                ? '#10B981'
                                                                : '#EF4444'
                                                        }
                                                    />
                                                ),
                                            )}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) => [
                                                `${appCurrency.symbol}${value.toLocaleString()}`,
                                                'Net Balance',
                                            ]}
                                            labelStyle={{ color: '#374151' }}
                                            contentStyle={{
                                                backgroundColor: '#F9FAFB',
                                                border: '1px solid #E5E7EB',
                                                borderRadius: '8px',
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Highest Contributors Section */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Top 10 Overall Contributors */}
                <Card className="shadow-lg dark:border-gray-700 dark:bg-gray-900">
                    <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:border-gray-700 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
                            <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                            Top 10 Overall Contributors
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="max-h-[800px] space-y-3 overflow-y-auto pr-2">
                            {top10OverallContributors.map((contributor) => (
                                <div
                                    key={`${contributor.name}-${contributor.group}`}
                                    className="border-b border-gray-200 pb-3 last:border-b-0 dark:border-gray-700"
                                >
                                    <div className="mb-1 flex items-center justify-between">
                                        <div className="flex items-center gap-1">
                                            {contributor.rank === 1 && (
                                                <span className="text-lg text-yellow-500">
                                                    ⭐
                                                </span>
                                            )}
                                            <span
                                                className={`text-sm font-medium ${contributor.rank === 1 ? 'font-bold text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`}
                                            >
                                                #{contributor.rank}
                                            </span>
                                        </div>
                                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                            {appCurrency.symbol}
                                            {contributor.total_contribution.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="mb-1 flex items-center justify-between">
                                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                                            {contributor.name}
                                        </span>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {contributor.group}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Contributions:
                                        </span>
                                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                                            {contributor.contribution_count}{' '}
                                            times
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            Latest Payment (
                                            {contributor.payment_period}):
                                        </span>
                                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                            {contributor.earliest_payment_date.getFullYear() ===
                                            9999
                                                ? 'No payments'
                                                : contributor.earliest_payment_date.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top 10 Contributors Per Group */}
                <Card className="shadow-lg dark:border-gray-700 dark:bg-gray-900">
                    <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50 dark:border-gray-700 dark:from-green-900/20 dark:to-emerald-900/20">
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-100">
                            <div className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400"></div>
                            Top 10 Contributors Per Group
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="max-h-[800px] space-y-4 overflow-y-auto pr-2">
                            {top10PerGroup.map((groupData) => (
                                <div
                                    key={groupData.group}
                                    className="border-b border-gray-200 pb-3 last:border-b-0 dark:border-gray-700"
                                >
                                    <div className="mb-3 flex items-center gap-2">
                                        <div
                                            className={`h-3 w-3 rounded-sm ${getGroupBgColor(groupData.group)}`}
                                        ></div>
                                        <span
                                            className={`font-semibold ${getGroupColor(groupData.group)}`}
                                        >
                                            {groupData.group}
                                        </span>
                                    </div>
                                    <div className="ml-5 space-y-2">
                                        {groupData.contributors.map(
                                            (contributor) => (
                                                <div
                                                    key={`${groupData.group}-${contributor.name}`}
                                                    className="space-y-1"
                                                >
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex items-center gap-1">
                                                                {contributor.rank ===
                                                                    1 && (
                                                                    <span className="text-sm text-yellow-500">
                                                                        ⭐
                                                                    </span>
                                                                )}
                                                                <span
                                                                    className={`text-xs font-medium ${contributor.rank === 1 ? 'font-bold text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`}
                                                                >
                                                                    #
                                                                    {
                                                                        contributor.rank
                                                                    }
                                                                </span>
                                                            </div>
                                                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                                                {
                                                                    contributor.name
                                                                }
                                                            </span>
                                                        </div>
                                                        <span className="font-bold text-green-600 dark:text-green-400">
                                                            {appCurrency.symbol}
                                                            {contributor.total_contribution.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="ml-4 flex items-center justify-between text-xs">
                                                        <span className="text-gray-500 dark:text-gray-400">
                                                            Contributions:
                                                        </span>
                                                        <span className="font-medium text-purple-600 dark:text-purple-400">
                                                            {
                                                                contributor.contribution_count
                                                            }{' '}
                                                            times
                                                        </span>
                                                    </div>
                                                    <div className="ml-4 flex items-center justify-between text-xs">
                                                        <span className="text-gray-500 dark:text-gray-400">
                                                            Latest Payment (
                                                            {
                                                                contributor.payment_period
                                                            }
                                                            ):
                                                        </span>
                                                        <span className="font-medium text-amber-600 dark:text-amber-400">
                                                            {contributor.earliest_payment_date.getFullYear() ===
                                                            9999
                                                                ? 'No payments'
                                                                : contributor.earliest_payment_date.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            ),
                                        )}
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
