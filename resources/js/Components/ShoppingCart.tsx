import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { router } from '@inertiajs/react';
import {
    CreditCard,
    Download,
    Minus,
    Package,
    Plus,
    Trash2,
} from 'lucide-react';
import React from 'react';
import { useCart } from './CartContext';

interface ShoppingCartProps {
    currency: {
        symbol: string;
        code: string;
    };
}

export const ShoppingCartPanel: React.FC<ShoppingCartProps> = ({
    currency,
}) => {
    const { state, removeItem, updateQuantity, clearCart } = useCart();

    const handleCheckout = () => {
        if (state.items.length === 0) {
            alert('Your cart is empty');
            return;
        }

        // Navigate to checkout page
        router.visit(route('product-orders.checkout'));
    };

    const getProductTypeIcon = (type: string) => {
        switch (type) {
            case 'physical':
                return <Package className="h-4 w-4" />;
            case 'digital':
                return <Download className="h-4 w-4" />;
            case 'service':
                return <CreditCard className="h-4 w-4" />;
            case 'subscription':
                return <CreditCard className="h-4 w-4" />;
            default:
                return <Package className="h-4 w-4" />;
        }
    };

    const getProductTypeLabel = (type: string) => {
        switch (type) {
            case 'physical':
                return 'Physical';
            case 'digital':
                return 'Digital';
            case 'service':
                return 'Service';
            case 'subscription':
                return 'Subscription';
            default:
                return type;
        }
    };

    // Don't render if cart is empty
    if (state.items.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Card className="w-80 border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Shopping Cart</CardTitle>
                        <Badge variant="secondary">{state.itemCount}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Cart Items */}
                    <div className="max-h-64 space-y-3 overflow-y-auto">
                        {state.items.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-start space-x-3 rounded border border-gray-200 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-700/50"
                            >
                                {item.thumbnail_url && (
                                    <img
                                        src={item.thumbnail_url}
                                        alt={item.name}
                                        className="h-12 w-12 rounded object-cover"
                                    />
                                )}
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {item.name}
                                            </h4>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {formatCurrency(
                                                    item.price,
                                                    currency.symbol,
                                                )}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                removeItem(
                                                    item.productId,
                                                    item.variantId,
                                                )
                                            }
                                            className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>

                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.productId,
                                                        item.variantId,
                                                        Math.max(
                                                            0,
                                                            item.quantity - 1,
                                                        ),
                                                    )
                                                }
                                                disabled={item.quantity <= 1}
                                                className="h-6 w-6 p-0"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-6 text-center text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {item.quantity}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    updateQuantity(
                                                        item.productId,
                                                        item.variantId,
                                                        item.quantity + 1,
                                                    )
                                                }
                                                className="h-6 w-6 p-0"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {formatCurrency(
                                                item.price * item.quantity,
                                                currency.symbol,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="space-y-3 border-t pt-3">
                        <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                Total:
                            </span>
                            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                {formatCurrency(state.total, currency.symbol)}
                            </span>
                        </div>

                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearCart}
                                className="flex-1"
                            >
                                Clear Cart
                            </Button>
                            <Button onClick={handleCheckout} className="flex-1">
                                Checkout
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
