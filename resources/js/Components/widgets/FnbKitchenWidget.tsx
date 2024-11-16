import { CardContent } from "@/Components/ui/card";
import { useState, useEffect } from "react";
import { Badge } from "@/Components/ui/badge";
import axios from "axios";

interface KitchenOrder {
    id: number;
    table_number: string;
    status: 'pending' | 'preparing' | 'ready' | 'served';
    items: Array<{
        name: string;
        quantity: number;
        notes?: string;
    }>;
    created_at: string;
}

export function FnbKitchenWidget() {
    const [orders, setOrders] = useState<KitchenOrder[]>([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('/pos-restaurant/kitchen-orders/overview');
                const transformedOrders = response.data.map((order: any) => ({
                    ...order,
                    items: JSON.parse(order.items),
                    client_identifier: undefined
                }));
                setOrders(transformedOrders);
            } catch (error) {
                console.error('Failed to fetch kitchen orders:', error);
            }
        };

        fetchOrders();
        const interval = setInterval(fetchOrders, 30000);

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: KitchenOrder['status']) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            preparing: 'bg-blue-100 text-blue-800',
            ready: 'bg-green-100 text-green-800',
            served: 'bg-gray-100 text-gray-800',
        };
        return colors[status];
    };

    const ordersByStatus = {
        pending: orders.filter(order => order.status === 'pending'),
        preparing: orders.filter(order => order.status === 'preparing'),
        ready: orders.filter(order => order.status === 'ready'),
        served: orders.filter(order => order.status === 'served'),
    };

    const OrderCard = ({ order }: { order: KitchenOrder }) => (
        <div 
            key={order.id} 
            className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
        >
            <div className="flex justify-between items-start mb-3">
                <div>
                    <span className="font-medium text-lg">{order.table_number}</span>
                    <Badge 
                        className={`ml-2 ${getStatusColor(order.status)}`}
                    >
                        {order.status}
                    </Badge>
                </div>
                <span className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleTimeString()}
                </span>
            </div>
            <ul className="space-y-2">
                {order.items.map((item, index) => (
                    <li key={index} className="text-sm flex items-start">
                        <span className="font-medium min-w-[2rem]">{item.quantity}x</span>
                        <div>
                            <div>{item.name}</div>
                            {item.notes && (
                                <div className="text-gray-500 italic text-xs">
                                    {item.notes}
                                </div>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <CardContent>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Kitchen Orders</h3>
                    <Badge variant="outline" className="px-2">
                        {orders.length} Active
                    </Badge>
                </div>
                
                {orders.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                        No active kitchen orders
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(ordersByStatus).map(([status, statusOrders]) => 
                            statusOrders.length > 0 && (
                                <div key={status}>
                                    <h4 className="text-md font-medium mb-4 capitalize">
                                        {status} Orders ({statusOrders.length})
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {statusOrders.map((order) => (
                                            <OrderCard key={order.id} order={order} />
                                        ))}
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </CardContent>
    );
} 