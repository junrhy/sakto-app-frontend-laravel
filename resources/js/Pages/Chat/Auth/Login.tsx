import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Eye, EyeOff, MessageCircle } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

interface Props extends PageProps {
    clientIdentifier?: string;
}

export default function ChatLogin({ clientIdentifier }: Props) {
    const [formData, setFormData] = useState({
        client_identifier: clientIdentifier || '',
        username: '',
        password: '',
    });

    // Get current URL parameters to pass to register link
    const getRegisterUrl = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const clientId = urlParams.get('client_identifier');
        const slug = urlParams.get('slug');

        if (clientId) {
            return `/chat/register?client_identifier=${clientId}`;
        } else if (slug) {
            return `/chat/register?slug=${slug}`;
        }
        return '/chat/register';
    };
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.client_identifier ||
            !formData.username ||
            !formData.password
        ) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/chat-auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.status === 'success') {
                // Store token in localStorage
                localStorage.setItem('chat_token', data.data.token);
                localStorage.setItem(
                    'chat_user',
                    JSON.stringify(data.data.user),
                );

                toast.success('Login successful!');

                // Redirect to chat
                window.location.href = '/chat';
            } else {
                toast.error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Head title="Chat Login" />

            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                            <MessageCircle className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                            Chat Login
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Sign in to your chat account
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Welcome Back</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        name="username"
                                        type="text"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        placeholder="Enter your username"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                        >
                                            {showPassword ? (
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
                                    {isLoading ? 'Signing in...' : 'Sign In'}
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Don't have an account?{' '}
                                    <Link
                                        href={getRegisterUrl()}
                                        className="font-medium text-blue-600 hover:text-blue-500"
                                    >
                                        Sign up here
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
