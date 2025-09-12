import React, { useState, useMemo, useEffect } from 'react';
import { Head, Link as InertiaLink } from '@inertiajs/react';
import BottomNav from '@/Components/BottomNav';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Message } from '@/types/chat';
import MessageDialog from '@/Components/MessageDialog';
import { ThemeProvider, useTheme } from "@/Components/ThemeProvider";
import { Button } from '@/Components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/Components/ui/dropdown-menu";
import { QuestionMarkCircleIcon, ArrowRightStartOnRectangleIcon, UserIcon, TrashIcon, CreditCardIcon } from '@heroicons/react/24/outline';
// @ts-ignore
import { Sun, Moon, Monitor } from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'sonner';

interface Subscription {
    plan: {
        name: string;
        unlimited_access: boolean;
        slug?: string;
    };
    end_date: string;
}

interface Props {
    auth: {
        user: {
            name: string;
            credits?: number;
            identifier?: string;
        };
        project: {
            enabledModules: string[];
            identifier: string;
        };
        modules: string[];
        teamMembers: Array<{
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        }>;
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        } | null;
    };
    messages: Message[];
    unreadCount: number;
}

export default function Inbox({ auth, messages: initialMessages }: Props) {
    const { theme, setTheme } = useTheme();
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [credits, setCredits] = useState<number>(auth.user.credits ?? 0);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [isLoadingSubscription, setIsLoadingSubscription] = useState<boolean>(true);
    const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);

    useEffect(() => {
        const fetchCredits = async () => {
            try {
                if (auth.user.identifier) {
                    const response = await fetch(`/credits/${auth.user.identifier}/balance`);
                    if (response.ok) {
                        const data = await response.json();
                        setCredits(data.available_credit);
                    }
                }
            } catch (error) {
                // Silently ignore credit fetch errors
                setCredits(0);
            }
        };

        const fetchSubscription = async () => {
            try {
                if (auth.user.identifier) {
                    setIsLoadingSubscription(true);
                    const response = await fetch(`/subscriptions/${auth.user.identifier}/active`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.active) {
                            setSubscription(data.subscription);
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to fetch subscription:', error);
            } finally {
                setIsLoadingSubscription(false);
            }
        };

        fetchCredits();
        fetchSubscription();
    }, [auth.user.identifier]);

    const formatNumber = (num: number | undefined | null) => {
        return num?.toLocaleString() ?? '0';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

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
            setMessageToDelete(null);
            toast.success('Message deleted successfully', {
                description: 'The message has been permanently removed from your inbox.',
                duration: 3000,
            });
        } catch (error) {
            console.error('Failed to delete message:', error);
            toast.error('Failed to delete message', {
                description: 'Please try again or contact support if the problem persists.',
                duration: 4000,
            });
        }
    };

    const confirmDelete = (message: Message) => {
        setMessageToDelete(message);
    };

    return (
                    <div className="relative min-h-screen pb-16 bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
                <Head title="Inbox" />

                {/* Message for users without subscription */}
                {!isLoadingSubscription && !subscription && (
                    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 z-20 py-1 text-center text-white text-sm shadow-lg">
                        <span className="font-medium">Subscribe to a plan to continue using all features!</span>
                        <Button 
                            variant="link" 
                            size="sm" 
                            className="text-white underline ml-2 p-0 h-auto hover:text-blue-100 dark:hover:text-blue-200"
                            onClick={() => window.location.href = route('subscriptions.index')}
                        >
                            View Plans
                        </Button>
                    </div>
                )}

                <div className={`fixed ${!isLoadingSubscription && !subscription ? 'top-7' : 'top-0'} left-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-10 shadow-lg dark:shadow-black/20`}>
                <div className="container mx-auto px-4 pt-4">
                    <div className="flex flex-col items-center mb-4">
                        <div className="w-full flex justify-between items-center mb-2">
                            <div className="flex items-center">
                                <ApplicationLogo className="h-10 w-auto fill-current text-gray-900 dark:text-white" />
                                <div className="ml-2">
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">{auth.user.name}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4">
                                <div className="hidden sm:flex items-center">
                                                                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => window.location.href = route('credits.spent-history', { clientIdentifier: auth.user.identifier })}
                                        className="text-gray-900 dark:text-white px-3 py-1.5 rounded-l-lg rounded-r-none hover:bg-gray-200 dark:hover:bg-gray-700 border-r border-gray-200 dark:border-gray-600 transition-colors duration-200"
                                    >
                                        <span className="text-sm font-medium">{formatNumber(credits)} Credits</span>
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white dark:from-orange-500 dark:to-orange-600 dark:hover:from-orange-600 dark:hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-1.5 font-semibold border-0 rounded-l-none rounded-r-lg [text-shadow:_0_1px_1px_rgba(0,0,0,0.2)]"
                                        onClick={() => window.location.href = route('credits.buy')}
                                    >
                                        <CreditCardIcon className="w-4 h-4" />
                                        Buy
                                    </Button>
                                </div>
                                </div>
                                {/* Mobile Credits Button */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="sm:hidden text-white hover:text-blue-100 hover:bg-white/10"
                                    onClick={() => window.location.href = route('credits.buy')}
                                >
                                    <CreditCardIcon className="w-5 h-5" />
                                </Button>
                                <div className="relative inline-block">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button 
                                                variant="ghost" 
                                                className="text-gray-900 dark:text-white hover:text-blue-900 hover:bg-white/10 transition-colors duration-200 flex items-center gap-2 px-3 py-2 h-auto font-normal border-0 no-underline hover:no-underline focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                                            >
                                                <UserIcon className="w-5 h-5" />
                                                <span>{auth.selectedTeamMember?.full_name || auth.user.name}</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent 
                                            align="end" 
                                            alignOffset={0}
                                            sideOffset={8}
                                            className="w-56 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl dark:shadow-black/30"
                                            onCloseAutoFocus={(e) => e.preventDefault()}
                                            collisionPadding={16}
                                        >
                                            <DropdownMenuItem>
                                                <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
                                                <InertiaLink href="/help" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">Help</InertiaLink>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>
                                                <ArrowRightStartOnRectangleIcon className="w-5 h-5 mr-2" />
                                                <InertiaLink 
                                                                                                            href={route('logout', { project: auth.project.identifier })}  
                                                    method="post" 
                                                    as="button"
                                                    className="w-full text-left text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
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

            <div className={`w-full px-4 ${!isLoadingSubscription && !subscription ? 'pt-[120px]' : 'pt-[100px]'} landscape:pt-[80px] md:pt-[100px]`}>
                <div className="py-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md overflow-hidden shadow-xl dark:shadow-black/20 sm:rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                            {/* Search Bar */}
                            <div className="mb-6">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search messages..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                                    />
                                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Messages List */}
                            <div className="space-y-3">
                                {messages.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <svg className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                        <p className="text-lg font-medium">No messages found</p>
                                        <p className="text-sm">Try adjusting your search terms</p>
                                    </div>
                                ) : (
                                    messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-black/10 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 border border-gray-200 dark:border-gray-700 ${
                                                !message.isRead ? 'border-l-4 border-blue-500 dark:border-blue-400 shadow-md dark:shadow-blue-500/20' : ''
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div 
                                                    className="flex-1 cursor-pointer"
                                                    onClick={() => handleMessageClick(message)}
                                                >
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                            {message.title}
                                                        </h3>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                                        {message.content}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex items-center">
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {new Date(message.timestamp).toLocaleString()}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            confirmDelete(message);
                                                        }}
                                                        className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors duration-200 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
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

            {/* Sonner Toaster for this component */}
            <Toaster 
                position="top-right"
                richColors
                closeButton
                duration={4000}
            />

            {selectedMessage && (
                <MessageDialog 
                    message={selectedMessage} 
                    onClose={() => setSelectedMessage(null)} 
                />
            )}

            {/* Delete Confirmation Dialog */}
            {messageToDelete && (
                <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl dark:shadow-black/50 w-full max-w-md border border-gray-200 dark:border-gray-700 transform transition-all duration-200 scale-100">
                        <div className="p-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                        <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Delete Message
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        This action cannot be undone
                                    </p>
                                </div>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-6">
                                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">
                                    {messageToDelete.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                    {messageToDelete.content}
                                </p>
                            </div>
                            
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setMessageToDelete(null)}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteMessage(messageToDelete.id)}
                                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 rounded-lg transition-colors duration-200"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 