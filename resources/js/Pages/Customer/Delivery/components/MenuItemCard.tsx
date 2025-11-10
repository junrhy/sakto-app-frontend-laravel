import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { FoodDeliveryMenuItem } from '../types';

interface MenuItemCardProps {
    item: FoodDeliveryMenuItem;
    formatCurrency: (amount: number) => string;
    onAddToCart?: (item: FoodDeliveryMenuItem) => void;
}

export default function MenuItemCard({
    item,
    formatCurrency,
    onAddToCart,
}: MenuItemCardProps) {
    return (
        <Card className="overflow-hidden">
            {item.image && (
                <div className="h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                    />
                </div>
            )}
            <CardContent className="p-4">
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    {item.name}
                </h3>
                {item.description && (
                    <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                    </p>
                )}
                <div className="flex items-center justify-between">
                    <div>
                        {item.discount_price ? (
                            <div>
                                <span className="text-lg font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(item.discount_price)}
                                </span>
                                <span className="ml-2 text-sm text-gray-500 line-through">
                                    {formatCurrency(item.price)}
                                </span>
                            </div>
                        ) : (
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                {formatCurrency(item.price)}
                            </span>
                        )}
                    </div>
                    {onAddToCart && (
                        <Button
                            size="sm"
                            onClick={() => onAddToCart(item)}
                            disabled={!item.is_available}
                        >
                            Add
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
