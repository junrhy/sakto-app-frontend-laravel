import React from 'react';
import { useCart } from './CartContext';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { ShoppingCart } from 'lucide-react';

interface CartButtonProps {
    className?: string;
    onClick?: () => void;
}

export const CartButton: React.FC<CartButtonProps> = ({ className, onClick }) => {
    const { state } = useCart();

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            className={className}
        >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Cart
            {state.itemCount > 0 && (
                <Badge className="ml-2 bg-blue-600 text-white">
                    {state.itemCount > 99 ? '99+' : state.itemCount}
                </Badge>
            )}
        </Button>
    );
}; 