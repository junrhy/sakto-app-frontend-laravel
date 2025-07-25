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
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover";
import { Calendar } from "@/Components/ui/calendar";
import { Plus, Minus, ArrowRightLeft, Wallet, History, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { usePage } from '@inertiajs/react';

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
    const [historyDate, setHistoryDate] = useState<Date>(new Date());
    const [historyTransactions, setHistoryTransactions] = useState<Transaction[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const pageProps = usePage<any>().props;
    const selectedTeamMember = pageProps?.auth?.selectedTeamMember;
    const canManageFunds = selectedTeamMember && Array.isArray(selectedTeamMember.roles) && (selectedTeamMember.roles.includes('admin') || selectedTeamMember.roles.includes('manager'));

    useEffect(() => {
        fetchWalletData();
        fetchAvailableContacts();
    }, [contactId]);

    // Fetch transaction history for today when component mounts
    useEffect(() => {
        if (contactId) {
            fetchTransactionHistory(historyDate);
        }
    }, [contactId]); // Only run when contactId changes, not when historyDate changes

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
                setTransactions(data.data || []);
                setHistoryTransactions(data.data || []);
            } else {
                setHistoryTransactions([]);
            }
        } catch (error) {
            setHistoryTransactions([]);
        }
    };

    // Fetch history transactions when date changes
    useEffect(() => {
        if (contactId) {
            setHistoryLoading(true);
            setCurrentPage(1); // Reset to first page when date changes
            fetchTransactionHistory(historyDate).finally(() => setHistoryLoading(false));
        }
    }, [historyDate, contactId]);

    // Pagination logic
    const paginatedTransactions = historyTransactions.slice(
        (currentPage - 1) * itemsPerPage, 
        currentPage * itemsPerPage
    );
    const totalPages = Math.ceil(historyTransactions.length / itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

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
            {canManageFunds && (
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
                </div>
            )}

            {/* Transaction History Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between w-full">
                        <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Transaction History
                        </CardTitle>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-[240px] justify-start text-left font-normal border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700",
                                        !historyDate && "text-slate-500 dark:text-slate-400",
                                        historyDate && "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-500/10"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {historyDate ? format(historyDate, "PPP") : "Select date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700" align="start">
                                <Calendar
                                    mode="single"
                                    selected={historyDate}
                                    onSelect={(date) => date && setHistoryDate(date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardHeader>
                <CardContent>
                    
                    {historyLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading transactions...</span>
                        </div>
                    ) : historyTransactions.length > 0 ? (
                        <div className="space-y-0">
                            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Reference</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {paginatedTransactions.map((transaction) => (
                                            <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-3 py-2 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        transaction.type === 'credit' 
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                    }`}>
                                                        {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                                                    <span className={transaction.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                                        {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                                                    {transaction.description || '-'}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 font-mono text-xs">
                                                    {transaction.reference || '-'}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {new Date(transaction.transaction_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {formatCurrency(transaction.balance_after)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, historyTransactions.length)} of {historyTransactions.length} transactions
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            Previous
                                        </button>
                                        <div className="flex items-center space-x-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => handlePageChange(page)}
                                                    className={`px-3 py-1 text-sm border rounded-md ${
                                                        currentPage === page
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">No transactions found for this date</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 