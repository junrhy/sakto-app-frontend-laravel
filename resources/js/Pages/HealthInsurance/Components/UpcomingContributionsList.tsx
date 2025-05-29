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
        <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member Name</TableHead>
                            <TableHead>Contribution Amount</TableHead>
                            <TableHead>Next Contribution Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contributions.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell>{member.name}</TableCell>
                                <TableCell>
                                    {appCurrency.symbol}{Number(member.contribution_amount).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    {member.nextContributionDate && 
                                        format(member.nextContributionDate, 'MMM dd, yyyy')}
                                </TableCell>
                            </TableRow>
                        ))}
                        {contributions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center text-muted-foreground">
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
            <div className="flex items-center gap-4">
                <Input
                    type="search"
                    placeholder="Search by member name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />
            </div>
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
                <div className="text-center text-muted-foreground py-8">
                    No upcoming contributions found
                </div>
            )}
        </div>
    );
} 