import { Card, CardContent } from "@/Components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const sampleInventoryData = [
    { category: 'Electronics', stock: 856 },
    { category: 'Clothing', stock: 432 },
    { category: 'Books', stock: 234 },
    { category: 'Sports', stock: 389 },
    { category: 'Home', stock: 178 },
];

export function InventoryWidget() {
    return (
        <CardContent className="pt-4">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Stock Items</span>
                    <span className="text-lg font-bold text-blue-600">1,234</span>
                </div>
                <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sampleInventoryData}>
                            <XAxis 
                                dataKey="category" 
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
                                    backgroundColor: 'white', 
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                                formatter={(value) => [`${value}`, 'Items']}
                            />
                            <Bar 
                                dataKey="stock" 
                                fill="#3b82f6"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </CardContent>
    );
} 