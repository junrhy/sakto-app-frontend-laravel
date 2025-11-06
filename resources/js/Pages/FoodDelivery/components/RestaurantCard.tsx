import { FoodDeliveryRestaurant } from '../types';
import { Card, CardContent } from '@/Components/ui/card';
import { UtensilsIcon, StarIcon } from 'lucide-react';
import { router } from '@inertiajs/react';

interface RestaurantCardProps {
    restaurant: FoodDeliveryRestaurant;
    formatCurrency: (amount: number) => string;
}

export default function RestaurantCard({ restaurant, formatCurrency }: RestaurantCardProps) {
    return (
        <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.visit(`/food-delivery/restaurant/${restaurant.id}`)}
        >
            <div className="relative h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
                {restaurant.cover_image ? (
                    <img
                        src={restaurant.cover_image}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <UtensilsIcon className="h-16 w-16 text-gray-400" />
                    </div>
                )}
                {restaurant.logo && (
                    <div className="absolute bottom-0 left-4 transform translate-y-1/2">
                        <img
                            src={restaurant.logo}
                            alt={restaurant.name}
                            className="w-16 h-16 rounded-full border-4 border-white dark:border-gray-800 object-cover"
                        />
                    </div>
                )}
            </div>
            <CardContent className="pt-8 p-4">
                <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                        {restaurant.name}
                    </h3>
                    {restaurant.rating && (
                        <div className="flex items-center space-x-1">
                            <StarIcon className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {restaurant.rating.toFixed(1)}
                            </span>
                        </div>
                    )}
                </div>
                {restaurant.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
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
                        Min. order: {formatCurrency(restaurant.minimum_order_amount)}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

