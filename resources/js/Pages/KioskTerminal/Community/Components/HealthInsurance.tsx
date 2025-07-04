import React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { Progress } from '@/Components/ui/progress';
import { format } from 'date-fns';
import {
    DollarSign,
    RefreshCw,
    CreditCard,
} from 'lucide-react';

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
}

interface Contribution {
    member_id: string;
    amount: number;
    selected: boolean;
}

interface HealthInsuranceProps {
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
}

export default function HealthInsurance({
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
    onMemberAmountChange
}: HealthInsuranceProps) {
    return (
        <>
            <style>{`
                [data-radix-checkbox] {
                    border-color: #d1d5db !important;
                    background-color: white !important;
                }
                [data-radix-checkbox][data-state="checked"] {
                    background-color: #16a34a !important;
                    border-color: #16a34a !important;
                }
                [data-radix-checkbox][data-state="checked"] svg {
                    color: white !important;
                    stroke: white !important;
                    fill: white !important;
                }
                [data-radix-checkbox] svg {
                    color: transparent !important;
                    stroke: transparent !important;
                    fill: transparent !important;
                }
            `}</style>
            <Card className="border-2">
            <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                    <DollarSign className="w-8 h-8" />
                    Health Insurance Contributions
                </CardTitle>
                <CardDescription className="text-lg">Submit contributions for health insurance members</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Search and Filter */}
                <div className="flex gap-6">
                    <div className="flex-1">
                        <Label className="text-lg font-semibold mb-3 block">Search Members</Label>
                        <Input
                            placeholder="Search by name or contact number..."
                            value={memberSearchQuery}
                            onChange={(e) => setMemberSearchQuery(e.target.value)}
                            className="h-12 text-lg px-4"
                        />
                    </div>
                    <div className="w-64">
                        <Label className="text-lg font-semibold mb-3 block">Filter by Group</Label>
                        <Select value={filterGroup} onValueChange={setFilterGroup}>
                            <SelectTrigger className="h-12 text-lg">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {groups.map((group) => (
                                    <SelectItem key={group} value={group} className="text-lg py-3">
                                        {group === 'all' ? 'All Groups' : group}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Contribution Form */}
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <Label className="text-lg font-semibold mb-3 block">Payment Date</Label>
                        <Input
                            type="date"
                            value={contributionData.payment_date}
                            onChange={(e) => setContributionData((prev: any) => ({ ...prev, payment_date: e.target.value }))}
                            className="h-12 text-lg px-4"
                        />
                    </div>
                    <div>
                        <Label className="text-lg font-semibold mb-3 block">Payment Method</Label>
                        <Select value={contributionData.payment_method} onValueChange={(value) => setContributionData((prev: any) => ({ ...prev, payment_method: value }))}>
                            <SelectTrigger className="h-12 text-lg">
                                <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cash" className="text-lg py-3">Cash</SelectItem>
                                <SelectItem value="bank_transfer" className="text-lg py-3">Bank Transfer</SelectItem>
                                <SelectItem value="check" className="text-lg py-3">Check</SelectItem>
                                <SelectItem value="mobile_money" className="text-lg py-3">Mobile Money</SelectItem>
                                <SelectItem value="other" className="text-lg py-3">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="text-lg font-semibold mb-3 block">Reference Number</Label>
                        <Input
                            placeholder="Optional reference number"
                            value={contributionData.reference_number}
                            onChange={(e) => setContributionData((prev: any) => ({ ...prev, reference_number: e.target.value }))}
                            className="h-12 text-lg px-4"
                        />
                    </div>
                    <div>
                        <Label className="text-lg font-semibold mb-3 block">Bulk Amount ({appCurrency.symbol})</Label>
                        <Input
                            type="number"
                            placeholder="Enter amount for all selected"
                            value={contributionData.bulk_amount}
                            onChange={(e) => onBulkAmountChange(e.target.value)}
                            className="h-12 text-lg px-4"
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
                                className="w-6 h-6"
                            />
                            <Label htmlFor="select-all" className="text-lg font-semibold">Select All</Label>
                        </div>
                    </div>

                    {processing && (
                        <div className="space-y-3">
                            <div className="flex justify-between text-lg font-semibold">
                                <span>Processing contributions...</span>
                                <span>{processingProgress.current}/{processingProgress.total}</span>
                            </div>
                            <Progress value={(processingProgress.current / processingProgress.total) * 100} className="h-3" />
                        </div>
                    )}

                    <div className="border-2 rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">Select</th>
                                        <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">Name</th>
                                        <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">Contact</th>
                                        <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">Group</th>
                                        <th className="px-6 py-4 text-left text-lg font-semibold text-gray-700">Amount ({appCurrency.symbol})</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredMembers.map((member) => {
                                        const contribution = memberContributions.find(c => c.member_id === member.id);
                                        return (
                                            <tr key={member.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <Checkbox
                                                        checked={contribution?.selected || false}
                                                        onCheckedChange={(checked) => onMemberSelection(member.id, checked as boolean)}
                                                        className="w-6 h-6"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 text-lg font-medium">{member.name}</td>
                                                <td className="px-6 py-4 text-lg">{member.contact_number}</td>
                                                <td className="px-6 py-4 text-lg">{member.group || '-'}</td>
                                                <td className="px-6 py-4">
                                                    <Input
                                                        type="number"
                                                        value={contribution?.amount || 0}
                                                        onChange={(e) => onMemberAmountChange(member.id, e.target.value)}
                                                        className="w-32 h-10 text-lg"
                                                        disabled={!contribution?.selected}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <Button 
                            onClick={onSubmit} 
                            disabled={processing || memberContributions.filter(c => c.selected).length === 0}
                            className="min-w-[300px] h-14 text-xl px-8 !bg-blue-600 hover:!bg-blue-700 !text-white disabled:!bg-gray-400 disabled:!text-gray-200"
                        >
                            {processing ? (
                                <>
                                    <RefreshCw className="w-6 h-6 mr-3 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="w-6 h-6 mr-3" />
                                    Submit Contributions
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
        </>
    );
} 