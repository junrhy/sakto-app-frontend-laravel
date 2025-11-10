import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { router } from '@inertiajs/react';
import { FoodDeliveryOrder } from '../types';

interface OrderCardProps {
    order: FoodDeliveryOrder;
    formatCurrency: (amount: number) => string;
    getStatusColor: (status: string) => string;
    formatStatus: (status: string) => string;
}

export default function OrderCard({
    order,
    formatCurrency,
    getStatusColor,
    formatStatus,
}: OrderCardProps) {
    return (
        <Card
            className="cursor-pointer transition-shadow hover:shadow-lg"
            onClick={() => router.visit(`/food-delivery/order/${order.id}`)}
        >
            <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                    <div>
                        <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                            Order #{order.order_reference}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {order.restaurant?.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                            {new Date(order.created_at).toLocaleString()}
                        </p>
                    </div>
                    <span
                        className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(order.order_status)}`}
                    >
                        {formatStatus(order.order_status)}
                    </span>
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Total Amount
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(order.total_amount)}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={(e) => {
                            e.stopPropagation();
                            router.visit(
                                `/food-delivery/track/${order.order_reference}`,
                            );
                        }}
                    >
                        Track Order
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
