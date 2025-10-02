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
        balance: number;
        currency: string;
    } | null>(null);
    const [isLoadingPricing, setIsLoadingPricing] = useState(false);
    const [pricing, setPricing] = useState<any>(null);

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

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // First, try to spend 2 credits
            const creditResponse = await axios.post('/credits/spend', {
                amount: 2,
                purpose: 'Semaphore SMS Sending',
                reference_id: `sms_semaphore_${Date.now()}`,
            });

            if (!creditResponse.data.success) {
                toast.error(
                    'Insufficient credits to send SMS. Please purchase more credits.',
                );
                return;
            }

            post('/sms-semaphore/send', {
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
                    Semaphore SMS
                </h2>
            }
        >
            <Head title="Semaphore SMS" />

            <div className="bg-gray-50 py-12 dark:bg-gray-900">
                <div className="mx-auto max-w-5xl space-y-6 sm:px-6 lg:px-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <Card className="overflow-hidden border border-gray-200 shadow-lg dark:border-gray-700">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Total Sent
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {stats.sent}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="overflow-hidden border border-gray-200 shadow-lg dark:border-gray-700">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Delivered
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {stats.delivered}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="overflow-hidden border border-gray-200 shadow-lg dark:border-gray-700">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Failed
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {stats.failed}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="overflow-hidden border border-gray-200 shadow-lg dark:border-gray-700">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Balance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {balance ? (
                                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {balance.balance} {balance.currency}
                                    </div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={getBalance}
                                        disabled={isLoadingBalance}
                                        className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        {isLoadingBalance && (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Check Balance
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Send Message Form */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <Card className="overflow-hidden border border-gray-200 shadow-lg dark:border-gray-700">
                                <CardHeader className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Send Message
                                    </CardTitle>
                                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                        Send SMS messages (Max 160 characters)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6 p-6">
                                    <form
                                        onSubmit={submit}
                                        className="space-y-6"
                                    >
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
                                                    setData(
                                                        'to',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="+639123456789"
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
                                            <div className="space-y-2">
                                                <Textarea
                                                    id="message"
                                                    value={data.message}
                                                    onChange={(e) =>
                                                        setData(
                                                            'message',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Type your message here..."
                                                    className="min-h-[100px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                                                    maxLength={160}
                                                />
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {data.message.length}/160
                                                    characters
                                                </p>
                                            </div>
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
                                                Sending this SMS will cost 2
                                                credits from your balance
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
                                                                    strokeWidth={
                                                                        2
                                                                    }
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

                        <div>
                            <Card className="overflow-hidden border border-gray-200 shadow-lg dark:border-gray-700">
                                <CardHeader className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                        Pricing
                                    </CardTitle>
                                    <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                        Current SMS rates
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    {pricing ? (
                                        <div className="space-y-3">
                                            {Object.entries(pricing).map(
                                                ([key, value]: [
                                                    string,
                                                    any,
                                                ]) => (
                                                    <div
                                                        key={key}
                                                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
                                                    >
                                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            {key}
                                                        </span>
                                                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                            ₱{value}
                                                        </span>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={getPricing}
                                            disabled={isLoadingPricing}
                                            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                        >
                                            {isLoadingPricing && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            View Pricing
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Message History */}
                    <Card className="overflow-hidden border border-gray-200 shadow-lg dark:border-gray-700">
                        <CardHeader className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Message History
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                Recent messages sent through Semaphore
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
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
        </AuthenticatedLayout>
    );
}
