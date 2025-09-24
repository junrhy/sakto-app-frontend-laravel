import ContactWallet from '@/Components/ContactWallet';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Input } from '@/Components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Eye,
    FileDown,
    Filter,
    PlusIcon,
    SearchIcon,
    Trash2,
    Users,
    Wallet,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import React, { useMemo, useState } from 'react';

interface IdNumber {
    id: number;
    type: string; // e.g., 'SSS', 'TIN', 'GSIS', 'PhilHealth', 'Pag-IBIG'
    number: string;
    notes?: string;
}

interface Contact {
    id: number;
    first_name: string;
    middle_name?: string;
    last_name: string;
    gender: 'male' | 'female' | 'other';
    date_of_birth?: string; // Add date_of_birth field
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
    id_numbers?: IdNumber[]; // Make id_numbers optional
    group?: string[]; // Add group field
    wallet_balance?: number;
    wallet_currency?: string;
    wallet_status?: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    auth: {
        user: any;
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        };
    };
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
        year: 'numeric',
    });
};

export default function Index({ auth, contacts, appCurrency }: Props) {
    const [search, setSearch] = useState('');
    const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(
        null,
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [groupFilter, setGroupFilter] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<string>('details');

    // Check if current team member has admin or manager role
    const canDelete = useMemo(() => {
        if (auth.selectedTeamMember) {
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager')
            );
        }
        // If no team member is selected, check if the main user is admin
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    // Check if current team member has admin, manager, or user role
    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        // If no team member is selected, check if the main user is admin
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);
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
        return (contacts || []).filter((contact) => {
            const matchesSearch =
                contact.first_name.toLowerCase().includes(searchLower) ||
                (contact.middle_name || '')
                    .toLowerCase()
                    .includes(searchLower) ||
                contact.last_name.toLowerCase().includes(searchLower) ||
                contact.gender.toLowerCase().includes(searchLower) ||
                (contact.fathers_name || '')
                    .toLowerCase()
                    .includes(searchLower) ||
                (contact.mothers_maiden_name || '')
                    .toLowerCase()
                    .includes(searchLower) ||
                contact.email.toLowerCase().includes(searchLower) ||
                (contact.call_number || '')
                    .toLowerCase()
                    .includes(searchLower) ||
                (contact.sms_number || '')
                    .toLowerCase()
                    .includes(searchLower) ||
                (contact.whatsapp || '').toLowerCase().includes(searchLower) ||
                (contact.facebook || '').toLowerCase().includes(searchLower) ||
                (contact.instagram || '').toLowerCase().includes(searchLower) ||
                (contact.twitter || '').toLowerCase().includes(searchLower) ||
                (contact.linkedin || '').toLowerCase().includes(searchLower) ||
                (contact.address || '').toLowerCase().includes(searchLower) ||
                (contact.notes || '').toLowerCase().includes(searchLower) ||
                (contact.group || []).some((g) =>
                    g.toLowerCase().includes(searchLower),
                ) ||
                parseIdNumbers(contact.id_numbers).some(
                    (idNum: IdNumber) =>
                        idNum.type.toLowerCase().includes(searchLower) ||
                        idNum.number.toLowerCase().includes(searchLower) ||
                        (idNum.notes || '').toLowerCase().includes(searchLower),
                );

            const matchesGroup =
                groupFilter === 'all' ||
                (contact.group && contact.group.includes(groupFilter));

            return matchesSearch && matchesGroup;
        });
    }, [contacts, search, groupFilter]);

    const toggleSelectAll = () => {
        if (selectedContacts.length === filteredContacts.length) {
            setSelectedContacts([]);
        } else {
            setSelectedContacts(
                (filteredContacts || []).map((contact) => contact.id),
            );
        }
    };

    const toggleSelect = (id: number) => {
        if (selectedContacts.includes(id)) {
            setSelectedContacts(
                selectedContacts.filter((contactId) => contactId !== id),
            );
        } else {
            setSelectedContacts([...selectedContacts, id]);
        }
    };

    const exportToCSV = () => {
        const selectedData = contacts.filter((contact) =>
            selectedContacts.includes(contact.id),
        );
        const headers = [
            'First Name',
            'Middle Name',
            'Last Name',
            'Gender',
            "Father's Name",
            "Mother's Maiden Name",
            'Email',
            'Call Number',
            'SMS Number',
            'WhatsApp',
            'Facebook',
            'Instagram',
            'Twitter',
            'LinkedIn',
            'Address',
            'Notes',
        ];

        const csvData = selectedData.map((contact) => [
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
            contact.notes || '',
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');

        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'contacts.csv';
        link.click();
    };

    const openContactModal = (contact: Contact) => {
        setSelectedContact({
            ...contact,
            id_numbers: parseIdNumbers(contact.id_numbers),
        });
        setIsModalOpen(true);
    };

    const handleDelete = (contactId: number, e?: React.MouseEvent) => {
        e?.preventDefault(); // Prevent default form submission
        if (window.confirm('Are you sure you want to delete this contact?')) {
            router.delete(route('contacts.destroy', contactId));
            if (isModalOpen) {
                setIsModalOpen(false);
            }
        }
    };

    const handleEdit = (contactId: number, e?: React.MouseEvent) => {
        e?.preventDefault(); // Prevent default form submission
        router.get(route('contacts.edit', contactId));
        if (isModalOpen) {
            setIsModalOpen(false);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedContacts.length === 0) return;
        if (
            !window.confirm(
                'Are you sure you want to delete the selected contacts?',
            )
        )
            return;
        router.post(
            route('contacts.bulk-delete'),
            { ids: selectedContacts },
            {
                onSuccess: () => {
                    setSelectedContacts([]);
                },
            },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="relative overflow-hidden p-6">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 opacity-10 dark:from-blue-900 dark:via-purple-900 dark:to-indigo-900 dark:opacity-20"></div>

                    <div className="relative flex flex-col space-y-6 md:flex-row md:items-center md:justify-between md:space-y-0">
                        <div className="flex items-center space-x-4">
                            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-3 shadow-lg dark:from-blue-600 dark:to-purple-700">
                                <Users className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h2 className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-3xl font-bold text-transparent dark:from-white dark:to-gray-200">
                                    Contacts
                                </h2>
                                <p className="mt-1 text-gray-600 dark:text-gray-400">
                                    Manage your contact database
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                            {/* Search with enhanced styling */}
                            <div className="group relative">
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 blur transition-opacity group-hover:opacity-30"></div>
                                <div className="relative">
                                    <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500 dark:text-gray-400" />
                                    <Input
                                        type="search"
                                        placeholder="Search contacts..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        className="w-full rounded-lg border-gray-300 bg-white/80 pl-9 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900/80 dark:focus:ring-blue-400 sm:w-[320px]"
                                    />
                                </div>
                            </div>

                            {/* Group filter with enhanced styling */}
                            <div className="group relative">
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 opacity-20 blur transition-opacity group-hover:opacity-30"></div>
                                <div className="relative">
                                    <Select
                                        value={groupFilter}
                                        onValueChange={setGroupFilter}
                                    >
                                        <SelectTrigger className="w-full rounded-lg border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-900/80 dark:focus:ring-purple-400 sm:w-[200px]">
                                            <Filter className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                                            <SelectValue placeholder="Filter by group" />
                                        </SelectTrigger>
                                        <SelectContent className="border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95">
                                            <SelectItem value="all">
                                                All Groups
                                            </SelectItem>
                                            {Array.from(
                                                new Set(
                                                    contacts.flatMap(
                                                        (contact) =>
                                                            contact.group || [],
                                                    ),
                                                ),
                                            ).map((group) => (
                                                <SelectItem
                                                    key={group}
                                                    value={group}
                                                >
                                                    {group}
                                                </SelectItem>
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
                                                className="group relative border-gray-300 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:bg-white dark:border-gray-600 dark:bg-gray-900/80 dark:hover:bg-gray-900"
                                            >
                                                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 blur transition-opacity group-hover:opacity-20"></div>
                                                <FileDown className="relative z-10 mr-2 h-4 w-4" />
                                                <span className="relative z-10">
                                                    Export (
                                                    {selectedContacts.length})
                                                </span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="border-gray-200 bg-white/95 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95">
                                            <DropdownMenuItem
                                                onClick={exportToCSV}
                                                className="hover:bg-gray-100 dark:hover:bg-gray-800"
                                            >
                                                Export to CSV
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    {canDelete && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleBulkDelete}
                                            className="group relative"
                                        >
                                            <div className="absolute inset-0 rounded-md bg-gradient-to-r from-red-500 to-pink-600 opacity-0 blur transition-opacity group-hover:opacity-20"></div>
                                            <Trash2 className="relative z-10 mr-2 h-4 w-4" />
                                            <span className="relative z-10">
                                                Delete (
                                                {selectedContacts.length})
                                            </span>
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Add Contact button with gradient */}
                            <Link href={route('contacts.create')}>
                                <Button className="group relative transform bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600">
                                    <div className="absolute inset-0 rounded-md bg-white/20 opacity-0 blur transition-opacity group-hover:opacity-100"></div>
                                    <PlusIcon className="relative z-10 mr-2 h-4 w-4" />
                                    <span className="relative z-10">
                                        Add Contact
                                    </span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Contacts" />

            <div className="py-8">
                <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
                        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:border-blue-700 dark:from-blue-900/20 dark:to-blue-800/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                            Total Contacts
                                        </p>
                                        <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                                            {(contacts || []).length}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-blue-500 p-3">
                                        <Users className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:border-green-700 dark:from-green-900/20 dark:to-green-800/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                            With Photos
                                        </p>
                                        <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                            {
                                                contacts.filter(
                                                    (c) => c.id_picture,
                                                ).length
                                            }
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-green-500 p-3">
                                        <Eye className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:border-purple-700 dark:from-purple-900/20 dark:to-purple-800/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                            Groups
                                        </p>
                                        <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                            {
                                                Array.from(
                                                    new Set(
                                                        contacts.flatMap(
                                                            (contact) =>
                                                                contact.group ||
                                                                [],
                                                        ),
                                                    ),
                                                ).length
                                            }
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-purple-500 p-3">
                                        <Filter className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:border-emerald-700 dark:from-emerald-900/20 dark:to-emerald-800/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                            Total Wallet Balance
                                        </p>
                                        <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                                            {appCurrency.symbol}
                                            {(contacts || [])
                                                .reduce((sum, contact) => {
                                                    const balance =
                                                        Number(
                                                            contact.wallet_balance,
                                                        ) || 0;
                                                    return sum + balance;
                                                }, 0)
                                                .toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2,
                                                })}
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-emerald-500 p-3">
                                        <Wallet className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Table Card */}
                    <Card className="border border-gray-200 bg-white/80 shadow-xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                Contact List
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50">
                                            <TableHead className="w-[50px] bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                <Checkbox
                                                    checked={
                                                        selectedContacts.length ===
                                                            filteredContacts.length &&
                                                        filteredContacts.length >
                                                            0
                                                    }
                                                    onCheckedChange={
                                                        toggleSelectAll
                                                    }
                                                    className="border-gray-300 dark:border-gray-600"
                                                />
                                            </TableHead>
                                            <TableHead className="w-[80px] bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                Photo
                                            </TableHead>
                                            <TableHead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                Name
                                            </TableHead>
                                            <TableHead className="hidden bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 md:table-cell">
                                                Email
                                            </TableHead>
                                            <TableHead className="hidden bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 lg:table-cell">
                                                Contact
                                            </TableHead>
                                            <TableHead className="hidden bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 xl:table-cell">
                                                Wallet
                                            </TableHead>
                                            <TableHead className="w-[180px] bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredContacts.map(
                                            (contact: Contact) => (
                                                <TableRow
                                                    key={contact.id}
                                                    className="border-gray-200 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:border-gray-700 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20"
                                                >
                                                    <TableCell className="bg-white dark:bg-gray-900/40">
                                                        <Checkbox
                                                            checked={selectedContacts.includes(
                                                                contact.id,
                                                            )}
                                                            onCheckedChange={() =>
                                                                toggleSelect(
                                                                    contact.id,
                                                                )
                                                            }
                                                            className="border-gray-300 dark:border-gray-600"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="bg-white dark:bg-gray-900/40">
                                                        {contact.id_picture ? (
                                                            <div className="group relative">
                                                                <img
                                                                    src={
                                                                        contact.id_picture
                                                                    }
                                                                    alt={`${contact.first_name}'s ID`}
                                                                    className="h-12 w-12 rounded-full object-cover shadow-lg ring-2 ring-gray-200 transition-all duration-200 group-hover:ring-blue-500 dark:ring-gray-700 dark:group-hover:ring-blue-400 sm:h-16 sm:w-16"
                                                                />
                                                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg ring-2 ring-gray-200 dark:from-gray-800 dark:to-gray-700 dark:ring-gray-700 sm:h-16 sm:w-16">
                                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
                                                                    No Photo
                                                                </span>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="bg-white dark:bg-gray-900/40">
                                                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                            {contact.first_name}{' '}
                                                            {
                                                                contact.middle_name
                                                            }{' '}
                                                            {contact.last_name}
                                                        </div>
                                                        <div className="mt-1 text-sm capitalize text-gray-500 dark:text-gray-400">
                                                            {contact.gender}
                                                        </div>
                                                        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 md:hidden">
                                                            {contact.email}
                                                        </div>
                                                        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400 lg:hidden">
                                                            {contact.call_number ||
                                                                contact.sms_number ||
                                                                contact.whatsapp ||
                                                                '-'}
                                                        </div>
                                                        {contact.group &&
                                                            contact.group
                                                                .length > 0 && (
                                                                <div className="mt-2 flex flex-wrap gap-1">
                                                                    {contact.group.map(
                                                                        (
                                                                            group,
                                                                            index,
                                                                        ) => (
                                                                            <Badge
                                                                                key={
                                                                                    index
                                                                                }
                                                                                variant="secondary"
                                                                                className="border-blue-200 bg-gradient-to-r from-blue-100 to-purple-100 text-xs text-blue-800 dark:border-blue-700 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-200"
                                                                            >
                                                                                {
                                                                                    group
                                                                                }
                                                                            </Badge>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            )}
                                                    </TableCell>
                                                    <TableCell className="hidden bg-white text-gray-700 dark:bg-gray-900/40 dark:text-gray-300 md:table-cell">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                                                            <span className="font-medium">
                                                                {contact.email}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden bg-white text-gray-700 dark:bg-gray-900/40 dark:text-gray-300 lg:table-cell">
                                                        <div className="flex items-center space-x-2">
                                                            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                                            <span className="font-medium">
                                                                {contact.call_number ||
                                                                    contact.sms_number ||
                                                                    contact.whatsapp ||
                                                                    '-'}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="hidden bg-white text-gray-700 dark:bg-gray-900/40 dark:text-gray-300 xl:table-cell">
                                                        <div className="flex items-center space-x-2">
                                                            <Wallet className="h-4 w-4 text-green-600" />
                                                            <span className="font-medium text-green-600">
                                                                {
                                                                    appCurrency.symbol
                                                                }
                                                                {(
                                                                    Number(
                                                                        contact.wallet_balance,
                                                                    ) || 0
                                                                ).toLocaleString(
                                                                    'en-US',
                                                                    {
                                                                        minimumFractionDigits: 2,
                                                                        maximumFractionDigits: 2,
                                                                    },
                                                                )}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="bg-white dark:bg-gray-900/40">
                                                        <div className="flex flex-col gap-2 sm:flex-row">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    openContactModal(
                                                                        contact,
                                                                    )
                                                                }
                                                                className="group relative border-gray-300 bg-white transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-900 dark:hover:border-blue-600 dark:hover:bg-blue-900/20"
                                                            >
                                                                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 blur transition-opacity group-hover:opacity-10"></div>
                                                                <Eye className="relative z-10 h-4 w-4 sm:mr-2" />
                                                                <span className="relative z-10 hidden sm:inline">
                                                                    View
                                                                </span>
                                                            </Button>
                                                            {canEdit && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={(
                                                                        e,
                                                                    ) =>
                                                                        handleEdit(
                                                                            contact.id,
                                                                            e,
                                                                        )
                                                                    }
                                                                    className="group relative border-gray-300 bg-white transition-all duration-200 hover:border-green-300 hover:bg-green-50 dark:border-gray-600 dark:bg-gray-900 dark:hover:border-green-600 dark:hover:bg-green-900/20"
                                                                >
                                                                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 blur transition-opacity group-hover:opacity-10"></div>
                                                                    <span className="relative z-10">
                                                                        Edit
                                                                    </span>
                                                                </Button>
                                                            )}
                                                            {canDelete && (
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={(
                                                                        e,
                                                                    ) =>
                                                                        handleDelete(
                                                                            contact.id,
                                                                            e,
                                                                        )
                                                                    }
                                                                    className="group relative"
                                                                >
                                                                    <div className="absolute inset-0 rounded-md bg-gradient-to-r from-red-500 to-pink-600 opacity-0 blur transition-opacity group-hover:opacity-20"></div>
                                                                    <span className="relative z-10">
                                                                        Delete
                                                                    </span>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                        )}
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
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border border-gray-200 bg-white/95 shadow-2xl backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/95">
                    <DialogHeader className="pb-6">
                        <DialogTitle className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-2xl font-bold text-transparent dark:from-white dark:to-gray-200">
                            Contact Details
                        </DialogTitle>
                    </DialogHeader>
                    {selectedContact && (
                        <div className="space-y-8">
                            {/* Header with photo and actions */}
                            <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-6 dark:border-blue-700 dark:from-blue-900/20 dark:to-purple-900/20">
                                <div className="flex items-center space-x-6">
                                    <div className="group relative">
                                        {selectedContact.id_picture ? (
                                            <img
                                                src={selectedContact.id_picture}
                                                alt={`${selectedContact.first_name}'s ID`}
                                                className="h-28 w-28 rounded-full object-cover shadow-xl ring-4 ring-white transition-all duration-300 group-hover:ring-blue-500 dark:ring-gray-700 dark:group-hover:ring-blue-400"
                                            />
                                        ) : (
                                            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-xl ring-4 ring-white dark:from-gray-800 dark:to-gray-700 dark:ring-gray-700">
                                                <span className="text-lg font-medium text-gray-500 dark:text-gray-400">
                                                    No Photo
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
                                    </div>
                                    <div>
                                        <h3 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
                                            {selectedContact.first_name}{' '}
                                            {selectedContact.middle_name}{' '}
                                            {selectedContact.last_name}
                                        </h3>
                                        <div className="flex items-center space-x-4">
                                            <Badge
                                                variant="secondary"
                                                className="border-blue-200 bg-gradient-to-r from-blue-100 to-purple-100 capitalize text-blue-800 dark:border-blue-700 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-200"
                                            >
                                                {selectedContact.gender}
                                            </Badge>
                                            <span className="text-gray-500 dark:text-gray-400">
                                                •
                                            </span>
                                            <span className="font-medium text-gray-600 dark:text-gray-300">
                                                {selectedContact.email}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            window.open(
                                                route(
                                                    'contacts.public-profile',
                                                    selectedContact.id,
                                                ),
                                                '_blank',
                                            )
                                        }
                                        className="group relative border-gray-300 bg-white transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-900 dark:hover:border-blue-600 dark:hover:bg-blue-900/20"
                                    >
                                        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 blur transition-opacity group-hover:opacity-10"></div>
                                        <span className="relative z-10">
                                            Public Profile
                                        </span>
                                    </Button>
                                    {canEdit && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) =>
                                                selectedContact &&
                                                handleEdit(
                                                    selectedContact.id,
                                                    e,
                                                )
                                            }
                                            className="group relative border-gray-300 bg-white transition-all duration-200 hover:border-green-300 hover:bg-green-50 dark:border-gray-600 dark:bg-gray-900 dark:hover:border-green-600 dark:hover:bg-green-900/20"
                                        >
                                            <div className="absolute inset-0 rounded-md bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 blur transition-opacity group-hover:opacity-10"></div>
                                            <span className="relative z-10">
                                                Edit
                                            </span>
                                        </Button>
                                    )}
                                    {canDelete && (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={(e) =>
                                                selectedContact &&
                                                handleDelete(
                                                    selectedContact.id,
                                                    e,
                                                )
                                            }
                                            className="group relative"
                                        >
                                            <div className="absolute inset-0 rounded-md bg-gradient-to-r from-red-500 to-pink-600 opacity-0 blur transition-opacity group-hover:opacity-20"></div>
                                            <span className="relative z-10">
                                                Delete
                                            </span>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Tabs with enhanced styling */}
                            <Tabs
                                value={activeTab}
                                onValueChange={setActiveTab}
                                className="w-full"
                            >
                                <TabsList className="grid w-full grid-cols-6 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 p-1 dark:from-gray-800 dark:to-gray-700">
                                    <TabsTrigger
                                        value="details"
                                        className="text-gray-700 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:text-gray-300 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400"
                                    >
                                        Details
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="contact"
                                        className="text-gray-700 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:text-gray-300 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400"
                                    >
                                        Contact
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="social"
                                        className="text-gray-700 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:text-gray-300 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400"
                                    >
                                        Social
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="wallet"
                                        className="text-gray-700 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:text-gray-300 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400"
                                    >
                                        <Wallet className="mr-1 h-4 w-4" />
                                        Wallet
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="qr"
                                        className="text-gray-700 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:text-gray-300 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400"
                                    >
                                        QR Code
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="idcard"
                                        className="text-gray-700 transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm dark:text-gray-300 dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-blue-400"
                                    >
                                        ID Card
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent
                                    value="details"
                                    className="mt-8 space-y-8"
                                >
                                    {/* Groups Section */}
                                    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 dark:border-blue-700 dark:from-blue-900/20 dark:to-blue-800/20">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                                                Groups
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-3">
                                                {selectedContact.group &&
                                                selectedContact.group.length >
                                                    0 ? (
                                                    selectedContact.group.map(
                                                        (group, index) => (
                                                            <Badge
                                                                key={index}
                                                                variant="secondary"
                                                                className="border-blue-300 bg-gradient-to-r from-blue-200 to-purple-200 px-4 py-2 text-sm text-blue-900 dark:border-blue-600 dark:from-blue-800/40 dark:to-purple-800/40 dark:text-blue-100"
                                                            >
                                                                {group}
                                                            </Badge>
                                                        ),
                                                    )
                                                ) : (
                                                    <p className="italic text-gray-500 dark:text-gray-400">
                                                        No groups assigned
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* ID Numbers Section */}
                                    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100 dark:border-green-700 dark:from-green-900/20 dark:to-green-800/20">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-semibold text-green-900 dark:text-green-100">
                                                ID Numbers
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {Array.isArray(
                                                    selectedContact.id_numbers,
                                                ) &&
                                                selectedContact.id_numbers
                                                    .length > 0 ? (
                                                    selectedContact.id_numbers.map(
                                                        (idNum, index) => (
                                                            <div
                                                                key={`${idNum.type}-${idNum.number}-${index}`}
                                                                className="flex items-center justify-between rounded-lg border border-green-200 bg-white/50 p-4 dark:border-green-600 dark:bg-gray-900/50"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                                                                    <div>
                                                                        <span className="text-sm font-semibold text-green-900 dark:text-green-100">
                                                                            {
                                                                                idNum.type
                                                                            }
                                                                            :
                                                                        </span>
                                                                        <span className="ml-2 font-mono text-sm text-green-700 dark:text-green-300">
                                                                            {
                                                                                idNum.number
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                {idNum.notes && (
                                                                    <span className="rounded bg-green-100 px-2 py-1 text-xs italic text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                                                        {
                                                                            idNum.notes
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ),
                                                    )
                                                ) : (
                                                    <p className="py-4 text-center italic text-gray-500 dark:text-gray-400">
                                                        No ID numbers added
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Personal Information Section */}
                                    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 dark:border-purple-700 dark:from-purple-900/20 dark:to-purple-800/20">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                                                Personal Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                                        <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                                                            Date of Birth:
                                                        </span>
                                                        <span className="text-sm text-purple-700 dark:text-purple-300">
                                                            {formatDate(
                                                                selectedContact.date_of_birth,
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                                        <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                                                            Father's Name:
                                                        </span>
                                                        <span className="text-sm text-purple-700 dark:text-purple-300">
                                                            {selectedContact.fathers_name ||
                                                                '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                                        <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                                                            Mother's Maiden
                                                            Name:
                                                        </span>
                                                        <span className="text-sm text-purple-700 dark:text-purple-300">
                                                            {selectedContact.mothers_maiden_name ||
                                                                '-'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start space-x-3">
                                                        <div className="mt-2 h-2 w-2 rounded-full bg-purple-500"></div>
                                                        <div>
                                                            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                                                                Address:
                                                            </span>
                                                            <p className="mt-1 text-sm text-purple-700 dark:text-purple-300">
                                                                {selectedContact.address ||
                                                                    '-'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            {selectedContact.notes && (
                                                <div className="mt-4 rounded-lg border border-purple-200 bg-white/50 p-4 dark:border-purple-600 dark:bg-gray-900/50">
                                                    <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                                                        Notes:
                                                    </span>
                                                    <p className="mt-1 text-sm text-purple-700 dark:text-purple-300">
                                                        {selectedContact.notes}
                                                    </p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent
                                    value="contact"
                                    className="mt-8 space-y-8"
                                >
                                    <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:border-indigo-700 dark:from-indigo-900/20 dark:to-indigo-800/20">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                                                Contact Information
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                                <div className="space-y-4">
                                                    <div className="flex items-center space-x-3 rounded-lg border border-indigo-200 bg-white/50 p-3 dark:border-indigo-600 dark:bg-gray-900/50">
                                                        <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                                                        <div>
                                                            <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                                                                Email:
                                                            </span>
                                                            <p className="font-mono text-sm text-indigo-700 dark:text-indigo-300">
                                                                {
                                                                    selectedContact.email
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3 rounded-lg border border-indigo-200 bg-white/50 p-3 dark:border-indigo-600 dark:bg-gray-900/50">
                                                        <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                                                        <div>
                                                            <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                                                                Call Number:
                                                            </span>
                                                            <p className="text-sm text-indigo-700 dark:text-indigo-300">
                                                                {selectedContact.call_number ||
                                                                    '-'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex items-center space-x-3 rounded-lg border border-indigo-200 bg-white/50 p-3 dark:border-indigo-600 dark:bg-gray-900/50">
                                                        <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                                                        <div>
                                                            <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                                                                SMS Number:
                                                            </span>
                                                            <p className="text-sm text-indigo-700 dark:text-indigo-300">
                                                                {selectedContact.sms_number ||
                                                                    '-'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3 rounded-lg border border-indigo-200 bg-white/50 p-3 dark:border-indigo-600 dark:bg-gray-900/50">
                                                        <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
                                                        <div>
                                                            <span className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                                                                WhatsApp:
                                                            </span>
                                                            <p className="text-sm text-indigo-700 dark:text-indigo-300">
                                                                {selectedContact.whatsapp ||
                                                                    '-'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent
                                    value="social"
                                    className="mt-8 space-y-8"
                                >
                                    <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-pink-100 dark:border-pink-700 dark:from-pink-900/20 dark:to-pink-800/20">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-semibold text-pink-900 dark:text-pink-100">
                                                Social Media
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div className="space-y-4">
                                                    <div className="flex items-center space-x-3 rounded-lg border border-pink-200 bg-white/50 p-3 dark:border-pink-600 dark:bg-gray-900/50">
                                                        <div className="h-3 w-3 rounded-full bg-pink-500"></div>
                                                        <div>
                                                            <span className="text-sm font-semibold text-pink-900 dark:text-pink-100">
                                                                Facebook:
                                                            </span>
                                                            <p className="text-sm text-pink-700 dark:text-pink-300">
                                                                {selectedContact.facebook ||
                                                                    '-'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3 rounded-lg border border-pink-200 bg-white/50 p-3 dark:border-pink-600 dark:bg-gray-900/50">
                                                        <div className="h-3 w-3 rounded-full bg-pink-500"></div>
                                                        <div>
                                                            <span className="text-sm font-semibold text-pink-900 dark:text-pink-100">
                                                                Instagram:
                                                            </span>
                                                            <p className="text-sm text-pink-700 dark:text-pink-300">
                                                                {selectedContact.instagram ||
                                                                    '-'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="flex items-center space-x-3 rounded-lg border border-pink-200 bg-white/50 p-3 dark:border-pink-600 dark:bg-gray-900/50">
                                                        <div className="h-3 w-3 rounded-full bg-pink-500"></div>
                                                        <div>
                                                            <span className="text-sm font-semibold text-pink-900 dark:text-pink-100">
                                                                Twitter:
                                                            </span>
                                                            <p className="text-sm text-pink-700 dark:text-pink-300">
                                                                {selectedContact.twitter ||
                                                                    '-'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3 rounded-lg border border-pink-200 bg-white/50 p-3 dark:border-pink-600 dark:bg-gray-900/50">
                                                        <div className="h-3 w-3 rounded-full bg-pink-500"></div>
                                                        <div>
                                                            <span className="text-sm font-semibold text-pink-900 dark:text-pink-100">
                                                                LinkedIn:
                                                            </span>
                                                            <p className="text-sm text-pink-700 dark:text-pink-300">
                                                                {selectedContact.linkedin ||
                                                                    '-'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent
                                    value="wallet"
                                    className="mt-8 space-y-8"
                                >
                                    <ContactWallet
                                        contactId={selectedContact.id}
                                        contactName={`${selectedContact.first_name} ${selectedContact.last_name}`}
                                        appCurrency={appCurrency}
                                    />
                                </TabsContent>

                                <TabsContent
                                    value="qr"
                                    className="mt-8 space-y-8"
                                >
                                    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:border-emerald-700 dark:from-emerald-900/20 dark:to-emerald-800/20">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                                                Public Profile QR Code
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-col items-center space-y-6">
                                                <div className="rounded-xl border border-emerald-200 bg-white p-6 shadow-lg dark:border-emerald-600">
                                                    <QRCodeSVG
                                                        value={route(
                                                            'contacts.public-profile',
                                                            selectedContact.id,
                                                        )}
                                                        size={240}
                                                        level="M"
                                                        className="rounded-lg border border-emerald-200 bg-white p-4 dark:border-emerald-600"
                                                    />
                                                </div>
                                                <div className="space-y-2 text-center">
                                                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                                                        Scan this QR code to
                                                        view the public profile
                                                    </p>
                                                    <p className="rounded-lg bg-emerald-100 px-3 py-2 font-mono text-xs text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                        {route(
                                                            'contacts.public-profile',
                                                            selectedContact.id,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent
                                    value="idcard"
                                    className="mt-8 space-y-8"
                                >
                                    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 dark:border-amber-700 dark:from-amber-900/20 dark:to-amber-800/20">
                                        <CardHeader>
                                            <CardTitle className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                                                ID Card Preview
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-col justify-center gap-8 lg:flex-row">
                                                {/* Front of ID Card */}
                                                <div className="flex flex-col items-center">
                                                    <h5 className="mb-4 text-sm font-medium text-amber-700 dark:text-amber-300">
                                                        Front
                                                    </h5>
                                                    <div
                                                        className="transform rounded-xl border border-blue-500 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white shadow-2xl transition-transform duration-300 hover:scale-105"
                                                        style={{
                                                            width: '280px',
                                                            height: '420px',
                                                            padding: '20px',
                                                        }}
                                                    >
                                                        <div className="mb-6 text-center">
                                                            <div className="mb-4 flex justify-center">
                                                                {selectedContact.id_picture ? (
                                                                    <img
                                                                        src={
                                                                            selectedContact.id_picture
                                                                        }
                                                                        alt={`${selectedContact.first_name}'s ID`}
                                                                        className="h-28 w-24 rounded-lg border-2 border-white object-cover shadow-xl"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-28 w-24 items-center justify-center rounded-lg border-2 border-white bg-blue-500 shadow-xl">
                                                                        <span className="text-sm font-bold text-white">
                                                                            PHOTO
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <h3 className="mb-2 text-xl font-bold leading-tight">
                                                                {
                                                                    selectedContact.first_name
                                                                }{' '}
                                                                {
                                                                    selectedContact.middle_name
                                                                }{' '}
                                                                {
                                                                    selectedContact.last_name
                                                                }
                                                            </h3>
                                                            <Badge
                                                                variant="secondary"
                                                                className="border-blue-400 bg-blue-500/20 capitalize text-blue-100"
                                                            >
                                                                {
                                                                    selectedContact.gender
                                                                }
                                                            </Badge>
                                                        </div>

                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-semibold text-blue-100">
                                                                    Email:
                                                                </span>
                                                                <span className="ml-2 max-w-[160px] truncate text-right font-medium">
                                                                    {
                                                                        selectedContact.email
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-semibold text-blue-100">
                                                                    Phone:
                                                                </span>
                                                                <span className="ml-2 max-w-[160px] truncate text-right font-medium">
                                                                    {selectedContact.call_number ||
                                                                        selectedContact.sms_number ||
                                                                        selectedContact.whatsapp ||
                                                                        'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="font-semibold text-blue-100">
                                                                    DOB:
                                                                </span>
                                                                <span className="font-medium">
                                                                    {formatDate(
                                                                        selectedContact.date_of_birth,
                                                                    ) || 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-start justify-between">
                                                                <span className="font-semibold text-blue-100">
                                                                    Address:
                                                                </span>
                                                                <span className="ml-2 max-w-[160px] text-right text-xs font-medium leading-tight">
                                                                    {selectedContact.address ||
                                                                        'N/A'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="mt-4 border-t border-blue-500 pt-2 text-center">
                                                            <p className="text-xs font-medium text-blue-100">
                                                                A member of{' '}
                                                                {auth.user.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Back of ID Card */}
                                                <div className="flex flex-col items-center">
                                                    <h5 className="mb-4 text-sm font-medium text-amber-700 dark:text-amber-300">
                                                        Back
                                                    </h5>
                                                    <div
                                                        className="transform rounded-xl border border-gray-600 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 text-white shadow-2xl transition-transform duration-300 hover:scale-105"
                                                        style={{
                                                            width: '280px',
                                                            height: '420px',
                                                            padding: '20px',
                                                        }}
                                                    >
                                                        <div className="mb-6 text-center">
                                                            <h4 className="mb-4 text-lg font-bold text-gray-100">
                                                                Emergency
                                                                Contacts
                                                            </h4>
                                                            <div className="space-y-3 text-sm">
                                                                <div className="flex justify-between rounded-lg bg-gray-800/50 p-2">
                                                                    <span className="font-semibold text-gray-300">
                                                                        Father:
                                                                    </span>
                                                                    <span className="ml-2 max-w-[140px] truncate font-medium">
                                                                        {selectedContact.fathers_name ||
                                                                            'N/A'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between rounded-lg bg-gray-800/50 p-2">
                                                                    <span className="font-semibold text-gray-300">
                                                                        Mother:
                                                                    </span>
                                                                    <span className="ml-2 max-w-[140px] truncate font-medium">
                                                                        {selectedContact.mothers_maiden_name ||
                                                                            'N/A'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-1 flex-col justify-center border-t border-gray-600 pt-4">
                                                            <h4 className="mb-3 text-center text-lg font-bold text-gray-100">
                                                                QR Code
                                                            </h4>
                                                            <div className="mb-2 flex justify-center">
                                                                <QRCodeSVG
                                                                    value={route(
                                                                        'contacts.public-profile',
                                                                        selectedContact.id,
                                                                    )}
                                                                    size={140}
                                                                    level="M"
                                                                    className="rounded-lg bg-white p-2"
                                                                />
                                                            </div>
                                                            <p className="text-center text-xs font-medium text-gray-400">
                                                                Scan to view
                                                                profile
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
