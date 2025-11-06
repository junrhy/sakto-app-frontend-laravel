import { FoodDeliveryMenuItem } from '../types';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';

interface MenuItemCardProps {
    item: FoodDeliveryMenuItem;
    formatCurrency: (amount: number) => string;
    onAddToCart?: (item: FoodDeliveryMenuItem) => void;
}

export default function MenuItemCard({ item, formatCurrency, onAddToCart }: MenuItemCardProps) {
    return (
        <Card className="overflow-hidden">
            {item.image && (
                <div className="h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
            <CardContent className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                    {item.name}
                </h3>
                {item.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
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

