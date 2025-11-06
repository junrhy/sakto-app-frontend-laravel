import { CartItem as CartItemType } from '../types';
import { Button } from '@/Components/ui/button';
import { PlusIcon, MinusIcon, TrashIcon } from 'lucide-react';

interface CartItemProps {
    item: CartItemType;
    formatCurrency: (amount: number) => string;
    onUpdateQuantity: (itemId: number, quantity: number) => void;
    onRemove: (itemId: number) => void;
}

export default function CartItem({ item, formatCurrency, onUpdateQuantity, onRemove }: CartItemProps) {
    return (
        <div className="flex gap-4 pb-4 border-b last:border-0">
            {item.menu_item.image && (
                <img
                    src={item.menu_item.image}
                    alt={item.menu_item.name}
                    className="w-20 h-20 object-cover rounded"
                />
            )}
            <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">
                    {item.menu_item.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(item.menu_item.effective_price || item.menu_item.discount_price || item.menu_item.price)} each
                </p>
                {item.special_instructions && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Note: {item.special_instructions}
                    </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateQuantity(item.menu_item.id, item.quantity - 1)}
                    >
                        <MinusIcon className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium text-gray-900 dark:text-white">
                        {item.quantity}
                    </span>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateQuantity(item.menu_item.id, item.quantity + 1)}
                    >
                        <PlusIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(item.menu_item.id)}
                        className="ml-auto text-red-600"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(item.subtotal)}
                </p>
            </div>
        </div>
    );
}

