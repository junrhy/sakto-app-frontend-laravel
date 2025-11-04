import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    endOfDay,
    endOfMonth,
    endOfWeek,
    format,
    startOfDay,
    startOfMonth,
    startOfWeek,
    subDays,
    subMonths,
    subWeeks,
} from 'date-fns';
import {
    CreditCard,
    DollarSign,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface SaleItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
}

interface Sale {
    id: number;
    created_at: string;
    items: SaleItem[];
    total_amount: number;
    cash_received: number | null;
    change: number | null;
    payment_method: string;
}

interface SalesAnalyticsProps {
    sales: Sale[];
    appCurrency: {
        symbol: string;
        decimal_separator?: string;
        thousands_separator?: string;
    };
}

const COLORS = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#8884d8',
    '#82ca9d',
];

export default function SalesAnalytics({
    sales,
    appCurrency,
}: SalesAnalyticsProps) {
    const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>(
        'month',
    );

    const formatAmount = (amount: number): string => {
        const { symbol, thousands_separator = ',' } = appCurrency;
        return `${symbol}${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, thousands_separator)}`;
    };

    const filteredSales = useMemo(() => {
        const now = new Date();
        let startDate: Date;

        switch (period) {
            case 'today':
                startDate = startOfDay(now);
                break;
            case 'week':
                startDate = startOfWeek(now);
                break;
            case 'month':
                startDate = startOfMonth(now);
                break;
            default:
                return sales;
        }

        return sales.filter((sale) => {
            const saleDate = new Date(sale.created_at);
            return saleDate >= startDate;
        });
    }, [sales, period]);

    const summary = useMemo(() => {
        const totalSales = filteredSales.length;
        const totalRevenue = filteredSales.reduce(
            (sum, sale) => sum + sale.total_amount,
            0,
        );
        const totalItems = filteredSales.reduce(
            (sum, sale) =>
                sum +
                sale.items.reduce(
                    (itemSum, item) => itemSum + item.quantity,
                    0,
                ),
            0,
        );
        const averageOrderValue =
            totalSales > 0 ? totalRevenue / totalSales : 0;

        // Payment method breakdown
        const paymentMethods = filteredSales.reduce(
            (acc, sale) => {
                const method = sale.payment_method.toLowerCase();
                acc[method] = (acc[method] || 0) + sale.total_amount;
                return acc;
            },
            {} as Record<string, number>,
        );

        // Top selling products
        const productSales = filteredSales.reduce(
            (acc, sale) => {
                sale.items.forEach((item) => {
                    if (!acc[item.name]) {
                        acc[item.name] = {
                            name: item.name,
                            quantity: 0,
                            revenue: 0,
                        };
                    }
                    acc[item.name].quantity += item.quantity;
                    acc[item.name].revenue += item.price * item.quantity;
                });
                return acc;
            },
            {} as Record<
                string,
                { name: string; quantity: number; revenue: number }
            >,
        );

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);

        // Daily sales data for chart
        const dailySales = filteredSales.reduce(
            (acc, sale) => {
                const date = format(new Date(sale.created_at), 'MMM dd');
                if (!acc[date]) {
                    acc[date] = { date, revenue: 0, count: 0 };
                }
                acc[date].revenue += sale.total_amount;
                acc[date].count += 1;
                return acc;
            },
            {} as Record<
                string,
                { date: string; revenue: number; count: number }
            >,
        );

        const dailyChartData = Object.values(dailySales)
            .sort(
                (a, b) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime(),
            )
            .slice(-7); // Last 7 days

        return {
            totalSales,
            totalRevenue,
            totalItems,
            averageOrderValue,
            paymentMethods,
            topProducts,
            dailyChartData,
        };
    }, [filteredSales]);

    const paymentMethodData = Object.entries(summary.paymentMethods).map(
        ([method, value]) => ({
            name: method.charAt(0).toUpperCase() + method.slice(1),
            value: value,
        }),
    );

    const previousPeriodSales = useMemo(() => {
        const now = new Date();
        let startDate: Date;
        let endDate: Date;

        switch (period) {
            case 'today':
                startDate = startOfDay(subDays(now, 1));
                endDate = endOfDay(subDays(now, 1));
                break;
            case 'week':
                startDate = startOfWeek(subWeeks(now, 1));
                endDate = endOfWeek(subWeeks(now, 1));
                break;
            case 'month':
                startDate = startOfMonth(subMonths(now, 1));
                endDate = endOfMonth(subMonths(now, 1));
                break;
            default:
                return { totalSales: 0, totalRevenue: 0 };
        }

        const previousSales = sales.filter((sale) => {
            const saleDate = new Date(sale.created_at);
            return saleDate >= startDate && saleDate <= endDate;
        });

        return {
            totalSales: previousSales.length,
            totalRevenue: previousSales.reduce(
                (sum, sale) => sum + sale.total_amount,
                0,
            ),
        };
    }, [sales, period]);

    const revenueChange =
        previousPeriodSales.totalRevenue > 0
            ? ((summary.totalRevenue - previousPeriodSales.totalRevenue) /
                  previousPeriodSales.totalRevenue) *
              100
            : 0;

    const salesChange =
        previousPeriodSales.totalSales > 0
            ? ((summary.totalSales - previousPeriodSales.totalSales) /
                  previousPeriodSales.totalSales) *
              100
            : 0;

    return (
        <div className="space-y-6">
            {/* Period Selector */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Sales Analytics
                </h3>
                <Select
                    value={period}
                    onValueChange={(value: any) => setPeriod(value)}
                >
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Total Revenue
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {formatAmount(summary.totalRevenue)}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            {revenueChange >= 0 ? (
                                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                            ) : (
                                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                            )}
                            <span
                                className={
                                    revenueChange >= 0
                                        ? 'text-green-500'
                                        : 'text-red-500'
                                }
                            >
                                {Math.abs(revenueChange).toFixed(1)}% from
                                previous
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Total Sales
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {summary.totalSales}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            {salesChange >= 0 ? (
                                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                            ) : (
                                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                            )}
                            <span
                                className={
                                    salesChange >= 0
                                        ? 'text-green-500'
                                        : 'text-red-500'
                                }
                            >
                                {Math.abs(salesChange).toFixed(1)}% from
                                previous
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Average Order Value
                        </CardTitle>
                        <CreditCard className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {formatAmount(summary.averageOrderValue)}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Per transaction
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Total Items Sold
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {summary.totalItems}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Units sold
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Daily Sales Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">
                            Daily Sales Trend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={summary.dailyChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    className="text-xs text-gray-600 dark:text-gray-400"
                                />
                                <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
                                <Tooltip
                                    formatter={(value: number) =>
                                        formatAmount(value)
                                    }
                                    contentStyle={{
                                        backgroundColor:
                                            'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #e5e7eb',
                                    }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#0088FE"
                                    strokeWidth={2}
                                    name="Revenue"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#00C49F"
                                    strokeWidth={2}
                                    name="Sales Count"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Payment Methods Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">
                            Payment Methods
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={paymentMethodData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) =>
                                        `${name} ${(percent * 100).toFixed(0)}%`
                                    }
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {paymentMethodData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) =>
                                        formatAmount(value)
                                    }
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Top Products */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">
                        Top Selling Products
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={summary.topProducts}
                            layout="horizontal"
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={150}
                                className="text-xs text-gray-600 dark:text-gray-400"
                            />
                            <Tooltip
                                formatter={(value: number) =>
                                    formatAmount(value)
                                }
                            />
                            <Legend />
                            <Bar
                                dataKey="revenue"
                                fill="#0088FE"
                                name="Revenue"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
