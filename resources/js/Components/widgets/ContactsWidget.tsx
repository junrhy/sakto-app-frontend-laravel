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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
        );
    }

    return (
        <div className="h-full">
            <ScrollArea className="h-[calc(100%-2rem)]">
                <div className="space-y-4 p-4">
                    {contacts.map((contact) => (
                        <Card key={contact.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                                <div className="flex items-start space-x-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={contact.id_picture} />
                                        <AvatarFallback>
                                            {contact.first_name[0]}
                                            {contact.last_name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium">
                                                {contact.first_name} {contact.middle_name} {contact.last_name}
                                            </h3>
                                            <Link href={`/contacts/${contact.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <User className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <Mail className="h-4 w-4 mr-1" />
                                            {contact.email}
                                        </div>
                                        {contact.call_number && (
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                <Phone className="h-4 w-4 mr-1" />
                                                {contact.call_number}
                                            </div>
                                        )}
                                        {contact.address && (
                                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                                <MapPin className="h-4 w-4 mr-1" />
                                                {contact.address}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
} 