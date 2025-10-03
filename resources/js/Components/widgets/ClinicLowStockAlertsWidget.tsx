import { Badge } from '@/Components/ui/badge';
import { CardContent } from '@/Components/ui/card';
import { AlertCircle, AlertTriangle, Package } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LowStockItem {
    id: number;
    name: string;
    category: string;
    current_stock: number;
    minimum_stock: number;
    unit: string;
    last_restocked: string;
    supplier: string | null;
    urgency: 'low' | 'medium' | 'high' | 'critical';
}

export function ClinicLowStockAlertsWidget() {
    const [items, setItems] = useState<LowStockItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchLowStockItems();
    }, []);

    const fetchLowStockItems = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                '/clinic/inventory/low-stock-alerts?limit=5',
            );

            if (!response.ok) {
                throw new Error('Failed to fetch low stock alerts');
            }

            const data = await response.json();
            setItems(data.items || []);
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
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

    const getStockPercentage = (current: number, minimum: number) => {
        if (minimum === 0) return 100;
        return Math.round((current / minimum) * 100);
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

    if (items.length === 0) {
        return (
            <CardContent className="p-6">
                <div className="text-center text-gray-500 dark:text-gray-400">
                    <Package className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                    <p>No low stock alerts</p>
                </div>
            </CardContent>
        );
    }

    return (
        <CardContent className="p-6">
            <div className="space-y-3">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {getUrgencyIcon(item.urgency)}
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {item.name}
                                </span>
                            </div>
                            <Badge className={getUrgencyColor(item.urgency)}>
                                {item.urgency.toUpperCase()}
                            </Badge>
                        </div>

                        <div className="mb-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Current Stock
                                </p>
                                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                                    {item.current_stock} {item.unit}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Minimum Required
                                </p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {item.minimum_stock} {item.unit}
                                </p>
                            </div>
                        </div>

                        <div className="mb-3">
                            <div className="mb-1 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>Stock Level</span>
                                <span>
                                    {getStockPercentage(
                                        item.current_stock,
                                        item.minimum_stock,
                                    )}
                                    %
                                </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                <div
                                    className={`h-2 rounded-full ${
                                        item.urgency === 'critical'
                                            ? 'bg-red-500'
                                            : item.urgency === 'high'
                                              ? 'bg-orange-500'
                                              : item.urgency === 'medium'
                                                ? 'bg-yellow-500'
                                                : 'bg-blue-500'
                                    }`}
                                    style={{
                                        width: `${Math.min(getStockPercentage(item.current_stock, item.minimum_stock), 100)}%`,
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <span className="font-medium">Category:</span>{' '}
                                {item.category}
                            </div>
                            {item.supplier && (
                                <div>
                                    <span className="font-medium">
                                        Supplier:
                                    </span>{' '}
                                    {item.supplier}
                                </div>
                            )}
                        </div>

                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Last restocked:{' '}
                            {item.last_restocked === 'N/A'
                                ? 'N/A'
                                : formatDate(item.last_restocked)}
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
    );
}
