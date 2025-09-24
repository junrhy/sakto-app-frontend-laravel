import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Button } from '@/Components/ui/button';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Link } from '@inertiajs/react';
import { Mail, MapPin, Phone, User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Contact {
    id: number;
    first_name: string;
    middle_name?: string;
    last_name: string;
    email: string;
    call_number?: string;
    address?: string;
    id_picture?: string;
}

export function ContactsWidget() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const response = await fetch('/contacts/list');
            if (!response.ok) throw new Error('Failed to fetch contacts');
            const result = await response.json();
            setContacts(result.data.slice(0, 5)); // Access the contacts array from the data property
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-500 dark:border-blue-400"></div>
            </div>
        );
    }

    return (
        <div className="h-full rounded-b-lg bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <ScrollArea className="h-[calc(100%-1rem)]">
                <div className="p-3">
                    {/* Table Header */}
                    <div className="mb-2 grid grid-cols-12 gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-2 py-2 text-xs font-semibold text-white shadow-sm dark:from-blue-700 dark:via-indigo-700 dark:to-purple-700">
                        <div className="col-span-2">Contact</div>
                        <div className="col-span-3">Email</div>
                        <div className="col-span-3">Phone</div>
                        <div className="col-span-3">Address</div>
                        <div className="col-span-1">Action</div>
                    </div>

                    {/* Table Rows */}
                    <div className="space-y-1">
                        {contacts.map((contact, index) => (
                            <div
                                key={contact.id}
                                className={`grid grid-cols-12 items-center gap-2 rounded-lg border p-2 backdrop-blur-sm transition-all duration-200 hover:shadow-md ${
                                    index % 2 === 0
                                        ? 'border-white/20 bg-white/90 dark:border-gray-700/50 dark:bg-gray-800/90'
                                        : 'border-white/20 bg-white/95 dark:border-gray-600/50 dark:bg-gray-700/95'
                                }`}
                            >
                                {/* Contact Info */}
                                <div className="col-span-2 flex items-center space-x-2">
                                    <Avatar className="h-6 w-6 flex-shrink-0 ring-2 ring-blue-200 dark:ring-blue-600">
                                        <AvatarImage src={contact.id_picture} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-xs font-medium text-white dark:from-blue-400 dark:to-indigo-400">
                                            {contact.first_name[0]}
                                            {contact.last_name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-semibold text-gray-800 dark:text-gray-200">
                                            {contact.first_name}{' '}
                                            {contact.last_name}
                                        </p>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="col-span-3 flex items-center">
                                    <Mail className="mr-1 h-3 w-3 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                                    <span className="truncate text-xs text-gray-700 dark:text-gray-300">
                                        {contact.email}
                                    </span>
                                </div>

                                {/* Phone */}
                                <div className="col-span-3 flex items-center">
                                    <Phone className="mr-1 h-3 w-3 flex-shrink-0 text-green-500 dark:text-green-400" />
                                    <span className="truncate text-xs text-gray-700 dark:text-gray-300">
                                        {contact.call_number || 'N/A'}
                                    </span>
                                </div>

                                {/* Address */}
                                <div className="col-span-3 flex items-center">
                                    <MapPin className="mr-1 h-3 w-3 flex-shrink-0 text-orange-500 dark:text-orange-400" />
                                    <span className="truncate text-xs text-gray-700 dark:text-gray-300">
                                        {contact.address || 'N/A'}
                                    </span>
                                </div>

                                {/* Action */}
                                <div className="col-span-1 flex justify-end">
                                    <Link href={`/contacts/${contact.id}`}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/50"
                                        >
                                            <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
