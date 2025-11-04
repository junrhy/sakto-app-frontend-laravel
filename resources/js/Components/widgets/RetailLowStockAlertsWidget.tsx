import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { CardContent } from '@/Components/ui/card';
import { AlertCircle, AlertTriangle, Package, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

interface LowStockItem {
    id: number;
    name: string;
    sku: string;
    quantity: number;
    low_stock_threshold: number;
    price: number;
    status: 'low_stock' | 'out_of_stock';
}

export function RetailLowStockAlertsWidget() {
    const [items, setItems] = useState<LowStockItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchLowStockItems();
    }, []);

    const fetchLowStockItems = async () => {
        try {
            setLoading(true);
            const clientIdentifier = document
                .querySelector('meta[name="client-identifier"]')
                ?.getAttribute('content') || '';
            
            const response = await fetch(
                `/inventory/low-stock-alerts?client_identifier=${clientIdentifier}`,
                {
                    headers: {
                        Accept: 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    credentials: 'same-origin',
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch low stock alerts');
            }

            const data = await response.json();
            if (data.status === 'success' && data.data?.items) {
                // Limit to top 5 items
                setItems(data.data.items.slice(0, 5));
            } else {
                setItems([]);
            }
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to load low stock alerts',
            );
        } finally {
            setLoading(false);
        }
    };

    const getUrgency = (item: LowStockItem): 'low' | 'medium' | 'high' | 'critical' => {
        if (item.status === 'out_of_stock') return 'critical';
        const percentage = (item.quantity / item.low_stock_threshold) * 100;
        if (percentage <= 20) return 'critical';
        if (percentage <= 40) return 'high';
        if (percentage <= 60) return 'medium';
        return 'low';
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency.toLowerCase()) {
            case 'critical':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'high':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'low':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const getUrgencyIcon = (urgency: string) => {
        switch (urgency.toLowerCase()) {
            case 'critical':
                return (
                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                );
            case 'high':
                return (
                    <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                );
            case 'medium':
                return (
                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                );
            case 'low':
                return (
                    <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                );
            default:
                return (
                    <Package className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                );
        }
    };

    const getStockPercentage = (current: number, threshold: number) => {
        if (threshold === 0) return 100;
        return Math.min(Math.round((current / threshold) * 100), 100);
    };

    if (loading) {
        return (
            <CardContent className="p-6">
                <div className="flex h-32 items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-yellow-600"></div>
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

    if (items.length === 0) {
        return (
            <CardContent className="p-6">
                <div className="text-center text-gray-500 dark:text-gray-400">
                    <Package className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                    <p className="text-sm">No low stock alerts</p>
                    <p className="mt-1 text-xs">All products are well stocked</p>
                </div>
            </CardContent>
        );
    }

    return (
        <CardContent className="p-6">
            <div className="space-y-3">
                {items.map((item) => {
                    const urgency = getUrgency(item);
                    return (
                        <div
                            key={item.id}
                            className={`rounded-lg border p-4 ${
                                urgency === 'critical'
                                    ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                                    : urgency === 'high'
                                      ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20'
                                      : urgency === 'medium'
                                        ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                                        : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                            }`}
                        >
                            <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {getUrgencyIcon(urgency)}
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {item.name}
                                    </span>
                                </div>
                                <Badge className={getUrgencyColor(urgency)}>
                                    {urgency.toUpperCase()}
                                </Badge>
                            </div>

                            <div className="mb-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Current Stock
                                    </p>
                                    <p
                                        className={`text-lg font-bold ${
                                            item.status === 'out_of_stock'
                                                ? 'text-red-600 dark:text-red-400'
                                                : 'text-yellow-600 dark:text-yellow-400'
                                        }`}
                                    >
                                        {item.quantity} units
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Threshold
                                    </p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                                        {item.low_stock_threshold} units
                                    </p>
                                </div>
                            </div>

                            <div className="mb-3">
                                <div className="mb-1 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Stock Level</span>
                                    <span>
                                        {getStockPercentage(
                                            item.quantity,
                                            item.low_stock_threshold,
                                        )}
                                        %
                                    </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                    <div
                                        className={`h-2 rounded-full ${
                                            urgency === 'critical'
                                                ? 'bg-red-500'
                                                : urgency === 'high'
                                                  ? 'bg-orange-500'
                                                  : urgency === 'medium'
                                                    ? 'bg-yellow-500'
                                                    : 'bg-blue-500'
                                        }`}
                                        style={{
                                            width: `${getStockPercentage(item.quantity, item.low_stock_threshold)}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>SKU: {item.sku}</span>
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-xs"
                                    onClick={() => {
                                        router.visit('/inventory?app=retail');
                                    }}
                                >
                                    Manage Stock
                                    <ArrowRight className="ml-1 h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    );
                })}
                {items.length >= 5 && (
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                            router.visit('/inventory?app=retail');
                        }}
                    >
                        View All Low Stock Items
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
        </CardContent>
    );
}

