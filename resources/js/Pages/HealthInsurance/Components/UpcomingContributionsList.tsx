import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Input } from '@/Components/ui/input';
import { format } from 'date-fns';
import { useState } from 'react';

interface Member {
    id: string;
    name: string;
    contribution_amount: number;
    contribution_frequency: string;
    membership_start_date: string;
}

interface Contribution {
    id: string;
    member_id: string;
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
    const [searchQuery, setSearchQuery] = useState('');

    const getNextContributionDate = (member: Member) => {
        const lastContribution = contributions
            .filter(c => c.member_id === member.id)
            .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())[0];

        const startDate = lastContribution 
            ? new Date(lastContribution.payment_date)
            : new Date(member.membership_start_date);

        const currentDate = new Date();
        let nextDate = new Date(startDate);

        // Keep adding intervals until we find a date that's in the future
        while (nextDate <= currentDate) {
            switch (member.contribution_frequency.toLowerCase()) {
                case 'monthly':
                    nextDate.setMonth(nextDate.getMonth() + 1);
                    break;
                case 'quarterly':
                    nextDate.setMonth(nextDate.getMonth() + 3);
                    break;
                case 'annually':
                    nextDate.setFullYear(nextDate.getFullYear() + 1);
                    break;
                default:
                    return null;
            }
        }

        return nextDate;
    };

    const upcomingContributions = members
        .map(member => ({
            ...member,
            nextContributionDate: getNextContributionDate(member)
        }))
        .filter(member => member.nextContributionDate)
        .sort((a, b) => a.nextContributionDate!.getTime() - b.nextContributionDate!.getTime());

    const filterContributions = (contributions: typeof upcomingContributions) => {
        if (!searchQuery) return contributions;
        return contributions.filter(member => 
            member.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const calculateTotalContributions = (contributions: typeof upcomingContributions) => {
        return Number(contributions.reduce((total, member) => total + Number(member.contribution_amount), 0));
    };

    const monthlyContributions = filterContributions(
        upcomingContributions.filter(member => member.contribution_frequency.toLowerCase() === 'monthly')
    );
    const quarterlyContributions = filterContributions(
        upcomingContributions.filter(member => member.contribution_frequency.toLowerCase() === 'quarterly')
    );
    const annualContributions = filterContributions(
        upcomingContributions.filter(member => member.contribution_frequency.toLowerCase() === 'annually')
    );

    const ContributionTable = ({ contributions, title }: { contributions: typeof upcomingContributions, title: string }) => (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="font-semibold">Member Name</TableHead>
                            <TableHead className="font-semibold">Contribution Amount</TableHead>
                            <TableHead className="font-semibold">Next Contribution Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contributions.map((member) => (
                            <TableRow key={member.id} className="hover:bg-gray-50">
                                <TableCell className="font-medium">{member.name}</TableCell>
                                <TableCell>
                                    <span className="font-medium text-primary">
                                        {appCurrency.symbol}{Number(member.contribution_amount).toFixed(2)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {member.nextContributionDate && 
                                        <span className="text-gray-600">
                                            {format(member.nextContributionDate, 'MMM dd, yyyy')}
                                        </span>
                                    }
                                </TableCell>
                            </TableRow>
                        ))}
                        {contributions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                                    No matching contributions found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Upcoming Contributions</h2>
                    <div className="flex items-center gap-4 min-w-[400px]">
                        <Input
                            type="search"
                            placeholder="Search by member name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Total Upcoming</div>
                        <div className="text-xl font-semibold text-gray-900">
                            {appCurrency.symbol}{calculateTotalContributions(upcomingContributions).toFixed(2)}
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Monthly Total</div>
                        <div className="text-xl font-semibold text-gray-900">
                            {appCurrency.symbol}{calculateTotalContributions(monthlyContributions).toFixed(2)}
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Quarterly Total</div>
                        <div className="text-xl font-semibold text-gray-900">
                            {appCurrency.symbol}{calculateTotalContributions(quarterlyContributions).toFixed(2)}
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Annual Total</div>
                        <div className="text-xl font-semibold text-gray-900">
                            {appCurrency.symbol}{calculateTotalContributions(annualContributions).toFixed(2)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {monthlyContributions.length > 0 && (
                    <ContributionTable contributions={monthlyContributions} title="Monthly Contributions" />
                )}
                {quarterlyContributions.length > 0 && (
                    <ContributionTable contributions={quarterlyContributions} title="Quarterly Contributions" />
                )}
                {annualContributions.length > 0 && (
                    <ContributionTable contributions={annualContributions} title="Annual Contributions" />
                )}
                {upcomingContributions.length === 0 && (
                    <div className="text-center text-muted-foreground py-12 bg-gray-50 rounded-lg">
                        No upcoming contributions found
                    </div>
                )}
            </div>
        </div>
    );
} 