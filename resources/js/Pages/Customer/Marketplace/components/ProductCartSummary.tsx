import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { ShoppingCart, Trash2 } from 'lucide-react';
import type { MarketplaceCartItem } from './ProductGrid';

interface ProductCartSummaryProps {
    cartItems: MarketplaceCartItem[];
    getCartItemCount: () => number;
    getCartTotal: () => number;
    formatPrice: (price: number | string) => string;
    handleCheckout: () => void;
    handleClearCart: () => void;
}

export default function ProductCartSummary({
    cartItems,
    getCartItemCount,
    getCartTotal,
    formatPrice,
    handleCheckout,
    handleClearCart,
}: ProductCartSummaryProps) {
    if (getCartItemCount() === 0) {
        return null;
    }

    const itemCount = getCartItemCount();
    const total = getCartTotal();

    return (
        <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20">
            <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Shopping Cart
                                </span>
                                <Badge
                                    variant="secondary"
                                    className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                >
                                    {itemCount} item{itemCount !== 1 ? 's' : ''}
                                </Badge>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Total:
                                </span>
                                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                    {formatPrice(total)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 sm:gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearCart}
                            className="border-red-300 text-red-700 transition-colors hover:bg-red-50 hover:text-red-800 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                        >
                            <Trash2 className="mr-1.5 h-4 w-4" />
                            <span className="hidden sm:inline">Clear Cart</span>
                            <span className="sm:hidden">Clear</span>
                        </Button>
                        <Button
                            onClick={handleCheckout}
                            size="sm"
                            className="bg-blue-600 text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
                        >
                            <ShoppingCart className="mr-1.5 h-4 w-4" />
                            Checkout
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
