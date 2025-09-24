import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import axios from 'axios';
import { Mail, Phone, Search, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Contact {
    id: number;
    first_name: string;
    middle_name?: string;
    last_name: string;
    email: string;
    call_number?: string;
    sms_number?: string;
    whatsapp?: string;
    address?: string;
    group?: string[];
    wallet_balance?: number;
}

interface ContactSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (contact: Contact) => void;
    title?: string;
}

export default function ContactSelector({
    isOpen,
    onClose,
    onSelect,
    title = 'Select Member',
}: ContactSelectorProps) {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchContacts();
        }
    }, [isOpen]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredContacts(contacts);
        } else {
            const filtered = contacts.filter(
                (contact) =>
                    `${contact.first_name} ${contact.middle_name || ''} ${contact.last_name}`
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    contact.email
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    (contact.call_number &&
                        contact.call_number.includes(searchTerm)) ||
                    (contact.sms_number &&
                        contact.sms_number.includes(searchTerm)),
            );
            setFilteredContacts(filtered);
        }
    }, [searchTerm, contacts]);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/contacts/list');
            if (response.data.success) {
                setContacts(response.data.data || []);
            } else {
                toast.error(
                    response.data.message || 'Failed to fetch contacts',
                );
            }
        } catch (error: any) {
            console.error('Error fetching contacts:', error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to fetch contacts');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (contact: Contact) => {
        onSelect(contact);
        onClose();
        setSearchTerm('');
    };

    const getFullName = (contact: Contact) => {
        return `${contact.first_name} ${contact.middle_name ? contact.middle_name + ' ' : ''}${contact.last_name}`.trim();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-gray-100">
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-1 flex-col gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
                        <Input
                            placeholder="Search members by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Contacts List */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-gray-500 dark:text-gray-400">
                                    Loading contacts...
                                </div>
                            </div>
                        ) : filteredContacts.length === 0 ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-center text-gray-500 dark:text-gray-400">
                                    {searchTerm
                                        ? 'No contacts found matching your search.'
                                        : 'No contacts available. Please add contacts first.'}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredContacts.map((contact) => (
                                    <Card
                                        key={contact.id}
                                        className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                                        onClick={() => handleSelect(contact)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">
                                                            {getFullName(
                                                                contact,
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                            {contact.email && (
                                                                <div className="flex items-center gap-1">
                                                                    <Mail className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                                    {
                                                                        contact.email
                                                                    }
                                                                </div>
                                                            )}
                                                            {(contact.call_number ||
                                                                contact.sms_number) && (
                                                                <div className="flex items-center gap-1">
                                                                    <Phone className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                                                                    {contact.call_number ||
                                                                        contact.sms_number}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    Select
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
