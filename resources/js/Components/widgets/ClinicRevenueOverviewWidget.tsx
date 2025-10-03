import { CardContent } from '@/Components/ui/card';
import { PageProps } from '@/types';
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RevenueStats {
    total_revenue: number;
    today_revenue: number;
    monthly_revenue: number;
    outstanding_amount: number;
    revenue_growth: number;
    payment_methods: {
        cash: number;
        card: number;
        insurance: number;
        other: number;
    };
}

interface Props extends PageProps {}

export function ClinicRevenueOverviewWidget({ auth }: Props) {
    const [stats, setStats] = useState<RevenueStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRevenueStats();
    }, []);

    const fetchRevenueStats = async () => {
        try {
            setLoading(true);
            const response = await fetch('/clinic/revenue-stats');

            if (!response.ok) {
                throw new Error('Failed to fetch revenue statistics');
            }

            const data = await response.json();
            setStats(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to load revenue statistics',
            );
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        const appCurrency = (auth.user as any).app_currency;
        if (!appCurrency) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(amount);
        }

        // Parse the JSON currency settings if it's a string
        let currencySettings = appCurrency;
        if (typeof appCurrency === 'string') {
            try {
                currencySettings = JSON.parse(appCurrency);
            } catch (e) {
                console.warn('Failed to parse app_currency JSON:', e);
                return new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                }).format(amount);
            }
        }

        return `${currencySettings.symbol}${amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const getGrowthIcon = (growth: number) => {
        if (growth > 0) {
            return (
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            );
        } else if (growth < 0) {
            return (
                <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            );
        }
        return null;
    };

    const getGrowthColor = (growth: number) => {
        if (growth > 0) {
            return 'text-green-600 dark:text-green-400';
        } else if (growth < 0) {
            return 'text-red-600 dark:text-red-400';
        }
        return 'text-gray-600 dark:text-gray-400';
    };

    if (loading) {
        return (
            <CardContent className="p-6">
                <div className="flex h-32 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                </div>
            </CardContent>
        );
    }

    if (error) {
        return (
            <CardContent className="p-6">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                </div>
            </CardContent>
        );
    }

    if (!stats) {
        return (
            <CardContent className="p-6">
                <div className="text-center text-gray-500 dark:text-gray-400">
                    No revenue data available
                </div>
            </CardContent>
        );
    }

    return (
        <CardContent className="p-6">
            <div className="space-y-4">
                {/* Main Revenue Display */}
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                        {formatCurrency(stats?.total_revenue || 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Revenue
                    </div>
                    <div className="mt-1 flex items-center justify-center gap-1">
                        {getGrowthIcon(stats?.revenue_growth || 0)}
                        <span
                            className={`text-sm ${getGrowthColor(stats?.revenue_growth || 0)}`}
                        >
                            {(stats?.revenue_growth || 0) > 0 ? '+' : ''}
                            {(stats?.revenue_growth || 0).toFixed(1)}%
                        </span>
                    </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
                        <div className="mb-1 flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                Today
                            </span>
                        </div>
                        <div className="text-base font-bold text-green-600 dark:text-green-400 sm:text-lg">
                            {formatCurrency(stats?.today_revenue || 0)}
                        </div>
                    </div>

                    <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                        <div className="mb-1 flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {new Date().toLocaleDateString('en-US', {
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </span>
                        </div>
                        <div className="text-base font-bold text-blue-600 dark:text-blue-400 sm:text-lg">
                            {formatCurrency(stats?.monthly_revenue || 0)}
                        </div>
                    </div>
                </div>

                {/* Outstanding Amount */}
                {(stats?.outstanding_amount || 0) > 0 && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                        <div className="mb-1 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                Outstanding Amount
                            </span>
                        </div>
                        <div className="text-base font-bold text-red-600 dark:text-red-400 sm:text-lg">
                            {formatCurrency(stats?.outstanding_amount || 0)}
                        </div>
                    </div>
                )}

                {/* Payment Methods Breakdown */}
                <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Payment Methods (
                        {new Date().toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                        })}
                        )
                    </div>
                    <div className="space-y-2">
                        {Object.entries(stats?.payment_methods || {}).map(
                            ([method, amount]) => (
                                <div
                                    key={method}
                                    className="flex items-center justify-between"
                                >
                                    <span className="text-sm capitalize text-gray-600 dark:text-gray-400">
                                        {method}
                                    </span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        {formatCurrency(amount)}
                                    </span>
                                </div>
                            ),
                        )}
                    </div>
                </div>
            </div>
        </CardContent>
    );
}
