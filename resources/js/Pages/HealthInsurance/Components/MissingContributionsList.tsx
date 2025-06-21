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
import { Plus, Table as TableIcon, Calendar, Search } from 'lucide-react';
import AddContributionDialog from './AddContributionDialog';
import { Tabs, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Input } from '@/Components/ui/input';

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
    const [searchQuery, setSearchQuery] = useState('');

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
                if (member.contribution_frequency === 'annually') {
                    return contributionDate.getFullYear() === expectedDate.getFullYear();
                }
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

    const filteredMembers = membersWithMissingContributions.filter(member => {
        const searchLower = searchQuery.toLowerCase();
        
        return (
            member.name.toLowerCase().includes(searchLower) ||
            member.contribution_frequency.toLowerCase().includes(searchLower) ||
            member.status.toLowerCase().includes(searchLower)
        );
    });

    const renderSummaryView = () => (
        <Table>
            <TableHeader>
                <TableRow className="dark:border-gray-700">
                    <TableHead className="dark:text-gray-300">Member Name</TableHead>
                    <TableHead className="dark:text-gray-300">Contribution Frequency</TableHead>
                    <TableHead className="dark:text-gray-300">Expected Amount</TableHead>
                    <TableHead className="dark:text-gray-300">Start Date</TableHead>
                    <TableHead className="dark:text-gray-300">Missing Contributions</TableHead>
                    <TableHead className="dark:text-gray-300">Total Due</TableHead>
                    <TableHead className="dark:text-gray-300">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredMembers.map((member) => (
                    <TableRow key={member.id} className="dark:border-gray-700">
                        <TableCell className="font-medium dark:text-gray-200">
                            {member.name}
                        </TableCell>
                        <TableCell className="capitalize dark:text-gray-300">
                            {member.contribution_frequency}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                            {appCurrency.symbol}{Number(member.contribution_amount).toFixed(2)}
                        </TableCell>
                        <TableCell className="dark:text-gray-300">
                            {format(new Date(member.membership_start_date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <span className="text-red-600 dark:text-red-400 font-medium">
                                    {member.missingContributions.length} payments
                                </span>
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => setViewMode('calendar')}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    View Details
                                </Button>
                            </div>
                        </TableCell>
                        <TableCell className="font-medium text-red-600 dark:text-red-400">
                            {appCurrency.symbol}{(Number(member.contribution_amount) * member.missingContributions.length).toFixed(2)}
                        </TableCell>
                        <TableCell>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAddContribution(member)}
                                className="dark:text-gray-300 dark:hover:text-gray-100"
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

        // Get all years for annual view
        const years = Array.from(
            new Set(
                months.map(month => month.getFullYear())
            )
        ).sort();

        // Group members by contribution frequency
        const monthlyMembers = filteredMembers.filter(m => m.contribution_frequency === 'monthly');
        const quarterlyMembers = filteredMembers.filter(m => m.contribution_frequency === 'quarterly');
        const annualMembers = filteredMembers.filter(m => m.contribution_frequency === 'annually');

        const renderMonthlyTable = (members: typeof filteredMembers, title: string) => {
            if (members.length === 0) return null;

            return (
                <div className="mb-8 p-4">
                    <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">{title}</h3>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="dark:border-gray-700">
                                    <TableHead className="sticky left-0 bg-white dark:bg-gray-900 dark:text-gray-300">Member Name</TableHead>
                                    {months.map(month => (
                                        <TableHead key={month.toISOString()} className="min-w-[120px] dark:text-gray-300">
                                            {format(month, 'MMM yyyy')}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map((member) => (
                                    <TableRow key={member.id} className="dark:border-gray-700">
                                        <TableCell className="font-medium sticky left-0 bg-white dark:bg-gray-900 dark:text-gray-200">
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
                                                    className={`text-center ${hasContribution ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'} ${isBeforeStart ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
                                                >
                                                    {!isBeforeStart && (
                                                        <>
                                                            {hasContribution ? (
                                                                <div className="space-y-1">
                                                                    <div></div>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-1">
                                                                    <div className="text-green-600 dark:text-green-400">✓</div>
                                                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                                                        {appCurrency.symbol}{Number(member.contribution_amount).toFixed(2)}
                                                                    </div>
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
                </div>
            );
        };

        const renderAnnualTable = (members: typeof filteredMembers) => {
            if (members.length === 0) return null;

            return (
                <div className="mb-8 p-4">
                    <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Annual Contributions</h3>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="dark:border-gray-700">
                                    <TableHead className="sticky left-0 bg-white dark:bg-gray-900 dark:text-gray-300">Member Name</TableHead>
                                    {years.map(year => (
                                        <TableHead key={year} className="min-w-[120px] dark:text-gray-300">
                                            {year}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {members.map((member) => (
                                    <TableRow key={member.id} className="dark:border-gray-700">
                                        <TableCell className="font-medium sticky left-0 bg-white dark:bg-gray-900 dark:text-gray-200">
                                            {member.name}
                                        </TableCell>
                                        {years.map(year => {
                                            const hasContribution = member.missingContributions.some(
                                                date => date.getFullYear() === year
                                            );
                                            const isBeforeStart = year < new Date(member.membership_start_date).getFullYear();
                                            
                                            return (
                                                <TableCell 
                                                    key={year}
                                                    className={`text-center ${hasContribution ? 'bg-red-100 dark:bg-red-900/20' : 'bg-green-100 dark:bg-green-900/20'} ${isBeforeStart ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
                                                >
                                                    {!isBeforeStart && (
                                                        <>
                                                            {hasContribution ? (
                                                                <div className="space-y-1">
                                                                    <div></div>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-1">
                                                                    <div className="text-green-600 dark:text-green-400">✓</div>
                                                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                                                        {appCurrency.symbol}{Number(member.contribution_amount).toFixed(2)}
                                                                    </div>
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
                </div>
            );
        };

        return (
            <div className="space-y-6 p-4">
                {renderMonthlyTable(monthlyMembers, 'Monthly Contributions')}
                {renderMonthlyTable(quarterlyMembers, 'Quarterly Contributions')}
                {renderAnnualTable(annualMembers)}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground dark:text-gray-400" />
                    <Input
                        placeholder="Search members..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
                    />
                </div>
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'summary' | 'calendar')}>
                    <TabsList className="dark:bg-gray-800">
                        <TabsTrigger 
                            value="summary"
                            className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100"
                        >
                            <TableIcon className="h-4 w-4 mr-2" />
                            Summary
                        </TabsTrigger>
                        <TabsTrigger 
                            value="calendar"
                            className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-100"
                        >
                            <Calendar className="h-4 w-4 mr-2" />
                            Calendar
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="rounded-md border dark:border-gray-700">
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