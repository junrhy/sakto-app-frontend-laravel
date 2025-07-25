import React from 'react';
import { useCart } from './CartContext';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { 
    ShoppingCart as ShoppingCartIcon, 
    X, 
    Plus, 
    Minus, 
    Trash2, 
    CreditCard,
    Package,
    Download
} from 'lucide-react';
import { router } from '@inertiajs/react';

interface ShoppingCartProps {
    currency: {
        symbol: string;
        code: string;
    };
}

export const ShoppingCartPanel: React.FC<ShoppingCartProps> = ({ currency }) => {
    const { 
        state, 
        removeItem, 
        updateQuantity, 
        clearCart
    } = useCart();

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
                return <Package className="w-4 h-4" />;
            case 'digital':
                return <Download className="w-4 h-4" />;
            case 'service':
                return <CreditCard className="w-4 h-4" />;
            case 'subscription':
                return <CreditCard className="w-4 h-4" />;
            default:
                return <Package className="w-4 h-4" />;
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
            <Card className="w-80 shadow-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Shopping Cart</CardTitle>
                        <Badge variant="secondary">{state.itemCount}</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Cart Items */}
                    <div className="max-h-64 overflow-y-auto space-y-3">
                        {state.items.map((item, index) => (
                            <div key={index} className="flex items-start space-x-3 p-2 border border-gray-200 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700/50">
                                {item.thumbnail_url && (
                                    <img 
                                        src={item.thumbnail_url} 
                                        alt={item.name}
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                {item.name}
                                            </h4>
                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {formatCurrency(item.price, currency.symbol)}
                                            </p>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="sm"
                                            onClick={() => removeItem(item.productId, item.variantId)}
                                            className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                    
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => updateQuantity(item.productId, item.variantId, Math.max(0, item.quantity - 1))}
                                                disabled={item.quantity <= 1}
                                                className="h-6 w-6 p-0"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </Button>
                                            <span className="text-sm font-medium w-6 text-center text-gray-900 dark:text-gray-100">
                                                {item.quantity}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                                                className="h-6 w-6 p-0"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {formatCurrency(item.price * item.quantity, currency.symbol)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="border-t pt-3 space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900 dark:text-gray-100">Total:</span>
                            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
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
                            <Button
                                onClick={handleCheckout}
                                className="flex-1"
                            >
                                Checkout
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}; 