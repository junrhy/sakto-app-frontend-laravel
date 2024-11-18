import { Card, CardContent } from "@/Components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';

interface InventoryItem {
    name: string;
    quantity: number;
    category_id: number;
}

interface Category {
    id: number;
    name: string;
}

interface InventoryResponse {
    items: InventoryItem[];
    categories: Category[];
}

interface CategoryData {
    [key: number]: {
        name: string;
        items: InventoryItem[];
        totalStock: number;
    };
}

export function RetailInventoryWidget() {
    const [categoryData, setCategoryData] = useState<CategoryData>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInventoryData = async () => {
            try {
                const response = await fetch('/inventory/products-overview');
                const data: InventoryResponse = await response.json();
                
                // Organize data by categories
                const organizedData: CategoryData = {};
                
                // Initialize categories
                data.categories.forEach(category => {
                    organizedData[category.id] = {
                        name: category.name,
                        items: [],
                        totalStock: 0
                    };
                });

                // Sort items into categories
                data.items.forEach(item => {
                    if (organizedData[item.category_id]) {
                        organizedData[item.category_id].items.push({
                            name: item.name,
                            quantity: item.quantity,
                            category_id: item.category_id
                        });
                        organizedData[item.category_id].totalStock += item.quantity;
                    }
                });

                setCategoryData(organizedData);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching inventory data:', error);
                setIsLoading(false);
            }
        };

        fetchInventoryData();
    }, []);

    if (isLoading) {
        return (
            <CardContent className="pt-4">
                <div>Loading...</div>
            </CardContent>
        );
    }

    return (
        <CardContent className="pt-4">
            <div className="space-y-8">
                {Object.entries(categoryData).map(([categoryId, category]) => (
                    <div key={categoryId} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium dark:text-gray-200">
                                {category.name} Stock Items
                            </span>
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {category.totalStock.toLocaleString()}
                            </span>
                        </div>
                        <div className="h-32">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={category.items}>
                                    <XAxis 
                                        dataKey="name" 
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        interval={0}
                                        tick={(props) => (
                                            <text
                                                transform={`rotate(-45 ${props.x} ${props.y})`}
                                                textAnchor="end"
                                                x={props.x}
                                                y={props.y + 10}
                                                fontSize={12}
                                            >
                                                {props.payload.value}
                                            </text>
                                        )}
                                        height={50}
                                    />
                                    <YAxis 
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'var(--background)', 
                                            border: 'none',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            color: 'var(--foreground)'
                                        }}
                                        formatter={(value) => [`${value}`, 'Items']}
                                    />
                                    <Bar 
                                        dataKey="quantity" 
                                        fill="#3b82f6"
                                        radius={[4, 4, 0, 0]}
                                        className="dark:fill-blue-400"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ))}
            </div>
        </CardContent>
    );
} 