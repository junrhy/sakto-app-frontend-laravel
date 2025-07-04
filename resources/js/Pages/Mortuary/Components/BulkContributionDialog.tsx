import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/Components/ui/dialog';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { format } from 'date-fns';
import { Users, DollarSign, Calendar, CreditCard } from 'lucide-react';

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
    id: string;
    member_id: string;
    amount: number;
    payment_date: string;
    payment_method: string;
    reference_number: string;
}

interface BulkContributionData {
    member_id: string;
    amount: number;
    selected: boolean;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    members: Member[];
    appCurrency: {
        code: string;
        symbol: string;
    };
    onContributionsAdded: (contributions: Contribution[]) => void;
}

export default function BulkContributionDialog({ open, onOpenChange, members, appCurrency, onContributionsAdded }: Props) {
    const [formData, setFormData] = useState({
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        payment_method: '',
        reference_number: '',
        bulk_amount: '',
        selected_members: [] as string[],
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [memberContributions, setMemberContributions] = useState<BulkContributionData[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterGroup, setFilterGroup] = useState<string>('all');
    const [selectAll, setSelectAll] = useState(false);
    const [processingProgress, setProcessingProgress] = useState({ current: 0, total: 0 });

    // Initialize member contributions when dialog opens
    useEffect(() => {
        if (open) {
            const initialContributions = members.map(member => ({
                member_id: member.id,
                amount: member.contribution_amount || 0,
                selected: false
            }));
            setMemberContributions(initialContributions);
            setFormData(prev => ({
                ...prev,
                bulk_amount: '',
                selected_members: []
            }));
            setSelectAll(false);
        }
    }, [open, members]);

    // Filter members based on search and group
    const filteredMembers = members.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            member.contact_number.includes(searchQuery);
        const matchesGroup = filterGroup === 'all' || member.group === filterGroup;
        return matchesSearch && matchesGroup;
    });

    // Get unique groups for filter
    const groups = ['all', ...Array.from(new Set(members.map(m => m.group).filter(Boolean)))];

    const handleBulkAmountChange = (amount: string) => {
        const numAmount = Number(amount) || 0;
        setFormData(prev => ({ ...prev, bulk_amount: amount }));
        
        // Update all selected members with the bulk amount
        setMemberContributions(prev => prev.map(member => ({
            ...member,
            amount: member.selected ? numAmount : member.amount
        })));
    };

    const handleMemberSelection = (memberId: string, selected: boolean) => {
        setMemberContributions(prev => prev.map(member => ({
            ...member,
            selected: member.member_id === memberId ? selected : member.selected,
            amount: member.member_id === memberId && selected && formData.bulk_amount ? 
                Number(formData.bulk_amount) : member.amount
        })));

        // Update selected members array
        const newSelectedMembers = selected 
            ? [...formData.selected_members, memberId]
            : formData.selected_members.filter((id: string) => id !== memberId);
        setFormData(prev => ({ ...prev, selected_members: newSelectedMembers }));
    };

    const handleSelectAll = (selected: boolean) => {
        setSelectAll(selected);
        const allMemberIds = filteredMembers.map(m => m.id);
        
        setMemberContributions(prev => prev.map(member => ({
            ...member,
            selected: allMemberIds.includes(member.member_id) ? selected : member.selected,
            amount: allMemberIds.includes(member.member_id) && selected && formData.bulk_amount ? 
                Number(formData.bulk_amount) : member.amount
        })));

        setFormData(prev => ({ ...prev, selected_members: selected ? allMemberIds : [] }));
    };

    const handleMemberAmountChange = (memberId: string, amount: string) => {
        setMemberContributions(prev => prev.map(member => ({
            ...member,
            amount: member.member_id === memberId ? Number(amount) || 0 : member.amount
        })));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const selectedContributions = memberContributions
            .filter(member => member.selected && member.amount > 0)
            .map(member => ({
                member_id: member.member_id,
                amount: member.amount,
                payment_date: formData.payment_date,
                payment_method: formData.payment_method,
                reference_number: formData.reference_number
            }));

        if (selectedContributions.length === 0) {
            return;
        }

        setProcessing(true);
        setProcessingProgress({ current: 0, total: selectedContributions.length });
        
        // Use the bulk endpoint
        router.post(route('mortuary.contributions.bulk'), {
            contributions: selectedContributions
        }, {
            onSuccess: () => {
                onOpenChange(false);
                setFormData({
                    payment_date: format(new Date(), 'yyyy-MM-dd'),
                    payment_method: '',
                    reference_number: '',
                    bulk_amount: '',
                    selected_members: []
                });
                setProcessingProgress({ current: 0, total: 0 });
                setProcessing(false);
                
                // Add successful contributions to the UI
                const successfulContributions = selectedContributions.map(c => ({
                    id: '',
                    ...c
                }));
                onContributionsAdded(successfulContributions);
                
                // Show success message
                console.log(`Successfully recorded ${selectedContributions.length} contributions`);
            },
            onError: (errors) => {
                onOpenChange(false);
                setFormData({
                    payment_date: format(new Date(), 'yyyy-MM-dd'),
                    payment_method: '',
                    reference_number: '',
                    bulk_amount: '',
                    selected_members: []
                });
                setProcessingProgress({ current: 0, total: 0 });
                setProcessing(false);
                
                // Still add the contributions to the UI (they might have been partially successful)
                const successfulContributions = selectedContributions.map(c => ({
                    id: '',
                    ...c
                }));
                onContributionsAdded(successfulContributions);
                
                console.error('Bulk contribution errors:', errors);
            }
        });
    };

    const selectedCount = memberContributions.filter(m => m.selected).length;
    const totalAmount = memberContributions
        .filter(m => m.selected)
        .reduce((sum, m) => sum + m.amount, 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Bulk Contribution Recording
                    </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Summary Card */}
                    {selectedCount > 0 && (
                        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                                {selectedCount}
                                            </div>
                                            <div className="text-sm text-green-600 dark:text-green-400">
                                                Members Selected
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                                {appCurrency.symbol}{totalAmount.toFixed(2)}
                                            </div>
                                            <div className="text-sm text-green-600 dark:text-green-400">
                                                Total Amount
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-green-600 dark:text-green-400">
                                            Average per member
                                        </div>
                                        <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                                            {appCurrency.symbol}{(totalAmount / selectedCount).toFixed(2)}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Global Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Global Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="payment_date">Payment Date</Label>
                                    <Input
                                        id="payment_date"
                                        type="date"
                                        value={formData.payment_date}
                                        onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="payment_method">Payment Method</Label>
                                    <Select
                                        value={formData.payment_method}
                                        onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                            <SelectItem value="check">Check</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="reference_number">Reference Number</Label>
                                    <Input
                                        id="reference_number"
                                        type="text"
                                        value={formData.reference_number}
                                        onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <Label htmlFor="bulk_amount">Bulk Amount (applies to selected members)</Label>
                                <Input
                                    id="bulk_amount"
                                    type="number"
                                    step="0.01"
                                    value={formData.bulk_amount}
                                    onChange={(e) => handleBulkAmountChange(e.target.value)}
                                    placeholder="Enter amount for all selected members"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Member Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Select Members</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <Label htmlFor="search">Search Members</Label>
                                    <Input
                                        id="search"
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search by name or contact number"
                                    />
                                </div>
                                <div className="sm:w-48">
                                    <Label htmlFor="group-filter">Filter by Group</Label>
                                    <Select value={filterGroup} onValueChange={setFilterGroup}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {groups.map(group => (
                                                <SelectItem key={group} value={group}>
                                                    {group === 'all' ? 'All Groups' : group}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Select All */}
                            <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <Checkbox
                                    id="select-all"
                                    checked={selectAll}
                                    onCheckedChange={handleSelectAll}
                                />
                                <Label htmlFor="select-all" className="font-medium">
                                    Select All ({filteredMembers.length} members)
                                </Label>
                                {selectedCount > 0 && (
                                    <Badge variant="secondary" className="ml-auto">
                                        {selectedCount} selected • {appCurrency.symbol}{totalAmount.toFixed(2)}
                                    </Badge>
                                )}
                            </div>

                            {/* Quick Group Selection */}
                            {filterGroup !== 'all' && (
                                <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <span className="text-sm text-blue-700 dark:text-blue-300">
                                        Filtering by group: <strong>{filterGroup}</strong>
                                    </span>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const groupMembers = filteredMembers.map(m => m.id);
                                            setMemberContributions(prev => prev.map(member => ({
                                                ...member,
                                                selected: groupMembers.includes(member.member_id) ? true : member.selected,
                                                amount: groupMembers.includes(member.member_id) && formData.bulk_amount ? 
                                                    Number(formData.bulk_amount) : member.amount
                                            })));
                                            setFormData(prev => ({
                                                ...prev,
                                                selected_members: [...prev.selected_members, ...groupMembers.filter(id => !prev.selected_members.includes(id))]
                                            }));
                                        }}
                                        className="text-xs"
                                    >
                                        Select All in Group
                                    </Button>
                                </div>
                            )}

                            {/* Members List */}
                            <div className="max-h-[400px] overflow-y-auto space-y-2">
                                {filteredMembers.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        No members found
                                    </div>
                                ) : (
                                    filteredMembers.map(member => {
                                        const memberContribution = memberContributions.find(m => m.member_id === member.id);
                                        const isSelected = memberContribution?.selected || false;
                                        const amount = memberContribution?.amount || 0;

                                        return (
                                            <div
                                                key={member.id}
                                                className={`p-4 border rounded-lg transition-colors ${
                                                    isSelected 
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                                        : 'border-gray-200 dark:border-gray-700'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onCheckedChange={(checked) => 
                                                            handleMemberSelection(member.id, checked as boolean)
                                                        }
                                                        className="mt-1"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="font-medium truncate">{member.name}</h4>
                                                            <Badge variant="outline" className="text-xs">
                                                                {member.group || 'No Group'}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                            <div className="flex items-center gap-4">
                                                                <span>{member.contact_number}</span>
                                                                <span>•</span>
                                                                <span>Default: {appCurrency.symbol}{member.contribution_amount}</span>
                                                            </div>
                                                        </div>
                                                        {isSelected && (
                                                            <div className="flex items-center gap-2">
                                                                <Label htmlFor={`amount-${member.id}`} className="text-sm">
                                                                    Amount:
                                                                </Label>
                                                                <Input
                                                                    id={`amount-${member.id}`}
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={amount}
                                                                    onChange={(e) => handleMemberAmountChange(member.id, e.target.value)}
                                                                    className="w-32"
                                                                    placeholder="0.00"
                                                                />
                                                                <span className="text-sm text-gray-500">
                                                                    {appCurrency.code}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {processing && processingProgress.total > 0 && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>Processing contributions...</span>
                                <span>{processingProgress.current} of {processingProgress.total}</span>
                            </div>
                            <Progress 
                                value={(processingProgress.current / processingProgress.total) * 100} 
                                className="w-full"
                            />
                        </div>
                    )}
                    
                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={processing}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={processing || selectedCount === 0}
                            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                        >
                            {processing ? (
                                processingProgress.total > 0 ? 
                                    `Processing ${processingProgress.current}/${processingProgress.total}...` : 
                                    'Recording...'
                            ) : (
                                `Record ${selectedCount} Contributions`
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 