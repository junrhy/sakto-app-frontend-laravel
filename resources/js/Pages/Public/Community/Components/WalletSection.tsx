import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import BillsSection from './BillsSection';

interface WalletSectionProps {
    member: {
        id: number;
        identifier?: string;
        app_currency: {
            code: string;
            symbol: string;
        } | null;
    };
    contactId: number | undefined;
}

interface WalletData {
    wallet: {
        id: number;
        balance: number | string | null;
        currency: string;
        status: string;
        created_at: string;
        updated_at: string;
    };
    contact: {
        id: number;
        name: string;
        email: string;
    };
}

interface Transaction {
    id: number;
    contact_wallet_id: number;
    contact_id: number;
    client_identifier: string;
    type: 'credit' | 'debit';
    amount: number | string;
    description: string | null;
    reference: string | null;
    balance_after: number | string;
    transaction_date: string;
    created_at: string;
    updated_at: string;
}

interface TransactionHistory {
    data: Transaction[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

// Helper to generate reference
function generateReference() {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `TRF-${date}-${time}-${rand}`;
}

export default function WalletSection({
    member,
    contactId,
}: WalletSectionProps) {
    const [walletData, setWalletData] = useState<WalletData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showTransactionHistory, setShowTransactionHistory] = useState(false);
    const [transactionHistory, setTransactionHistory] =
        useState<TransactionHistory | null>(null);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [transactionError, setTransactionError] = useState('');

    // Transfer state
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [availableContacts, setAvailableContacts] = useState<
        Array<{ id: number; name: string; sms_number: string }>
    >([]);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [transferAmount, setTransferAmount] = useState('');
    const [transferToContactId, setTransferToContactId] = useState('');
    const [transferToContactNumber, setTransferToContactNumber] = useState('');
    const [transferToContactName, setTransferToContactName] = useState('');
    const [transferDescription, setTransferDescription] = useState('');
    const [transferReference, setTransferReference] = useState('');
    const [transferring, setTransferring] = useState(false);
    const [transferError, setTransferError] = useState('');

    // Bills state
    const [showBillsModal, setShowBillsModal] = useState(false);

    // Add a new state for field-level contact search error
    const [contactSearchError, setContactSearchError] = useState('');

    // Add success message state
    const [successMessage, setSuccessMessage] = useState('');

    // Add pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Add pagination logic
    const paginatedTransactions = transactionHistory?.data
        ? transactionHistory.data.slice(
              (currentPage - 1) * itemsPerPage,
              currentPage * itemsPerPage,
          )
        : [];

    const totalPages = transactionHistory?.data
        ? Math.ceil(transactionHistory.data.length / itemsPerPage)
        : 0;

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const [transactionHistoryOpen, setTransactionHistoryOpen] = useState(false);
    const [historyDate, setHistoryDate] = useState<Date>(new Date());
    const [historyTransactions, setHistoryTransactions] = useState<
        Transaction[]
    >([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Fetch transaction history for a specific date
    const fetchTransactionHistoryByDate = async (date?: Date) => {
        if (!contactId) return;
        try {
            setHistoryLoading(true);
            let url = `/public/contacts/${contactId}/wallet/transactions`;
            if (date) {
                const dateStr = format(date, 'yyyy-MM-dd');
                url += `?date=${dateStr}`;
            }
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setHistoryTransactions(data.data.data || data.data || []);
            } else {
                setHistoryTransactions([]);
            }
        } catch (err) {
            setHistoryTransactions([]);
        } finally {
            setHistoryLoading(false);
        }
    };

    useEffect(() => {
        if (contactId) {
            fetchWalletBalance();
        } else {
            setLoading(false);
        }
    }, [contactId]);

    useEffect(() => {
        if (transactionHistoryOpen) {
            fetchTransactionHistoryByDate(historyDate);
        }
    }, [transactionHistoryOpen, historyDate, contactId]);

    const fetchWalletBalance = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch(
                `/public/contacts/${contactId}/wallet/balance`,
            );

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setWalletData(data.data);
                } else {
                    setError(data.message || 'Failed to fetch wallet balance');
                }
            } else {
                setError('Failed to fetch wallet balance');
            }
        } catch (err) {
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    // In fetchTransactionHistory, reset pagination
    const fetchTransactionHistory = async () => {
        if (!contactId) return;

        try {
            setLoadingTransactions(true);
            setTransactionError('');
            setCurrentPage(1); // Reset to first page

            const response = await fetch(
                `/public/contacts/${contactId}/wallet/transactions`,
            );

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setTransactionHistory(data.data);
                } else {
                    setTransactionError(
                        data.message || 'Failed to fetch transaction history',
                    );
                }
            } else {
                setTransactionError('Failed to fetch transaction history');
            }
        } catch (err) {
            setTransactionError('Network error occurred');
        } finally {
            setLoadingTransactions(false);
        }
    };

    const fetchAvailableContacts = async () => {
        if (!contactId) return;

        try {
            setLoadingContacts(true);

            const response = await fetch(
                `/public/contacts/${contactId}/wallet/available-contacts`,
            );

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setAvailableContacts(data.data);
                } else {
                    console.error(
                        'Failed to fetch available contacts:',
                        data.message,
                    );
                    setTransferError(
                        `Failed to load contacts: ${data.message}`,
                    );
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error(
                    'Failed to fetch available contacts:',
                    response.status,
                    errorData,
                );
                setTransferError(
                    `Failed to load contacts (${response.status}): ${errorData.message || 'Unknown error'}`,
                );
            }
        } catch (err) {
            console.error(
                'Network error occurred while fetching contacts:',
                err,
            );
            setTransferError('Network error occurred while loading contacts');
        } finally {
            setLoadingContacts(false);
        }
    };

    const searchContactByNumber = (smsNumber: string) => {
        const contact = availableContacts.find(
            (c) => c.sms_number === smsNumber,
        );
        if (contact) {
            setTransferToContactId(contact.id.toString());
            setTransferToContactName(contact.name);
            setContactSearchError('');
        } else {
            setTransferToContactId('');
            setTransferToContactName('');
            setContactSearchError('Member not found with this number');
        }
    };

    const handleTransfer = async () => {
        if (!contactId || !transferToContactId || !transferAmount) {
            setTransferError('Please fill in all required fields');
            return;
        }

        const amount = parseFloat(transferAmount);
        if (isNaN(amount) || amount <= 0) {
            setTransferError('Please enter a valid amount');
            return;
        }

        if (
            walletData &&
            walletData.wallet.balance !== null &&
            amount >
                (typeof walletData.wallet.balance === 'string'
                    ? parseFloat(walletData.wallet.balance)
                    : walletData.wallet.balance)
        ) {
            setTransferError('Insufficient funds');
            return;
        }

        try {
            setTransferring(true);
            setTransferError('');

            const response = await fetch(
                `/public/contacts/${contactId}/wallet/transfer`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify({
                        to_contact_id: parseInt(transferToContactId),
                        amount: amount,
                        description: transferDescription || undefined,
                    }),
                },
            );

            const data = await response.json();

            if (data.success) {
                // Reset form
                setTransferAmount('');
                setTransferToContactId('');
                setTransferToContactNumber('');
                setTransferToContactName('');
                setTransferDescription('');
                setTransferReference('');
                setShowTransferModal(false);

                // Set success message
                setSuccessMessage(
                    'Send completed successfully! Reference: ' +
                        (data.data?.reference || 'N/A'),
                );

                // Refresh wallet data and transaction history
                await fetchWalletBalance();
                await fetchTransactionHistory();

                // Clear success message after 5 seconds
                setTimeout(() => setSuccessMessage(''), 5000);
            } else {
                setTransferError(data.message || 'Transfer failed');
            }
        } catch (err) {
            setTransferError('Network error occurred');
        } finally {
            setTransferring(false);
        }
    };

    const openTransferModal = () => {
        setShowTransferModal(true);
        setTransferError('');
        setTransferToContactNumber('');
        setTransferToContactName('');
        setTransferToContactId('');
        setTransferReference(generateReference());
        fetchAvailableContacts();
    };

    const formatPrice = (price: number | string | null | undefined): string => {
        const symbol = member.app_currency?.symbol || '₱';
        const numericPrice =
            typeof price === 'string' ? parseFloat(price) : price;

        if (
            numericPrice === null ||
            numericPrice === undefined ||
            isNaN(numericPrice)
        ) {
            return `${symbol}0.00`;
        }

        // Add comma formatting for thousands
        const formattedNumber = numericPrice.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

        return `${symbol}${formattedNumber}`;
    };

    if (!contactId) {
        return (
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 text-gray-400">
                        <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                            />
                        </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                        Wallet Access Required
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Please log in with your contact information to view your
                        wallet balance.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                <div className="animate-pulse">
                    <div className="mb-4 h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="mb-4 h-8 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 text-red-400">
                        <svg
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                        Error Loading Wallet
                    </h3>
                    <p className="mb-4 text-gray-600 dark:text-gray-400">
                        {error}
                    </p>
                    <button
                        onClick={fetchWalletBalance}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Wallet Balance Card */}
            <div className="mb-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white shadow-sm dark:from-blue-700 dark:to-indigo-700 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="mb-1 text-lg font-medium sm:text-xl">
                            Wallet Balance
                        </h2>
                        <p className="text-sm text-blue-100 dark:text-blue-200">
                            {walletData?.contact.name || 'Your Account'}
                        </p>
                    </div>
                    <div className="text-center sm:text-right">
                        <div className="text-2xl font-bold sm:text-3xl">
                            {walletData
                                ? formatPrice(walletData.wallet.balance)
                                : formatPrice(0)}
                        </div>
                        <div className="text-sm text-blue-100 dark:text-blue-200">
                            {walletData?.wallet.currency ||
                                member.app_currency?.code ||
                                'PHP'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-green-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                {successMessage}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="mb-4 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 sm:p-6">
                <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                    Quick Actions
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                    <button
                        onClick={openTransferModal}
                        className="flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 sm:px-4 sm:py-3"
                    >
                        <svg
                            className="mr-2 h-4 w-4 text-green-600 sm:h-5 sm:w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                            />
                        </svg>
                        <span className="text-sm text-gray-700 dark:text-gray-300 sm:text-base">
                            Send
                        </span>
                    </button>
                    <button
                        onClick={() => {
                            setTransactionHistoryOpen(true);
                        }}
                        className="flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 sm:px-4 sm:py-3"
                    >
                        <svg
                            className="mr-2 h-4 w-4 text-blue-600 sm:h-5 sm:w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <span className="text-sm text-gray-700 dark:text-gray-300 sm:text-base">
                            History
                        </span>
                    </button>
                    <button
                        onClick={() => setShowBillsModal(true)}
                        className="flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 sm:px-4 sm:py-3"
                    >
                        <svg
                            className="mr-2 h-4 w-4 text-purple-600 sm:h-5 sm:w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <span className="text-sm text-gray-700 dark:text-gray-300 sm:text-base">
                            Bills
                        </span>
                    </button>
                </div>
            </div>

            {/* Transaction History Dialog */}
            {transactionHistoryOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-0 sm:p-4">
                    <div className="flex h-full w-full flex-col overflow-hidden rounded-none bg-white shadow-xl dark:bg-gray-800 sm:h-auto sm:max-h-[95vh] sm:max-w-4xl sm:rounded-lg">
                        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700 sm:p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                Transaction History
                            </h3>
                            <button
                                onClick={() => setTransactionHistoryOpen(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <svg
                                    className="h-5 w-5 sm:h-6 sm:w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    value={format(historyDate, 'yyyy-MM-dd')}
                                    onChange={(e) => {
                                        const date = new Date(e.target.value);
                                        if (!isNaN(date.getTime())) {
                                            setHistoryDate(date);
                                        }
                                    }}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            {historyLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                                        Loading transactions...
                                    </span>
                                </div>
                            ) : historyTransactions.length > 0 ? (
                                <div className="space-y-0">
                                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead className="bg-gray-50 dark:bg-gray-700">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                        Type
                                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                        Amount
                                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                        Description
                                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                        Reference
                                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                        Date
                                                    </th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                                        Balance
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                                                {historyTransactions.map(
                                                    (transaction) => (
                                                        <tr
                                                            key={transaction.id}
                                                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                                        >
                                                            <td className="whitespace-nowrap px-3 py-2">
                                                                <span
                                                                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                                        transaction.type ===
                                                                        'credit'
                                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                    }`}
                                                                >
                                                                    {transaction.type ===
                                                                    'credit'
                                                                        ? 'Credit'
                                                                        : 'Debit'}
                                                                </span>
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-2 text-sm font-medium">
                                                                <span
                                                                    className={
                                                                        transaction.type ===
                                                                        'credit'
                                                                            ? 'text-green-600 dark:text-green-400'
                                                                            : 'text-red-600 dark:text-red-400'
                                                                    }
                                                                >
                                                                    {transaction.type ===
                                                                    'credit'
                                                                        ? '+'
                                                                        : '-'}
                                                                    {formatPrice(
                                                                        transaction.amount,
                                                                    )}
                                                                </span>
                                                            </td>
                                                            <td className="max-w-xs truncate px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                                                                {transaction.description ||
                                                                    '-'}
                                                            </td>
                                                            <td className="px-3 py-2 font-mono text-sm text-xs text-gray-500 dark:text-gray-400">
                                                                {transaction.reference ||
                                                                    '-'}
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                                                {new Date(
                                                                    transaction.transaction_date,
                                                                ).toLocaleDateString()}
                                                            </td>
                                                            <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                                                                {formatPrice(
                                                                    transaction.balance_after,
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <div className="mb-4 text-gray-400">
                                        <svg
                                            className="mx-auto h-12 w-12"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        No transactions found for this date
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Transfer Modal */}
            {showTransferModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-0 sm:p-4">
                    <div className="flex h-full w-full flex-col overflow-hidden rounded-none bg-white shadow-xl dark:bg-gray-800 sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-lg">
                        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700 sm:p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                Send Funds
                            </h3>
                            <button
                                onClick={() => setShowTransferModal(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <svg
                                    className="h-5 w-5 sm:h-6 sm:w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                            {transferError && (
                                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        {transferError}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* Available Balance */}
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                        Available Balance
                                    </p>
                                    <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                                        {walletData
                                            ? formatPrice(
                                                  walletData.wallet.balance,
                                              )
                                            : formatPrice(0)}
                                    </p>
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Amount *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        max={walletData?.wallet.balance || 0}
                                        value={transferAmount}
                                        onChange={(e) =>
                                            setTransferAmount(e.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        placeholder="Enter amount"
                                    />
                                </div>

                                {/* Recipient */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Recipient Contact Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={transferToContactNumber}
                                        onChange={(e) => {
                                            setTransferToContactNumber(
                                                e.target.value,
                                            );
                                            if (e.target.value.length >= 10) {
                                                searchContactByNumber(
                                                    e.target.value,
                                                );
                                            } else {
                                                setTransferToContactId('');
                                                setTransferToContactName('');
                                            }
                                        }}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        placeholder="Enter contact number"
                                    />
                                    {transferToContactName && (
                                        <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-2 dark:border-green-800 dark:bg-green-900/20">
                                            <p className="text-sm text-green-600 dark:text-green-400">
                                                {transferToContactName
                                                    .split(' ')
                                                    .map((name) => {
                                                        if (name.length === 2)
                                                            return (
                                                                name[0] + '*'
                                                            );
                                                        if (name.length === 3)
                                                            return (
                                                                name[0] + '**'
                                                            );
                                                        if (name.length > 3)
                                                            return (
                                                                name[0] +
                                                                '**' +
                                                                name.slice(3)
                                                            );
                                                        return name;
                                                    })
                                                    .join(' ')}
                                            </p>
                                        </div>
                                    )}
                                    {contactSearchError && (
                                        <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                            {contactSearchError}
                                        </p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Description (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={transferDescription}
                                        onChange={(e) =>
                                            setTransferDescription(
                                                e.target.value,
                                            )
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        placeholder="Enter description"
                                        maxLength={255}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-700 sm:p-6">
                            <button
                                onClick={() => setShowTransferModal(false)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                disabled={transferring}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTransfer}
                                disabled={
                                    transferring ||
                                    !transferAmount ||
                                    !transferToContactId
                                }
                                className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
                            >
                                {transferring ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                        Sending...
                                    </>
                                ) : (
                                    'Send Funds'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bills Modal */}
            {showBillsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-0 sm:p-4">
                    <div className="flex h-full w-full flex-col overflow-hidden rounded-none bg-white shadow-xl dark:bg-gray-800 sm:h-auto sm:max-h-[95vh] sm:max-w-6xl sm:rounded-lg">
                        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700 sm:p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                Bill Payments
                            </h3>
                            <button
                                onClick={() => setShowBillsModal(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <svg
                                    className="h-5 w-5 sm:h-6 sm:w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <BillsSection
                                member={member}
                                contactId={contactId}
                                walletBalance={walletData?.wallet.balance}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
