import React from 'react';
import { useCart } from './CartContext';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { ShoppingCart } from 'lucide-react';

interface CartButtonProps {
    className?: string;
}

export const CartButton: React.FC<CartButtonProps> = ({ className }) => {
    const { toggleCart, getItemCount } = useCart();
    const itemCount = getItemCount();

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={toggleCart}
            className={className}
        >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Cart
            {itemCount > 0 && (
                <Badge className="ml-2 bg-blue-600 text-white">
                    {itemCount}
                </Badge>
            )}
        </Button>
    );
}; 