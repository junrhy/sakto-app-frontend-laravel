import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';

interface Member {
    id: string;
    name: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onContributionAdded: (contribution: any) => void;
    members: Member[];
    appCurrency: {
        code: string;
        symbol: string;
    };
}

export default function AddContributionDialog({ isOpen, onClose, onContributionAdded, members, appCurrency }: Props) {
    const [formData, setFormData] = useState({
        member_id: '',
        amount: '',
        payment_date: '',
        payment_method: '',
        reference_number: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                member_id: '',
                amount: '',
                payment_date: '',
                payment_method: '',
                reference_number: ''
            });
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        if (!formData.member_id) return;
        router.post(`/mortuary/contributions/${formData.member_id}`, formData, {
            onSuccess: () => {
                setFormData({
                    member_id: '',
                    amount: '',
                    payment_date: '',
                    payment_method: '',
                    reference_number: ''
                });
                onClose();
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            }
        });
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleMemberSelect = (memberId: string) => {
        setFormData(prev => ({ ...prev, member_id: memberId }));
    };

    const handleClose = () => {
        setFormData({
            member_id: '',
            amount: '',
            payment_date: '',
            payment_method: '',
            reference_number: ''
        });
        onClose();
    };

    // Helper function to get selected member name
    const getSelectedMemberName = () => {
        if (!formData.member_id) return '';
        const selectedMember = members.find(member => member.id === formData.member_id);
        return selectedMember ? selectedMember.name : '';
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-[95vw] sm:max-w-md mx-4">
                <DialogHeader>
                    <DialogTitle>Record Contribution</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="member_id">Member</Label>
                        <Select 
                            value={formData.member_id} 
                            onValueChange={handleMemberSelect}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select member">
                                    {getSelectedMemberName()}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {members.map(member => (
                                    <SelectItem key={member.id} value={member.id}>
                                        {member.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="amount">Amount ({appCurrency.symbol})</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.amount}
                            onChange={e => handleInputChange('amount', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="payment_date">Payment Date</Label>
                        <Input
                            id="payment_date"
                            type="date"
                            value={formData.payment_date}
                            onChange={e => handleInputChange('payment_date', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="payment_method">Payment Method</Label>
                        <Input
                            id="payment_method"
                            value={formData.payment_method}
                            onChange={e => handleInputChange('payment_method', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="reference_number">Reference Number (Optional)</Label>
                        <Input
                            id="reference_number"
                            value={formData.reference_number}
                            onChange={e => handleInputChange('reference_number', e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={handleClose} className="w-full sm:w-auto">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                            {isSubmitting ? 'Recording...' : 'Record Contribution'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 