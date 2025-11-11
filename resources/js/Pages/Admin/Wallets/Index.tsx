import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Head, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { useState } from 'react';
import { formatDateTimeForDisplay } from '@/Pages/Public/Community/utils/dateUtils';
import { toast } from 'sonner';

interface Customer {
    id: number;
    name: string;
    email: string;
    contact_number?: string | null;
    identifier?: string | null;
}

interface Wallet {
    id: number;
    balance: string;
    currency: string;
    updated_at: string;
}

interface WalletTransaction {
    id: number;
    type: string;
    status: string;
    amount: string;
    reference?: string | null;
    description?: string | null;
    transaction_at: string;
}

interface Props extends PageProps {
    customer: Customer | null;
    wallet: Wallet | null;
    transactions: WalletTransaction[];
    filters: {
        contact_number?: string;
    };
}

export default function AdminWalletIndex({
    auth,
    customer,
    wallet,
    transactions,
    filters,
}: Props) {
    const formatCurrency = (value: unknown, currencyCode?: string) => {
        const numeric = Number.parseFloat(
            typeof value === 'number' ? value.toString() : value ? String(value) : '0',
        );

        if (!Number.isFinite(numeric)) {
            return (currencyCode ?? 'USD') + ' 0.00';
        }

        return numeric.toLocaleString('en-US', {
            style: 'currency',
            currency: currencyCode ?? 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const [topUpProcessing, setTopUpProcessing] = useState(false);
    const [form, setForm] = useState({
        contact_number: filters.contact_number ?? '',
        amount: '',
        reference: '',
        description: '',
    });

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        router.get(
            route('admin.wallets.index', {
                contact_number: form.contact_number,
            }),
            {},
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    const handleTopUp = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setTopUpProcessing(true);

        try {
            const response = await fetch(route('admin.wallets.top-up'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({
                    contact_number: form.contact_number,
                    amount: form.amount,
                    reference: form.reference,
                    description: form.description,
                }),
            });

            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload?.message ?? payload?.error ?? 'Top-up failed.');
            }

            toast.success('Funds added successfully.');
            setForm((prev) => ({
                ...prev,
                amount: '',
                reference: '',
                description: '',
            }));

            router.reload({
                only: ['customer', 'wallet', 'transactions'],
            });
        } catch (error: any) {
            toast.error(error.message ?? 'Top-up failed.');
        } finally {
            setTopUpProcessing(false);
        }
    };

    return (
        <AdminLayout auth={auth}>
            <Head title="Wallet Management" />

            <div className="space-y-6">
                <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <CardHeader>
                        <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                            Wallet Lookup
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                            Search for a customer wallet using their contact number.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                            <div className="sm:flex-1">
                                <label className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                    Customer Contact Number
                                </label>
                                <Input
                                    value={form.contact_number}
                                    onChange={(event) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            contact_number: event.target.value,
                                        }))
                                    }
                                    placeholder="e.g. 09171234567"
                                    required
                                />
                            </div>
                            <Button type="submit" className="sm:w-auto">
                                Search
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {customer ? (
                    <>
                        <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                            <CardHeader>
                                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                                    {customer.name}
                                </CardTitle>
                                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                    {customer.email} • {customer.contact_number ?? 'No contact number'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        Wallet Balance
                                    </p>
                                    <p className="text-2xl font-semibold text-indigo-600 dark:text-indigo-300">
                                        {wallet ? formatCurrency(wallet.balance, wallet.currency) : '—'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        Last Updated
                                    </p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {wallet
                                            ? formatDateTimeForDisplay(wallet.updated_at, {
                                                  month: 'short',
                                                  day: 'numeric',
                                                  year: 'numeric',
                                                  hour: 'numeric',
                                                  minute: 'numeric',
                                              })
                                            : '—'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                            <CardHeader>
                                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                                    Manual Top-Up
                                </CardTitle>
                                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                    Add funds to the selected customer wallet.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4" onSubmit={handleTopUp}>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                                Contact Number
                                            </label>
                                            <Input
                                                value={form.contact_number}
                                                onChange={(event) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        contact_number: event.target.value,
                                                    }))
                                                }
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                                Amount
                                            </label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={form.amount}
                                                onChange={(event) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        amount: event.target.value,
                                                    }))
                                                }
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                                Reference (optional)
                                            </label>
                                            <Input
                                                value={form.reference}
                                                onChange={(event) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        reference: event.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                                Notes (optional)
                                            </label>
                                            <Input
                                                value={form.description}
                                                onChange={(event) =>
                                                    setForm((prev) => ({
                                                        ...prev,
                                                        description: event.target.value,
                                                    }))
                                                }
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={topUpProcessing}>
                                            {topUpProcessing ? 'Processing…' : 'Add Funds'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                            <CardHeader>
                                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                                    Recent Transactions
                                </CardTitle>
                                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                    Showing the latest 50 wallet transactions.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                {transactions.length === 0 ? (
                                    <div className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                        No transactions found for this customer.
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50 dark:bg-gray-800">
                                                <TableHead className="text-gray-900 dark:text-white">Reference</TableHead>
                                                <TableHead className="text-gray-900 dark:text-white">Type</TableHead>
                                                <TableHead className="text-gray-900 dark:text-white">Status</TableHead>
                                                <TableHead className="text-gray-900 dark:text-white">Amount</TableHead>
                                                <TableHead className="text-right text-gray-900 dark:text-white">
                                                    Date
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transactions.map((transaction) => (
                                                <TableRow key={transaction.id}>
                                                    <TableCell className="text-sm text-gray-900 dark:text-gray-100">
                                                        {transaction.reference ?? '—'}
                                                    </TableCell>
                                                    <TableCell className="text-sm capitalize text-gray-900 dark:text-gray-100">
                                                        {transaction.type.replace('_', ' ')}
                                                    </TableCell>
                                                    <TableCell className="text-sm capitalize text-gray-900 dark:text-gray-100">
                                                        {transaction.status}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-900 dark:text-gray-100">
                                                        {formatCurrency(transaction.amount, wallet?.currency)}
                                                    </TableCell>
                                                    <TableCell className="text-right text-sm text-gray-900 dark:text-gray-100">
                                                        {formatDateTimeForDisplay(transaction.transaction_at, {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                            hour: 'numeric',
                                                            minute: 'numeric',
                                                        })}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </>
                ) : filters.contact_number ? (
                    <Card className="border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                        <CardHeader>
                            <CardTitle className="text-sm font-semibold text-red-700 dark:text-red-400">
                                Customer Not Found
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-red-600 dark:text-red-300">
                                No customer account was found for contact number {filters.contact_number}. Verify the
                                number and try again.
                            </p>
                        </CardContent>
                    </Card>
                ) : null}
            </div>
        </AdminLayout>
    );
}

