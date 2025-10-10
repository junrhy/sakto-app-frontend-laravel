import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Plus, Search, MessageCircle, Users, Clock, Menu, X, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Conversation {
    id: number;
    title: string;
    type: string;
    participants: number[];
    last_message_at: string;
    created_at: string;
    updated_at: string;
    latest_message?: {
        id: number;
        content: string;
        sender_id: number;
        created_at: string;
        sender: {
            id: number;
            name: string;
            email: string;
        };
    };
    participant_users?: Array<{
        id: number;
        name: string;
        email: string;
    }>;
}

interface User {
    id: number;
    name: string;
    email: string;
    identifier: string;
}

interface ChatUser {
    id: number;
    name: string;
    email: string;
    avatar_url?: string;
    is_online?: boolean;
    last_seen_at?: string;
}

interface Props extends PageProps {
    conversations: Conversation[];
    user: User;
}

export default function ChatIndex({ conversations, user }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [availableChatUsers, setAvailableChatUsers] = useState<ChatUser[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
    const [newChatTitle, setNewChatTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);

    const filteredConversations = conversations.filter(conversation =>
        conversation.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conversation.participant_users?.some(participant =>
            participant.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const formatLastMessageTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const diffInMinutes = Math.floor(diffInHours * 60);
            return `${diffInMinutes}m ago`;
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const getConversationTitle = (conversation: Conversation) => {
        if (conversation.title) {
            return conversation.title;
        }
        
        if (conversation.type === 'direct' && conversation.participant_users) {
            const otherParticipant = conversation.participant_users.find(
                participant => participant.id !== user.id
            );
            return otherParticipant?.name || 'Direct Message';
        }
        
        return 'Group Chat';
    };

    const getConversationSubtitle = (conversation: Conversation) => {
        if (conversation.latest_message) {
            const isOwnMessage = conversation.latest_message.sender_id === user.id;
            const prefix = isOwnMessage ? 'You: ' : '';
            return `${prefix}${conversation.latest_message.content}`;
        }
        return 'No messages yet';
    };

    const loadAvailableChatUsers = async () => {
        try {
            const response = await fetch('/chat/users');
            const data = await response.json();
            if (data.status === 'success') {
                setAvailableChatUsers(data.data);
            }
        } catch (error) {
            console.error('Failed to load chat users:', error);
        }
    };

    const createNewConversation = async () => {
        if (selectedContacts.length === 0) {
            toast.error('Please select at least one contact');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/chat/conversations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    title: newChatTitle || null,
                    type: selectedContacts.length === 1 ? 'direct' : 'group',
                    participants: selectedContacts, // Only contact IDs, not user ID
                }),
            });

            const data = await response.json();
            if (data.status === 'success') {
                toast.success('Conversation created successfully');
                setShowNewChatModal(false);
                setSelectedContacts([]);
                setNewChatTitle('');
                // Reload the page to show the new conversation
                window.location.reload();
            } else {
                toast.error(data.message || 'Failed to create conversation');
            }
        } catch (error) {
            console.error('Failed to create conversation:', error);
            toast.error('Failed to create conversation');
        } finally {
            setLoading(false);
        }
    };

    const toggleContactSelection = (contactId: number) => {
        setSelectedContacts(prev =>
            prev.includes(contactId)
                ? prev.filter(id => id !== contactId)
                : [...prev, contactId]
        );
    };

    useEffect(() => {
        if (showNewChatModal) {
            loadAvailableChatUsers();
        }
    }, [showNewChatModal]);

    return (
        <>
            <Head title="Chat" />
            
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Mobile Header */}
                <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowSidebar(true)}
                                className="p-2"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Chat</h1>
                        </div>
                        <Button
                            onClick={() => setShowNewChatModal(true)}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Desktop Header */}
                <div className="hidden lg:block max-w-7xl mx-auto px-6 py-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Chat</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Connect and communicate with your team members
                        </p>
                    </div>
                </div>

                <div className="flex h-screen lg:h-auto">
                    {/* Mobile Sidebar Overlay */}
                    {showSidebar && (
                        <div className="lg:hidden fixed inset-0 z-50">
                            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowSidebar(false)} />
                            <div className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-800 shadow-lg">
                                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversations</h2>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowSidebar(false)}
                                        className="p-2"
                                    >
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                                <div className="p-4">
                                    <div className="relative mb-4">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <Input
                                            placeholder="Search conversations..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        {filteredConversations.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                                {searchTerm ? 'No conversations found' : 'No conversations yet'}
                                            </div>
                                        ) : (
                                            filteredConversations.map((conversation) => (
                                                <Link
                                                    key={conversation.id}
                                                    href={`/chat/${conversation.id}`}
                                                    onClick={() => setShowSidebar(false)}
                                                    className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <Avatar className="h-12 w-12">
                                                            <AvatarImage src="" />
                                                            <AvatarFallback>
                                                                {conversation.type === 'direct' ? (
                                                                    conversation.participant_users?.[0]?.name?.charAt(0) || 'U'
                                                                ) : (
                                                                    <Users className="h-5 w-5" />
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                                    {getConversationTitle(conversation)}
                                                                </h3>
                                                                {conversation.last_message_at && (
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                                                        {formatLastMessageTime(conversation.last_message_at)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                                                                {getConversationSubtitle(conversation)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Desktop Sidebar */}
                    <div className="hidden lg:block w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversations</h2>
                                <Button
                                    onClick={() => setShowNewChatModal(true)}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    New Chat
                                </Button>
                            </div>
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    placeholder="Search conversations..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                                {filteredConversations.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                        {searchTerm ? 'No conversations found' : 'No conversations yet'}
                                    </div>
                                ) : (
                                    filteredConversations.map((conversation) => (
                                        <Link
                                            key={conversation.id}
                                            href={`/chat/${conversation.id}`}
                                            className="block p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarImage src="" />
                                                    <AvatarFallback>
                                                        {conversation.type === 'direct' ? (
                                                            conversation.participant_users?.[0]?.name?.charAt(0) || 'U'
                                                        ) : (
                                                            <Users className="h-5 w-5" />
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                            {getConversationTitle(conversation)}
                                                        </h3>
                                                        {conversation.last_message_at && (
                                                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                                                {formatLastMessageTime(conversation.last_message_at)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                                                        {getConversationSubtitle(conversation)}
                                                    </p>
                                                    <div className="flex items-center mt-1">
                                                        {conversation.type === 'group' && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                Group
                                                            </Badge>
                                                        )}
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                                                            {conversation.participant_users?.length || 0} participants
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 bg-white dark:bg-gray-800">
                        <div className="h-full flex items-center justify-center p-6">
                            <div className="text-center max-w-md">
                                <MessageCircle className="h-20 w-20 text-gray-400 mx-auto mb-6" />
                                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">
                                    Welcome to Chat
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                                    Select a conversation from the sidebar or start a new chat to begin messaging with your team.
                                </p>
                                <div className="space-y-3">
                                    <Button
                                        onClick={() => setShowNewChatModal(true)}
                                        className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base"
                                    >
                                        <Plus className="h-5 w-5 mr-2" />
                                        Start New Chat
                                    </Button>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {conversations.length} conversation{conversations.length !== 1 ? 's' : ''} available
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* New Chat Modal */}
            {showNewChatModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md max-h-[90vh] overflow-hidden">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Start New Chat</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowNewChatModal(false)}
                                    className="p-2"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Chat Title (Optional)
                                </label>
                                <Input
                                    placeholder="Enter chat title..."
                                    value={newChatTitle}
                                    onChange={(e) => setNewChatTitle(e.target.value)}
                                    className="h-11"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Select Contacts ({selectedContacts.length} selected)
                                </label>
                                <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                                    {availableChatUsers.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                            No contacts available
                                        </div>
                                    ) : (
                                        availableChatUsers.map((chatUser) => (
                                            <div
                                                key={chatUser.id}
                                                className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                                onClick={() => toggleContactSelection(chatUser.id)}
                                            >
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedContacts.includes(chatUser.id)}
                                                        onChange={() => toggleContactSelection(chatUser.id)}
                                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                                    />
                                                </div>
                                                <div className="ml-3 flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {chatUser.name}
                                                        </div>
                                                        {chatUser.is_online && (
                                                            <div className="flex items-center">
                                                                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                                                <span className="text-xs text-green-600 dark:text-green-400">Online</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                        {chatUser.email}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowNewChatModal(false)}
                                    className="flex-1 h-11"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={createNewConversation}
                                    disabled={loading || selectedContacts.length === 0}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 h-11"
                                >
                                    {loading ? 'Creating...' : `Create Chat${selectedContacts.length > 1 ? ' (Group)' : ''}`}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
}
