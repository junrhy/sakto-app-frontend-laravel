import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/Components/CartContext';
import { Badge } from '@/Components/ui/badge';

interface CartIconProps {
    className?: string;
    onClick?: () => void;
}

export default function CartIcon({ className = '', onClick }: CartIconProps) {
    const { state } = useCart();

    return (
        <div className={`relative ${className}`} onClick={onClick}>
            <ShoppingCart className="h-6 w-6" />
            {state.itemCount > 0 && (
                <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                    {state.itemCount > 99 ? '99+' : state.itemCount}
                </Badge>
            )}
        </div>
    );
} 