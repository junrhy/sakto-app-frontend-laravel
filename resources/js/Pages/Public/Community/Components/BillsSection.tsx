import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface BillsSectionProps {
    member: {
        id: number;
        identifier?: string;
        app_currency: {
            code: string;
            symbol: string;
        } | null;
    };
    contactId: number | undefined;
    walletBalance?: number | string | null;
}

interface Biller {
    id: number;
    name: string;
    category: string;
    logo?: string;
    is_favorite: boolean;
    account_number?: string;
}

export default function BillsSection({
    member,
    contactId,
    walletBalance,
}: BillsSectionProps) {
    const [billers, setBillers] = useState<Biller[]>([]);
    const [favoriteBillers, setFavoriteBillers] = useState<Biller[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Payment state
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedBiller, setSelectedBiller] = useState<Biller | null>(null);
    const [accountNumber, setAccountNumber] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');
    const [processing, setProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [paymentConfirmed, setPaymentConfirmed] = useState(false);

    // Search and category state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(
        null,
    );
    const [showCategories, setShowCategories] = useState(true);
    const [categories, setCategories] = useState<
        Array<{ id: string; name: string; icon: string }>
    >([]);

    useEffect(() => {
        if (contactId) {
            fetchBillers();
        } else {
            setLoading(false);
        }
    }, [contactId]);

    const fetchBillers = async () => {
        try {
            setLoading(true);
            setError('');

            if (!member.identifier) {
                setError('Member identifier not available');
                return;
            }

            const params = new URLSearchParams();
            if (contactId) {
                params.append('contact_id', contactId.toString());
            }

            const response = await fetch(
                `/m/${member.identifier}/billers?${params.toString()}`,
            );
            const data = await response.json();

            if (response.ok && data.data) {
                const billersData = data.data.map((biller: any) => ({
                    id: biller.id,
                    name: biller.name,
                    category: biller.category || 'other',
                    logo: biller.logo,
                    is_favorite: biller.is_favorite || false,
                    account_number: biller.account_number || '',
                }));

                setBillers(billersData);
                setFavoriteBillers(
                    billersData.filter((biller: Biller) => biller.is_favorite),
                );

                // Extract unique categories from biller data
                const uniqueCategories = [
                    ...new Set(
                        billersData.map((biller: Biller) => biller.category),
                    ),
                ] as string[];
                const categoryData = uniqueCategories.map(
                    (category: string) => ({
                        id: category,
                        name: category,
                        icon: getCategoryIconName(category),
                    }),
                );

                setCategories(categoryData);
            } else {
                setError(data.error || 'Failed to load billers');
            }
        } catch (err) {
            setError('Failed to load billers');
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async (billerId: number) => {
        try {
            if (!member.identifier) {
                toast.error('Member identifier not available');
                return;
            }

            if (!contactId) {
                toast.error('Contact ID is required to manage favorites');
                return;
            }

            const response = await fetch(
                `/m/${member.identifier}/billers/${billerId}/favorite`,
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
                        contact_id: contactId,
                    }),
                },
            );

            const data = await response.json();

            if (response.ok) {
                setBillers((prev) =>
                    prev.map((biller) =>
                        biller.id === billerId
                            ? { ...biller, is_favorite: !biller.is_favorite }
                            : biller,
                    ),
                );

                setFavoriteBillers((prev) => {
                    const biller = billers.find((b) => b.id === billerId);
                    if (!biller) return prev;

                    if (biller.is_favorite) {
                        return prev.filter((b) => b.id !== billerId);
                    } else {
                        return [...prev, { ...biller, is_favorite: true }];
                    }
                });

                toast.success('Favorite updated successfully');
            } else {
                toast.error(data.error || 'Failed to update favorite');
            }
        } catch (err) {
            toast.error('Failed to update favorite');
        }
    };

    const handleCategoryClick = (categoryId: string) => {
        setSelectedCategory(categoryId);
        setShowCategories(false);
        setSearchTerm(''); // Clear search when switching categories
    };

    const handleBackToCategories = () => {
        setSelectedCategory(null);
        setShowCategories(true);
        setSearchTerm('');
    };

    const handlePayment = async () => {
        if (!selectedBiller || !accountNumber || !paymentAmount) {
            setPaymentError('Please fill in all required fields');
            return;
        }

        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            setPaymentError('Please enter a valid amount');
            return;
        }

        // Calculate total with service fee
        const serviceFee = 10;
        const totalAmount = amount + serviceFee;

        // Check if total amount exceeds wallet balance
        const currentBalance =
            typeof walletBalance === 'string'
                ? parseFloat(walletBalance)
                : walletBalance;
        if (
            currentBalance !== null &&
            currentBalance !== undefined &&
            totalAmount > currentBalance
        ) {
            setPaymentError(
                `Insufficient funds. Total amount (${formatPrice(totalAmount)}) exceeds your wallet balance (${formatPrice(currentBalance)})`,
            );
            return;
        }

        try {
            setProcessing(true);
            setPaymentError('');

            if (!member.identifier) {
                setPaymentError('Member identifier not available');
                return;
            }

            const response = await fetch(
                `/m/${member.identifier}/bill-payments`,
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
                        biller_id: selectedBiller.id,
                        biller_name: selectedBiller.name,
                        account_number: accountNumber,
                        amount: amount,
                        category: selectedBiller.category,
                        contact_id: contactId,
                    }),
                },
            );

            const data = await response.json();

            if (response.ok && data.success) {
                // Reset form
                setAccountNumber('');
                setPaymentAmount('');
                setSelectedBiller(null);
                setShowPaymentModal(false);

                // Show success toast with payment details
                const amount = parseFloat(paymentAmount);
                const serviceFee = 10;
                const totalAmount = amount + serviceFee;

                toast.success(`Payment successful! ${selectedBiller.name}`, {
                    description: `Total: ${formatPrice(totalAmount)} | Account: ${accountNumber}`,
                    duration: 5000,
                });
            } else {
                setPaymentError(
                    data.message ||
                        data.error ||
                        'Payment failed. Please try again.',
                );
            }
        } catch (err) {
            setPaymentError('Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const openPaymentModal = (biller: Biller) => {
        setSelectedBiller(biller);
        setShowPaymentModal(true);
        setPaymentError('');
        setAccountNumber(biller.account_number || '');
        setPaymentAmount('');
        setPaymentConfirmed(false);
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

    const getCategoryIcon = (category: string) => {
        // Map category to icon identifier first
        const iconName = getCategoryIconName(category);

        switch (iconName) {
            case 'electricity':
                return (
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                    </svg>
                );
            case 'water':
                return (
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                    </svg>
                );
            case 'internet':
                return (
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                        />
                    </svg>
                );
            case 'mobile':
                return (
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                    </svg>
                );
            case 'cable':
                return (
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                    </svg>
                );
            case 'credit_card':
                return (
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                    </svg>
                );
            case 'insurance':
                return (
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                    </svg>
                );
            case 'loan':
                return (
                    <svg
                        className="h-5 w-5"
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
                );
            default:
                return (
                    <svg
                        className="h-5 w-5"
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
                );
        }
    };

    const getCategoryIconName = (category: string): string => {
        // Map category names to icon identifiers
        const categoryMap: { [key: string]: string } = {
            electricity: 'electricity',
            water: 'water',
            internet: 'internet',
            mobile: 'mobile',
            cable: 'cable',
            credit_card: 'credit_card',
            insurance: 'insurance',
            loan: 'loan',
            utilities: 'electricity',
            telecommunications: 'internet',
            banking: 'credit_card',
            healthcare: 'insurance',
            transportation: 'mobile',
            entertainment: 'cable',
            education: 'other',
            government: 'other',
            retail: 'other',
            other: 'other',
        };

        return categoryMap[category.toLowerCase()] || 'other';
    };

    const getCategoryColor = (category: string) => {
        switch (category.toLowerCase()) {
            case 'electricity':
                return 'text-yellow-600';
            case 'water':
                return 'text-blue-600';
            case 'internet':
                return 'text-purple-600';
            case 'mobile':
                return 'text-green-600';
            case 'cable':
                return 'text-red-600';
            case 'credit_card':
                return 'text-indigo-600';
            case 'insurance':
                return 'text-emerald-600';
            case 'loan':
                return 'text-orange-600';
            case 'utilities':
                return 'text-yellow-600';
            case 'telecommunications':
                return 'text-purple-600';
            case 'banking':
                return 'text-indigo-600';
            case 'healthcare':
                return 'text-emerald-600';
            case 'transportation':
                return 'text-green-600';
            case 'entertainment':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const getCategoryBillers = (categoryId: string) => {
        return billers.filter((biller) => biller.category === categoryId);
    };

    const getFilteredBillers = () => {
        if (!selectedCategory) return [];

        const categoryBillers = getCategoryBillers(selectedCategory);
        if (!searchTerm) return categoryBillers;

        return categoryBillers.filter((biller) =>
            biller.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    };

    const getCategoryBillersCount = (categoryId: string) => {
        return billers.filter((biller) => biller.category === categoryId)
            .length;
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
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    </div>
                    <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                        Bills Access Required
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Please log in with your contact information to view and
                        pay bills.
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
                        Error Loading Bills
                    </h3>
                    <p className="mb-4 text-gray-600 dark:text-gray-400">
                        {error}
                    </p>
                    <button
                        onClick={fetchBillers}
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
            {/* Header - Only show when viewing billers */}
            {!showCategories && (
                <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 sm:p-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleBackToCategories}
                                className="flex items-center text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                                <svg
                                    className="mr-1 h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                                Back to Categories
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search billers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Favorite Billers - Only show when viewing categories */}
            {showCategories && favoriteBillers.length > 0 && (
                <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 sm:p-6">
                    <h3 className="mb-4 flex items-center text-lg font-medium text-gray-900 dark:text-gray-100">
                        <svg
                            className="mr-2 h-5 w-5 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Favorite Billers
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {favoriteBillers.map((biller) => (
                            <div
                                key={biller.id}
                                className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                                onClick={() => openPaymentModal(biller)}
                            >
                                <div className="flex min-w-0 flex-1 items-center">
                                    <div
                                        className={`mr-3 ${getCategoryColor(biller.category)} flex-shrink-0`}
                                    >
                                        {getCategoryIcon(biller.category)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="truncate font-medium text-gray-900 dark:text-gray-100">
                                            {biller.name}
                                        </div>
                                        {biller.account_number && (
                                            <div className="truncate text-sm text-gray-500 dark:text-gray-400">
                                                Account: {biller.account_number}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(biller.id);
                                    }}
                                    className="ml-2 flex-shrink-0 text-yellow-500 hover:text-yellow-600"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Categories View */}
            {showCategories && (
                <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 sm:p-6">
                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                        Categories
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {categories.map((category) => {
                            const billerCount = getCategoryBillersCount(
                                category.id,
                            );
                            return (
                                <div
                                    key={category.id}
                                    className={`cursor-pointer rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 ${
                                        billerCount === 0
                                            ? 'cursor-not-allowed opacity-50'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        billerCount > 0 &&
                                        handleCategoryClick(category.id)
                                    }
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div
                                                className={`mr-3 ${getCategoryColor(category.id)}`}
                                            >
                                                {getCategoryIcon(category.id)}
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                                    {category.name}
                                                </h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {billerCount} biller
                                                    {billerCount !== 1
                                                        ? 's'
                                                        : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <svg
                                            className="h-5 w-5 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Billers View */}
            {!showCategories && (
                <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800 sm:p-6">
                    <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-gray-100">
                        {
                            categories.find((c) => c.id === selectedCategory)
                                ?.name
                        }{' '}
                        Billers
                    </h3>
                    {getFilteredBillers().length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {getFilteredBillers().map((biller) => (
                                <div
                                    key={biller.id}
                                    className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                                    onClick={() => openPaymentModal(biller)}
                                >
                                    <div className="flex min-w-0 flex-1 items-center">
                                        <div
                                            className={`mr-3 ${getCategoryColor(biller.category)} flex-shrink-0`}
                                        >
                                            {getCategoryIcon(biller.category)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate font-medium text-gray-900 dark:text-gray-100">
                                                {biller.name}
                                            </div>
                                            {biller.account_number && (
                                                <div className="truncate text-sm text-gray-500 dark:text-gray-400">
                                                    Account:{' '}
                                                    {biller.account_number}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(biller.id);
                                        }}
                                        className={`${biller.is_favorite ? 'text-yellow-500' : 'text-gray-400'} ml-2 flex-shrink-0 hover:text-yellow-600`}
                                    >
                                        <svg
                                            className="h-5 w-5"
                                            fill={
                                                biller.is_favorite
                                                    ? 'currentColor'
                                                    : 'none'
                                            }
                                            stroke="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
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
                                {searchTerm
                                    ? 'No billers found matching your search'
                                    : 'No billers available in this category'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && selectedBiller && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-0 sm:p-4">
                    <div className="flex h-full w-full flex-col overflow-hidden bg-white dark:bg-gray-800 sm:max-h-[90vh] sm:w-full sm:max-w-md sm:rounded-lg sm:shadow-xl">
                        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700 sm:p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                Pay Bill
                            </h3>
                            <button
                                onClick={() => setShowPaymentModal(false)}
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
                            {paymentError && (
                                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        {paymentError}
                                    </p>
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* Wallet Balance */}
                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                        Available Balance
                                    </p>
                                    <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                                        {walletBalance
                                            ? formatPrice(walletBalance)
                                            : formatPrice(0)}
                                    </p>
                                </div>

                                {/* Biller Info */}
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                                    <div className="flex items-center">
                                        <div
                                            className={`mr-3 ${getCategoryColor(selectedBiller.category)}`}
                                        >
                                            {getCategoryIcon(
                                                selectedBiller.category,
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                {selectedBiller.name}
                                            </p>
                                            <p className="text-sm capitalize text-gray-600 dark:text-gray-400">
                                                {selectedBiller.category}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Number */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Account Number *
                                    </label>
                                    <input
                                        type="text"
                                        value={accountNumber}
                                        onChange={(e) =>
                                            setAccountNumber(e.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        placeholder="Enter account number"
                                    />
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
                                        max={(() => {
                                            const currentBalance =
                                                typeof walletBalance ===
                                                'string'
                                                    ? parseFloat(walletBalance)
                                                    : walletBalance;
                                            return currentBalance !== null &&
                                                currentBalance !== undefined
                                                ? currentBalance - 10
                                                : undefined;
                                        })()}
                                        value={paymentAmount}
                                        onChange={(e) =>
                                            setPaymentAmount(e.target.value)
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        placeholder="Enter amount"
                                    />
                                </div>

                                {/* Payment Summary */}
                                {paymentAmount &&
                                    parseFloat(paymentAmount) > 0 && (
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                                            <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                                Payment Summary
                                            </h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        Bill Amount:
                                                    </span>
                                                    <span className="text-gray-900 dark:text-gray-100">
                                                        {formatPrice(
                                                            parseFloat(
                                                                paymentAmount,
                                                            ),
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600 dark:text-gray-400">
                                                        Service Fee:
                                                    </span>
                                                    <span className="text-gray-900 dark:text-gray-100">
                                                        {formatPrice(10)}
                                                    </span>
                                                </div>
                                                <div className="border-t border-gray-200 pt-2 dark:border-gray-600">
                                                    <div className="flex justify-between font-medium">
                                                        <span className="text-gray-900 dark:text-gray-100">
                                                            Total Amount:
                                                        </span>
                                                        <span className="text-blue-600 dark:text-blue-400">
                                                            {formatPrice(
                                                                parseFloat(
                                                                    paymentAmount,
                                                                ) + 10,
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                {/* Payment Confirmation Checkbox */}
                                <div className="flex items-start space-x-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                                    <input
                                        type="checkbox"
                                        id="payment-confirmation"
                                        checked={paymentConfirmed}
                                        onChange={(e) =>
                                            setPaymentConfirmed(
                                                e.target.checked,
                                            )
                                        }
                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label
                                        htmlFor="payment-confirmation"
                                        className="text-sm text-gray-700 dark:text-gray-300"
                                    >
                                        I confirm that I want to proceed with
                                        this payment. I understand that this
                                        action cannot be undone and the amount
                                        will be deducted from my wallet balance.
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-gray-200 p-4 dark:border-gray-700 sm:p-6">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePayment}
                                disabled={
                                    processing ||
                                    !accountNumber ||
                                    !paymentAmount ||
                                    !paymentConfirmed
                                }
                                className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
                            >
                                {processing ? (
                                    <>
                                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                        Processing...
                                    </>
                                ) : (
                                    'Pay Bill'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
