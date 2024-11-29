import React, { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Message } from '@/types/chat';
import MessageDialog from '@/Components/MessageDialog';

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
            case 'marketing': return 'bg-purple-100 text-purple-800';
            case 'notification': return 'bg-blue-100 text-blue-800';
            case 'update': return 'bg-green-100 text-green-800';
        }
    };

    const handleDeleteMessage = (messageId: number) => {
        setMessages(prevMessages => prevMessages.filter(message => message.id !== messageId));
    };

    return (
        <div className="relative min-h-screen pb-16">
            <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-black via-gray-900 to-black z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <ApplicationLogo className="h-10 w-auto fill-current text-white" />
                            <span className="ml-2 text-xl font-bold text-white">Inbox</span>
                        </div>
                        <Link 
                            href="/help"
                            className="text-white hover:text-blue-100 transition-colors duration-200"
                        >
                            <span className="text-md font-semibold">Help</span>
                        </Link>
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
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Messages List */}
                    <div className="space-y-2">
                        {filteredMessages.map((message) => (
                            <div
                                key={message.id}
                                className={`bg-white rounded-lg shadow-sm p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                                    !message.isRead ? 'border-l-4 border-blue-500' : ''
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div 
                                        className="flex-1"
                                        onClick={() => setSelectedMessage(message)}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <h3 className="font-semibold text-gray-900">
                                                {message.title}
                                            </h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(message.type)}`}>
                                                {message.type}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                            {message.content}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                            {message.timestamp}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteMessage(message.id);
                                            }}
                                            className="p-1 hover:bg-red-100 rounded-full transition-colors duration-200"
                                        >
                                            <svg 
                                                xmlns="http://www.w3.org/2000/svg" 
                                                className="h-5 w-5 text-red-500" 
                                                fill="none" 
                                                viewBox="0 0 24 24" 
                                                stroke="currentColor"
                                            >
                                                <path 
                                                    strokeLinecap="round" 
                                                    strokeLinejoin="round" 
                                                    strokeWidth={2} 
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                                                />
                                            </svg>
                                        </button>
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
    );
} 