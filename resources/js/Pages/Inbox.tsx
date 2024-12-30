import React, { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Message } from '@/types/chat';
import MessageDialog from '@/Components/MessageDialog';
import { ThemeProvider } from "@/Components/ThemeProvider";
import { ModeToggle } from "@/Components/ModeToggle";

interface Props {
    auth: {
        user: {
            name: string;
        };
    };
}

export default function Inbox({ auth }: Props) {
    // Dummy data for demonstration
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            title: "New Feature Available!",
            content: "We've just launched our new time tracking feature. Try it out today!",
            timestamp: "10:30 AM",
            type: "update",
            isRead: false
        },
        {
            id: 2,
            title: "Special Offer Inside",
            content: "Get 20% off on your next premium subscription upgrade.",
            timestamp: "Yesterday",
            type: "marketing",
            isRead: true
        },
        {
            id: 3,
            title: "Payment Processed",
            content: "Your latest payment has been successfully processed.",
            timestamp: "2 days ago",
            type: "notification",
            isRead: true
        },
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    const filteredMessages = useMemo(() => {
        return messages.filter(message => 
            message.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            message.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [messages, searchQuery]);

    const getTypeColor = (type: Message['type']) => {
        switch (type) {
            case 'marketing': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
            case 'notification': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
            case 'update': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
        }
    };

    const handleDeleteMessage = (messageId: number) => {
        setMessages(prevMessages => prevMessages.filter(message => message.id !== messageId));
    };

    return (
        <ThemeProvider>
            <div className="relative min-h-screen pb-16 bg-white dark:bg-gray-900">
                <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 z-10">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <ApplicationLogo className="h-10 w-auto fill-current text-white" />
                                <span className="ml-2 text-xl font-bold text-white">Sakto</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <ModeToggle />
                                <Link 
                                    href="/help"
                                    className="text-white hover:text-blue-100 transition-colors duration-200"
                                >
                                    <span className="text-md font-semibold">Help</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 pt-[100px] landscape:pt-[80px] md:pt-[100px]">
                    <div className="max-w-4xl mx-auto">
                        {/* Search Bar */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Search messages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                            />
                        </div>

                        {/* Messages List */}
                        <div className="space-y-2">
                            {filteredMessages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors duration-200 ${
                                        !message.isRead ? 'border-l-4 border-blue-500 dark:border-blue-400' : ''
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div 
                                            className="flex-1"
                                            onClick={() => setSelectedMessage(message)}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {message.title}
                                                </h3>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(message.type)}`}>
                                                    {message.type}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                                                {message.content}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {message.timestamp}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                <BottomNav />

                {selectedMessage && (
                    <MessageDialog 
                        message={selectedMessage} 
                        onClose={() => setSelectedMessage(null)} 
                    />
                )}
            </div>
        </ThemeProvider>
    );
} 