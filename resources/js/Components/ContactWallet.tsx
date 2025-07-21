import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Plus, Minus, ArrowRightLeft, Wallet, History, TrendingUp } from 'lucide-react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Calendar } from '@/Components/ui/calendar';
import { format } from 'date-fns';

interface WalletData {
    wallet: {
        id: number;
        balance: number | string;
        currency: string;
        status: string;
        last_transaction_date: string;
    };
    contact: {
        id: number;
        name: string;
        email: string;
    };
}

interface Transaction {
    id: number;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    reference: string;
    balance_after: number;
    transaction_date: string;
}

interface ContactWalletProps {
    contactId: number;
    contactName: string;
    appCurrency: {
        symbol: string;
        decimal_separator: string;
        thousands_separator: string;
    };
}

export default function ContactWallet({ contactId, contactName, appCurrency }: ContactWalletProps) {
    const [walletData, setWalletData] = useState<WalletData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [addFundsOpen, setAddFundsOpen] = useState(false);
    const [deductFundsOpen, setDeductFundsOpen] = useState(false);
    const [transferFundsOpen, setTransferFundsOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [reference, setReference] = useState('');
    const [toContactId, setToContactId] = useState('');
    const [toContactNumber, setToContactNumber] = useState('');
    const [toContactName, setToContactName] = useState('');
    const [availableContacts, setAvailableContacts] = useState<any[]>([]);
    // Add a new state for field-level contact search error
    const [contactSearchError, setContactSearchError] = useState('');
    const [transactionHistoryOpen, setTransactionHistoryOpen] = useState(false);
    const [historyDate, setHistoryDate] = useState<Date>(new Date());
    const [historyTransactions, setHistoryTransactions] = useState<Transaction[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        fetchWalletData();
        fetchTransactionHistory();
        fetchAvailableContacts();
    }, [contactId]);

    const fetchWalletData = async () => {
        try {
            const response = await fetch(`/contacts/${contactId}/wallet/balance`);
            const data = await response.json();
            
            if (data.success) {
                setWalletData(data.data);
            } else {
                toast.error(data.message || 'Failed to fetch wallet data');
            }
        } catch (error) {
            toast.error('Error fetching wallet data');
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactionHistory = async (date?: Date) => {
        try {
            let url = `/contacts/${contactId}/wallet/transactions`;
            if (date) {
                const dateStr = format(date, 'yyyy-MM-dd');
                url += `?date=${dateStr}`;
            }
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setTransactions(data.data.data || []);
                if (date) setHistoryTransactions(data.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching transaction history:', error);
        }
    };

    // Fetch history transactions when dialog opens or date changes
    useEffect(() => {
        if (transactionHistoryOpen) {
            setHistoryLoading(true);
            fetchTransactionHistory(historyDate).finally(() => setHistoryLoading(false));
        }
    }, [transactionHistoryOpen, historyDate, contactId]);

    const fetchAvailableContacts = async () => {
        try {
            const response = await fetch('/contacts/list');
            const data = await response.json();
            
            if (data.success) {
                setAvailableContacts(data.data.filter((contact: any) => contact.id !== contactId));
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    const searchContactByNumber = (smsNumber: string) => {
        const contact = availableContacts.find((c: any) => c.sms_number === smsNumber);
        if (contact) {
            setToContactId(contact.id.toString());
            setToContactName(`${contact.first_name} ${contact.last_name}`);
            setContactSearchError('');
        } else {
            setToContactId('');
            setToContactName('');
            setContactSearchError('Member not found with this number');
        }
    };

    const handleAddFunds = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            const response = await fetch(`/contacts/${contactId}/wallet/add-funds`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    description,
                    reference,
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                toast.success('Funds added successfully');
                setAddFundsOpen(false);
                setAmount('');
                setDescription('');
                setReference('');
                fetchWalletData();
                fetchTransactionHistory();
            } else {
                toast.error(data.message || 'Failed to add funds');
            }
        } catch (error) {
            toast.error('Error adding funds');
        }
    };

    const handleDeductFunds = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (walletData && parseFloat(amount) > (typeof walletData.wallet.balance === 'string' ? parseFloat(walletData.wallet.balance) : walletData.wallet.balance)) {
            toast.error('Insufficient funds');
            return;
        }

        try {
            const response = await fetch(`/contacts/${contactId}/wallet/deduct-funds`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    description,
                    reference,
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                toast.success('Funds deducted successfully');
                setDeductFundsOpen(false);
                setAmount('');
                setDescription('');
                setReference('');
                fetchWalletData();
                fetchTransactionHistory();
            } else {
                toast.error(data.message || 'Failed to deduct funds');
            }
        } catch (error) {
            toast.error('Error deducting funds');
        }
    };

    const handleTransferFunds = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        if (!toContactId) {
            toast.error('Please select a recipient');
            return;
        }

        if (walletData && parseFloat(amount) > (typeof walletData.wallet.balance === 'string' ? parseFloat(walletData.wallet.balance) : walletData.wallet.balance)) {
            toast.error('Insufficient funds');
            return;
        }

        try {
            const response = await fetch('/contacts/wallets/transfer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    from_contact_id: contactId,
                    to_contact_id: parseInt(toContactId),
                    amount: parseFloat(amount),
                    description,
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                toast.success('Transfer completed successfully! Reference: ' + (data.data?.reference || 'N/A'));
                setTransferFundsOpen(false);
                setAmount('');
                setDescription('');
                setReference('');
                setToContactId('');
                setToContactNumber('');
                setToContactName('');
                fetchWalletData();
                fetchTransactionHistory();
            } else {
                toast.error(data.message || 'Failed to transfer funds');
            }
        } catch (error) {
            toast.error('Error transferring funds');
        }
    };

    const formatCurrency = (amount: number | string | null | undefined) => {
        // Convert to number and handle null/undefined cases
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (numAmount === null || numAmount === undefined || isNaN(numAmount)) {
            return appCurrency.symbol + '0.00';
        }
        return appCurrency.symbol + number_format(numAmount, 2, appCurrency.decimal_separator, appCurrency.thousands_separator);
    };

    const number_format = (number: number, decimals: number, dec_point: string, thousands_sep: string) => {
        // Ensure number is a valid number
        if (typeof number !== 'number' || isNaN(number)) {
            return '0' + dec_point + '0'.repeat(decimals);
        }
        const parts = number.toFixed(decimals).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands_sep);
        return parts.join(dec_point);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Wallet Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        Wallet Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {walletData ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {formatCurrency(walletData.wallet.balance)}
                                </div>
                                <div className="text-sm text-gray-500">Current Balance</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-semibold">
                                    {walletData.wallet.currency}
                                </div>
                                <div className="text-sm text-gray-500">Currency</div>
                            </div>
                            <div className="text-center">
                                <Badge variant={walletData.wallet.status === 'active' ? 'default' : 'secondary'}>
                                    {walletData.wallet.status}
                                </Badge>
                                <div className="text-sm text-gray-500 mt-1">Status</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500">
                            No wallet data available
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
                <Dialog open={addFundsOpen} onOpenChange={setAddFundsOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Funds
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Funds to Wallet</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="amount">Amount</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Optional description"
                                />
                            </div>
                            <div>
                                <Label htmlFor="reference">Reference</Label>
                                <Input
                                    id="reference"
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                    placeholder="Optional reference"
                                />
                            </div>
                            <Button onClick={handleAddFunds} className="w-full">
                                Add Funds
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={deductFundsOpen} onOpenChange={setDeductFundsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Minus className="h-4 w-4" />
                            Deduct Funds
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Deduct Funds from Wallet</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="deduct-amount">Amount</Label>
                                <Input
                                    id="deduct-amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max={walletData?.wallet.balance || 0}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                />
                            </div>
                            <div>
                                <Label htmlFor="deduct-description">Description</Label>
                                <Textarea
                                    id="deduct-description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Optional description"
                                />
                            </div>
                            <div>
                                <Label htmlFor="deduct-reference">Reference</Label>
                                <Input
                                    id="deduct-reference"
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                    placeholder="Optional reference"
                                />
                            </div>
                            <Button onClick={handleDeductFunds} className="w-full">
                                Deduct Funds
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={transferFundsOpen} onOpenChange={setTransferFundsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                            <ArrowRightLeft className="h-4 w-4" />
                            Transfer Funds
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Transfer Funds to Another Contact</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="transfer-amount">Amount</Label>
                                <Input
                                    id="transfer-amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    max={walletData?.wallet.balance || 0}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                />
                            </div>
                            <div>
                                <Label htmlFor="to-contact">Recipient Contact Number</Label>
                                <Input
                                    type="tel"
                                    value={toContactNumber}
                                    onChange={(e) => {
                                        setToContactNumber(e.target.value);
                                        if (e.target.value.length >= 10) {
                                            searchContactByNumber(e.target.value);
                                        } else {
                                            setToContactId('');
                                            setToContactName('');
                                            setContactSearchError(''); // Clear error when input is empty
                                        }
                                    }}
                                    placeholder="Enter contact number"
                                />
                                {contactSearchError && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {contactSearchError}
                                    </p>
                                )}
                                {toContactName && (
                                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-600 text-sm">
                                            {toContactName.split(' ').map(name => {
                                                if (name.length === 2) return name[0] + '*';
                                                if (name.length === 3) return name[0] + '**';
                                                if (name.length > 3) return name[0] + '**' + name.slice(3);
                                                return name;
                                            }).join(' ')}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="transfer-description">Description</Label>
                                <Textarea
                                    id="transfer-description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Optional description"
                                />
                            </div>
                            <Button onClick={handleTransferFunds} className="w-full">
                                Transfer Funds
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={transactionHistoryOpen} onOpenChange={setTransactionHistoryOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-2">
                            <History className="h-4 w-4" />
                            View Transaction History
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Transaction History</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="history-date">Date</Label>
                                <Calendar
                                    mode="single"
                                    selected={historyDate}
                                    onSelect={(date) => { if (date) setHistoryDate(date); }}
                                    className="rounded-md border"
                                />
                            </div>
                            {historyLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                </div>
                            ) : historyTransactions.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Reference</TableHead>
                                            <TableHead>Balance After</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {historyTransactions.map((transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={transaction.type === 'credit' ? 'default' : 'secondary'}>
                                                        {transaction.type.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                                                    {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                                </TableCell>
                                                <TableCell>{transaction.description || '-'}</TableCell>
                                                <TableCell>{transaction.reference || '-'}</TableCell>
                                                <TableCell>{formatCurrency(transaction.balance_after)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="text-center text-gray-500 py-8">
                                    No transactions found for this date
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Transaction History */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Transaction History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {transactions.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Balance After</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                                        <TableCell>
                                            <Badge variant={transaction.type === 'credit' ? 'default' : 'secondary'}>
                                                {transaction.type.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                                            {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                        </TableCell>
                                        <TableCell>{transaction.description || '-'}</TableCell>
                                        <TableCell>{transaction.reference || '-'}</TableCell>
                                        <TableCell>{formatCurrency(transaction.balance_after)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            No transactions found
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 