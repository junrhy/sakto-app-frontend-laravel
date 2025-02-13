import React, { useState, useMemo } from 'react';
import { Head, Link as InertiaLink } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Message } from '@/types/chat';
import MessageDialog from '@/Components/MessageDialog';
import { ThemeProvider, useTheme } from "@/Components/ThemeProvider";
import { Button } from '@/Components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/Components/ui/dropdown-menu";
import { QuestionMarkCircleIcon, ArrowRightStartOnRectangleIcon, UserIcon, TrashIcon } from '@heroicons/react/24/outline';
// @ts-ignore
import { Sun, Moon, Monitor } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

interface Props {
    auth: {
        user: {
            name: string;
        };
    };
    messages: Message[];
    unreadCount: number;
}

export default function Inbox({ auth, messages: initialMessages }: Props) {
    const { theme, setTheme } = useTheme();
    const [messages, setMessages] = useState<Message[]>(initialMessages);
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
            default: return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
        }
    };

    const handleMessageClick = async (message: Message) => {
        if (!message.isRead) {
            try {
                await axios.patch(`/inbox/${message.id}/read`);
                setMessages(prevMessages =>
                    prevMessages.map(m =>
                        m.id === message.id ? { ...m, isRead: true } : m
                    )
                );
            } catch (error) {
                console.error('Failed to mark message as read:', error);
            }
        }
        setSelectedMessage(message);
    };

    const handleDeleteMessage = async (messageId: number) => {
        try {
            await axios.delete(`/inbox/${messageId}`);
            setMessages(prevMessages => prevMessages.filter(message => message.id !== messageId));
            toast.success('Message deleted successfully');
        } catch (error) {
            console.error('Failed to delete message:', error);
            toast.error('Failed to delete message');
        }
    };

    return (
        <div className="relative min-h-screen pb-16 bg-white dark:bg-gray-900 overflow-x-hidden">
            <Head title="Inbox" />

            <div className="fixed top-0 left-0 w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 z-10">
                <div className="container mx-auto px-4 pt-4">
                    <div className="flex flex-col items-center mb-4">
                        <div className="w-full flex justify-between items-center mb-2">
                            <div className="flex items-center">
                                <ApplicationLogo className="h-10 w-auto fill-current text-white" />
                                <span className="ml-2 text-xl font-bold text-white">Sakto</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="relative inline-block">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                className="text-white hover:text-blue-100 hover:bg-white/10 transition-colors duration-200 flex items-center gap-2 px-3 py-2 h-auto font-normal border-0 no-underline hover:no-underline focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                                            >
                                                <UserIcon className="w-5 h-5" />
                                                <span>{auth.user.name}</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent 
                                            align="end" 
                                            alignOffset={0}
                                            sideOffset={8}
                                            className="w-56 z-50"
                                            onCloseAutoFocus={(e) => e.preventDefault()}
                                            collisionPadding={16}
                                        >
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger className="flex items-center">
                                                    {theme === 'dark' ? (
                                                        <Moon className="h-4 w-4 mr-2" />
                                                    ) : (
                                                        <Sun className="h-4 w-4 mr-2" />
                                                    )}
                                                    <span>Theme</span>
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuItem 
                                                        onClick={() => setTheme("light")}
                                                        className="flex items-center cursor-pointer"
                                                    >
                                                        <Sun className="mr-2 h-4 w-4" />
                                                        <span>Light</span>
                                                        {theme === "light" && <span className="ml-auto">✓</span>}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => setTheme("dark")}
                                                        className="flex items-center cursor-pointer"
                                                    >
                                                        <Moon className="mr-2 h-4 w-4" />
                                                        <span>Dark</span>
                                                        {theme === "dark" && <span className="ml-auto">✓</span>}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => setTheme("system")}
                                                        className="flex items-center cursor-pointer"
                                                    >
                                                        <Monitor className="mr-2 h-4 w-4" />
                                                        <span>System</span>
                                                        {theme === "system" && <span className="ml-auto">✓</span>}
                                                    </DropdownMenuItem>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuSub>
                                            <DropdownMenuItem>
                                                <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
                                                <InertiaLink href="/help">Help</InertiaLink>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>
                                                <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-2" />
                                                <InertiaLink 
                                                    href={route('logout')} 
                                                    method="post" 
                                                    as="button"
                                                    className="w-full text-left"
                                                >
                                                    Logout
                                                </InertiaLink>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full px-4 pt-[100px] landscape:pt-[80px] md:pt-[100px]">
                <div className="py-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white/95 dark:bg-gray-800/80 backdrop-blur-sm overflow-hidden shadow-sm sm:rounded-lg p-6">
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
                                {messages.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        No messages found
                                    </div>
                                ) : (
                                    messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 ${
                                                !message.isRead ? 'border-l-4 border-blue-500 dark:border-blue-400' : ''
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div 
                                                    className="flex-1 cursor-pointer"
                                                    onClick={() => handleMessageClick(message)}
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
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                        {message.timestamp}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteMessage(message.id);
                                                        }}
                                                        className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors duration-200"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
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