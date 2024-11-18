import { Card, CardContent } from "@/Components/ui/card";

const sampleOrdersData = [
    { id: '1234', customer: 'John Doe', status: 'pending', amount: 234.50, time: '2 mins ago' },
    { id: '1235', customer: 'Jane Smith', status: 'processing', amount: 129.00, time: '15 mins ago' },
    { id: '1236', customer: 'Bob Johnson', status: 'pending', amount: 445.80, time: '45 mins ago' },
    { id: '1237', customer: 'Alice Brown', status: 'processing', amount: 55.20, time: '1 hour ago' },
];

export function RetailOrdersWidget() {
    return (
        <CardContent className="pt-4">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium dark:text-gray-200">Pending Orders</span>
                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">47</span>
                </div>
                <div className="space-y-2">
                    {sampleOrdersData.map((order) => (
                        <div 
                            key={order.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors"
                        >
                            <div className="flex flex-col">
                                <span className="text-sm font-medium dark:text-gray-200">{order.customer}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">#{order.id}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        order.status === 'pending' 
                                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-medium dark:text-gray-200">
                                    ${order.amount.toFixed(2)}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {order.time}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </CardContent>
    );
} 