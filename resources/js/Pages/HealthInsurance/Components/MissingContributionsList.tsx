import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { format, addMonths, addQuarters, addYears, isBefore, isAfter, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { Plus, Table as TableIcon, Calendar } from 'lucide-react';
import AddContributionDialog from './AddContributionDialog';
import { Tabs, TabsList, TabsTrigger } from '@/Components/ui/tabs';

interface Member {
    id: string;
    name: string;
    date_of_birth: string;
    gender: string;
    contact_number: string;
    address: string;
    membership_start_date: string;
    contribution_amount: number;
    contribution_frequency: string;
    status: string;
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
    onContributionAdded: (contribution: any) => void;
}

export default function MissingContributionsList({ members, contributions, appCurrency, onContributionAdded }: Props) {
    const [isAddContributionOpen, setIsAddContributionOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [viewMode, setViewMode] = useState<'summary' | 'calendar'>('summary');

    const getExpectedContributionDates = (member: Member) => {
        const startDate = new Date(member.membership_start_date);
        const today = new Date();
        const dates: Date[] = [];
        let currentDate = startDate;

        while (isBefore(currentDate, today)) {
            dates.push(new Date(currentDate));
            
            switch (member.contribution_frequency) {
                case 'monthly':
                    currentDate = addMonths(currentDate, 1);
                    break;
                case 'quarterly':
                    currentDate = addQuarters(currentDate, 1);
                    break;
                case 'annually':
                    currentDate = addYears(currentDate, 1);
                    break;
            }
        }

        return dates;
    };

    const getMissingContributions = (member: Member) => {
        const expectedDates = getExpectedContributionDates(member);
        const memberContributions = contributions.filter(c => c.member_id === member.id);
        
        return expectedDates.filter(expectedDate => {
            const hasContribution = memberContributions.some(contribution => {
                const contributionDate = new Date(contribution.payment_date);
                return (
                    contributionDate.getMonth() === expectedDate.getMonth() &&
                    contributionDate.getFullYear() === expectedDate.getFullYear()
                );
            });
            return !hasContribution;
        });
    };

    const handleAddContribution = (member: Member) => {
        setSelectedMember(member);
        setIsAddContributionOpen(true);
    };

    const membersWithMissingContributions = members
        .map(member => ({
            ...member,
            missingContributions: getMissingContributions(member)
        }))
        .filter(member => member.missingContributions.length > 0)
        .sort((a, b) => b.missingContributions.length - a.missingContributions.length);

    const renderSummaryView = () => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Member Name</TableHead>
                    <TableHead>Contribution Frequency</TableHead>
                    <TableHead>Expected Amount</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Missing Contributions</TableHead>
                    <TableHead>Total Due</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {membersWithMissingContributions.map((member) => (
                    <TableRow key={member.id}>
                        <TableCell className="font-medium">
                            {member.name}
                        </TableCell>
                        <TableCell className="capitalize">
                            {member.contribution_frequency}
                        </TableCell>
                        <TableCell>
                            {appCurrency.symbol}{Number(member.contribution_amount).toFixed(2)}
                        </TableCell>
                        <TableCell>
                            {format(new Date(member.membership_start_date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <span className="text-red-600 font-medium">
                                    {member.missingContributions.length} payments
                                </span>
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => setViewMode('calendar')}
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    View Details
                                </Button>
                            </div>
                        </TableCell>
                        <TableCell className="font-medium text-red-600">
                            {appCurrency.symbol}{(Number(member.contribution_amount) * member.missingContributions.length).toFixed(2)}
                        </TableCell>
                        <TableCell>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAddContribution(member)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Contribution
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    const renderCalendarView = () => {
        // Get all months from the earliest membership start date to current month
        const earliestStartDate = new Date(Math.min(...members.map(m => new Date(m.membership_start_date).getTime())));
        const months = eachMonthOfInterval({
            start: startOfMonth(earliestStartDate),
            end: endOfMonth(new Date())
        });

        return (
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="sticky left-0 bg-white">Member Name</TableHead>
                            {months.map(month => (
                                <TableHead key={month.toISOString()} className="min-w-[120px]">
                                    {format(month, 'MMM yyyy')}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {membersWithMissingContributions.map((member) => (
                            <TableRow key={member.id}>
                                <TableCell className="font-medium sticky left-0 bg-white">
                                    {member.name}
                                </TableCell>
                                {months.map(month => {
                                    const hasContribution = member.missingContributions.some(
                                        date => date.getMonth() === month.getMonth() && 
                                               date.getFullYear() === month.getFullYear()
                                    );
                                    const isBeforeStart = isBefore(month, new Date(member.membership_start_date));
                                    
                                    return (
                                        <TableCell 
                                            key={month.toISOString()}
                                            className={`text-center ${hasContribution ? 'text-red-600 font-medium' : 'text-green-600'} ${isBeforeStart ? 'bg-gray-50' : ''}`}
                                        >
                                            {!isBeforeStart && (
                                                <>
                                                    {hasContribution ? (
                                                        <div className="space-y-1">
                                                            <div className="text-red-600">
                                                                {appCurrency.symbol}{Number(member.contribution_amount).toFixed(2)}
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleAddContribution(member)}
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-1">
                                                            <div>
                                                                {appCurrency.symbol}{Number(member.contribution_amount).toFixed(2)}
                                                            </div>
                                                            <div className="text-green-600">✓</div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'summary' | 'calendar')}>
                    <TabsList>
                        <TabsTrigger value="summary">
                            <TableIcon className="h-4 w-4 mr-2" />
                            Summary
                        </TabsTrigger>
                        <TabsTrigger value="calendar">
                            <Calendar className="h-4 w-4 mr-2" />
                            Calendar
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="rounded-md border">
                {viewMode === 'summary' ? renderSummaryView() : renderCalendarView()}
            </div>

            <AddContributionDialog
                open={isAddContributionOpen}
                onOpenChange={setIsAddContributionOpen}
                members={members}
                appCurrency={appCurrency}
                onContributionAdded={onContributionAdded}
                selectedMember={selectedMember}
            />
        </div>
    );
} 