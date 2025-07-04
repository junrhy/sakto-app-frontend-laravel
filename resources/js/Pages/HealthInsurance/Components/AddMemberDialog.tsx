import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { useToast } from '@/Components/ui/use-toast';
import { useState, useEffect } from 'react';
import { UserPlus, Plus, Trash2, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';

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

interface MemberFormData {
    name: string;
    date_of_birth: string;
    gender: string;
    contact_number: string;
    address: string;
    membership_start_date: string;
    contribution_amount: string;
    contribution_frequency: string;
    status: string;
    group: string;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onMemberAdded: (member: any) => void;
    appCurrency: {
        code: string;
        symbol: string;
    };
}

export default function AddMemberDialog({ open, onOpenChange, onMemberAdded, appCurrency }: Props) {
    const { toast } = useToast();
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [showContactSearch, setShowContactSearch] = useState(false);
    const [members, setMembers] = useState<MemberFormData[]>([
        {
            name: '',
            date_of_birth: '',
            gender: '',
            contact_number: '',
            address: '',
            membership_start_date: '',
            contribution_amount: '',
            contribution_frequency: '',
            status: 'active',
            group: '',
        }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Fetch contacts when dialog opens
        if (open) {
            fetchContacts();
        } else {
            // Reset states when dialog closes
            setShowContactSearch(false);
            setSelectedContacts([]);
            setMembers([{
                name: '',
                date_of_birth: '',
                gender: '',
                contact_number: '',
                address: '',
                membership_start_date: '',
                contribution_amount: '',
                contribution_frequency: '',
                status: 'active',
                group: '',
            }]);
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

    const handleContactSelect = (contactIds: string[]) => {
        setSelectedContacts(contactIds);
        
        // Create member entries for selected contacts
        const selectedContactData = contacts.filter(c => contactIds.includes(c.id));
        const newMembers = selectedContactData.map(contact => {
            const formattedDate = contact.date_of_birth ? new Date(contact.date_of_birth).toISOString().split('T')[0] : '';
            return {
                name: `${contact.first_name} ${contact.middle_name ? contact.middle_name + ' ' : ''}${contact.last_name}`.trim(),
                contact_number: contact.call_number || contact.sms_number || contact.whatsapp || '',
                address: contact.address || '',
                date_of_birth: formattedDate,
                gender: contact.gender || '',
                membership_start_date: '',
                contribution_amount: '',
                contribution_frequency: '',
                status: 'active',
                group: '',
            };
        });
        
        setMembers(newMembers);
        setShowContactSearch(false);
    };

    const addMember = () => {
        setMembers([...members, {
            name: '',
            date_of_birth: '',
            gender: '',
            contact_number: '',
            address: '',
            membership_start_date: '',
            contribution_amount: '',
            contribution_frequency: '',
            status: 'active',
            group: '',
        }]);
    };

    const removeMember = (index: number) => {
        if (members.length > 1) {
            setMembers(members.filter((_, i) => i !== index));
        }
    };

    const updateMember = (index: number, field: keyof MemberFormData, value: string) => {
        const updatedMembers = [...members];
        updatedMembers[index] = { ...updatedMembers[index], [field]: value };
        setMembers(updatedMembers);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Submit each member individually
            for (const member of members) {
                if (!member.name.trim()) continue; // Skip empty entries
                
                await new Promise((resolve, reject) => {
                    const formData = new FormData();
                    Object.entries(member).forEach(([key, value]) => {
                        formData.append(key, value);
                    });

                    fetch(route('health-insurance.members.store'), {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        },
                    })
                    .then(response => {
                        if (!response.ok) throw new Error('Failed to add member');
                        return response.json();
                    })
                    .then(resolve)
                    .catch(reject);
                });
            }

            toast({
                title: "Success",
                description: `${members.filter(m => m.name.trim()).length} member(s) added successfully`,
            });

            // Reset and close
            setMembers([{
                name: '',
                date_of_birth: '',
                gender: '',
                contact_number: '',
                address: '',
                membership_start_date: '',
                contribution_amount: '',
                contribution_frequency: '',
                status: 'active',
                group: '',
            }]);
            setSelectedContacts([]);
            onOpenChange(false);
            
            // Reload page after delay
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add some members",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const validMembers = members.filter(m => m.name.trim());

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Add Members
                        <Badge variant="secondary" className="ml-2">
                            {validMembers.length} member{validMembers.length !== 1 ? 's' : ''}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {!showContactSearch ? (
                        <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
                            <CardContent className="p-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-16"
                                    onClick={() => setShowContactSearch(true)}
                                >
                                    <UserPlus className="mr-2 h-5 w-5" />
                                    Search from Contacts
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm">Select Contacts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Select
                                    value={selectedContacts[0] || ''}
                                    onValueChange={(value) => handleContactSelect([value])}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select contacts" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {contacts.map((contact) => (
                                            <SelectItem key={contact.id} value={contact.id}>
                                                {`${contact.first_name} ${contact.middle_name ? contact.middle_name + ' ' : ''}${contact.last_name}`}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </CardContent>
                        </Card>
                    )}

                    <div className="space-y-4">
                        {members.map((member, index) => (
                            <Card key={index} className="relative">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm">Member {index + 1}</CardTitle>
                                        {members.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeMember(index)}
                                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label htmlFor={`name-${index}`}>Full Name</Label>
                                            <Input
                                                id={`name-${index}`}
                                                value={member.name}
                                                onChange={(e) => updateMember(index, 'name', e.target.value)}
                                                placeholder="Enter full name"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={`date_of_birth-${index}`}>Date of Birth</Label>
                                            <Input
                                                id={`date_of_birth-${index}`}
                                                type="date"
                                                value={member.date_of_birth}
                                                onChange={(e) => updateMember(index, 'date_of_birth', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label htmlFor={`gender-${index}`}>Gender</Label>
                                            <Select
                                                value={member.gender}
                                                onValueChange={(value) => updateMember(index, 'gender', value)}
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
                                        </div>
                                        <div>
                                            <Label htmlFor={`contact_number-${index}`}>Contact Number</Label>
                                            <Input
                                                id={`contact_number-${index}`}
                                                value={member.contact_number}
                                                onChange={(e) => updateMember(index, 'contact_number', e.target.value)}
                                                placeholder="Enter contact number"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor={`address-${index}`}>Address</Label>
                                        <Input
                                            id={`address-${index}`}
                                            value={member.address}
                                            onChange={(e) => updateMember(index, 'address', e.target.value)}
                                            placeholder="Enter address"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label htmlFor={`membership_start_date-${index}`}>Membership Start Date</Label>
                                            <Input
                                                id={`membership_start_date-${index}`}
                                                type="date"
                                                value={member.membership_start_date}
                                                onChange={(e) => updateMember(index, 'membership_start_date', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={`contribution_amount-${index}`}>Premium ({appCurrency.symbol})</Label>
                                            <Input
                                                id={`contribution_amount-${index}`}
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={member.contribution_amount}
                                                onChange={(e) => updateMember(index, 'contribution_amount', e.target.value)}
                                                placeholder="Enter premium amount"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <Label htmlFor={`contribution_frequency-${index}`}>Frequency</Label>
                                            <Select
                                                value={member.contribution_frequency}
                                                onValueChange={(value) => updateMember(index, 'contribution_frequency', value)}
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
                                        </div>
                                        <div>
                                            <Label htmlFor={`status-${index}`}>Status</Label>
                                            <Select
                                                value={member.status}
                                                onValueChange={(value) => updateMember(index, 'status', value)}
                                            >
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
                                            <Label htmlFor={`group-${index}`}>Group</Label>
                                            <Input
                                                id={`group-${index}`}
                                                value={member.group}
                                                onChange={(e) => updateMember(index, 'group', e.target.value)}
                                                placeholder="Enter group name"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={addMember}
                        className="w-full"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Another Member
                    </Button>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting || validMembers.length === 0}
                        >
                            {isSubmitting ? 'Adding...' : `Add ${validMembers.length} Member${validMembers.length !== 1 ? 's' : ''}`}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 