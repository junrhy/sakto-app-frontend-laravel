import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Badge } from '@/Components/ui/badge';
import { Loader2 } from 'lucide-react';

interface Message {
    id: string;
    to: string;
    body: string;
    status: string;
    created_at: string;
}

interface Stats {
    sent: number;
    delivered: number;
    failed: number;
}

interface Props {
    auth: {
        user: {
            name: string;
            email: string;
        }
    };
    messages: Message[];
    stats: Stats;
}

export default function Index({ auth, messages, stats }: Props) {
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);
    const [balance, setBalance] = useState<{ balance: number; currency: string } | null>(null);
    const [isLoadingPricing, setIsLoadingPricing] = useState(false);
    const [pricing, setPricing] = useState<any>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        to: '',
        message: ''
    });

    const getBalance = async () => {
        setIsLoadingBalance(true);
        try {
            const response = await fetch('/sms-semaphore/balance');
            const data = await response.json();
            if (data.error) {
                toast.error('Failed to fetch balance: ' + data.error);
            } else {
                setBalance(data);
            }
        } catch (error) {
            toast.error('Failed to fetch balance');
        } finally {
            setIsLoadingBalance(false);
        }
    };

    const getPricing = async () => {
        setIsLoadingPricing(true);
        try {
            const response = await fetch('/sms-semaphore/pricing');
            const data = await response.json();
            if (data.error) {
                toast.error('Failed to fetch pricing: ' + data.error);
            } else {
                setPricing(data);
            }
        } catch (error) {
            toast.error('Failed to fetch pricing');
        } finally {
            setIsLoadingPricing(false);
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/sms-semaphore/send', {
            onSuccess: () => {
                toast.success('Message sent successfully!');
                reset();
            },
            onError: (errors) => {
                toast.error('Failed to send message');
            }
        });
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return 'bg-green-500';
            case 'failed':
                return 'bg-red-500';
            case 'sent':
                return 'bg-blue-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Semaphore SMS</h2>}
        >
            <Head title="Semaphore SMS" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.sent}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.delivered}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.failed}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Balance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {balance ? (
                                    <div className="text-2xl font-bold">
                                        {balance.balance} {balance.currency}
                                    </div>
                                ) : (
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={getBalance}
                                        disabled={isLoadingBalance}
                                    >
                                        {isLoadingBalance && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Check Balance
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Send Message Form */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Send Message</CardTitle>
                                    <CardDescription>Send SMS messages using Semaphore (Max 160 characters)</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={submit} className="space-y-4">
                                        <div className="space-y-2">
                                            <label htmlFor="to" className="text-sm font-medium">
                                                To
                                            </label>
                                            <Input
                                                id="to"
                                                type="text"
                                                value={data.to}
                                                onChange={e => setData('to', e.target.value)}
                                                placeholder="+639123456789"
                                                className="max-w-md"
                                            />
                                            {errors.to && (
                                                <p className="text-sm text-red-500">{errors.to}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="message" className="text-sm font-medium">
                                                Message
                                            </label>
                                            <div className="space-y-2">
                                                <Textarea
                                                    id="message"
                                                    value={data.message}
                                                    onChange={e => setData('message', e.target.value)}
                                                    placeholder="Type your message here..."
                                                    className="min-h-[100px]"
                                                    maxLength={160}
                                                />
                                                <p className="text-sm text-gray-500">
                                                    {data.message.length}/160 characters
                                                </p>
                                            </div>
                                            {errors.message && (
                                                <p className="text-sm text-red-500">{errors.message}</p>
                                            )}
                                        </div>

                                        <Button type="submit" disabled={processing}>
                                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Send Message
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        <div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pricing</CardTitle>
                                    <CardDescription>Current SMS rates</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {pricing ? (
                                        <div className="space-y-2">
                                            {Object.entries(pricing).map(([key, value]: [string, any]) => (
                                                <div key={key} className="flex justify-between items-center">
                                                    <span className="text-sm font-medium">{key}</span>
                                                    <span className="text-sm">₱{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={getPricing}
                                            disabled={isLoadingPricing}
                                            className="w-full"
                                        >
                                            {isLoadingPricing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            View Pricing
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Message History */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Message History</CardTitle>
                            <CardDescription>Recent messages sent through Semaphore</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {messages.length === 0 ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No messages sent yet</p>
                                ) : (
                                    messages.map((message) => (
                                        <div 
                                            key={message.id}
                                            className="border rounded-lg p-4 space-y-2"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium">{message.to}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {message.body}
                                                    </p>
                                                </div>
                                                <Badge variant="secondary" className={getStatusColor(message.status)}>
                                                    {message.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(message.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
