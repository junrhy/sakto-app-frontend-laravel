import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { useToast } from '@/Components/ui/use-toast';
import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';

interface Contact {
    id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    email: string;
    call_number?: string;
    sms_number?: string;
    whatsapp?: string;
    address?: string;
    gender?: string;
    date_of_birth?: string;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onMemberAdded: (member: any) => void;
}

export default function AddMemberDialog({ open, onOpenChange, onMemberAdded }: Props) {
    const { toast } = useToast();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [showContactSearch, setShowContactSearch] = useState(false);

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

    useEffect(() => {
        // Fetch contacts when dialog opens
        if (open) {
            fetchContacts();
        } else {
            // Reset states when dialog closes
            setShowContactSearch(false);
            setSelectedContact(null);
        }
    }, [open]);

    const fetchContacts = async () => {
        try {
            const response = await fetch(route('contacts.list'));
            if (!response.ok) {
                throw new Error('Failed to fetch contacts');
            }
            const result = await response.json();
            if (result.success) {
                setContacts(result.data);
            } else {
                throw new Error(result.message || 'Failed to fetch contacts');
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast({
                title: "Error",
                description: "Failed to fetch contacts",
                variant: "destructive",
            });
        }
    };

    const handleContactSelect = (contactId: string) => {
        const contact = contacts.find(c => c.id === contactId);
        if (contact) {
            setSelectedContact(contact);
            // Format date_of_birth if it exists
            const formattedDate = contact.date_of_birth ? new Date(contact.date_of_birth).toISOString().split('T')[0] : '';
            setData({
                ...data,
                name: `${contact.first_name} ${contact.middle_name ? contact.middle_name + ' ' : ''}${contact.last_name}`.trim(),
                contact_number: contact.call_number || contact.sms_number || contact.whatsapp || '',
                address: contact.address || '',
                date_of_birth: formattedDate,
                gender: contact.gender || '',
            });
            setShowContactSearch(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('health-insurance.members.store'), {
            onSuccess: () => {
                reset();
                setSelectedContact(null);
                onOpenChange(false);
                toast({
                    title: "Success",
                    description: "Member added successfully",
                });
                // Add delay before reloading to show toast
                setTimeout(() => {
                    window.location.reload();
                }, 1500); // 1.5 seconds delay
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
                    {!showContactSearch ? (
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => setShowContactSearch(true)}
                        >
                            <UserPlus className="mr-2 h-4 w-4" />
                            Search from Contacts
                        </Button>
                    ) : (
                        <div>
                            <Label>Search Contact</Label>
                            <Select
                                value={selectedContact?.id}
                                onValueChange={handleContactSelect}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a contact" />
                                </SelectTrigger>
                                <SelectContent>
                                    {contacts.map((contact) => (
                                        <SelectItem key={contact.id} value={contact.id}>
                                            {`${contact.first_name} ${contact.middle_name ? contact.middle_name + ' ' : ''}${contact.last_name}`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

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