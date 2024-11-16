import { Card, CardContent } from "@/Components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from "react";

interface SalesData {
    name: string;
    sales: number;
}

export function RetailSalesWidget() {
    const [salesData, setSalesData] = useState<SalesData[]>([]);
    const [todaySales, setTodaySales] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currencySymbol, setCurrencySymbol] = useState<string>('$');
    useEffect(() => {
        const fetchSalesData = async () => {
            try {
                const response = await fetch('/retail-sale-overview');
                if (!response.ok) {
                    throw new Error('Failed to fetch sales data');
                }
                const data = await response.json();
                
                // Create a weekly data array for the last 7 days
                const today = new Date();
                const weeklyData = Array.from({ length: 7 }, (_, i) => {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    return {
                        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
                        sales: i === 0 ? Number(data.todaySales) : Number(data.weeklySales) / 7
                    };
                }).reverse(); // Reverse to show oldest to newest

                setSalesData(weeklyData);
                setTodaySales(Number(data.todaySales));
                setCurrencySymbol( data.currency_symbol);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching sales data:', error);
                setError(error instanceof Error ? error.message : 'An error occurred');
                setIsLoading(false);
            }
        };

        fetchSalesData();
    }, []);

    if (isLoading) {
        return (
            <CardContent className="pt-4">
                <div>Loading...</div>
            </CardContent>
        );
    }

    if (error) {
        return (
            <CardContent className="pt-4">
                <div className="text-red-500">Error: {error}</div>
            </CardContent>
        );
    }

    // Only render the chart if we have data
    if (!salesData.length) {
        return (
            <CardContent className="pt-4">
                <div>No sales data available</div>
            </CardContent>
        );
    }

    return (
        <CardContent className="pt-4">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Today's Sales</span>
                    <span className="text-lg font-bold text-green-600">
                        {currencySymbol}{todaySales.toLocaleString()}
                    </span>
                </div>
                <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={salesData}>
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
                                tickFormatter={(value) => `${currencySymbol}${value}`}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'white', 
                                    border: 'none',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                                formatter={(value) => [`${currencySymbol}${value}`, 'Sales']}
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