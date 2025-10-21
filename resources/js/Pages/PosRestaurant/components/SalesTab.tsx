import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    Receipt,
    Search,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Sale } from '../types';

interface SalesTabProps {
    sales: Sale[];
    currency_symbol: string;
}

export const SalesTab: React.FC<SalesTabProps> = ({
    sales,
    currency_symbol,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState<
        'all' | 'today' | 'week' | 'month'
    >('all');
    const [paymentMethodFilter, setPaymentMethodFilter] =
        useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Parse items JSON string to count items
    const parseItems = (itemsString: string): number => {
        try {
            const items = JSON.parse(itemsString);
            return Array.isArray(items)
                ? items.reduce((sum, item) => sum + (item.quantity || 0), 0)
                : 0;
        } catch (error) {
            return 0;
        }
    };

    // Filter sales based on search term, date, and payment method
    const filteredSales = useMemo(() => {
        const filtered = sales.filter((sale) => {
            // Search filter
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                !searchTerm ||
                sale.table_number.toLowerCase().includes(searchLower) ||
                sale.id.toString().includes(searchLower) ||
                (sale.payment_method &&
                    sale.payment_method.toLowerCase().includes(searchLower));

            // Date filter
            const saleDate = new Date(sale.created_at);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let matchesDate = true;
            if (dateFilter === 'today') {
                const saleDateOnly = new Date(saleDate);
                saleDateOnly.setHours(0, 0, 0, 0);
                matchesDate = saleDateOnly.getTime() === today.getTime();
            } else if (dateFilter === 'week') {
                const weekAgo = new Date(today);
                weekAgo.setDate(weekAgo.getDate() - 7);
                matchesDate = saleDate >= weekAgo;
            } else if (dateFilter === 'month') {
                const monthAgo = new Date(today);
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                matchesDate = saleDate >= monthAgo;
            }

            // Payment method filter
            const matchesPaymentMethod =
                paymentMethodFilter === 'all' ||
                sale.payment_method === paymentMethodFilter;

            return matchesSearch && matchesDate && matchesPaymentMethod;
        });

        // Reset to first page when filters change
        setCurrentPage(1);

        return filtered;
    }, [sales, searchTerm, dateFilter, paymentMethodFilter]);

    // Pagination calculations
    const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSales = filteredSales.slice(startIndex, endIndex);

    // Handle page changes
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };

    // Calculate totals
    const totals = useMemo(() => {
        return filteredSales.reduce(
            (acc, sale) => ({
                count: acc.count + 1,
                subtotal: acc.subtotal + parseFloat(sale.subtotal.toString()),
                discount:
                    acc.discount + parseFloat(sale.discount?.toString() || '0'),
                total: acc.total + parseFloat(sale.total.toString()),
            }),
            { count: 0, subtotal: 0, discount: 0, total: 0 },
        );
    }, [filteredSales]);

    // Format currency
    const formatCurrency = (amount: number) => {
        return `${currency_symbol}${amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Total Sales
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {totals.count}
                                </p>
                            </div>
                            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                                <Receipt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Subtotal
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(totals.subtotal)}
                                </p>
                            </div>
                            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Discounts
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(totals.discount)}
                                </p>
                            </div>
                            <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900">
                                <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    Net Total
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(totals.total)}
                                </p>
                            </div>
                            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
                                <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search by table or sale ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select
                            value={dateFilter}
                            onValueChange={(value) =>
                                setDateFilter(
                                    value as 'all' | 'today' | 'week' | 'month',
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by date" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">
                                    Last 7 Days
                                </SelectItem>
                                <SelectItem value="month">
                                    Last 30 Days
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={paymentMethodFilter}
                            onValueChange={setPaymentMethodFilter}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by payment method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Methods</SelectItem>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="card">Card</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={itemsPerPage.toString()}
                            onValueChange={handleItemsPerPageChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Items per page" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10 per page</SelectItem>
                                <SelectItem value="25">25 per page</SelectItem>
                                <SelectItem value="50">50 per page</SelectItem>
                                <SelectItem value="100">
                                    100 per page
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Sales Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-700">
                                <TableHead className="text-gray-900 dark:text-white">
                                    Sale ID
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Table
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Items
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Subtotal
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Discount
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Total
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Payment
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Change
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Date & Time
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedSales.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={9}
                                        className="text-center text-gray-500 dark:text-gray-400"
                                    >
                                        No sales found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedSales.map((sale) => (
                                    <TableRow
                                        key={sale.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        <TableCell className="font-medium text-gray-900 dark:text-white">
                                            #{sale.id}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {sale.table_number}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {parseItems(sale.items)} items
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {formatCurrency(
                                                parseFloat(
                                                    sale.subtotal.toString(),
                                                ),
                                            )}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {sale.discount
                                                ? `${formatCurrency(parseFloat(sale.discount.toString()))} ${
                                                      sale.discount_type ===
                                                      'percentage'
                                                          ? '%'
                                                          : ''
                                                  }`
                                                : '-'}
                                        </TableCell>
                                        <TableCell className="font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(
                                                parseFloat(
                                                    sale.total.toString(),
                                                ),
                                            )}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    sale.payment_method ===
                                                    'cash'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                }`}
                                            >
                                                {sale.payment_method
                                                    ? sale.payment_method
                                                          .charAt(0)
                                                          .toUpperCase() +
                                                      sale.payment_method.slice(
                                                          1,
                                                      )
                                                    : '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {sale.change_amount > 0
                                                ? formatCurrency(
                                                      parseFloat(
                                                          sale.change_amount.toString(),
                                                      ),
                                                  )
                                                : '-'}
                                        </TableCell>
                                        <TableCell className="text-gray-900 dark:text-white">
                                            {formatDate(sale.created_at)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination Controls */}
            {filteredSales.length > 0 && totalPages > 1 && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                Showing {startIndex + 1} to{' '}
                                {Math.min(endIndex, filteredSales.length)} of{' '}
                                {filteredSales.length} sales
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handlePageChange(currentPage - 1)
                                    }
                                    disabled={currentPage === 1}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                <div className="flex items-center gap-1">
                                    {Array.from(
                                        { length: totalPages },
                                        (_, i) => i + 1,
                                    ).map((page) => {
                                        // Show first page, last page, current page, and pages around current
                                        if (
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 1 &&
                                                page <= currentPage + 1)
                                        ) {
                                            return (
                                                <Button
                                                    key={page}
                                                    variant={
                                                        currentPage === page
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                    size="sm"
                                                    onClick={() =>
                                                        handlePageChange(page)
                                                    }
                                                    className="h-8 w-8 p-0"
                                                >
                                                    {page}
                                                </Button>
                                            );
                                        } else if (
                                            page === currentPage - 2 ||
                                            page === currentPage + 2
                                        ) {
                                            return (
                                                <span
                                                    key={page}
                                                    className="px-2 text-gray-400"
                                                >
                                                    ...
                                                </span>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handlePageChange(currentPage + 1)
                                    }
                                    disabled={currentPage === totalPages}
                                    className="h-8 w-8 p-0"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Summary Footer */}
            {filteredSales.length > 0 && (
                <Card className="border-2 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Total Sales
                                </p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {totals.count}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Subtotal
                                </p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(totals.subtotal)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Total Discounts
                                </p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(totals.discount)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Net Total
                                </p>
                                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                    {formatCurrency(totals.total)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
