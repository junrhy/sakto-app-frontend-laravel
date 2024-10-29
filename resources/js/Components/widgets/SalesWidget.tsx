import { Card, CardContent } from "@/Components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const sampleSalesData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 5000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
];

export function SalesWidget() {
    return (
        <CardContent className="pt-4">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Today's Sales</span>
                    <span className="text-lg font-bold text-green-600">$12,543</span>
                </div>
                <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sampleSalesData}>
                            <XAxis 
                                dataKey="name" 
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis 
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'white', 
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                                formatter={(value) => [`$${value}`, 'Sales']}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="sales" 
                                stroke="#22c55e" 
                                strokeWidth={2}
                                dot={false}
                                activeDot={{ r: 4, fill: "#22c55e" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </CardContent>
    );
} 