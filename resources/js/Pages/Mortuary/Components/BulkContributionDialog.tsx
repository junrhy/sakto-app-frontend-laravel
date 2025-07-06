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
import { Users, DollarSign, Calendar, CreditCard, Expand, Minimize, Phone, MapPin, User } from 'lucide-react';

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
        
        // Validate required fields
        if (!formData.payment_method || formData.payment_method.trim() === '') {
            setErrors({ payment_method: 'Payment method is required' });
            console.log('Payment method validation failed:', formData.payment_method);
            return;
        }
        
        const selectedContributions = memberContributions
            .filter(member => member.selected && member.amount > 0)
            .map(member => ({
                member_id: member.member_id, // member_id is already a string in this interface
                amount: Number(member.amount),
                payment_date: formData.payment_date,
                payment_method: formData.payment_method,
                reference_number: formData.reference_number || ''
            }));

        if (selectedContributions.length === 0) {
            setErrors({ general: 'Please select at least one member with a valid amount' });
            return;
        }

        setErrors({});
        setProcessing(true);
        setProcessingProgress({ current: 0, total: selectedContributions.length });
        
        // Debug: Log the payload being sent
        console.log('Sending payload:', {
            contributions: selectedContributions
        });
        console.log('Payment method:', formData.payment_method);
        
        // Use fetch instead of Inertia router to handle JSON responses
        fetch(route('mortuary.contributions.bulk'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                contributions: selectedContributions
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Response received:', data);
            
            if (data.success) {
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
            } else {
                throw new Error(data.message || 'Failed to record contributions');
            }
        })
        .catch(error => {
            console.error('Bulk contribution error:', error);
            setProcessing(false);
            setProcessingProgress({ current: 0, total: 0 });
            
            // Show error message
            setErrors({ general: error.message || 'Failed to record contributions' });
        });
    };

    const selectedCount = memberContributions.filter(m => m.selected).length;
    const totalAmount = memberContributions
        .filter(m => m.selected)
        .reduce((sum, m) => sum + (Number(m.amount) || 0), 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[1400px] max-h-[90vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Bulk Contribution Recording
                    </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                        {/* Two Column Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Global Settings */}
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Global Settings</CardTitle>
                                    </CardHeader>
                                    {errors.general && (
                                        <div className="px-6 pb-3">
                                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                                <p className="text-sm text-red-700 dark:text-red-300">{errors.general}</p>
                                            </div>
                                        </div>
                                    )}
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <Label htmlFor="payment_date" className="text-sm">Payment Date</Label>
                                                <Input
                                                    id="payment_date"
                                                    type="date"
                                                    value={formData.payment_date}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                                                    className="h-9"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="payment_method" className="text-sm">
                                                    Payment Method <span className="text-red-500">*</span>
                                                </Label>
                                                <Select
                                                    value={formData.payment_method}
                                                    onValueChange={(value) => {
                                                        setFormData(prev => ({ ...prev, payment_method: value }));
                                                        if (errors.payment_method) {
                                                            setErrors(prev => {
                                                                const newErrors = { ...prev };
                                                                delete newErrors.payment_method;
                                                                return newErrors;
                                                            });
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className={`h-9 ${errors.payment_method ? 'border-red-500' : ''}`}>
                                                        <SelectValue placeholder="Select method" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="cash">Cash</SelectItem>
                                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                        <SelectItem value="check">Check</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.payment_method && (
                                                    <p className="text-xs text-red-500 mt-1">{errors.payment_method}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="reference_number" className="text-sm">Reference Number</Label>
                                                <Input
                                                    id="reference_number"
                                                    type="text"
                                                    value={formData.reference_number}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                                                    placeholder="Optional"
                                                    className="h-9"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="bulk_amount" className="text-sm">Bulk Amount</Label>
                                                <Input
                                                    id="bulk_amount"
                                                    type="number"
                                                    step="0.01"
                                                    value={formData.bulk_amount}
                                                    onChange={(e) => handleBulkAmountChange(e.target.value)}
                                                    placeholder="Amount for selected"
                                                    className="h-9"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Selected Members Section */}
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center justify-between">
                                            <span>Selected Members</span>
                                            {selectedCount > 0 && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {selectedCount} selected
                                                </Badge>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {selectedCount === 0 ? (
                                            <div className="text-center py-8 text-gray-500 text-sm">
                                                <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                                <p>No members selected</p>
                                                <p className="text-xs">Select members from the list on the right</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-1 max-h-[300px] overflow-y-auto">
                                                {memberContributions
                                                    .filter(member => member.selected)
                                                    .map(memberContribution => {
                                                        const member = members.find(m => m.id === memberContribution.member_id);
                                                        if (!member) return null;
                                                        
                                                        return (
                                                            <div
                                                                key={member.id}
                                                                className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                                                            >
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="font-medium text-sm truncate">{member.name}</h4>
                                                                        <Badge variant="outline" className="text-xs flex-shrink-0">
                                                                            {member.group || 'No Group'}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-right">
                                                                    <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                                                                        {appCurrency.symbol}{Number(memberContribution.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 w-16">
                                                                        {member.contribution_frequency}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        )}
                                        
                                        {selectedCount > 0 && (
                                            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="font-medium text-green-700 dark:text-green-300">Total Amount:</span>
                                                    <span className="font-bold text-green-700 dark:text-green-300">
                                                        {appCurrency.symbol}{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-green-600 dark:text-green-400 mt-1">
                                                    <span>Average per member:</span>
                                                    <span>{appCurrency.symbol}{(totalAmount / selectedCount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column - Member Selection */}
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Select Members</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Filters */}
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex-1">
                                                <Label htmlFor="search" className="text-sm">Search Members</Label>
                                                <Input
                                                    id="search"
                                                    type="text"
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    placeholder="Search by name or contact number"
                                                    className="h-9"
                                                />
                                            </div>
                                            <div className="sm:w-40">
                                                <Label htmlFor="group-filter" className="text-sm">Filter by Group</Label>
                                                <Select value={filterGroup} onValueChange={setFilterGroup}>
                                                    <SelectTrigger className="h-9">
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
                                        <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <Checkbox
                                                id="select-all"
                                                checked={selectAll}
                                                onCheckedChange={handleSelectAll}
                                            />
                                            <Label htmlFor="select-all" className="text-sm font-medium">
                                                Select All ({filteredMembers.length} members)
                                            </Label>
                                            {selectedCount > 0 && (
                                                <Badge variant="secondary" className="ml-auto text-xs">
                                                    {selectedCount} selected • {appCurrency.symbol}{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Quick Group Selection */}
                                        {filterGroup !== 'all' && (
                                            <div className="flex items-center space-x-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                <span className="text-xs text-blue-700 dark:text-blue-300">
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
                                                    className="text-xs h-7"
                                                >
                                                    Select All in Group
                                                </Button>
                                            </div>
                                        )}

                                        {/* Members List */}
                                        <div className="max-h-[500px] overflow-y-auto space-y-1">
                                            {filteredMembers.length === 0 ? (
                                                <div className="text-center py-6 text-gray-500 text-sm">
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
                                                            className={`p-3 border rounded-lg transition-colors ${
                                                                isSelected 
                                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                                                                    : 'border-gray-200 dark:border-gray-700'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <Checkbox
                                                                    checked={isSelected}
                                                                    onCheckedChange={(checked) => 
                                                                        handleMemberSelection(member.id, checked as boolean)
                                                                    }
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <h4 className="font-medium text-sm truncate">{member.name}</h4>
                                                                        <Badge variant="outline" className="text-xs">
                                                                            {member.group || 'No Group'}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                                        <span>{member.contact_number}</span>
                                                                        <span className="mx-2">•</span>
                                                                        <span>Default: {appCurrency.symbol}{member.contribution_amount}</span>
                                                                    </div>
                                                                    {isSelected && (
                                                                        <div className="flex items-center gap-2">
                                                                            <Label htmlFor={`amount-${member.id}`} className="text-xs">
                                                                                Amount:
                                                                            </Label>
                                                                            <Input
                                                                                id={`amount-${member.id}`}
                                                                                type="number"
                                                                                step="0.01"
                                                                                value={amount}
                                                                                onChange={(e) => handleMemberAmountChange(member.id, e.target.value)}
                                                                                className="w-24 h-7 text-xs"
                                                                                placeholder="0.00"
                                                                            />
                                                                            <span className="text-xs text-gray-500">
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
                            </div>
                        </div>
                    </div>

                    {processing && processingProgress.total > 0 && (
                        <div className="space-y-2 flex-shrink-0">
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
                    
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 flex-shrink-0 pt-4">
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
                            disabled={processing || selectedCount === 0 || !formData.payment_method}
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