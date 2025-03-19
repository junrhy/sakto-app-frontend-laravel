import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Link } from '@inertiajs/react';
import { PlusIcon, SearchIcon, FileDown, Trash2, Eye } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

interface IdNumber {
    id: number;
    type: string;  // e.g., 'SSS', 'TIN', 'GSIS', 'PhilHealth', 'Pag-IBIG'
    number: string;
    notes?: string;
}

interface Contact {
    id: number;
    first_name: string;
    middle_name?: string;
    last_name: string;
    gender: 'male' | 'female' | 'other';
    fathers_name?: string;
    mothers_maiden_name?: string;
    email: string;
    call_number?: string;
    sms_number?: string;
    whatsapp?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    address?: string;
    notes?: string;
    id_picture?: string;
    id_numbers?: IdNumber[];  // Make id_numbers optional
    group?: string[];  // Add group field
    created_at: string;
    updated_at: string;
}

interface Props {
    auth: { user: any };
    contacts: Contact[];
}

export default function Index({ auth, contacts }: Props) {
    const [search, setSearch] = useState('');
    const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groupFilter, setGroupFilter] = useState<string>('all');

    // Parse id_numbers if it's a string
    const parseIdNumbers = (idNumbers: any) => {
        if (!idNumbers) return [];
        if (Array.isArray(idNumbers)) return idNumbers;
        try {
            return typeof idNumbers === 'string' ? JSON.parse(idNumbers) : [];
        } catch (e) {
            console.error('Error parsing id_numbers:', e);
            return [];
        }
    };

    const filteredContacts = useMemo(() => {
        if (!search.trim() && groupFilter === 'all') return contacts;

        const searchLower = search.toLowerCase();
        return contacts.filter(contact => {
            const matchesSearch = contact.first_name.toLowerCase().includes(searchLower) ||
                (contact.middle_name || '').toLowerCase().includes(searchLower) ||
                contact.last_name.toLowerCase().includes(searchLower) ||
                contact.gender.toLowerCase().includes(searchLower) ||
                (contact.fathers_name || '').toLowerCase().includes(searchLower) ||
                (contact.mothers_maiden_name || '').toLowerCase().includes(searchLower) ||
                contact.email.toLowerCase().includes(searchLower) ||
                (contact.call_number || '').toLowerCase().includes(searchLower) ||
                (contact.sms_number || '').toLowerCase().includes(searchLower) ||
                (contact.whatsapp || '').toLowerCase().includes(searchLower) ||
                (contact.facebook || '').toLowerCase().includes(searchLower) ||
                (contact.instagram || '').toLowerCase().includes(searchLower) ||
                (contact.twitter || '').toLowerCase().includes(searchLower) ||
                (contact.linkedin || '').toLowerCase().includes(searchLower) ||
                (contact.address || '').toLowerCase().includes(searchLower) ||
                (contact.notes || '').toLowerCase().includes(searchLower) ||
                (contact.group || []).some(g => g.toLowerCase().includes(searchLower)) ||
                parseIdNumbers(contact.id_numbers).some((idNum: IdNumber) => 
                    idNum.type.toLowerCase().includes(searchLower) ||
                    idNum.number.toLowerCase().includes(searchLower) ||
                    (idNum.notes || '').toLowerCase().includes(searchLower)
                );

            const matchesGroup = groupFilter === 'all' || (contact.group && contact.group.includes(groupFilter));

            return matchesSearch && matchesGroup;
        });
    }, [contacts, search, groupFilter]);

    const toggleSelectAll = () => {
        if (selectedContacts.length === filteredContacts.length) {
            setSelectedContacts([]);
        } else {
            setSelectedContacts(filteredContacts.map(contact => contact.id));
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedContacts.includes(id)) {
            setSelectedContacts(selectedContacts.filter(contactId => contactId !== id));
        } else {
            setSelectedContacts([...selectedContacts, id]);
        }
    };

    const exportToCSV = () => {
        const selectedData = contacts.filter(contact => selectedContacts.includes(contact.id));
        const headers = [
            'First Name',
            'Middle Name',
            'Last Name',
            'Gender',
            'Father\'s Name',
            'Mother\'s Maiden Name',
            'Email',
            'Call Number',
            'SMS Number',
            'WhatsApp',
            'Facebook',
            'Instagram',
            'Twitter',
            'LinkedIn',
            'Address',
            'Notes'
        ];

        const csvData = selectedData.map(contact => [
            contact.first_name,
            contact.middle_name || '',
            contact.last_name,
            contact.gender,
            contact.fathers_name || '',
            contact.mothers_maiden_name || '',
            contact.email,
            contact.call_number || '',
            contact.sms_number || '',
            contact.whatsapp || '',
            contact.facebook || '',
            contact.instagram || '',
            contact.twitter || '',
            contact.linkedin || '',
            contact.address || '',
            contact.notes || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'contacts.csv';
        link.click();
    };

    const openContactModal = (contact: Contact) => {
        setSelectedContact({
            ...contact,
            id_numbers: parseIdNumbers(contact.id_numbers)
        });
        setIsModalOpen(true);
    };

    const handleDelete = (contactId: number, e?: React.MouseEvent) => {
        e?.preventDefault();  // Prevent default form submission
        if (window.confirm('Are you sure you want to delete this contact?')) {
            router.delete(route('contacts.destroy', contactId));
            if (isModalOpen) {
                setIsModalOpen(false);
            }
        }
    };

    const handleEdit = (contactId: number, e?: React.MouseEvent) => {
        e?.preventDefault();  // Prevent default form submission
        router.get(route('contacts.edit', contactId));
        if (isModalOpen) {
            setIsModalOpen(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Contacts
                    </h2>
                    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
                            <Input
                                type="search"
                                placeholder="Search contacts..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 w-full sm:w-[300px] bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                            />
                        </div>
                        <Select value={groupFilter} onValueChange={setGroupFilter}>
                            <SelectTrigger className="w-full sm:w-[200px] bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
                                <SelectValue placeholder="Filter by group" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Groups</SelectItem>
                                {Array.from(new Set(contacts.flatMap(contact => contact.group || []))).map(group => (
                                    <SelectItem key={group} value={group}>{group}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {selectedContacts.length > 0 && (
                            <div className="flex items-center gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="whitespace-nowrap border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
                                            <FileDown className="h-4 w-4 mr-2" />
                                            Export ({selectedContacts.length})
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                        <DropdownMenuItem onClick={exportToCSV} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                                            Export to CSV
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button variant="destructive" size="sm" className="whitespace-nowrap">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete ({selectedContacts.length})
                                </Button>
                            </div>
                        )}
                        <Link href={route('contacts.create')}>
                            <Button className="w-full sm:w-auto whitespace-nowrap bg-gray-600 hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-600">
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Add Contact
                            </Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Contacts" />

            <div className="py-12">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="p-4 sm:p-6 overflow-x-auto">
                            <div className="min-w-full">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-gray-200 dark:border-gray-700">
                                            <TableHead className="w-[50px] bg-gray-50 dark:bg-gray-800/50">
                                                <Checkbox
                                                    checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                                                    onCheckedChange={toggleSelectAll}
                                                    className="border-gray-300 dark:border-gray-600"
                                                />
                                            </TableHead>
                                            <TableHead className="w-[80px] bg-gray-50 dark:bg-gray-800/50">ID Picture</TableHead>
                                            <TableHead className="bg-gray-50 dark:bg-gray-800/50">Name</TableHead>
                                            <TableHead className="hidden md:table-cell bg-gray-50 dark:bg-gray-800/50">Email</TableHead>
                                            <TableHead className="hidden lg:table-cell bg-gray-50 dark:bg-gray-800/50">Contact Number</TableHead>
                                            <TableHead className="w-[180px] bg-gray-50 dark:bg-gray-800/50">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredContacts.map((contact: Contact) => (
                                            <TableRow key={contact.id} className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <TableCell className="bg-white dark:bg-gray-800/40">
                                                    <Checkbox
                                                        checked={selectedContacts.includes(contact.id)}
                                                        onCheckedChange={() => toggleSelect(contact.id)}
                                                        className="border-gray-300 dark:border-gray-600"
                                                    />
                                                </TableCell>
                                                <TableCell className="bg-white dark:bg-gray-800/40">
                                                    {contact.id_picture ? (
                                                        <img 
                                                            src={contact.id_picture} 
                                                            alt={`${contact.first_name}'s ID`}
                                                            className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-700">
                                                            <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                                                                No ID
                                                            </span>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="bg-white dark:bg-gray-800/40">
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                                        {contact.first_name} {contact.middle_name} {contact.last_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                                        {contact.gender}
                                                    </div>
                                                    <div className="md:hidden text-sm text-gray-500 dark:text-gray-400">
                                                        {contact.email}
                                                    </div>
                                                    <div className="lg:hidden text-sm text-gray-500 dark:text-gray-400">
                                                        {contact.call_number || contact.sms_number || contact.whatsapp || '-'}
                                                    </div>
                                                    {contact.group && contact.group.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {contact.group.map((group, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                                                >
                                                                    {group}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell bg-white dark:bg-gray-800/40 text-gray-700 dark:text-gray-300">
                                                    {contact.email}
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell bg-white dark:bg-gray-800/40 text-gray-700 dark:text-gray-300">
                                                    {contact.call_number || contact.sms_number || contact.whatsapp || '-'}
                                                </TableCell>
                                                <TableCell className="bg-white dark:bg-gray-800/40">
                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => openContactModal(contact)}
                                                            className="w-full sm:w-auto bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                        >
                                                            <Eye className="h-4 w-4 sm:mr-2" />
                                                            <span className="hidden sm:inline">View</span>
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={(e) => handleEdit(contact.id, e)}
                                                            className="w-full sm:w-auto bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button 
                                                            variant="destructive" 
                                                            size="sm"
                                                            onClick={(e) => handleDelete(contact.id, e)}
                                                            className="w-full sm:w-auto"
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog 
                open={isModalOpen} 
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedContact(null);
                    }
                    setIsModalOpen(open);
                }}
            >
                <DialogContent className="max-w-3xl bg-white dark:bg-gray-800/40 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-gray-100">Contact Details</DialogTitle>
                    </DialogHeader>
                    {selectedContact && (
                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    {selectedContact.id_picture ? (
                                        <img 
                                            src={selectedContact.id_picture} 
                                            alt={`${selectedContact.first_name}'s ID`}
                                            className="w-24 h-24 object-cover rounded-full ring-2 ring-gray-200 dark:ring-gray-700"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-700">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                No ID
                                            </span>
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                                            {selectedContact.first_name} {selectedContact.middle_name} {selectedContact.last_name}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 capitalize">{selectedContact.gender}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(route('contacts.public-profile', selectedContact.id), '_blank')}
                                        className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        Public Profile
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => selectedContact && handleEdit(selectedContact.id, e)}
                                        className="bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={(e) => selectedContact && handleDelete(selectedContact.id, e)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-medium text-gray-500 dark:text-gray-400 mb-4">Groups</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedContact.group && selectedContact.group.length > 0 ? (
                                            selectedContact.group.map((group, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                                                >
                                                    {group}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 dark:text-gray-400">No groups assigned</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-500 dark:text-gray-400 mb-4">ID Numbers</h4>
                                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                        {Array.isArray(selectedContact.id_numbers) && selectedContact.id_numbers.length > 0 ? (
                                            selectedContact.id_numbers.map((idNum, index) => (
                                                <div key={`${idNum.type}-${idNum.number}-${index}`} className="flex items-center justify-between py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{idNum.type}:</span>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">{idNum.number}</span>
                                                    </div>
                                                    {idNum.notes && (
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                                                            {idNum.notes}
                                                        </span>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 dark:text-gray-400 py-3">No ID numbers added</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-500 dark:text-gray-400 mb-4">Personal Information</h4>
                                    <div className="space-y-3">
                                        <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Father's Name:</span> {selectedContact.fathers_name || '-'}</p>
                                        <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Mother's Maiden Name:</span> {selectedContact.mothers_maiden_name || '-'}</p>
                                        <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Address:</span> {selectedContact.address || '-'}</p>
                                        <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Notes:</span> {selectedContact.notes || '-'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-medium text-gray-500 dark:text-gray-400 mb-4">Contact Information</h4>
                                    <div className="space-y-3">
                                        <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Email:</span> {selectedContact.email}</p>
                                        <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Call Number:</span> {selectedContact.call_number || '-'}</p>
                                        <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">SMS Number:</span> {selectedContact.sms_number || '-'}</p>
                                        <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">WhatsApp:</span> {selectedContact.whatsapp || '-'}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-500 dark:text-gray-400 mb-4">Social Media</h4>
                                    <div className="space-y-3">
                                        <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Facebook:</span> {selectedContact.facebook || '-'}</p>
                                        <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Instagram:</span> {selectedContact.instagram || '-'}</p>
                                        <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Twitter:</span> {selectedContact.twitter || '-'}</p>
                                        <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">LinkedIn:</span> {selectedContact.linkedin || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
