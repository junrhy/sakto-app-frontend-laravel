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

export default function UpcomingContributionsList({ members, contributions, appCurrency }: Props) {
    const formatCurrency = (amount: number) => {
        // Ensure amount is a number and handle any string conversion
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(numericAmount)) return `${appCurrency.symbol}0`;
        return `${appCurrency.symbol}${numericAmount.toLocaleString()}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getNextContributionDate = (member: Member) => {
        const memberContributions = contributions
            .filter(c => c.member_id === member.id)
            .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());

        let lastContributionDate = new Date(member.membership_start_date);
        if (memberContributions.length > 0) {
            lastContributionDate = new Date(memberContributions[0].payment_date);
        }

        const nextDate = new Date(lastContributionDate);
        switch (member.contribution_frequency) {
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            case 'quarterly':
                nextDate.setMonth(nextDate.getMonth() + 3);
                break;
            case 'annually':
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                break;
        }

        return nextDate;
    };

    const getDaysUntilNextContribution = (member: Member) => {
        const nextDate = getNextContributionDate(member);
        const now = new Date();
        const diffTime = nextDate.getTime() - now.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getUpcomingContributions = () => {
        return members
            .map(member => ({
                ...member,
                nextContributionDate: getNextContributionDate(member),
                daysUntil: getDaysUntilNextContribution(member)
            }))
            .filter(member => member.daysUntil >= 0)
            .sort((a, b) => a.daysUntil - b.daysUntil);
    };

    const upcomingContributions = getUpcomingContributions();
    const dueThisMonth = upcomingContributions.filter(m => m.daysUntil <= 30);
    const dueNextMonth = upcomingContributions.filter(m => m.daysUntil > 30 && m.daysUntil <= 60);

    const getDueStatus = (daysUntil: number) => {
        if (daysUntil <= 7) return 'overdue';
        if (daysUntil <= 30) return 'due-soon';
        return 'upcoming';
    };

    const getDueStatusColor = (status: string) => {
        switch (status) {
            case 'overdue':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'due-soon':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'upcoming':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Upcoming</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {upcomingContributions.length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Due This Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {dueThisMonth.length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Due Next Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {dueNextMonth.length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            {formatCurrency(upcomingContributions.reduce((sum, m) => sum + m.contribution_amount, 0))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Contributions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Contributions ({upcomingContributions.length})</CardTitle>
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
                                    <th className="text-left py-3 px-4 font-medium">Next Due Date</th>
                                    <th className="text-left py-3 px-4 font-medium">Days Until Due</th>
                                    <th className="text-left py-3 px-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcomingContributions.map((member) => {
                                    const status = getDueStatus(member.daysUntil);
                                    return (
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
                                                <div className="text-sm">{formatDate(member.nextContributionDate.toISOString())}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className={`font-medium ${
                                                    member.daysUntil <= 7 ? 'text-red-600 dark:text-red-400' :
                                                    member.daysUntil <= 30 ? 'text-yellow-600 dark:text-yellow-400' :
                                                    'text-green-600 dark:text-green-400'
                                                }`}>
                                                    {member.daysUntil} days
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Badge className={getDueStatusColor(status)}>
                                                    {status === 'overdue' ? 'Overdue' :
                                                     status === 'due-soon' ? 'Due Soon' : 'Upcoming'}
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