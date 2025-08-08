import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { 
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Package,
    Users,
    ShoppingCart,
    BarChart3,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

interface Statistics {
    total_orders: number;
    total_revenue: number;
    average_order_value: number;
    orders_by_status: {
        pending: number;
        confirmed: number;
        processing: number;
        shipped: number;
        delivered: number;
        cancelled: number;
        refunded: number;
    };
    orders_by_payment_status: {
        pending: number;
        paid: number;
        failed: number;
        refunded: number;
        partially_refunded: number;
    };
    revenue_by_month: Array<{
        month: string;
        revenue: number;
        subtotal: number;
        service_fee: number;
        tax_amount: number;
        shipping_fee: number;
        discount_amount: number;
        orders: number;
    }>;
    top_products: Array<{
        product_id: number;
        name: string;
        quantity_sold: number;
        revenue: number;
    }>;
    recent_orders: Array<{
        id: number;
        order_number: string;
        customer_name: string;
        total_amount: number;
        order_status: string;
        created_at: string;
    }>;
}

interface Props extends PageProps {
    statistics: Statistics;
    currency: {
        symbol: string;
        code: string;
    };
    errors?: {
        [key: string]: string;
    };
}

export default function Statistics({ auth, statistics, currency, errors }: Props) {
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 12;
    const maxRecords = 60;

    // Pagination logic for revenue by month
    const paginatedRevenueData = useMemo(() => {
        const limitedData = statistics.revenue_by_month.slice(0, maxRecords);
        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        return limitedData.slice(startIndex, endIndex);
    }, [statistics.revenue_by_month, currentPage]);

    const totalPages = useMemo(() => {
        const limitedData = statistics.revenue_by_month.slice(0, maxRecords);
        return Math.ceil(limitedData.length / recordsPerPage);
    }, [statistics.revenue_by_month]);

    const getStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700/50',
            confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-700/50',
            processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-700/50',
            shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700/50',
            delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700/50',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700/50',
            refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300 border-gray-200 dark:border-gray-600/50',
        };
        return colors[status as keyof typeof colors] || colors.pending;
    };

    const getPaymentStatusColor = (status: string) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700/50',
            paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700/50',
            failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700/50',
            refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300 border-gray-200 dark:border-gray-600/50',
            partially_refunded: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-700/50',
        };
        return colors[status as keyof typeof colors] || colors.pending;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Order Statistics</h2>}
        >
            <Head title="Order Statistics" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Error Messages */}
                    {errors && Object.keys(errors).length > 0 && (
                        <div className="mb-6">
                            {Object.entries(errors).map(([key, message]) => (
                                <div key={key} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-2">
                                    {message}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Order Statistics</h1>
                            <p className="text-gray-600 dark:text-gray-400">Comprehensive overview of your order performance</p>
                        </div>
                        <Link href={route('product-orders.index')}>
                            <Button variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Orders
                            </Button>
                        </Link>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{statistics.total_orders}</div>
                                <p className="text-xs text-muted-foreground">
                                    All time orders
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(statistics.total_revenue, currency.symbol)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    All time revenue
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {formatCurrency(statistics.average_order_value, currency.symbol)}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Per order average
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {statistics.total_orders > 0 ? 
                                        Math.round((statistics.orders_by_status.delivered / statistics.total_orders) * 100) : 0}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Orders delivered
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Status Breakdown */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Orders by Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {Object.entries(statistics.orders_by_status).map(([status, count]) => (
                                        <div key={status} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Badge className={getStatusColor(status)}>
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </Badge>
                                            </div>
                                            <div className="text-sm font-medium">{count}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Orders by Payment Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {Object.entries(statistics.orders_by_payment_status).map(([status, count]) => (
                                        <div key={status} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <Badge className={getPaymentStatusColor(status)}>
                                                    {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                                                </Badge>
                                            </div>
                                            <div className="text-sm font-medium">{count}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Revenue by Month */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Revenue by Month</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                            <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Month</th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Orders</th>
                                            <th className="text-right py-3 px-4 font-medium text-blue-600 dark:text-blue-400">Subtotal</th>
                                            <th className="text-right py-3 px-4 font-medium text-purple-600 dark:text-purple-400">Service Fee</th>
                                            <th className="text-right py-3 px-4 font-medium text-orange-600 dark:text-orange-400">Tax</th>
                                            <th className="text-right py-3 px-4 font-medium text-indigo-600 dark:text-indigo-400">Shipping</th>
                                            <th className="text-right py-3 px-4 font-medium text-red-600 dark:text-red-400">Discount</th>
                                            <th className="text-right py-3 px-4 font-medium text-green-600 dark:text-green-400">Total Revenue</th>
                                            <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Avg Order</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedRevenueData.map((monthData, index) => (
                                            <tr key={index} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                                                        <span className={`font-medium ${monthData.month.includes(new Date().getFullYear().toString()) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                                                            {monthData.month}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="text-right py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">{monthData.orders > 0 ? monthData.orders : '-'}</td>
                                                <td className="text-right py-3 px-4 text-blue-600 dark:text-blue-400 font-medium">{monthData.subtotal > 0 ? formatCurrency(monthData.subtotal, currency.symbol) : '-'}</td>
                                                <td className="text-right py-3 px-4 text-purple-600 dark:text-purple-400 font-medium">{monthData.service_fee > 0 ? formatCurrency(monthData.service_fee, currency.symbol) : '-'}</td>
                                                <td className="text-right py-3 px-4 text-orange-600 dark:text-orange-400 font-medium">{monthData.tax_amount > 0 ? formatCurrency(monthData.tax_amount, currency.symbol) : '-'}</td>
                                                <td className="text-right py-3 px-4 text-indigo-600 dark:text-indigo-400 font-medium">{monthData.shipping_fee > 0 ? formatCurrency(monthData.shipping_fee, currency.symbol) : '-'}</td>
                                                <td className="text-right py-3 px-4 text-red-600 dark:text-red-400 font-medium">{monthData.discount_amount > 0 ? formatCurrency(monthData.discount_amount, currency.symbol) : '-'}</td>
                                                <td className="text-right py-3 px-4 font-bold text-green-600 dark:text-green-400">{monthData.revenue > 0 ? formatCurrency(monthData.revenue, currency.symbol) : '-'}</td>
                                                <td className="text-right py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {monthData.revenue > 0 ? 
                                                        formatCurrency(monthData.revenue / monthData.orders, currency.symbol) : 
                                                        '-'
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Showing {((currentPage - 1) * recordsPerPage) + 1} to {Math.min(currentPage * recordsPerPage, Math.min(statistics.revenue_by_month.length, maxRecords))} of {Math.min(statistics.revenue_by_month.length, maxRecords)} months
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            Previous
                                        </Button>
                                        <div className="flex items-center space-x-1">
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }
                                                
                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        variant={currentPage === pageNum ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className="w-8 h-8 p-0"
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Top Products */}
                    <Card className="mb-8">
                        <CardHeader>
                            <CardTitle>Top Selling Products</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {statistics.top_products.map((product, index) => (
                                    <div key={product.product_id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">#{index + 1}</span>
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-gray-100">{product.name}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{product.quantity_sold} units sold</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium text-gray-900 dark:text-gray-100">
                                                {formatCurrency(product.revenue, currency.symbol)}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {product.revenue > 0 && product.quantity_sold > 0 ? 
                                                    formatCurrency(product.revenue / product.quantity_sold, currency.symbol) + ' avg' : 
                                                    'N/A'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Orders */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {statistics.recent_orders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                                <Package className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-gray-100">{order.order_number}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{order.customer_name}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <Badge className={`${getStatusColor(order.order_status)} border`}>
                                                {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                                            </Badge>
                                            <div className="text-right">
                                                <div className="font-medium text-gray-900 dark:text-gray-100">
                                                    {formatCurrency(order.total_amount, currency.symbol)}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {format(new Date(order.created_at), 'MMM dd, yyyy')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 