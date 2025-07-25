import { useEffect, useState } from "react";
import { Card, CardContent } from "@/Components/ui/card";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Button } from "@/Components/ui/button";
import { Phone, Mail, MapPin, User } from "lucide-react";
import { Link } from "@inertiajs/react";

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
            const response = await fetch("/contacts/list");
            if (!response.ok) throw new Error("Failed to fetch contacts");
            const result = await response.json();
            setContacts(result.data.slice(0, 5)); // Access the contacts array from the data property
        } catch (error) {
            console.error("Error fetching contacts:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 dark:border-blue-400"></div>
            </div>
        );
    }

    return (
        <div className="h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-b-lg">
            <ScrollArea className="h-[calc(100%-1rem)]">
                <div className="p-3">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-2 px-2 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-700 dark:via-indigo-700 dark:to-purple-700 rounded-lg mb-2 shadow-sm">
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
                                className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg hover:shadow-md transition-all duration-200 backdrop-blur-sm border ${
                                    index % 2 === 0 
                                        ? 'bg-white/90 dark:bg-gray-800/90 border-white/20 dark:border-gray-700/50' 
                                        : 'bg-white/95 dark:bg-gray-700/95 border-white/20 dark:border-gray-600/50'
                                }`}
                            >
                                {/* Contact Info */}
                                <div className="col-span-2 flex items-center space-x-2">
                                    <Avatar className="h-6 w-6 flex-shrink-0 ring-2 ring-blue-200 dark:ring-blue-600">
                                        <AvatarImage src={contact.id_picture} />
                                        <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 text-white">
                                            {contact.first_name[0]}
                                            {contact.last_name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-xs truncate text-gray-800 dark:text-gray-200">
                                            {contact.first_name} {contact.last_name}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Email */}
                                <div className="col-span-3 flex items-center">
                                    <Mail className="h-3 w-3 mr-1 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                                    <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                                        {contact.email}
                                    </span>
                                </div>
                                
                                {/* Phone */}
                                <div className="col-span-3 flex items-center">
                                    <Phone className="h-3 w-3 mr-1 flex-shrink-0 text-green-500 dark:text-green-400" />
                                    <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                                        {contact.call_number || 'N/A'}
                                    </span>
                                </div>
                                
                                {/* Address */}
                                <div className="col-span-3 flex items-center">
                                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0 text-orange-500 dark:text-orange-400" />
                                    <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                                        {contact.address || 'N/A'}
                                    </span>
                                </div>
                                
                                {/* Action */}
                                <div className="col-span-1 flex justify-end">
                                    <Link href={`/contacts/${contact.id}`}>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-6 w-6 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
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