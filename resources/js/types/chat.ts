export interface Message {
    id: number;
    title: string;
    content: string;
    timestamp: string;
    type: 'marketing' | 'notification' | 'update';
    isRead: boolean;
}

export interface ChatThread {
    id: number;
    participant: string;
    lastMessage: Message;
    unreadCount: number;
} 