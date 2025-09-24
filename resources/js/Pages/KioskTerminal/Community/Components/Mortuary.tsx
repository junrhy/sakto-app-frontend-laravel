import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Progress } from '@/Components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { format } from 'date-fns';
import { CreditCard, RefreshCw } from 'lucide-react';
import { useMemo } from 'react';

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
    group: string;
    latest_contribution_amount?: number;
    latest_contribution_date?: string;
    total_contribution?: number;
}

interface Contribution {
    member_id: string;
    amount: number;
    selected: boolean;
}

// Helper function to format date in Manila timezone
const formatManilaTime = (dateString: string) => {
    const date = new Date(dateString);
    const manilaTime = new Date(
        date.toLocaleString('en-US', { timeZone: 'Asia/Manila' }),
    );
    return format(manilaTime, 'MMM dd, yyyy h:mm a');
};

interface MortuaryProps {
    auth: {
        user: any;
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        };
    };
    members: Member[];
    contributionData: any;
    setContributionData: (data: any) => void;
    memberContributions: Contribution[];
    setMemberContributions: (contributions: Contribution[]) => void;
    memberSearchQuery: string;
    setMemberSearchQuery: (query: string) => void;
    filterGroup: string;
    setFilterGroup: (group: string) => void;
    selectAll: boolean;
    setSelectAll: (select: boolean) => void;
    groups: string[];
    filteredMembers: Member[];
    processing: boolean;
    processingProgress: { current: number; total: number };
    appCurrency: { code: string; symbol: string };
    onSubmit: () => void;
    onBulkAmountChange: (amount: string) => void;
    onMemberSelection: (memberId: string, selected: boolean) => void;
    onSelectAll: (selected: boolean) => void;
    onMemberAmountChange: (memberId: string, amount: string) => void;
    onRefreshData?: () => void;
}

export default function Mortuary({
    auth,
    members,
    contributionData,
    setContributionData,
    memberContributions,
    memberSearchQuery,
    setMemberSearchQuery,
    filterGroup,
    setFilterGroup,
    selectAll,
    groups,
    filteredMembers,
    processing,
    processingProgress,
    appCurrency,
    onSubmit,
    onBulkAmountChange,
    onMemberSelection,
    onSelectAll,
    onMemberAmountChange,
    onRefreshData,
}: MortuaryProps) {
    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        return auth.user.is_admin || false;
    }, [auth.selectedTeamMember, auth.user?.is_admin]);

    return (
        <>
            <style>{`
                /* Checkbox styling - simple color change */
                [data-radix-checkbox] {
                    background-color: white !important;
                    border: 2px solid #d1d5db !important;
                }
                
                [data-radix-checkbox][data-state="checked"] {
                    background-color: #3b82f6 !important;
                    border-color: #3b82f6 !important;
                }
                
                /* Submit button text color fix */
                .submit-button {
                    color: white !important;
                }
                .submit-button:hover {
                    color: white !important;
                }
                .submit-button:not(:disabled) {
                    color: white !important;
                }
                .submit-button:not(:disabled):hover {
                    color: white !important;
                }
            `}</style>
            <Card className="border-2">
                <CardHeader className="pb-6"></CardHeader>
                <CardContent className="space-y-8">
                    {/* Submit Button Card */}
                    <Card className="border-2 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <CardContent className="p-6">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <h3 className="mb-2 text-xl font-bold text-gray-800 lg:text-2xl">
                                        Submit Contributions
                                    </h3>
                                    <p className="text-gray-600">
                                        Review and submit the selected member
                                        contributions
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3 sm:flex-row">
                                    {onRefreshData && (
                                        <Button
                                            onClick={onRefreshData}
                                            variant="outline"
                                            className="h-12 px-6 text-lg"
                                        >
                                            <RefreshCw className="mr-2 h-5 w-5" />
                                            Refresh
                                        </Button>
                                    )}
                                    {canEdit && (
                                        <Button
                                            onClick={onSubmit}
                                            disabled={processing}
                                            className="submit-button h-12 min-w-[200px] transform rounded-xl border-0 !bg-gradient-to-r !from-indigo-600 !to-purple-600 px-8 text-lg font-bold !text-white shadow-lg transition-all duration-200 hover:scale-105 hover:!from-indigo-700 hover:!to-purple-700 hover:!text-white hover:shadow-xl disabled:transform-none disabled:!bg-gray-400 disabled:!text-gray-200 disabled:shadow-none"
                                            type="button"
                                        >
                                            {processing ? (
                                                <>
                                                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CreditCard className="mr-2 h-5 w-5" />
                                                    Submit
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Search, Filter, and Bulk Amount */}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
                        <div>
                            <Label className="mb-3 block text-lg font-semibold">
                                Search Members
                            </Label>
                            <Input
                                placeholder="Search by name or contact number..."
                                value={memberSearchQuery}
                                onChange={(e) =>
                                    setMemberSearchQuery(e.target.value)
                                }
                                className="h-12 px-4 text-lg"
                            />
                        </div>
                        <div>
                            <Label className="mb-3 block text-lg font-semibold">
                                Filter by Group
                            </Label>
                            <Select
                                value={filterGroup}
                                onValueChange={setFilterGroup}
                            >
                                <SelectTrigger className="h-12 text-lg">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {groups.map((group) => (
                                        <SelectItem
                                            key={group}
                                            value={group}
                                            className="py-3 text-lg"
                                        >
                                            {group === 'all'
                                                ? 'All Groups'
                                                : group}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label className="mb-3 block text-lg font-semibold">
                                Bulk Amount ({appCurrency.symbol})
                            </Label>
                            <Input
                                type="number"
                                placeholder="Enter amount for all selected"
                                value={contributionData.bulk_amount}
                                onChange={(e) =>
                                    onBulkAmountChange(e.target.value)
                                }
                                className="h-12 px-4 text-lg"
                                disabled={!canEdit}
                            />
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-semibold">Members</h3>
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    checked={selectAll}
                                    onCheckedChange={onSelectAll}
                                    id="select-all"
                                    className="h-6 w-6"
                                    disabled={!canEdit}
                                />
                                <Label
                                    htmlFor="select-all"
                                    className="text-lg font-semibold"
                                >
                                    Select All
                                </Label>
                            </div>
                        </div>

                        {processing && (
                            <div className="space-y-3">
                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Processing contributions...</span>
                                    <span>
                                        {processingProgress.current}/
                                        {processingProgress.total}
                                    </span>
                                </div>
                                <Progress
                                    value={
                                        (processingProgress.current /
                                            processingProgress.total) *
                                        100
                                    }
                                    className="h-3"
                                />
                            </div>
                        )}

                        <div className="rounded-lg border-2">
                            <div className="max-h-[500px] overflow-x-auto overflow-y-auto">
                                <table className="w-full min-w-[800px]">
                                    <thead className="sticky top-0 z-10 bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-4 text-left text-base font-semibold text-gray-700 lg:px-6 lg:text-lg">
                                                Select
                                            </th>
                                            <th className="px-3 py-4 text-left text-base font-semibold text-gray-700 lg:px-6 lg:text-lg">
                                                Name
                                            </th>
                                            <th className="px-3 py-4 text-left text-base font-semibold text-gray-700 lg:px-6 lg:text-lg">
                                                Latest Contribution
                                            </th>
                                            <th className="px-3 py-4 text-left text-base font-semibold text-gray-700 lg:px-6 lg:text-lg">
                                                Total Contribution
                                            </th>
                                            <th className="px-3 py-4 text-left text-base font-semibold text-gray-700 lg:px-6 lg:text-lg">
                                                Group
                                            </th>
                                            <th className="px-3 py-4 text-left text-base font-semibold text-gray-700 lg:px-6 lg:text-lg">
                                                Amount ({appCurrency.symbol})
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredMembers.map((member) => {
                                            const contribution =
                                                memberContributions.find(
                                                    (c) =>
                                                        c.member_id ===
                                                        member.id,
                                                );
                                            return (
                                                <tr
                                                    key={member.id}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="px-3 py-4 lg:px-6">
                                                        <Checkbox
                                                            checked={
                                                                contribution?.selected ||
                                                                false
                                                            }
                                                            onCheckedChange={(
                                                                checked,
                                                            ) =>
                                                                onMemberSelection(
                                                                    member.id,
                                                                    checked as boolean,
                                                                )
                                                            }
                                                            className="h-5 w-5 lg:h-6 lg:w-6"
                                                            disabled={!canEdit}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-4 text-base font-medium lg:px-6 lg:text-lg">
                                                        {member.name}
                                                    </td>
                                                    <td className="px-3 py-4 text-base lg:px-6 lg:text-lg">
                                                        {member.latest_contribution_amount ? (
                                                            <div>
                                                                <div className="font-medium">
                                                                    {
                                                                        appCurrency.symbol
                                                                    }
                                                                    {
                                                                        member.latest_contribution_amount
                                                                    }
                                                                </div>
                                                                <div className="text-xs text-gray-500 lg:text-sm">
                                                                    {member.latest_contribution_date
                                                                        ? formatManilaTime(
                                                                              member.latest_contribution_date,
                                                                          )
                                                                        : 'N/A'}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400">
                                                                No contributions
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-4 text-base lg:px-6 lg:text-lg">
                                                        {member.total_contribution ? (
                                                            <span className="font-medium">
                                                                {
                                                                    appCurrency.symbol
                                                                }
                                                                {
                                                                    member.total_contribution
                                                                }
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-400">
                                                                ₱0
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-4 text-base lg:px-6 lg:text-lg">
                                                        {member.group || '-'}
                                                    </td>
                                                    <td className="px-3 py-4 lg:px-6">
                                                        <Input
                                                            type="number"
                                                            value={
                                                                contribution?.amount ||
                                                                0
                                                            }
                                                            onChange={(e) =>
                                                                onMemberAmountChange(
                                                                    member.id,
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className={`h-8 w-24 text-base lg:h-10 lg:w-32 lg:text-lg ${
                                                                contribution?.amount &&
                                                                contribution.amount <
                                                                    member.contribution_amount
                                                                    ? 'border-red-500 focus:border-red-500'
                                                                    : ''
                                                            }`}
                                                            disabled={
                                                                !contribution?.selected ||
                                                                !canEdit
                                                            }
                                                            min={
                                                                member.contribution_amount
                                                            }
                                                            placeholder={`Min: ${appCurrency.symbol}${member.contribution_amount}`}
                                                        />
                                                        {contribution?.amount &&
                                                            contribution.amount <
                                                                member.contribution_amount && (
                                                                <p className="mt-1 text-xs text-red-500">
                                                                    Minimum:{' '}
                                                                    {
                                                                        appCurrency.symbol
                                                                    }
                                                                    {
                                                                        member.contribution_amount
                                                                    }
                                                                </p>
                                                            )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}
