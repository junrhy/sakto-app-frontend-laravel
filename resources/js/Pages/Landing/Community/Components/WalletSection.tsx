import { useState, useEffect } from 'react';

interface WalletSectionProps {
    member: {
        id: number;
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

export default function WalletSection({ member, contactId }: WalletSectionProps) {
    const [walletData, setWalletData] = useState<WalletData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showTransactionHistory, setShowTransactionHistory] = useState(false);
    const [transactionHistory, setTransactionHistory] = useState<TransactionHistory | null>(null);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [transactionError, setTransactionError] = useState('');
    
    // Transfer state
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [availableContacts, setAvailableContacts] = useState<Array<{id: number, name: string, email: string}>>([]);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [transferAmount, setTransferAmount] = useState('');
    const [transferToContactId, setTransferToContactId] = useState('');
    const [transferDescription, setTransferDescription] = useState('');
    const [transferReference, setTransferReference] = useState('');
    const [transferring, setTransferring] = useState(false);
    const [transferError, setTransferError] = useState('');

    useEffect(() => {
        if (contactId) {
            fetchWalletBalance();
        } else {
            setLoading(false);
        }
    }, [contactId]);

    const fetchWalletBalance = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await fetch(`/public/contacts/${contactId}/wallet/balance`);

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

    const fetchTransactionHistory = async () => {
        if (!contactId) return;
        
        try {
            setLoadingTransactions(true);
            setTransactionError('');
            
            const response = await fetch(`/public/contacts/${contactId}/wallet/transactions`);

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setTransactionHistory(data.data);
                } else {
                    setTransactionError(data.message || 'Failed to fetch transaction history');
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
            
            const response = await fetch(`/public/contacts/${contactId}/wallet/available-contacts`);

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setAvailableContacts(data.data);
                } else {
                    console.error('Failed to fetch available contacts:', data.message);
                }
            } else {
                console.error('Failed to fetch available contacts');
            }
        } catch (err) {
            console.error('Network error occurred while fetching contacts');
        } finally {
            setLoadingContacts(false);
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

        if (walletData && walletData.wallet.balance !== null && amount > (typeof walletData.wallet.balance === 'string' ? parseFloat(walletData.wallet.balance) : walletData.wallet.balance)) {
            setTransferError('Insufficient funds');
            return;
        }

        try {
            setTransferring(true);
            setTransferError('');

            const response = await fetch(`/public/contacts/${contactId}/wallet/transfer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    to_contact_id: parseInt(transferToContactId),
                    amount: amount,
                    description: transferDescription || undefined,
                    reference: transferReference || undefined,
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                // Reset form
                setTransferAmount('');
                setTransferToContactId('');
                setTransferDescription('');
                setTransferReference('');
                setShowTransferModal(false);
                
                // Refresh wallet data and transaction history
                await fetchWalletBalance();
                await fetchTransactionHistory();
                
                // Show success message (you might want to add a toast library)
                alert('Transfer completed successfully!');
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
        fetchAvailableContacts();
    };

    const formatPrice = (price: number | string | null | undefined): string => {
        const symbol = member.app_currency?.symbol || '₱';
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
        
        if (numericPrice === null || numericPrice === undefined || isNaN(numericPrice)) {
            return `${symbol}0.00`;
        }
        
        // Add comma formatting for thousands
        const formattedNumber = numericPrice.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        return `${symbol}${formattedNumber}`;
    };

    if (!contactId) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Wallet Access Required</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Please log in with your contact information to view your wallet balance.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 text-red-400 mb-4">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Error Loading Wallet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={fetchWalletBalance}
                        className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Wallet Balance Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-lg shadow-sm p-4 sm:p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-lg sm:text-xl font-medium mb-1">Wallet Balance</h2>
                        <p className="text-blue-100 dark:text-blue-200 text-sm">
                            {walletData?.contact.name || 'Your Account'}
                        </p>
                    </div>
                    <div className="text-center sm:text-right">
                        <div className="text-2xl sm:text-3xl font-bold">
                            {walletData ? formatPrice(walletData.wallet.balance) : formatPrice(0)}
                        </div>
                        <div className="text-blue-100 dark:text-blue-200 text-sm">
                            {walletData?.wallet.currency || member.app_currency?.code || 'PHP'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Wallet Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Wallet Information</h3>
                <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Status</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${
                            walletData?.wallet.status === 'active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                            {walletData?.wallet.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Currency</span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium text-sm sm:text-base">
                            {walletData?.wallet.currency || member.app_currency?.code || 'PHP'}
                        </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">Last Updated</span>
                        <span className="text-gray-900 dark:text-gray-100 text-sm">
                            {walletData?.wallet.updated_at 
                                ? new Date(walletData.wallet.updated_at).toLocaleDateString()
                                : 'N/A'
                            }
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <button
                        disabled
                        className="flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors opacity-50 cursor-not-allowed"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Cash In</span>
                    </button>
                    <button
                        onClick={openTransferModal}
                        className="flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Transfer</span>
                    </button>
                    <button
                        onClick={() => {
                            setShowTransactionHistory(true);
                            fetchTransactionHistory();
                        }}
                        className="flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">View History</span>
                    </button>
                </div>
            </div>

            {/* Transaction History Modal */}
            {showTransactionHistory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Transaction History</h3>
                            <button
                                onClick={() => setShowTransactionHistory(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                            {loadingTransactions ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className="ml-2 text-gray-600 dark:text-gray-400">Loading transactions...</span>
                                </div>
                            ) : transactionError ? (
                                <div className="text-center py-8">
                                    <div className="text-red-500 mb-4">
                                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">{transactionError}</p>
                                    <button
                                        onClick={fetchTransactionHistory}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : transactionHistory && transactionHistory.data.length > 0 ? (
                                <div className="space-y-3 sm:space-y-4">
                                    {transactionHistory.data.map((transaction) => (
                                        <div key={transaction.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 bg-white dark:bg-gray-800">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                                                <div className="flex items-center">
                                                    <div className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${
                                                        transaction.type === 'credit' 
                                                            ? 'bg-green-500' 
                                                            : 'bg-red-500'
                                                    }`}></div>
                                                    <span className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                                                        {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                                                    </span>
                                                </div>
                                                <span className={`font-bold text-sm sm:text-base ${
                                                    transaction.type === 'credit' 
                                                        ? 'text-green-600 dark:text-green-400' 
                                                        : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                    {transaction.type === 'credit' ? '+' : '-'}{formatPrice(transaction.amount)}
                                                </span>
                                            </div>
                                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                                {transaction.description && (
                                                    <p className="break-words"><strong>Description:</strong> {transaction.description}</p>
                                                )}
                                                {transaction.reference && (
                                                    <p className="break-words"><strong>Reference:</strong> {transaction.reference}</p>
                                                )}
                                                <p><strong>Balance After:</strong> {formatPrice(transaction.balance_after)}</p>
                                                <p><strong>Date:</strong> {new Date(transaction.transaction_date).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 mb-4">
                                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400">No transactions found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Transfer Modal */}
            {showTransferModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Transfer Funds</h3>
                            <button
                                onClick={() => setShowTransferModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                            {transferError && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <p className="text-red-600 dark:text-red-400 text-sm">{transferError}</p>
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* Available Balance */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                    <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Available Balance</p>
                                    <p className="text-blue-800 dark:text-blue-200 text-lg font-bold">
                                        {walletData ? formatPrice(walletData.wallet.balance) : formatPrice(0)}
                                    </p>
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Amount *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        max={walletData?.wallet.balance || 0}
                                        value={transferAmount}
                                        onChange={(e) => setTransferAmount(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="Enter amount"
                                    />
                                </div>

                                {/* Recipient */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Transfer To *
                                    </label>
                                    {loadingContacts ? (
                                        <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                                <span className="text-gray-500 dark:text-gray-400 text-sm">Loading contacts...</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <select
                                            value={transferToContactId}
                                            onChange={(e) => setTransferToContactId(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="">Select a contact</option>
                                            {availableContacts.map((contact) => (
                                                <option key={contact.id} value={contact.id}>
                                                    {contact.name} ({contact.email})
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {availableContacts.length === 0 && !loadingContacts && (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                            No other contacts available for transfer
                                        </p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Description (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={transferDescription}
                                        onChange={(e) => setTransferDescription(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="Enter description"
                                        maxLength={255}
                                    />
                                </div>

                                {/* Reference */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Reference (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={transferReference}
                                        onChange={(e) => setTransferReference(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                        placeholder="Enter reference"
                                        maxLength={255}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <button
                                onClick={() => setShowTransferModal(false)}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                disabled={transferring}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTransfer}
                                disabled={transferring || !transferAmount || !transferToContactId || availableContacts.length === 0}
                                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {transferring ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Transferring...
                                    </>
                                ) : (
                                    'Transfer Funds'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 