import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { MessageCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface Props extends PageProps {
    clientIdentifier?: string;
}

export default function ChatRegister({ clientIdentifier }: Props) {
    const [formData, setFormData] = useState({
        client_identifier: clientIdentifier || '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        display_name: '',
        avatar_url: '',
    });

    // Get current URL parameters to pass to login link
    const getLoginUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const clientId = urlParams.get('client_identifier');
        const slug = urlParams.get('slug');
        
        if (clientId) {
            return `/chat/login?client_identifier=${clientId}`;
        } else if (slug) {
            return `/chat/login?slug=${slug}`;
        }
        return '/chat/login';
    };
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.client_identifier || !formData.username || !formData.email || 
            !formData.password || !formData.display_name) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (formData.password !== formData.password_confirmation) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        
        try {
            const response = await fetch('/api/chat-auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    client_identifier: formData.client_identifier,
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    display_name: formData.display_name,
                    avatar_url: formData.avatar_url || null,
                }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                // Store token in localStorage
                localStorage.setItem('chat_token', data.data.token);
                localStorage.setItem('chat_user', JSON.stringify(data.data.user));
                
                toast.success('Registration successful!');
                
                // Redirect to chat
                window.location.href = '/chat';
            } else {
                toast.error(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error('Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head title="Chat Registration" />
            
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
                            <MessageCircle className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                            Chat Registration
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Create your chat account
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Join the Chat</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="username">Username *</Label>
                                    <Input
                                        id="username"
                                        name="username"
                                        type="text"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        placeholder="Choose a unique username"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="display_name">Display Name *</Label>
                                    <Input
                                        id="display_name"
                                        name="display_name"
                                        type="text"
                                        value={formData.display_name}
                                        onChange={handleInputChange}
                                        placeholder="How should others see you?"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="avatar_url">Avatar URL (Optional)</Label>
                                    <Input
                                        id="avatar_url"
                                        name="avatar_url"
                                        type="url"
                                        value={formData.avatar_url}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com/avatar.jpg"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="password">Password *</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="Create a password (min 6 characters)"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="password_confirmation">Confirm Password *</Label>
                                    <div className="relative">
                                        <Input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type={showPasswordConfirmation ? 'text' : 'password'}
                                            value={formData.password_confirmation}
                                            onChange={handleInputChange}
                                            placeholder="Confirm your password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                        >
                                            {showPasswordConfirmation ? (
                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Creating Account...' : 'Create Account'}
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Already have an account?{' '}
                                    <Link
                                        href={getLoginUrl()}
                                        className="font-medium text-blue-600 hover:text-blue-500"
                                    >
                                        Sign in here
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
