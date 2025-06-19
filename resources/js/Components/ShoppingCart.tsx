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
        clearCart, 
        closeCart, 
        getItemCount, 
        getTotalPrice 
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

    if (!state.isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={closeCart}
            />
            
            {/* Cart Panel */}
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform">
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b">
                        <div className="flex items-center">
                            <ShoppingCartIcon className="w-5 h-5 mr-2" />
                            <h2 className="text-lg font-semibold">Shopping Cart</h2>
                            {getItemCount() > 0 && (
                                <Badge className="ml-2">{getItemCount()}</Badge>
                            )}
                        </div>
                        <Button variant="ghost" size="sm" onClick={closeCart}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {state.items.length === 0 ? (
                            <div className="text-center py-8">
                                <ShoppingCartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                                <p className="text-gray-500">Add some products to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {state.items.map((item) => (
                                    <Card key={item.id} className="p-4">
                                        <div className="flex items-start space-x-3">
                                            {item.thumbnail_url && (
                                                <img 
                                                    src={item.thumbnail_url} 
                                                    alt={item.name}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-medium text-gray-900 truncate">
                                                            {item.name}
                                                        </h4>
                                                        <div className="flex items-center mt-1">
                                                            {getProductTypeIcon(item.type)}
                                                            <span className="text-xs text-gray-500 ml-1">
                                                                {getProductTypeLabel(item.type)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-900 mt-1">
                                                            {formatCurrency(item.price, currency.symbol)}
                                                        </p>
                                                    </div>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm"
                                                        onClick={() => removeItem(item.id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex items-center space-x-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </Button>
                                                        <span className="text-sm font-medium w-8 text-center">
                                                            {item.quantity}
                                                        </span>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            disabled={
                                                                item.type === 'physical' && 
                                                                item.stock_quantity !== undefined && 
                                                                item.quantity >= item.stock_quantity
                                                            }
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </Button>
                                                    </div>
                                                    <p className="text-sm font-medium">
                                                        {formatCurrency(item.price * item.quantity, currency.symbol)}
                                                    </p>
                                                </div>
                                                
                                                {item.type === 'physical' && item.stock_quantity !== undefined && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {item.stock_quantity} in stock
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {state.items.length > 0 && (
                        <div className="border-t p-4 space-y-4">
                            {/* Summary */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal:</span>
                                    <span>{formatCurrency(getTotalPrice(), currency.symbol)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Tax:</span>
                                    <span>{formatCurrency(0, currency.symbol)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Shipping:</span>
                                    <span>{formatCurrency(0, currency.symbol)}</span>
                                </div>
                                <div className="flex justify-between font-medium text-lg border-t pt-2">
                                    <span>Total:</span>
                                    <span>{formatCurrency(getTotalPrice(), currency.symbol)}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="space-y-2">
                                <Button 
                                    onClick={handleCheckout}
                                    className="w-full"
                                    disabled={state.items.length === 0}
                                >
                                    Proceed to Checkout
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={clearCart}
                                    className="w-full"
                                >
                                    Clear Cart
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}; 