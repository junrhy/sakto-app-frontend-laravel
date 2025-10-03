import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Project, User } from '@/types/index';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

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

interface Props extends PageProps {
    auth: {
        user: User;
        project?: Project;
        modules?: string[];
        selectedTeamMember?: {
            identifier: string;
            first_name: string;
            last_name: string;
            full_name: string;
            email: string;
            roles: string[];
            allowed_apps: string[];
            profile_picture?: string;
        };
    };
    messages: Message[];
    stats: Stats;
}

export default function Index({ auth, messages, stats }: Props) {
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);
    const [balance, setBalance] = useState<{
        balance: string;
        currency: string;
    } | null>(null);

    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    const { data, setData, post, processing, errors, reset } = useForm({
        to: '',
        message: '',
    });

    const getBalance = async () => {
        setIsLoadingBalance(true);
        try {
            const response = await fetch('/sms-twilio/balance');
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

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!data.to || !data.to.trim()) {
            toast.error('Phone number is required');
            return;
        }

        if (!data.message || !data.message.trim()) {
            toast.error('Message is required');
            return;
        }

        // Basic phone number validation
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(data.to.trim())) {
            toast.error('Please enter a valid phone number (e.g., +1234567890)');
            return;
        }

        try {
            // First, try to spend 4 credits
            const creditResponse = await axios.post('/credits/spend', {
                amount: 4,
                purpose: 'International SMS Sending',
                reference_id: `sms_twilio_${Date.now()}`,
            });

            if (!creditResponse.data.success) {
                toast.error(
                    'Insufficient credits to send SMS. Please purchase more credits.',
                );
                return;
            }

            post('/sms-twilio/send', {
                onSuccess: () => {
                    toast.success('Message sent successfully!');
                    reset();
                },
                onError: (errors) => {
                    toast.error('Failed to send message');
                },
            });
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || 'Failed to send message',
            );
        }
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
            auth={{
                user: auth.user,
                project: auth.project,
                modules: auth.modules,
            }}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    International SMS
                </h2>
            }
        >
            <Head title="International SMS" />

            <div>
                <div className="mx-auto sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Total Sent Card */}
                        <Card className="relative overflow-hidden border border-gray-200 shadow-lg transition-all duration-200 hover:shadow-xl dark:border-gray-700 bg-slate-50 dark:bg-slate-800/50">
                            <CardContent className="relative bg-slate-50 p-6 dark:bg-slate-800/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Total Sent
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                            {stats.sent}
                                        </p>
                                        <p className="text-xs text-blue-600 dark:text-blue-400">
                                            All messages sent
                                        </p>
                                    </div>
                                    <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                                        <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Delivered Card */}
                        <Card className="relative overflow-hidden border border-gray-200 shadow-lg transition-all duration-200 hover:shadow-xl dark:border-gray-700 bg-slate-50 dark:bg-slate-800/50">
                            <CardContent className="relative bg-slate-50 p-6 dark:bg-slate-800/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Delivered
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                            {stats.delivered}
                                        </p>
                                        <p className="text-xs text-green-600 dark:text-green-400">
                                            {stats.sent > 0 ? `${Math.round((stats.delivered / stats.sent) * 100)}% success rate` : '0% success rate'}
                                        </p>
                                    </div>
                                    <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                                        <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Failed Card */}
                        <Card className="relative overflow-hidden border border-gray-200 shadow-lg transition-all duration-200 hover:shadow-xl dark:border-gray-700 bg-slate-50 dark:bg-slate-800/50">
                            <CardContent className="relative bg-slate-50 p-6 dark:bg-slate-800/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Failed
                                        </p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                            {stats.failed}
                                        </p>
                                        <p className="text-xs text-red-600 dark:text-red-400">
                                            {stats.sent > 0 ? `${Math.round((stats.failed / stats.sent) * 100)}% failure rate` : '0% failure rate'}
                                        </p>
                                    </div>
                                    <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                                        <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Balance Card */}
                        <Card className="relative overflow-hidden border border-gray-200 shadow-lg transition-all duration-200 hover:shadow-xl dark:border-gray-700 bg-slate-50 dark:bg-slate-800/50">
                            <CardContent 
                                className="relative bg-slate-50 p-6 dark:bg-slate-800/50 cursor-pointer"
                                onClick={!balance ? getBalance : undefined}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Account Balance
                                        </p>
                                        {balance ? (
                                            <div>
                                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                                    {balance.balance}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {balance.currency}
                                                </p>
                                                <p className="text-xs text-purple-600 dark:text-purple-400">
                                                    Current balance
                                                </p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                                    --
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Not loaded
                                                </p>
                                                <p className="text-xs text-purple-600 dark:text-purple-400">
                                                    Click to check balance
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
                                        <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Send Message Form */}
                    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <Card className="overflow-hidden border border-gray-200 shadow-lg dark:border-gray-700">
                        <CardHeader className="border-b border-gray-200 bg-slate-50 px-6 py-4 dark:border-gray-700 dark:bg-slate-800">
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Send Message
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                Send SMS messages using International SMS
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 bg-slate-50 p-6 dark:bg-slate-800/50">
                            <form onSubmit={submit} className="space-y-6">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="to"
                                        className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                                    >
                                        To
                                    </label>
                                    <Input
                                        id="to"
                                        type="text"
                                        value={data.to}
                                        onChange={(e) =>
                                            setData('to', e.target.value)
                                        }
                                        placeholder="+1234567890"
                                        className="max-w-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                    />
                                    {errors.to && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.to}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label
                                        htmlFor="message"
                                        className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                                    >
                                        Message
                                    </label>
                                    <Textarea
                                        id="message"
                                        value={data.message}
                                        onChange={(e) =>
                                            setData('message', e.target.value)
                                        }
                                        placeholder="Type your message here..."
                                        className="min-h-[100px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                    />
                                    {errors.message && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.message}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                                        <svg
                                            className="mr-2 h-5 w-5 text-yellow-500"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        Sending this SMS will cost 4 credits
                                        from your balance
                                    </div>
                                    {canEdit && (
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="inline-flex items-center rounded-lg border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2 className="-ml-1 mr-3 h-5 w-5 animate-spin text-white" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <svg
                                                        className="mr-2 h-5 w-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                                        />
                                                    </svg>
                                                    Send Message
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Quick Actions */}
                        <div className="space-y-6">
                            {/* Quick Stats */}
                            <Card className="overflow-hidden border border-gray-200 shadow-lg dark:border-gray-700">
                                <CardHeader className="border-b border-gray-200 bg-slate-50 px-6 py-4 dark:border-gray-700 dark:bg-slate-800">
                                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Quick Stats
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="bg-slate-50 p-6 dark:bg-slate-800/50">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                Total Sent
                                            </span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {stats.sent}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                Delivered
                                            </span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {stats.delivered}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                Failed
                                            </span>
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {stats.failed}
                                            </span>
                                        </div>
                                        {balance && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    Balance
                                                </span>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {balance.balance} {balance.currency}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card className="overflow-hidden border border-gray-200 shadow-lg dark:border-gray-700">
                                <CardHeader className="border-b border-gray-200 bg-slate-50 px-6 py-4 dark:border-gray-700 dark:bg-slate-800">
                                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Quick Actions
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="bg-slate-50 p-6 dark:bg-slate-800/50">
                                    <div className="space-y-3">
                                        <Button
                                            variant="outline"
                                            onClick={getBalance}
                                            disabled={isLoadingBalance}
                                            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                        >
                                            {isLoadingBalance && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            Check Balance
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => window.location.reload()}
                                            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                        >
                                            Refresh Stats
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Message History */}
                    <div className="mt-8">
                        <Card className="overflow-hidden border border-gray-200 shadow-lg dark:border-gray-700">
                        <CardHeader className="border-b border-gray-200 bg-slate-50 px-6 py-4 dark:border-gray-700 dark:bg-slate-800">
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Message History
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                Recent messages sent through Twilio
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="bg-slate-50 p-6 dark:bg-slate-800/50">
                            <div className="space-y-4">
                                {messages.length === 0 ? (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No messages sent yet
                                    </p>
                                ) : (
                                    messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className="space-y-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-600 dark:bg-gray-700"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                                        {message.to}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {message.body}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant="secondary"
                                                    className={`${getStatusColor(
                                                        message.status,
                                                    )} text-white`}
                                                >
                                                    {message.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(
                                                    message.created_at,
                                                ).toLocaleString()}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
