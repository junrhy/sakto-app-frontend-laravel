import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Textarea } from '@/Components/ui/textarea';
import CustomerLayout from '@/Layouts/Customer/CustomerLayout';
import { formatDateTimeForDisplay } from '@/Pages/Public/Community/utils/dateUtils';
import { PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface Wallet {
    id: number;
    customer_id: number;
    balance: string;
    currency: string;
    updated_at: string;
}

interface WalletTransaction {
    id: number;
    type: string;
    status: string;
    amount: string;
    balance_before: string;
    balance_after: string;
    reference?: string | null;
    description?: string | null;
    transaction_at: string;
}

interface WalletPageProps extends PageProps {
    wallet: Wallet | null;
    transactions: WalletTransaction[];
    isAdmin: boolean;
}

export default function WalletIndex({
    auth,
    wallet,
    transactions,
    isAdmin,
}: WalletPageProps) {
    const [activeTab, setActiveTab] = useState<
        'overview' | 'history' | 'transfer' | 'topup'
    >('overview');
    const [transferForm, setTransferForm] = useState({
        contact_number: '',
        amount: '',
        description: '',
    });
    const [transferProcessing, setTransferProcessing] = useState(false);

    const [topUpForm, setTopUpForm] = useState({
        customer: '',
        amount: '',
        reference: '',
        description: '',
    });
    const [topUpProcessing, setTopUpProcessing] = useState(false);

    const currencySettings = useMemo(() => {
        const fallback = {
            symbol: '$',
            code: 'USD',
            decimalSeparator: '.',
            thousandsSeparator: ',',
        };

        const rawCurrency = auth?.user?.app_currency;

        if (!rawCurrency) {
            return fallback;
        }

        if (typeof rawCurrency === 'string') {
            try {
                const parsed = JSON.parse(rawCurrency);
                return {
                    symbol: '$',
                    code: 'USD',
                    decimalSeparator:
                        parsed?.decimal_separator ?? fallback.decimalSeparator,
                    thousandsSeparator:
                        parsed?.thousands_separator ??
                        fallback.thousandsSeparator,
                };
            } catch {
                return fallback;
            }
        }

        return {
            symbol: '$',
            code: 'USD',
            decimalSeparator:
                rawCurrency.decimal_separator ?? fallback.decimalSeparator,
            thousandsSeparator:
                rawCurrency.thousands_separator ?? fallback.thousandsSeparator,
        };
    }, [auth?.user?.app_currency]);

    const parseNumber = useCallback(
        (value: unknown): number => {
            if (typeof value === 'number') {
                return Number.isFinite(value) ? value : 0;
            }

            if (typeof value === 'string') {
                const normalized = value
                    .replace(
                        new RegExp(
                            `[^0-9${currencySettings.decimalSeparator}-]`,
                            'g',
                        ),
                        '',
                    )
                    .replace(currencySettings.decimalSeparator, '.');
                const numeric = Number.parseFloat(normalized);
                return Number.isFinite(numeric) ? numeric : 0;
            }

            return 0;
        },
        [currencySettings.decimalSeparator],
    );

    const formatCurrency = useCallback(
        (value: unknown) => {
            const amount = parseNumber(value);
            const formatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currencySettings.code,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(amount);

            if (
                currencySettings.symbol &&
                currencySettings.symbol !== currencySettings.code
            ) {
                return formatted.replace(
                    currencySettings.code,
                    currencySettings.symbol,
                );
            }

            return formatted;
        },
        [currencySettings.code, currencySettings.symbol, parseNumber],
    );

    const computedBalance = useMemo(() => {
        if (!wallet) {
            return 0;
        }

        const balance = parseNumber(wallet.balance);
        if (balance !== 0) {
            return balance;
        }

        if (transactions.length > 0) {
            const latestBalance = parseNumber(transactions[0]?.balance_after);
            if (latestBalance !== 0) {
                return latestBalance;
            }
        }

        return balance;
    }, [wallet, transactions, parseNumber]);

    const formattedBalance = useMemo(() => {
        return formatCurrency(computedBalance);
    }, [computedBalance, formatCurrency]);

    const handleTransferSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();
        setTransferProcessing(true);

        try {
            const response = await fetch(route('customer.wallet.transfer'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') ?? '',
                },
                body: JSON.stringify(transferForm),
            });

            const payload = await response.json();

            if (!response.ok) {
                throw new Error(payload?.message ?? 'Transfer failed.');
            }

            toast.success('Transfer completed successfully.');
            setTransferForm({
                contact_number: '',
                amount: '',
                description: '',
            });

            router.visit(route('customer.wallet.index'), {
                preserveScroll: true,
                preserveState: false,
            });
        } catch (error: any) {
            toast.error(error.message ?? 'Transfer failed.');
        } finally {
            setTransferProcessing(false);
        }
    };

    const handleTopUpSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();
        setTopUpProcessing(true);

        try {
            const response = await fetch(route('customer.wallet.top-up'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') ?? '',
                },
                body: JSON.stringify(topUpForm),
            });

            const payload = await response.json();

            if (!response.ok) {
                throw new Error(
                    payload?.message ?? payload?.error ?? 'Top-up failed.',
                );
            }

            toast.success('Funds added successfully.');
            setTopUpForm({
                customer: '',
                amount: '',
                reference: '',
                description: '',
            });
        } catch (error: any) {
            toast.error(error.message ?? 'Top-up failed.');
        } finally {
            setTopUpProcessing(false);
        }
    };

    return (
        <CustomerLayout
            auth={auth}
            title="Wallet"
            header={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                            Wallet
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Manage your balance, transfers, and transaction
                            history.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Wallet" />

            <Tabs
                value={activeTab}
                onValueChange={(value) =>
                    setActiveTab(value as typeof activeTab)
                }
            >
                <TabsList className="w-full overflow-x-auto">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="transfer">Transfer</TabsTrigger>
                    {isAdmin && (
                        <TabsTrigger value="topup">Admin Top-Up</TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-4">
                    <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <CardHeader>
                            <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                                Current Balance
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                Available funds for transfers and purchases.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-semibold text-indigo-600 dark:text-indigo-300">
                                {formattedBalance}
                            </div>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Last updated:{' '}
                                {wallet?.updated_at
                                    ? formatDateTimeForDisplay(
                                          wallet.updated_at,
                                          {
                                              month: 'short',
                                              day: 'numeric',
                                              year: 'numeric',
                                              hour: 'numeric',
                                              minute: 'numeric',
                                          },
                                      )
                                    : '—'}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <CardHeader>
                            <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                                Recent Activity
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                A snapshot of your latest transactions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {transactions.length === 0 ? (
                                <div className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                    No transactions yet.
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50 dark:bg-gray-700">
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Type
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Amount
                                            </TableHead>
                                            <TableHead className="text-gray-900 dark:text-white">
                                                Status
                                            </TableHead>
                                            <TableHead className="text-right text-gray-900 dark:text-white">
                                                Date
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions
                                            .slice(0, 10)
                                            .map((transaction) => (
                                                <TableRow key={transaction.id}>
                                                    <TableCell className="text-sm capitalize text-gray-900 dark:text-gray-100">
                                                        {transaction.type.replace(
                                                            '_',
                                                            ' ',
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm text-gray-900 dark:text-gray-100">
                                                        {formatCurrency(
                                                            transaction.amount,
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm capitalize text-gray-900 dark:text-gray-100">
                                                        {transaction.status}
                                                    </TableCell>
                                                    <TableCell className="text-right text-sm text-gray-900 dark:text-gray-100">
                                                        {formatDateTimeForDisplay(
                                                            transaction.transaction_at,
                                                            {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: 'numeric',
                                                                minute: 'numeric',
                                                            },
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                    <TransactionHistory
                        transactions={transactions}
                        formatAmount={formatCurrency}
                    />
                </TabsContent>

                <TabsContent value="transfer" className="mt-6">
                    <Card className="max-w-2xl border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                        <CardHeader>
                            <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                                Send Funds
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                Transfers are instant and available to any
                                customer account.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                className="space-y-4"
                                onSubmit={handleTransferSubmit}
                            >
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                            Recipient Contact Number
                                        </label>
                                        <Input
                                            value={transferForm.contact_number}
                                            onChange={(event) =>
                                                setTransferForm((prev) => ({
                                                    ...prev,
                                                    contact_number:
                                                        event.target.value,
                                                }))
                                            }
                                            placeholder="e.g. 09171234567"
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
                                            value={transferForm.amount}
                                            onChange={(event) =>
                                                setTransferForm((prev) => ({
                                                    ...prev,
                                                    amount: event.target.value,
                                                }))
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                        Description (optional)
                                    </label>
                                    <Textarea
                                        rows={3}
                                        value={transferForm.description}
                                        onChange={(event) =>
                                            setTransferForm((prev) => ({
                                                ...prev,
                                                description: event.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={transferProcessing}
                                    >
                                        {transferProcessing
                                            ? 'Processing…'
                                            : 'Send Funds'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {isAdmin && (
                    <TabsContent value="topup" className="mt-6">
                        <Card className="max-w-2xl border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                            <CardHeader>
                                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                                    Admin Manual Top-Up
                                </CardTitle>
                                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                                    Add funds to a customer wallet on their
                                    behalf.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    className="space-y-4"
                                    onSubmit={handleTopUpSubmit}
                                >
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                                Customer Contact Number
                                            </label>
                                            <Input
                                                value={topUpForm.customer}
                                                onChange={(event) =>
                                                    setTopUpForm((prev) => ({
                                                        ...prev,
                                                        customer:
                                                            event.target.value,
                                                    }))
                                                }
                                                placeholder="e.g. 09171234567"
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
                                                value={topUpForm.amount}
                                                onChange={(event) =>
                                                    setTopUpForm((prev) => ({
                                                        ...prev,
                                                        amount: event.target
                                                            .value,
                                                    }))
                                                }
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                            Reference (optional)
                                        </label>
                                        <Input
                                            value={topUpForm.reference}
                                            onChange={(event) =>
                                                setTopUpForm((prev) => ({
                                                    ...prev,
                                                    reference:
                                                        event.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                                            Description (optional)
                                        </label>
                                        <Textarea
                                            rows={3}
                                            value={topUpForm.description}
                                            onChange={(event) =>
                                                setTopUpForm((prev) => ({
                                                    ...prev,
                                                    description:
                                                        event.target.value,
                                                }))
                                            }
                                        />
                                    </div>
                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={topUpProcessing}
                                        >
                                            {topUpProcessing
                                                ? 'Processing…'
                                                : 'Add Funds'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>
        </CustomerLayout>
    );
}

interface HistoryProps {
    transactions: WalletTransaction[];
    formatAmount: (value: unknown) => string;
}

function TransactionHistory({ transactions, formatAmount }: HistoryProps) {
    const history = useMemo(() => transactions, [transactions]);

    if (history.length === 0) {
        return (
            <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <CardHeader>
                    <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                        Transaction History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        No transactions have been recorded yet.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
                    Transaction History
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    A detailed list of all wallet activity.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-700">
                            <TableHead className="text-gray-900 dark:text-white">
                                Reference
                            </TableHead>
                            <TableHead className="text-gray-900 dark:text-white">
                                Type
                            </TableHead>
                            <TableHead className="text-gray-900 dark:text-white">
                                Status
                            </TableHead>
                            <TableHead className="text-gray-900 dark:text-white">
                                Amount
                            </TableHead>
                            <TableHead className="text-right text-gray-900 dark:text-white">
                                Date
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {history.map((transaction) => (
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
                                    {formatAmount(transaction.amount)}
                                </TableCell>
                                <TableCell className="text-right text-sm text-gray-900 dark:text-gray-100">
                                    {formatDateTimeForDisplay(
                                        transaction.transaction_at,
                                        {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                        },
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
