import { FoodDeliveryOrder } from '../types';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { router } from '@inertiajs/react';

interface OrderCardProps {
    order: FoodDeliveryOrder;
    formatCurrency: (amount: number) => string;
    getStatusColor: (status: string) => string;
    formatStatus: (status: string) => string;
}

export default function OrderCard({ order, formatCurrency, getStatusColor, formatStatus }: OrderCardProps) {
    return (
        <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.visit(`/food-delivery/order/${order.id}`)}
        >
            <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                            Order #{order.order_reference}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.restaurant?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {new Date(order.created_at).toLocaleString()}
                        </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}>
                        {formatStatus(order.order_status)}
                    </span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
                        <p className="font-semibold text-lg text-gray-900 dark:text-white">
                            {formatCurrency(order.total_amount)}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.visit(`/food-delivery/track/${order.order_reference}`);
                        }}
                    >
                        Track Order
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

