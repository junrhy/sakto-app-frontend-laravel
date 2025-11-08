import { Card, CardContent } from '@/Components/ui/card';
import { router } from '@inertiajs/react';
import { StarIcon, UtensilsIcon } from 'lucide-react';
import { FoodDeliveryRestaurant } from '../types';

interface RestaurantCardProps {
    restaurant: FoodDeliveryRestaurant;
    formatCurrency: (amount: number) => string;
}

export default function RestaurantCard({
    restaurant,
    formatCurrency,
}: RestaurantCardProps) {
    return (
        <Card
            className="cursor-pointer transition-shadow hover:shadow-lg"
            onClick={() =>
                router.visit(`/food-delivery/restaurant/${restaurant.id}`)
            }
        >
            <div className="relative h-48 overflow-hidden rounded-t-lg bg-gray-200 dark:bg-gray-700">
                {restaurant.cover_image ? (
                    <img
                        src={restaurant.cover_image}
                        alt={restaurant.name}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <UtensilsIcon className="h-16 w-16 text-gray-400" />
                    </div>
                )}
                {restaurant.logo && (
                    <div className="absolute bottom-0 left-4 translate-y-1/2 transform">
                        <img
                            src={restaurant.logo}
                            alt={restaurant.name}
                            className="h-16 w-16 rounded-full border-4 border-white object-cover dark:border-gray-800"
                        />
                    </div>
                )}
            </div>
            <CardContent className="p-4 pt-8">
                <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {restaurant.name}
                    </h3>
                    {restaurant.rating &&
                        typeof restaurant.rating === 'number' && (
                            <div className="flex items-center space-x-1">
                                <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {restaurant.rating.toFixed(1)}
                                </span>
                            </div>
                        )}
                </div>
                {restaurant.description && (
                    <p className="mb-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                        {restaurant.description}
                    </p>
                )}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                        {formatCurrency(restaurant.delivery_fee)} delivery fee
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                        {restaurant.estimated_prep_time} min
                    </span>
                </div>
                {restaurant.minimum_order_amount > 0 && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Min. order:{' '}
                        {formatCurrency(restaurant.minimum_order_amount)}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
