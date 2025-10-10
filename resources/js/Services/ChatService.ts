import echo from '../echo';

export interface Message {
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

export interface Conversation {
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

export class ChatService {
    private static instance: ChatService;
    private listeners: Map<string, (data: any) => void> = new Map();

    private constructor() {}

    public static getInstance(): ChatService {
        if (!ChatService.instance) {
            ChatService.instance = new ChatService();
        }
        return ChatService.instance;
    }

    /**
     * Listen for new messages in a conversation
     */
    public listenForMessages(conversationId: number, userId: number, callback: (message: Message) => void) {
        const channelName = `chat-conversation-${conversationId}-user-${userId}`;
        
        // Store the callback
        this.listeners.set(channelName, callback);

        // Listen to the channel
        echo.private(channelName)
            .listen('new-message', (data: any) => {
                console.log('Received new message:', data);
                if (data.message) {
                    callback(data.message);
                }
            })
            .error((error: any) => {
                console.error('Echo error:', error);
            });
    }

    /**
     * Listen for conversation updates
     */
    public listenForConversationUpdates(conversationId: number, userId: number, callback: (conversation: Conversation) => void) {
        const channelName = `chat-conversation-${conversationId}-user-${userId}`;
        
        echo.private(channelName)
            .listen('conversation-updated', (data: any) => {
                console.log('Conversation updated:', data);
                if (data.conversation) {
                    callback(data.conversation);
                }
            });
    }

    /**
     * Listen for user presence in conversations
     */
    public listenForUserPresence(conversationId: number, callback: (data: any) => void) {
        const channelName = `chat-conversation-${conversationId}`;
        
        echo.join(channelName)
            .here((users: any[]) => {
                console.log('Users currently in conversation:', users);
                callback({ type: 'here', users });
            })
            .joining((user: any) => {
                console.log('User joined conversation:', user);
                callback({ type: 'joining', user });
            })
            .leaving((user: any) => {
                console.log('User left conversation:', user);
                callback({ type: 'leaving', user });
            });
    }

    /**
     * Stop listening to a channel
     */
    public stopListening(conversationId: number, userId: number) {
        const channelName = `chat-conversation-${conversationId}-user-${userId}`;
        
        // Remove the callback
        this.listeners.delete(channelName);
        
        // Leave the channel
        echo.leave(channelName);
    }

    /**
     * Send a message
     */
    public async sendMessage(conversationId: number, content: string, messageType: string = 'text') {
        try {
            const response = await fetch('/chat/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    conversation_id: conversationId,
                    content,
                    message_type: messageType,
                }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    }

    /**
     * Mark messages as read
     */
    public async markAsRead(conversationId: number) {
        try {
            const response = await fetch('/chat/mark-read', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    conversation_id: conversationId,
                }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to mark messages as read:', error);
            throw error;
        }
    }

    /**
     * Get conversation messages
     */
    public async getMessages(conversationId: number) {
        try {
            const response = await fetch(`/chat/${conversationId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to get messages:', error);
            throw error;
        }
    }

    /**
     * Create a new conversation
     */
    public async createConversation(title: string, participants: number[], type: string = 'direct') {
        try {
            const response = await fetch('/chat/conversations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    title,
                    participants,
                    type,
                }),
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to create conversation:', error);
            throw error;
        }
    }

    /**
     * Get available chat users for new conversations
     */
    public async getChatUsers() {
        try {
            const response = await fetch('/chat/users');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to get chat users:', error);
            throw error;
        }
    }

    /**
     * Disconnect from all channels
     */
    public disconnect() {
        echo.disconnect();
        this.listeners.clear();
    }
}

export default ChatService;
