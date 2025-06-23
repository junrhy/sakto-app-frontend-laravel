import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onMemberAdded: (member: any) => void;
    appCurrency: {
        code: string;
        symbol: string;
    };
}

export default function AddMemberDialog({ isOpen, onClose, onMemberAdded, appCurrency }: Props) {
    const [formData, setFormData] = useState({
        name: '',
        date_of_birth: '',
        gender: '',
        contact_number: '',
        address: '',
        membership_start_date: '',
        contribution_amount: '',
        contribution_frequency: '',
        status: 'active',
        group: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post('/mortuary/members', formData, {
            onSuccess: () => {
                setFormData({
                    name: '',
                    date_of_birth: '',
                    gender: '',
                    contact_number: '',
                    address: '',
                    membership_start_date: '',
                    contribution_amount: '',
                    contribution_frequency: '',
                    status: 'active',
                    group: ''
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] flex flex-col mx-4">
                <DialogHeader>
                    <DialogTitle>Add New Member</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto pr-2">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="date_of_birth">Date of Birth</Label>
                            <Input
                                id="date_of_birth"
                                type="date"
                                value={formData.date_of_birth}
                                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="gender">Gender</Label>
                            <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="contact_number">Contact Number</Label>
                            <Input
                                id="contact_number"
                                value={formData.contact_number}
                                onChange={(e) => handleInputChange('contact_number', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="membership_start_date">Membership Start Date</Label>
                            <Input
                                id="membership_start_date"
                                type="date"
                                value={formData.membership_start_date}
                                onChange={(e) => handleInputChange('membership_start_date', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="contribution_amount">Contribution Amount ({appCurrency.symbol})</Label>
                            <Input
                                id="contribution_amount"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.contribution_amount}
                                onChange={(e) => handleInputChange('contribution_amount', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="contribution_frequency">Contribution Frequency</Label>
                            <Select value={formData.contribution_frequency} onValueChange={(value) => handleInputChange('contribution_frequency', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select frequency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="quarterly">Quarterly</SelectItem>
                                    <SelectItem value="annually">Annually</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="group">Group (Optional)</Label>
                            <Input
                                id="group"
                                value={formData.group}
                                onChange={(e) => handleInputChange('group', e.target.value)}
                            />
                        </div>
                    </form>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t mt-4">
                    <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} onClick={handleSubmit} className="w-full sm:w-auto">
                        {isSubmitting ? 'Adding...' : 'Add Member'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 