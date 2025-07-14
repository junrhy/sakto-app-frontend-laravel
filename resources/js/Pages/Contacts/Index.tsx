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
import { PlusIcon, SearchIcon, FileDown, Trash2, Eye, Users, Filter, Wallet } from 'lucide-react';
import React, { useState, useMemo } from 'react';
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
import { QRCodeSVG } from 'qrcode.react';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/Components/ui/tabs";
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import ContactWallet from '@/Components/ContactWallet';

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
    date_of_birth?: string;  // Add date_of_birth field
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
    wallet_balance?: number;
    wallet_currency?: string;
    wallet_status?: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    auth: { user: any };
    contacts: Contact[];
    appCurrency: {
        symbol: string;
        decimal_separator: string;
        thousands_separator: string;
    };
}

const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

export default function Index({ auth, contacts, appCurrency }: Props) {
    const [search, setSearch] = useState('');
    const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groupFilter, setGroupFilter] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<string>('details');
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
        if (!search.trim() && groupFilter === 'all') return contacts || [];

        const searchLower = search.toLowerCase();
        return (contacts || []).filter(contact => {
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
            setSelectedContacts((filteredContacts || []).map(contact => contact.id));
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

    const handleBulkDelete = async () => {
        if (selectedContacts.length === 0) return;
        if (!window.confirm('Are you sure you want to delete the selected contacts?')) return;
        router.post(route('contacts.bulk-delete'), { ids: selectedContacts }, {
            onSuccess: () => {
                setSelectedContacts([]);
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="relative overflow-hidden p-6">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-900 dark:via-purple-900 dark:to-indigo-900 opacity-10 dark:opacity-20"></div>
                    
                    <div className="relative flex flex-col space-y-6 md:flex-row md:justify-between md:items-center md:space-y-0">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-xl shadow-lg">
                                <Users className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                                    Contacts
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Manage your contact database
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                            {/* Search with enhanced styling */}
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                <div className="relative">
                                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-4 w-4" />
                                    <Input
                                        type="search"
                                        placeholder="Search contacts..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9 w-full sm:w-[320px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                                    />
                                </div>
                            </div>
                            
                            {/* Group filter with enhanced styling */}
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                                <div className="relative">
                                    <Select value={groupFilter} onValueChange={setGroupFilter}>
                                        <SelectTrigger className="w-full sm:w-[200px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all duration-200">
                                            <Filter className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                                            <SelectValue placeholder="Filter by group" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                                            <SelectItem value="all">All Groups</SelectItem>
                                            {Array.from(new Set(contacts.flatMap(contact => contact.group || []))).map(group => (
                                                <SelectItem key={group} value={group}>{group}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            
                            {/* Action buttons */}
                            {selectedContacts.length > 0 && (
                                <div className="flex items-center gap-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="relative group bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-900 transition-all duration-200"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-md blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                                <FileDown className="h-4 w-4 mr-2 relative z-10" />
                                                <span className="relative z-10">Export ({selectedContacts.length})</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-gray-200 dark:border-gray-700">
                                            <DropdownMenuItem onClick={exportToCSV} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                                                Export to CSV
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <Button 
                                        variant="destructive" 
                                        size="sm" 
                                        className="relative group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-md blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                        <Trash2 className="h-4 w-4 mr-2 relative z-10" />
                                        <span className="relative z-10">Delete ({selectedContacts.length})</span>
                                    </Button>
                                </div>
                            )}
                            
                            {/* Add Contact button with gradient */}
                            <Link href={route('contacts.create')}>
                                <Button className="relative group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                                    <div className="absolute inset-0 bg-white/20 rounded-md blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <PlusIcon className="w-4 h-4 mr-2 relative z-10" />
                                    <span className="relative z-10">Add Contact</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Contacts" />

            <div className="py-8">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Contacts</p>
                                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{(contacts || []).length}</p>
                                    </div>
                                    <div className="p-3 bg-blue-500 rounded-lg">
                                        <Users className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-600 dark:text-green-400">With Photos</p>
                                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                            {contacts.filter(c => c.id_picture).length}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-green-500 rounded-lg">
                                        <Eye className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Groups</p>
                                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                            {Array.from(new Set(contacts.flatMap(contact => contact.group || []))).length}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-purple-500 rounded-lg">
                                        <Filter className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-700">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Total Wallet Balance</p>
                                        <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                                            {appCurrency.symbol}{((contacts || [])
                                                .reduce((sum, contact) => {
                                                    const balance = Number(contact.wallet_balance) || 0;
                                                    return sum + balance;
                                                }, 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-emerald-500 rounded-lg">
                                        <Wallet className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Table Card */}
                    <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Contact List
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <TableHead className="w-[50px] bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                <Checkbox
                                                    checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                                                    onCheckedChange={toggleSelectAll}
                                                    className="border-gray-300 dark:border-gray-600"
                                                />
                                            </TableHead>
                                            <TableHead className="w-[80px] bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">Photo</TableHead>
                                            <TableHead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">Name</TableHead>
                                            <TableHead className="hidden md:table-cell bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">Email</TableHead>
                                            <TableHead className="hidden lg:table-cell bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">Contact</TableHead>
                                            <TableHead className="hidden xl:table-cell bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">Wallet</TableHead>
                                            <TableHead className="w-[180px] bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredContacts.map((contact: Contact) => (
                                            <TableRow 
                                                key={contact.id} 
                                                className="border-gray-200 dark:border-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200"
                                            >
                                                <TableCell className="bg-white dark:bg-gray-900/40">
                                                    <Checkbox
                                                        checked={selectedContacts.includes(contact.id)}
                                                        onCheckedChange={() => toggleSelect(contact.id)}
                                                        className="border-gray-300 dark:border-gray-600"
                                                    />
                                                </TableCell>
                                                <TableCell className="bg-white dark:bg-gray-900/40">
                                                    {contact.id_picture ? (
                                                        <div className="relative group">
                                                            <img 
                                                                src={contact.id_picture} 
                                                                alt={`${contact.first_name}'s ID`}
                                                                className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-full ring-2 ring-gray-200 dark:ring-gray-700 shadow-lg group-hover:ring-blue-500 dark:group-hover:ring-blue-400 transition-all duration-200"
                                                            />
                                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center ring-2 ring-gray-200 dark:ring-gray-700 shadow-lg">
                                                            <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm font-medium">
                                                                No Photo
                                                            </span>
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="bg-white dark:bg-gray-900/40">
                                                    <div className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                                                        {contact.first_name} {contact.middle_name} {contact.last_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 capitalize mt-1">
                                                        {contact.gender}
                                                    </div>
                                                    <div className="md:hidden text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        {contact.email}
                                                    </div>
                                                    <div className="lg:hidden text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                        {contact.call_number || contact.sms_number || contact.whatsapp || '-'}
                                                    </div>
                                                    {contact.group && contact.group.length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {contact.group.map((group, index) => (
                                                                <Badge
                                                                    key={index}
                                                                    variant="secondary"
                                                                    className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700"
                                                                >
                                                                    {group}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell bg-white dark:bg-gray-900/40 text-gray-700 dark:text-gray-300">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                        <span className="font-medium">{contact.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell bg-white dark:bg-gray-900/40 text-gray-700 dark:text-gray-300">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                        <span className="font-medium">{contact.call_number || contact.sms_number || contact.whatsapp || '-'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden xl:table-cell bg-white dark:bg-gray-900/40 text-gray-700 dark:text-gray-300">
                                                    <div className="flex items-center space-x-2">
                                                        <Wallet className="h-4 w-4 text-green-600" />
                                                        <span className="font-medium text-green-600">
                                                            {appCurrency.symbol}{(Number(contact.wallet_balance) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="bg-white dark:bg-gray-900/40">
                                                    <div className="flex flex-col sm:flex-row gap-2">
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => openContactModal(contact)}
                                                            className="relative group bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
                                                        >
                                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md blur opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                                            <Eye className="h-4 w-4 sm:mr-2 relative z-10" />
                                                            <span className="hidden sm:inline relative z-10">View</span>
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={(e) => handleEdit(contact.id, e)}
                                                            className="relative group bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200"
                                                        >
                                                            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-md blur opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                                            <span className="relative z-10">Edit</span>
                                                        </Button>
                                                        <Button 
                                                            variant="destructive" 
                                                            size="sm"
                                                            onClick={(e) => handleDelete(contact.id, e)}
                                                            className="relative group"
                                                        >
                                                            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-md blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                                            <span className="relative z-10">Delete</span>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
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
                <DialogContent className="max-w-4xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="pb-6">
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                            Contact Details
                        </DialogTitle>
                    </DialogHeader>
                    {selectedContact && (
                        <div className="space-y-8">
                            {/* Header with photo and actions */}
                            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                                <div className="flex items-center space-x-6">
                                    <div className="relative group">
                                        {selectedContact.id_picture ? (
                                            <img 
                                                src={selectedContact.id_picture} 
                                                alt={`${selectedContact.first_name}'s ID`}
                                                className="w-28 h-28 object-cover rounded-full ring-4 ring-white dark:ring-gray-700 shadow-xl group-hover:ring-blue-500 dark:group-hover:ring-blue-400 transition-all duration-300"
                                            />
                                        ) : (
                                            <div className="w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-gray-700 shadow-xl">
                                                <span className="text-gray-500 dark:text-gray-400 text-lg font-medium">
                                                    No Photo
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                            {selectedContact.first_name} {selectedContact.middle_name} {selectedContact.last_name}
                                        </h3>
                                        <div className="flex items-center space-x-4">
                                            <Badge variant="secondary" className="capitalize bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700">
                                                {selectedContact.gender}
                                            </Badge>
                                            <span className="text-gray-500 dark:text-gray-400">•</span>
                                            <span className="text-gray-600 dark:text-gray-300 font-medium">{selectedContact.email}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.open(route('contacts.public-profile', selectedContact.id), '_blank')}
                                        className="relative group bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md blur opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                        <span className="relative z-10">Public Profile</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => selectedContact && handleEdit(selectedContact.id, e)}
                                        className="relative group bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-600 transition-all duration-200"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-md blur opacity-0 group-hover:opacity-10 transition-opacity"></div>
                                        <span className="relative z-10">Edit</span>
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={(e) => selectedContact && handleDelete(selectedContact.id, e)}
                                        className="relative group"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 rounded-md blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                        <span className="relative z-10">Delete</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Tabs with enhanced styling */}
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-6 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 p-1 rounded-lg">
                                    <TabsTrigger 
                                        value="details" 
                                        className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all duration-200"
                                    >
                                        Details
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="contact" 
                                        className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all duration-200"
                                    >
                                        Contact
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="social" 
                                        className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all duration-200"
                                    >
                                        Social
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="wallet" 
                                        className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all duration-200"
                                    >
                                        <Wallet className="h-4 w-4 mr-1" />
                                        Wallet
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="qr" 
                                        className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all duration-200"
                                    >
                                        QR Code
                                    </TabsTrigger>
                                    <TabsTrigger 
                                        value="idcard" 
                                        className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all duration-200"
                                    >
                                        ID Card
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="details" className="space-y-8 mt-8">
                                    {/* Groups Section */}
                                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-semibold text-blue-900 dark:text-blue-100">Groups</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-3">
                                                {selectedContact.group && selectedContact.group.length > 0 ? (
                                                    selectedContact.group.map((group, index) => (
                                                        <Badge
                                                            key={index}
                                                            variant="secondary"
                                                            className="text-sm bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800/40 dark:to-purple-800/40 text-blue-900 dark:text-blue-100 border-blue-300 dark:border-blue-600 px-4 py-2"
                                                        >
                                                            {group}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-500 dark:text-gray-400 italic">No groups assigned</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* ID Numbers Section */}
                                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-semibold text-green-900 dark:text-green-100">ID Numbers</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {Array.isArray(selectedContact.id_numbers) && selectedContact.id_numbers.length > 0 ? (
                                                    selectedContact.id_numbers.map((idNum, index) => (
                                                        <div key={`${idNum.type}-${idNum.number}-${index}`} className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-green-200 dark:border-green-600">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                                <div>
                                                                    <span className="text-sm font-semibold text-green-900 dark:text-green-100">{idNum.type}:</span>
                                                                    <span className="text-sm text-green-700 dark:text-green-300 ml-2 font-mono">{idNum.number}</span>
                                                                </div>
                                                            </div>
                                                            {idNum.notes && (
                                                                <span className="text-xs text-green-600 dark:text-green-400 italic bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                                                                    {idNum.notes}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-500 dark:text-gray-400 italic text-center py-4">No ID numbers added</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Personal Information Section */}
                                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-semibold text-purple-900 dark:text-purple-100">Personal Information</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                        <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Date of Birth:</span>
                                                        <span className="text-sm text-purple-700 dark:text-purple-300">{formatDate(selectedContact.date_of_birth)}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                        <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Father's Name:</span>
                                                        <span className="text-sm text-purple-700 dark:text-purple-300">{selectedContact.fathers_name || '-'}</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                                        <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Mother's Maiden Name:</span>
                                                        <span className="text-sm text-purple-700 dark:text-purple-300">{selectedContact.mothers_maiden_name || '-'}</span>
                                                    </div>
                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                                                        <div>
                                                            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Address:</span>
                                                            <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">{selectedContact.address || '-'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedContact.notes && (
                                                <div className="mt-4 p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-purple-200 dark:border-purple-600">
                                                    <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Notes:</span>
                                                    <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">{selectedContact.notes}</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="contact" className="space-y-8 mt-8">
                                    <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-700">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">Contact Information</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-indigo-200 dark:border-indigo-600">
                                                        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                                                        <div>
                                                            <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">Email:</span>
                                                            <p className="text-sm text-indigo-700 dark:text-indigo-300 font-mono">{selectedContact.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-indigo-200 dark:border-indigo-600">
                                                        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                                                        <div>
                                                            <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">Call Number:</span>
                                                            <p className="text-sm text-indigo-700 dark:text-indigo-300">{selectedContact.call_number || '-'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-indigo-200 dark:border-indigo-600">
                                                        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                                                        <div>
                                                            <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">SMS Number:</span>
                                                            <p className="text-sm text-indigo-700 dark:text-indigo-300">{selectedContact.sms_number || '-'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-indigo-200 dark:border-indigo-600">
                                                        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                                                        <div>
                                                            <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">WhatsApp:</span>
                                                            <p className="text-sm text-indigo-700 dark:text-indigo-300">{selectedContact.whatsapp || '-'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="social" className="space-y-8 mt-8">
                                    <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-pink-200 dark:border-pink-700">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-semibold text-pink-900 dark:text-pink-100">Social Media</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-4">
                                                    <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-pink-200 dark:border-pink-600">
                                                        <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                                                        <div>
                                                            <span className="text-sm font-semibold text-pink-900 dark:text-pink-100">Facebook:</span>
                                                            <p className="text-sm text-pink-700 dark:text-pink-300">{selectedContact.facebook || '-'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-pink-200 dark:border-pink-600">
                                                        <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                                                        <div>
                                                            <span className="text-sm font-semibold text-pink-900 dark:text-pink-100">Instagram:</span>
                                                            <p className="text-sm text-pink-700 dark:text-pink-300">{selectedContact.instagram || '-'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-pink-200 dark:border-pink-600">
                                                        <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                                                        <div>
                                                            <span className="text-sm font-semibold text-pink-900 dark:text-pink-100">Twitter:</span>
                                                            <p className="text-sm text-pink-700 dark:text-pink-300">{selectedContact.twitter || '-'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg border border-pink-200 dark:border-pink-600">
                                                        <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                                                        <div>
                                                            <span className="text-sm font-semibold text-pink-900 dark:text-pink-100">LinkedIn:</span>
                                                            <p className="text-sm text-pink-700 dark:text-pink-300">{selectedContact.linkedin || '-'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="wallet" className="space-y-8 mt-8">
                                    <ContactWallet 
                                        contactId={selectedContact.id} 
                                        contactName={`${selectedContact.first_name} ${selectedContact.last_name}`}
                                        appCurrency={appCurrency}
                                    />
                                </TabsContent>

                                <TabsContent value="qr" className="space-y-8 mt-8">
                                    <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-700">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Public Profile QR Code</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-col items-center space-y-6">
                                                <div className="p-6 bg-white rounded-xl shadow-lg border border-emerald-200 dark:border-emerald-600">
                                                    <QRCodeSVG
                                                        value={route('contacts.public-profile', selectedContact.id)}
                                                        size={240}
                                                        level="M"
                                                        className="border border-emerald-200 dark:border-emerald-600 rounded-lg p-4 bg-white"
                                                    />
                                                </div>
                                                <div className="text-center space-y-2">
                                                    <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                                                        Scan this QR code to view the public profile
                                                    </p>
                                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-100 dark:bg-emerald-900/30 px-3 py-2 rounded-lg">
                                                        {route('contacts.public-profile', selectedContact.id)}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="idcard" className="space-y-8 mt-8">
                                    <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-700">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-semibold text-amber-900 dark:text-amber-100">ID Card Preview</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-col lg:flex-row gap-8 justify-center">
                                                {/* Front of ID Card */}
                                                <div className="flex flex-col items-center">
                                                    <h5 className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-4">Front</h5>
                                                    <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white rounded-xl shadow-2xl border border-blue-500 transform hover:scale-105 transition-transform duration-300" style={{ width: '280px', height: '420px', padding: '20px' }}>
                                                        <div className="text-center mb-6">
                                                            <div className="flex justify-center mb-4">
                                                                {selectedContact.id_picture ? (
                                                                    <img 
                                                                        src={selectedContact.id_picture} 
                                                                        alt={`${selectedContact.first_name}'s ID`}
                                                                        className="w-24 h-28 object-cover rounded-lg border-2 border-white shadow-xl"
                                                                    />
                                                                ) : (
                                                                    <div className="w-24 h-28 bg-blue-500 rounded-lg border-2 border-white shadow-xl flex items-center justify-center">
                                                                        <span className="text-white text-sm font-bold">PHOTO</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <h3 className="text-xl font-bold mb-2 leading-tight">
                                                                {selectedContact.first_name} {selectedContact.middle_name} {selectedContact.last_name}
                                                            </h3>
                                                            <Badge variant="secondary" className="capitalize bg-blue-500/20 text-blue-100 border-blue-400">
                                                                {selectedContact.gender}
                                                            </Badge>
                                                        </div>
                                                        
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-blue-100 font-semibold">Email:</span>
                                                                <span className="font-medium truncate ml-2 text-right max-w-[160px]">{selectedContact.email}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-blue-100 font-semibold">Phone:</span>
                                                                <span className="font-medium truncate ml-2 text-right max-w-[160px]">{selectedContact.call_number || selectedContact.sms_number || selectedContact.whatsapp || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-blue-100 font-semibold">DOB:</span>
                                                                <span className="font-medium">{formatDate(selectedContact.date_of_birth) || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex justify-between items-start">
                                                                <span className="text-blue-100 font-semibold">Address:</span>
                                                                <span className="font-medium text-right max-w-[160px] ml-2 text-xs leading-tight">{selectedContact.address || 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="mt-4 pt-2 border-t border-blue-500 text-center">
                                                            <p className="text-xs text-blue-100 font-medium">
                                                                A member of {auth.user.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Back of ID Card */}
                                                <div className="flex flex-col items-center">
                                                    <h5 className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-4">Back</h5>
                                                    <div className="bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 text-white rounded-xl shadow-2xl border border-gray-600 transform hover:scale-105 transition-transform duration-300" style={{ width: '280px', height: '420px', padding: '20px' }}>
                                                        <div className="text-center mb-6">
                                                            <h4 className="text-lg font-bold text-gray-100 mb-4">Emergency Contacts</h4>
                                                            <div className="space-y-3 text-sm">
                                                                <div className="flex justify-between p-2 bg-gray-800/50 rounded-lg">
                                                                    <span className="text-gray-300 font-semibold">Father:</span>
                                                                    <span className="font-medium truncate ml-2 max-w-[140px]">{selectedContact.fathers_name || 'N/A'}</span>
                                                                </div>
                                                                <div className="flex justify-between p-2 bg-gray-800/50 rounded-lg">
                                                                    <span className="text-gray-300 font-semibold">Mother:</span>
                                                                    <span className="font-medium truncate ml-2 max-w-[140px]">{selectedContact.mothers_maiden_name || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="border-t border-gray-600 pt-4 flex-1 flex flex-col justify-center">
                                                            <h4 className="text-lg font-bold text-gray-100 mb-3 text-center">QR Code</h4>
                                                            <div className="flex justify-center mb-2">
                                                                <QRCodeSVG
                                                                    value={route('contacts.public-profile', selectedContact.id)}
                                                                    size={140}
                                                                    level="M"
                                                                    className="bg-white p-2 rounded-lg"
                                                                />
                                                            </div>
                                                            <p className="text-xs text-gray-400 text-center font-medium">
                                                                Scan to view profile
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}
