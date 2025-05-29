import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { useToast } from '@/Components/ui/use-toast';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onMemberAdded: (member: any) => void;
}

export default function AddMemberDialog({ open, onOpenChange, onMemberAdded }: Props) {
    const { toast } = useToast();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        date_of_birth: '',
        gender: '',
        contact_number: '',
        address: '',
        membership_start_date: '',
        contribution_amount: '',
        contribution_frequency: '',
        status: 'active',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('health-insurance.members.store'), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
                toast({
                    title: "Success",
                    description: "Member added successfully",
                });
            },
            onError: () => {
                toast({
                    title: "Error",
                    description: "Failed to add member",
                    variant: "destructive",
                });
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add Member</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="Enter full name"
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                        <Input
                            id="date_of_birth"
                            type="date"
                            value={data.date_of_birth}
                            onChange={(e) => setData('date_of_birth', e.target.value)}
                        />
                        {errors.date_of_birth && (
                            <p className="text-sm text-red-500">{errors.date_of_birth}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                            value={data.gender}
                            onValueChange={(value) => setData('gender', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.gender && (
                            <p className="text-sm text-red-500">{errors.gender}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="contact_number">Contact Number</Label>
                        <Input
                            id="contact_number"
                            type="tel"
                            value={data.contact_number}
                            onChange={(e) => setData('contact_number', e.target.value)}
                            placeholder="Enter contact number"
                        />
                        {errors.contact_number && (
                            <p className="text-sm text-red-500">{errors.contact_number}</p>
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
                        />
                        {errors.address && (
                            <p className="text-sm text-red-500">{errors.address}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="membership_start_date">Membership Start Date</Label>
                        <Input
                            id="membership_start_date"
                            type="date"
                            value={data.membership_start_date}
                            onChange={(e) => setData('membership_start_date', e.target.value)}
                        />
                        {errors.membership_start_date && (
                            <p className="text-sm text-red-500">{errors.membership_start_date}</p>
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
                        />
                        {errors.contribution_amount && (
                            <p className="text-sm text-red-500">{errors.contribution_amount}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="contribution_frequency">Contribution Frequency</Label>
                        <Select
                            value={data.contribution_frequency}
                            onValueChange={(value) => setData('contribution_frequency', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="annually">Annually</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.contribution_frequency && (
                            <p className="text-sm text-red-500">{errors.contribution_frequency}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={data.status}
                            onValueChange={(value) => setData('status', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && (
                            <p className="text-sm text-red-500">{errors.status}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            Add Member
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 