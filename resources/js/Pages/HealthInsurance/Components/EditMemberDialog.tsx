import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { useToast } from '@/Components/ui/use-toast';
import { useEffect, useState } from 'react';

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

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    member: Member | null;
    onMemberUpdated: (member: Member) => void;
}

export default function EditMemberDialog({ open, onOpenChange, member, onMemberUpdated }: Props) {
    const { toast } = useToast();
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const { data, setData, put, processing, errors, reset } = useForm({
        name: member?.name || '',
        date_of_birth: member?.date_of_birth || '',
        gender: member?.gender || '',
        contact_number: member?.contact_number || '',
        address: member?.address || '',
        membership_start_date: member?.membership_start_date || '',
        contribution_amount: member?.contribution_amount || '',
        contribution_frequency: member?.contribution_frequency || '',
        status: member?.status || 'active',
    });

    useEffect(() => {
        if (member) {
            // Format dates if they exist
            const formattedDob = member.date_of_birth ? new Date(member.date_of_birth).toISOString().split('T')[0] : '';
            const formattedStartDate = member.membership_start_date ? new Date(member.membership_start_date).toISOString().split('T')[0] : '';
            
            setData({
                name: member.name,
                date_of_birth: formattedDob,
                gender: member.gender,
                contact_number: member.contact_number,
                address: member.address,
                membership_start_date: formattedStartDate,
                contribution_amount: member.contribution_amount,
                contribution_frequency: member.contribution_frequency,
                status: member.status,
            });
        }
        // Clear errors when dialog opens/closes
        setFieldErrors({});
    }, [member, open]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // Name validation
        if (!data.name.trim()) {
            newErrors.name = 'Name is required';
        }

        // Date of birth validation
        if (!data.date_of_birth) {
            newErrors.date_of_birth = 'Date of birth is required';
        } else {
            const dob = new Date(data.date_of_birth);
            const today = new Date();
            if (dob > today) {
                newErrors.date_of_birth = 'Date of birth cannot be in the future';
            }
        }

        // Gender validation
        if (!data.gender) {
            newErrors.gender = 'Gender is required';
        } else if (!['male', 'female', 'other'].includes(data.gender)) {
            newErrors.gender = 'Invalid gender selection';
        }

        // Contact number validation
        if (!data.contact_number.trim()) {
            newErrors.contact_number = 'Contact number is required';
        } else if (!/^[0-9+\-\s()]{8,20}$/.test(data.contact_number)) {
            newErrors.contact_number = 'Invalid contact number format';
        }

        // Address validation
        if (!data.address.trim()) {
            newErrors.address = 'Address is required';
        }

        // Membership start date validation
        if (!data.membership_start_date) {
            newErrors.membership_start_date = 'Membership start date is required';
        } else {
            const startDate = new Date(data.membership_start_date);
            const today = new Date();
            if (startDate > today) {
                newErrors.membership_start_date = 'Start date cannot be in the future';
            }
        }

        // Contribution amount validation
        if (!data.contribution_amount) {
            newErrors.contribution_amount = 'Contribution amount is required';
        } else if (isNaN(Number(data.contribution_amount)) || Number(data.contribution_amount) < 0) {
            newErrors.contribution_amount = 'Contribution amount must be a positive number';
        }

        // Contribution frequency validation
        if (!data.contribution_frequency) {
            newErrors.contribution_frequency = 'Contribution frequency is required';
        } else if (!['monthly', 'quarterly', 'annually'].includes(data.contribution_frequency)) {
            newErrors.contribution_frequency = 'Invalid contribution frequency';
        }

        // Status validation
        if (!data.status) {
            newErrors.status = 'Status is required';
        } else if (!['active', 'inactive'].includes(data.status)) {
            newErrors.status = 'Invalid status';
        }

        setFieldErrors(newErrors);
        return newErrors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!member) return;

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            toast({
                title: "Validation Error",
                description: "Please check the form for errors",
                variant: "destructive",
            });
            return;
        }

        put(route('health-insurance.members.update', { id: member.id }), {
            onSuccess: () => {
                reset();
                setFieldErrors({});
                onOpenChange(false);
                toast({
                    title: "Success",
                    description: "Member updated successfully",
                });
                // Add delay before reloading to show toast
                setTimeout(() => {
                    window.location.reload();
                }, 1500); // 1.5 seconds delay
            },
            onError: (errors) => {
                setFieldErrors(errors);
                toast({
                    title: "Error",
                    description: "Failed to update member",
                    variant: "destructive",
                });
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Member</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Enter name"
                            className={fieldErrors.name ? "border-red-500" : ""}
                        />
                        {fieldErrors.name && (
                            <p className="text-sm text-red-500 mt-1">{fieldErrors.name}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                        <Input
                            id="date_of_birth"
                            type="date"
                            value={data.date_of_birth}
                            onChange={(e) => setData('date_of_birth', e.target.value)}
                            className={fieldErrors.date_of_birth ? "border-red-500" : ""}
                        />
                        {fieldErrors.date_of_birth && (
                            <p className="text-sm text-red-500 mt-1">{fieldErrors.date_of_birth}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                            value={data.gender}
                            onValueChange={(value) => setData('gender', value)}
                        >
                            <SelectTrigger className={fieldErrors.gender ? "border-red-500" : ""}>
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        {fieldErrors.gender && (
                            <p className="text-sm text-red-500 mt-1">{fieldErrors.gender}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="contact_number">Contact Number</Label>
                        <Input
                            id="contact_number"
                            type="text"
                            value={data.contact_number}
                            onChange={(e) => setData('contact_number', e.target.value)}
                            placeholder="Enter contact number"
                            className={fieldErrors.contact_number ? "border-red-500" : ""}
                        />
                        {fieldErrors.contact_number && (
                            <p className="text-sm text-red-500 mt-1">{fieldErrors.contact_number}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            type="text"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            placeholder="Enter address"
                            className={fieldErrors.address ? "border-red-500" : ""}
                        />
                        {fieldErrors.address && (
                            <p className="text-sm text-red-500 mt-1">{fieldErrors.address}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="membership_start_date">Membership Start Date</Label>
                        <Input
                            id="membership_start_date"
                            type="date"
                            value={data.membership_start_date}
                            onChange={(e) => setData('membership_start_date', e.target.value)}
                            className={fieldErrors.membership_start_date ? "border-red-500" : ""}
                        />
                        {fieldErrors.membership_start_date && (
                            <p className="text-sm text-red-500 mt-1">{fieldErrors.membership_start_date}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="contribution_amount">Contribution Amount</Label>
                        <Input
                            id="contribution_amount"
                            type="number"
                            value={data.contribution_amount}
                            onChange={(e) => setData('contribution_amount', e.target.value)}
                            placeholder="Enter contribution amount"
                            className={fieldErrors.contribution_amount ? "border-red-500" : ""}
                        />
                        {fieldErrors.contribution_amount && (
                            <p className="text-sm text-red-500 mt-1">{fieldErrors.contribution_amount}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="contribution_frequency">Contribution Frequency</Label>
                        <Select
                            value={data.contribution_frequency}
                            onValueChange={(value) => setData('contribution_frequency', value)}
                        >
                            <SelectTrigger className={fieldErrors.contribution_frequency ? "border-red-500" : ""}>
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="annually">Annually</SelectItem>
                            </SelectContent>
                        </Select>
                        {fieldErrors.contribution_frequency && (
                            <p className="text-sm text-red-500 mt-1">{fieldErrors.contribution_frequency}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={data.status}
                            onValueChange={(value) => setData('status', value)}
                        >
                            <SelectTrigger className={fieldErrors.status ? "border-red-500" : ""}>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        {fieldErrors.status && (
                            <p className="text-sm text-red-500 mt-1">{fieldErrors.status}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setFieldErrors({});
                                onOpenChange(false);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Update Member
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 