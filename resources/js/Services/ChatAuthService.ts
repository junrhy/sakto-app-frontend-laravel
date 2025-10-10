import { toast } from 'sonner';

export interface ChatUser {
    id: number;
    username: string;
    email: string;
    display_name: string;
    avatar_url?: string;
    is_online: boolean;
    last_seen_at: string;
    preferences: {
        theme: string;
        notifications: boolean;
        sound_enabled: boolean;
    };
}

export interface ChatAuthResponse {
    status: string;
    message: string;
    data: {
        user: ChatUser;
        token: string;
    };
}

export class ChatAuthService {
    private static instance: ChatAuthService;
    private baseUrl: string;

    private constructor() {
        this.baseUrl = '/api/chat-auth';
    }

    public static getInstance(): ChatAuthService {
        if (!ChatAuthService.instance) {
            ChatAuthService.instance = new ChatAuthService();
        }
        return ChatAuthService.instance;
    }

    /**
     * Register a new chat user
     */
    public async register(userData: {
        client_identifier: string;
        username: string;
        email: string;
        password: string;
        display_name: string;
        avatar_url?: string;
    }): Promise<ChatAuthResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (data.status === 'success') {
                // Store token and user data
                this.setToken(data.data.token);
                this.setUser(data.data.user);
                toast.success('Registration successful!');
            } else {
                toast.error(data.message || 'Registration failed');
            }

            return data;
        } catch (error) {
            console.error('Registration error:', error);
            toast.error('Registration failed. Please try again.');
            throw error;
        }
    }

    /**
     * Login chat user
     */
    public async login(credentials: {
        client_identifier: string;
        username: string;
        password: string;
    }): Promise<ChatAuthResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (data.status === 'success') {
                // Store token and user data
                this.setToken(data.data.token);
                this.setUser(data.data.user);
                toast.success('Login successful!');
            } else {
                toast.error(data.message || 'Login failed');
            }

            return data;
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Login failed. Please try again.');
            throw error;
        }
    }

    /**
     * Logout chat user
     */
    public async logout(): Promise<void> {
        try {
            const token = this.getToken();
            if (!token) return;

            await fetch(`${this.baseUrl}/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            // Clear stored data
            this.clearAuth();
            toast.success('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            // Clear data even if logout request fails
            this.clearAuth();
        }
    }

    /**
     * Get current user profile
     */
    public async getProfile(): Promise<ChatUser | null> {
        try {
            const token = this.getToken();
            if (!token) return null;

            const response = await fetch(`${this.baseUrl}/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                },
            });

            const data = await response.json();

            if (data.status === 'success') {
                this.setUser(data.data);
                return data.data;
            }

            return null;
        } catch (error) {
            console.error('Get profile error:', error);
            return null;
        }
    }

    /**
     * Update user profile
     */
    public async updateProfile(profileData: {
        display_name?: string;
        avatar_url?: string;
        preferences?: any;
    }): Promise<ChatUser | null> {
        try {
            const token = this.getToken();
            if (!token) return null;

            const response = await fetch(`${this.baseUrl}/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (data.status === 'success') {
                this.setUser(data.data);
                toast.success('Profile updated successfully');
                return data.data;
            } else {
                toast.error(data.message || 'Profile update failed');
            }

            return null;
        } catch (error) {
            console.error('Update profile error:', error);
            toast.error('Profile update failed');
            throw error;
        }
    }

    /**
     * Change password
     */
    public async changePassword(passwordData: {
        current_password: string;
        new_password: string;
    }): Promise<boolean> {
        try {
            const token = this.getToken();
            if (!token) return false;

            const response = await fetch(`${this.baseUrl}/change-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(passwordData),
            });

            const data = await response.json();

            if (data.status === 'success') {
                toast.success('Password changed successfully');
                return true;
            } else {
                toast.error(data.message || 'Password change failed');
                return false;
            }
        } catch (error) {
            console.error('Change password error:', error);
            toast.error('Password change failed');
            return false;
        }
    }

    /**
     * Update online status
     */
    public async updateOnlineStatus(isOnline: boolean): Promise<void> {
        try {
            const token = this.getToken();
            if (!token) return;

            await fetch(`${this.baseUrl}/update-online-status`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ is_online: isOnline }),
            });
        } catch (error) {
            console.error('Update online status error:', error);
        }
    }

    /**
     * Get online users
     */
    public async getOnlineUsers(clientIdentifier: string): Promise<ChatUser[]> {
        try {
            const response = await fetch(`${this.baseUrl}/online-users?client_identifier=${clientIdentifier}`, {
                headers: {
                    'Accept': 'application/json',
                },
            });

            const data = await response.json();

            if (data.status === 'success') {
                return data.data;
            }

            return [];
        } catch (error) {
            console.error('Get online users error:', error);
            return [];
        }
    }

    /**
     * Check if user is authenticated
     */
    public isAuthenticated(): boolean {
        return !!this.getToken() && !!this.getUser();
    }

    /**
     * Get current user
     */
    public getUser(): ChatUser | null {
        const userStr = localStorage.getItem('chat_user');
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * Get auth token
     */
    public getToken(): string | null {
        return localStorage.getItem('chat_token');
    }

    /**
     * Set auth token
     */
    private setToken(token: string): void {
        localStorage.setItem('chat_token', token);
    }

    /**
     * Set user data
     */
    private setUser(user: ChatUser): void {
        localStorage.setItem('chat_user', JSON.stringify(user));
    }

    /**
     * Clear authentication data
     */
    private clearAuth(): void {
        localStorage.removeItem('chat_token');
        localStorage.removeItem('chat_user');
    }

    /**
     * Get auth headers for API requests
     */
    public getAuthHeaders(): Record<string, string> {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
}

export default ChatAuthService;
