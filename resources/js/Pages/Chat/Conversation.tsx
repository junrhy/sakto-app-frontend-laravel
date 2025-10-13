import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import ChatService, { Message as ChatMessage } from '@/Services/ChatService';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Info,
    MessageCircle,
    Phone,
    Send,
    Users,
    Video,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Message {
    id: number;
    content: string;
    sender_id: number;
    message_type: string;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
    sender: {
        id: number;
        name: string;
        email: string;
    };
}

interface Conversation {
    id: number;
    title: string;
    type: string;
    participants: number[];
    created_at: string;
    participant_users: Array<{
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

interface Props extends PageProps {
    conversation: Conversation;
    messages: Message[];
    user: User;
}

export default function ChatConversation({
    conversation,
    messages,
    user,
}: Props) {
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [localMessages, setLocalMessages] = useState<Message[]>(messages);
    const chatService = ChatService.getInstance();
    const [showInfo, setShowInfo] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [localMessages]);

    // Set up real-time listeners
    useEffect(() => {
        // Listen for new messages
        chatService.listenForMessages(
            conversation.id,
            user.id,
            (message: ChatMessage) => {
                setLocalMessages((prev) => [...prev, message]);
            },
        );

        // Mark messages as read when component mounts
        chatService.markAsRead(conversation.id);

        // Cleanup on unmount
        return () => {
            chatService.stopListening(conversation.id, user.id);
        };
    }, [conversation.id, user.id]);

    const formatMessageTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatMessageDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    const groupMessagesByDate = (messages: Message[]) => {
        const groups: { [key: string]: Message[] } = {};

        messages.forEach((message) => {
            const date = new Date(message.created_at).toDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(message);
        });

        return groups;
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || isLoading) return;

        const messageContent = newMessage.trim();
        setNewMessage('');
        setIsLoading(true);

        try {
            const data = await chatService.sendMessage(
                conversation.id,
                messageContent,
                'text',
            );
            if (data.status === 'success') {
                // Add the new message to local state immediately for instant feedback
                const newMessage: Message = {
                    id: data.data.id,
                    content: messageContent,
                    sender_id: user.id,
                    message_type: 'text',
                    is_read: false,
                    read_at: null,
                    created_at: new Date().toISOString(),
                    sender: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                    },
                };
                setLocalMessages((prev) => [...prev, newMessage]);
            } else {
                toast.error(data.message || 'Failed to send message');
                setNewMessage(messageContent); // Restore the message
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            toast.error('Failed to send message');
            setNewMessage(messageContent); // Restore the message
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);
        // Simple typing indicator logic
        if (e.target.value && !isTyping) {
            setIsTyping(true);
            setTimeout(() => setIsTyping(false), 2000);
        }
    };

    const getConversationTitle = () => {
        if (conversation.title) {
            return conversation.title;
        }

        if (conversation.type === 'direct') {
            const otherParticipant = conversation.participant_users.find(
                (participant) => participant.id !== user.id,
            );
            return otherParticipant?.name || 'Direct Message';
        }

        return 'Group Chat';
    };

    const messageGroups = groupMessagesByDate(localMessages);

    return (
        <>
            <Head title={`Chat - ${getConversationTitle()}`} />

            <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
                {/* Mobile-Optimized Header */}
                <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-3 py-3 dark:border-gray-700 dark:bg-gray-800 sm:px-4">
                    <div className="flex items-center justify-between">
                        <div className="flex min-w-0 flex-1 items-center space-x-2 sm:space-x-3">
                            <Link
                                href="/chat"
                                className="flex-shrink-0 rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </Link>

                            {/* Avatar and Title - Mobile Optimized */}
                            <div className="flex min-w-0 flex-1 items-center space-x-2 sm:space-x-3">
                                <Avatar className="h-8 w-8 flex-shrink-0 sm:h-10 sm:w-10">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="text-xs sm:text-sm">
                                        {conversation.type === 'direct' ? (
                                            conversation.participant_users
                                                .find((p) => p.id !== user.id)
                                                ?.name?.charAt(0) || 'U'
                                        ) : (
                                            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                                        )}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0 flex-1">
                                    <h1 className="truncate text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
                                        {getConversationTitle()}
                                    </h1>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                                            {
                                                conversation.participant_users
                                                    .length
                                            }{' '}
                                            {conversation.participant_users
                                                .length === 1
                                                ? 'member'
                                                : 'members'}
                                        </span>
                                        {conversation.type === 'group' && (
                                            <Badge
                                                variant="secondary"
                                                className="text-xs"
                                            >
                                                Group
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons - Mobile Optimized */}
                        <div className="flex flex-shrink-0 items-center space-x-1 sm:space-x-2">
                            {conversation.type === 'direct' && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                                    >
                                        <Phone className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                                    >
                                        <Video className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                                onClick={() => setShowInfo(!showInfo)}
                            >
                                <Info className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Conversation Info Panel - Mobile Sliding Panel */}
                {showInfo && (
                    <div className="border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                        <div className="space-y-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Conversation Info
                            </h3>
                            <div className="space-y-2">
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Created:
                                    </span>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {new Date(
                                            conversation.created_at,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        Participants:
                                    </span>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {conversation.participant_users.map(
                                            (participant) => (
                                                <Badge
                                                    key={participant.id}
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {participant.name}
                                                </Badge>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages - Mobile Optimized */}
                <div className="flex-1 space-y-3 overflow-y-auto p-2 sm:space-y-4 sm:p-4">
                    {Object.keys(messageGroups).length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center py-8 text-center">
                            <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800">
                                <MessageCircle className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                                Start the conversation
                            </h3>
                            <p className="max-w-sm text-gray-500 dark:text-gray-400">
                                Send your first message to begin chatting with{' '}
                                {getConversationTitle()}
                            </p>
                        </div>
                    ) : (
                        Object.entries(messageGroups).map(
                            ([date, messages]) => (
                                <div key={date}>
                                    {/* Date Separator - Mobile Optimized */}
                                    <div className="my-3 flex items-center justify-center sm:my-4">
                                        <div className="rounded-full bg-gray-200 px-3 py-1 dark:bg-gray-700">
                                            <span className="text-xs text-gray-600 dark:text-gray-300 sm:text-sm">
                                                {formatMessageDate(
                                                    messages[0].created_at,
                                                )}
                                            </span>
                                        </div>
                                    </div>

                                    {messages.map((message, index) => {
                                        const isOwnMessage =
                                            message.sender_id === user.id;
                                        const showAvatar =
                                            index === 0 ||
                                            messages[index - 1].sender_id !==
                                                message.sender_id;
                                        const nextMessage = messages[index + 1];
                                        const showTime =
                                            !nextMessage ||
                                            nextMessage.sender_id !==
                                                message.sender_id;

                                        return (
                                            <div
                                                key={message.id}
                                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${
                                                    showAvatar
                                                        ? 'mt-3 sm:mt-4'
                                                        : 'mt-1'
                                                }`}
                                            >
                                                <div
                                                    className={`flex max-w-[85%] sm:max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                                                >
                                                    {/* Avatar - Mobile Optimized */}
                                                    {!isOwnMessage &&
                                                        showAvatar && (
                                                            <Avatar className="mr-2 h-6 w-6 flex-shrink-0 sm:h-8 sm:w-8">
                                                                <AvatarImage src="" />
                                                                <AvatarFallback className="text-xs">
                                                                    {message.sender.name.charAt(
                                                                        0,
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        )}
                                                    {!isOwnMessage &&
                                                        !showAvatar && (
                                                            <div className="mr-2 w-6 flex-shrink-0 sm:w-8" />
                                                        )}

                                                    <div
                                                        className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
                                                    >
                                                        {/* Sender Name - Mobile Optimized */}
                                                        {!isOwnMessage &&
                                                            showAvatar && (
                                                                <span className="mb-1 px-1 text-xs text-gray-500 dark:text-gray-400">
                                                                    {
                                                                        message
                                                                            .sender
                                                                            .name
                                                                    }
                                                                </span>
                                                            )}

                                                        {/* Message Bubble - Mobile Optimized */}
                                                        <div
                                                            className={`max-w-full break-words rounded-lg px-3 py-2 sm:px-4 sm:py-2 ${
                                                                isOwnMessage
                                                                    ? 'rounded-br-sm bg-blue-600 text-white'
                                                                    : 'rounded-bl-sm border border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white'
                                                            }`}
                                                        >
                                                            <p className="text-sm leading-relaxed sm:text-base">
                                                                {
                                                                    message.content
                                                                }
                                                            </p>
                                                        </div>

                                                        {/* Message Time and Status - Mobile Optimized */}
                                                        {(showTime ||
                                                            isOwnMessage) && (
                                                            <div
                                                                className={`mt-1 flex items-center space-x-1 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}
                                                            >
                                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {formatMessageTime(
                                                                        message.created_at,
                                                                    )}
                                                                </span>
                                                                {isOwnMessage &&
                                                                    message.is_read && (
                                                                        <span className="text-xs text-blue-500">
                                                                            ✓✓
                                                                        </span>
                                                                    )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ),
                        )
                    )}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="flex items-center space-x-2 rounded-lg bg-gray-100 px-3 py-2 dark:bg-gray-800">
                                <div className="flex space-x-1">
                                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                                    <div
                                        className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                                        style={{ animationDelay: '0.1s' }}
                                    ></div>
                                    <div
                                        className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                                        style={{ animationDelay: '0.2s' }}
                                    ></div>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Typing...
                                </span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input - Mobile Optimized */}
                <div className="safe-area-pb border-t border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800 sm:p-4">
                    <div className="flex items-end space-x-2 sm:space-x-3">
                        <div className="min-w-0 flex-1">
                            <Input
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading}
                                className="min-h-[44px] resize-none text-base"
                            />
                        </div>
                        <Button
                            onClick={sendMessage}
                            disabled={!newMessage.trim() || isLoading}
                            className="min-h-[44px] min-w-[44px] flex-shrink-0 bg-blue-600 p-0 hover:bg-blue-700"
                        >
                            {isLoading ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
