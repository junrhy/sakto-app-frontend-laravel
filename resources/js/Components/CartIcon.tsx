import { useCart } from '@/Components/CartContext';
import { Badge } from '@/Components/ui/badge';
import { ShoppingCart } from 'lucide-react';

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
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                >
                    {state.itemCount > 99 ? '99+' : state.itemCount}
                </Badge>
            )}
        </div>
    );
}
