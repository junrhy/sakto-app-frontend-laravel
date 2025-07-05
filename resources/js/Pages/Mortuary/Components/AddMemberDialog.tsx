import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { useToast } from '@/Components/ui/use-toast';
import { useState, useEffect, useRef } from 'react';
import { UserPlus, Plus, Trash2, Users, Upload, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { router } from '@inertiajs/react';
import { Separator } from '@/Components/ui/separator';

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
    
    // Use router for posting individual members
    const [processing, setProcessing] = useState(false);
    
    // CSV import functionality
    const [showCsvImport, setShowCsvImport] = useState(false);
    const [csvData, setCsvData] = useState<MemberFormData[]>([]);
    const [csvErrors, setCsvErrors] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            // Reset processing state
            setProcessing(false);
            // Reset CSV import state
            setShowCsvImport(false);
            setCsvData([]);
            setCsvErrors([]);
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
        setProcessing(true);

        try {
            // Submit each member individually using Inertia router
            for (const member of members) {
                if (!member.name.trim()) continue; // Skip empty entries
                
                // Submit using Inertia router.post
                await new Promise<void>((resolve, reject) => {
                    router.post(route('mortuary.members.store'), member as any, {
                        onSuccess: () => {
                            resolve();
                        },
                        onError: (errors: any) => {
                            const errorMessage = Object.entries(errors)
                                .map(([field, message]) => `${field}: ${message}`)
                                .join('; ');
                            reject(new Error(errorMessage));
                        },
                        preserveScroll: true,
                        preserveState: true,
                    });
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
            console.error('Error adding members:', error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to add some members",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
            setProcessing(false);
        }
    };

    const validMembers = members.filter(m => m.name.trim());

    // CSV parsing function
    const parseCSV = (csvText: string): MemberFormData[] => {
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
            throw new Error('CSV must have at least a header row and one data row');
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
        const dataRows = lines.slice(1);
        const errors: string[] = [];
        const parsedData: MemberFormData[] = [];

        dataRows.forEach((row, index) => {
            const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
            const member: MemberFormData = {
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
            };

            headers.forEach((header, colIndex) => {
                const value = values[colIndex] || '';
                switch (header) {
                    case 'name':
                    case 'full_name':
                    case 'member_name':
                        member.name = value;
                        break;
                    case 'date_of_birth':
                    case 'birth_date':
                    case 'dob':
                        member.date_of_birth = value;
                        break;
                    case 'gender':
                        member.gender = value.toLowerCase();
                        break;
                    case 'contact_number':
                    case 'phone':
                    case 'mobile':
                    case 'contact':
                        member.contact_number = value;
                        break;
                    case 'address':
                        member.address = value;
                        break;
                    case 'membership_start_date':
                    case 'start_date':
                    case 'member_since':
                        member.membership_start_date = value;
                        break;
                    case 'contribution_amount':
                    case 'premium':
                    case 'amount':
                        member.contribution_amount = value;
                        break;
                    case 'contribution_frequency':
                    case 'frequency':
                    case 'payment_frequency':
                        member.contribution_frequency = value.toLowerCase();
                        break;
                    case 'status':
                        member.status = value.toLowerCase() || 'active';
                        break;
                    case 'group':
                        member.group = value;
                        break;
                }
            });

            // Validate required fields
            if (!member.name) {
                errors.push(`Row ${index + 2}: Name is required`);
            }
            if (!member.date_of_birth) {
                errors.push(`Row ${index + 2}: Date of birth is required`);
            }
            if (!member.gender) {
                errors.push(`Row ${index + 2}: Gender is required`);
            }
            if (!member.contact_number) {
                errors.push(`Row ${index + 2}: Contact number is required`);
            }
            if (!member.address) {
                errors.push(`Row ${index + 2}: Address is required`);
            }
            if (!member.membership_start_date) {
                errors.push(`Row ${index + 2}: Membership start date is required`);
            }
            if (!member.contribution_amount) {
                errors.push(`Row ${index + 2}: Contribution amount is required`);
            }
            if (!member.contribution_frequency) {
                errors.push(`Row ${index + 2}: Contribution frequency is required`);
            }

            parsedData.push(member);
        });

        setCsvErrors(errors);
        return parsedData;
    };

    // Handle CSV file upload
    const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.csv')) {
            toast({
                title: "Error",
                description: "Please select a CSV file",
                variant: "destructive",
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csvText = e.target?.result as string;
                const parsedData = parseCSV(csvText);
                setCsvData(parsedData);
                
                if (csvErrors.length === 0) {
                    toast({
                        title: "Success",
                        description: `Successfully parsed ${parsedData.length} members from CSV`,
                    });
                } else {
                    toast({
                        title: "Warning",
                        description: `Parsed ${parsedData.length} members with ${csvErrors.length} validation errors`,
                        variant: "destructive",
                    });
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to parse CSV file",
                    variant: "destructive",
                });
            }
        };
        reader.readAsText(file);
    };

    // Import CSV data to members
    const importCsvData = () => {
        if (csvData.length === 0) return;
        
        setMembers(csvData);
        setShowCsvImport(false);
        setCsvData([]);
        setCsvErrors([]);
        
        toast({
            title: "Success",
            description: `Imported ${csvData.length} members from CSV`,
        });
    };

    // Download CSV template
    const downloadCsvTemplate = () => {
        const template = `name,date_of_birth,gender,contact_number,address,membership_start_date,contribution_amount,contribution_frequency,status,group
"John Doe","1990-01-01","male","09123456789","123 Main St","2024-01-01","500","monthly","active","Group A"
"Jane Smith","1985-05-15","female","09876543210","456 Oak Ave","2024-01-01","750","quarterly","active","Group B"`;
        
        const blob = new Blob([template], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'mortuary_members_template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

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
                    <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
                        <CardContent className="p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {!showContactSearch ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-12"
                                        onClick={() => setShowContactSearch(true)}
                                    >
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Search Contacts
                                    </Button>
                                ) : (
                                    <div className="sm:col-span-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm font-medium">Select Contact:</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowContactSearch(false)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                        <Select
                                            value={selectedContacts[0] || ''}
                                            onValueChange={(value) => handleContactSelect([value])}
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
                                
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-12"
                                    onClick={() => setShowCsvImport(true)}
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import CSV
                                </Button>
                                
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-12"
                                    onClick={downloadCsvTemplate}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Template
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {showCsvImport && (
                        <Card>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm">Import CSV File</CardTitle>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowCsvImport(false)}
                                    >
                                        Close
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <Label htmlFor="csv-file" className="text-sm">Select CSV File</Label>
                                    <Input
                                        id="csv-file"
                                        type="file"
                                        accept=".csv"
                                        onChange={handleCsvUpload}
                                        ref={fileInputRef}
                                        className="h-9"
                                    />
                                </div>
                                
                                {csvData.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium">Preview ({csvData.length} members)</h4>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setCsvData([]);
                                                        setCsvErrors([]);
                                                        if (fileInputRef.current) {
                                                            fileInputRef.current.value = '';
                                                        }
                                                    }}
                                                >
                                                    Clear
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={importCsvData}
                                                >
                                                    Import to Form
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                                            <table className="w-full text-xs">
                                                <thead>
                                                    <tr className="border-b">
                                                        <th className="text-left p-1">Name</th>
                                                        <th className="text-left p-1">DOB</th>
                                                        <th className="text-left p-1">Gender</th>
                                                        <th className="text-left p-1">Contact</th>
                                                        <th className="text-left p-1">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {csvData.slice(0, 3).map((member, index) => (
                                                        <tr key={index} className="border-b">
                                                            <td className="p-1">{member.name}</td>
                                                            <td className="p-1">{member.date_of_birth}</td>
                                                            <td className="p-1">{member.gender}</td>
                                                            <td className="p-1">{member.contact_number}</td>
                                                            <td className="p-1">{member.contribution_amount}</td>
                                                        </tr>
                                                    ))}
                                                    {csvData.length > 3 && (
                                                        <tr>
                                                            <td colSpan={5} className="p-1 text-center text-gray-500">
                                                                ... and {csvData.length - 3} more
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        
                                        {csvErrors.length > 0 && (
                                            <div className="bg-red-50 border border-red-200 rounded-md p-2">
                                                <h5 className="text-sm font-medium text-red-800 mb-1">
                                                    Errors ({csvErrors.length})
                                                </h5>
                                                <div className="max-h-24 overflow-y-auto">
                                                    {csvErrors.slice(0, 5).map((error, index) => (
                                                        <p key={index} className="text-xs text-red-700 mb-0.5">
                                                            {error}
                                                        </p>
                                                    ))}
                                                    {csvErrors.length > 5 && (
                                                        <p className="text-xs text-red-700">
                                                            ... and {csvErrors.length - 5} more errors
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
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
                            disabled={processing || isSubmitting || validMembers.length === 0}
                        >
                            {processing || isSubmitting ? 'Adding...' : `Add ${validMembers.length} Member${validMembers.length !== 1 ? 's' : ''}`}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 