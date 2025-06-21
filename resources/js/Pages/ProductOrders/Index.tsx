import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { 
    Eye, 
    Edit, 
    Trash2, 
    SearchIcon, 
    Filter,
    Plus,
    BarChart3,
    Package,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    Archive
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    order_items: Array<{
        product_id: number;
        variant_id?: number;
        attributes?: Record<string, string>;
        name: string;
        quantity: number;
        price: number;
    }>;
    subtotal: number;
    tax_amount: number;
    shipping_fee: number;
    discount_amount: number;
    total_amount: number;
    order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
    payment_method?: 'cash' | 'card' | 'bank_transfer' | 'digital_wallet' | 'cod';
    created_at: string;
    updated_at: string;
}

interface Props extends PageProps {
    orders: {
        data: Order[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    currency: {
        symbol: string;
        code: string;
    };
    errors?: {
        [key: string]: string;
    };
}

export default function Index({ auth, orders, currency, errors }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
    const [selectedOrders, setSelectedOrders] = useState<number[]>([]);

    // Ensure orders has proper structure with defaults
    const safeOrders = useMemo(() => {
        if (!orders || typeof orders !== 'object') {
            return {
                data: [],
                current_page: 1,
                last_page: 1,
                per_page: 15,
                total: 0
            };
        }
        return {
            data: orders.data || [],
            current_page: orders.current_page || 1,
            last_page: orders.last_page || 1,
            per_page: orders.per_page || 15,
            total: orders.total || 0
        };
    }, [orders]);

    const filteredOrders = useMemo(() => {
        return safeOrders.data.filter((order) => {
            const matchesSearch = 
                order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
            const matchesPaymentStatus = paymentStatusFilter === 'all' || order.payment_status === paymentStatusFilter;
            
            return matchesSearch && matchesStatus && matchesPaymentStatus;
        });
    }, [safeOrders.data, searchTerm, statusFilter, paymentStatusFilter]);

    const toggleSelect = (orderId: number) => {
        setSelectedOrders(prev => 
            prev.includes(orderId) 
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedOrders.length === filteredOrders.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(filteredOrders.map(order => order.id));
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
            processing: { color: 'bg-purple-100 text-purple-800', icon: Package },
            shipped: { color: 'bg-indigo-100 text-indigo-800', icon: Truck },
            delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle },
            refunded: { color: 'bg-gray-100 text-gray-800', icon: Archive },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge className={config.color}>
                <Icon className="w-3 h-3 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getPaymentStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
            paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            failed: { color: 'bg-red-100 text-red-800', icon: XCircle },
            refunded: { color: 'bg-gray-100 text-gray-800', icon: Archive },
            partially_refunded: { color: 'bg-orange-100 text-orange-800', icon: Archive },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge className={config.color}>
                <Icon className="w-3 h-3 mr-1" />
                {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
            </Badge>
        );
    };

    const handleDelete = (orderId: number) => {
        if (confirm('Are you sure you want to delete this order?')) {
            router.delete(route('product-orders.destroy', orderId));
        }
    };

    const handleBulkDelete = () => {
        if (selectedOrders.length === 0) {
            alert('Please select orders to delete');
            return;
        }

        if (confirm(`Are you sure you want to delete ${selectedOrders.length} orders?`)) {
            selectedOrders.forEach(orderId => {
                router.delete(route('product-orders.destroy', orderId));
            });
            setSelectedOrders([]);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Product Orders</h2>}
        >
            <Head title="Product Orders" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Error Messages */}
                    {errors && Object.keys(errors).length > 0 && (
                        <div className="mb-6">
                            {Object.entries(errors).map(([key, message]) => (
                                <div key={key} className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-2">
                                    {message}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Product Orders</h1>
                            <p className="text-gray-600">Manage your product orders and track their status</p>
                        </div>
                        <div className="flex space-x-2">
                            <Link href={route('product-orders.statistics')}>
                                <Button variant="outline">
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Statistics
                                </Button>
                            </Link>
                            <Link href={route('products.index')}>
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    View Products
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Filter className="w-4 h-4 mr-2" />
                                Filters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="relative">
                                    <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search orders..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Order Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="shipped">Shipped</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                        <SelectItem value="refunded">Refunded</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Payment Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Payment Statuses</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="paid">Paid</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                        <SelectItem value="refunded">Refunded</SelectItem>
                                        <SelectItem value="partially_refunded">Partially Refunded</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                        setPaymentStatusFilter('all');
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Orders Table */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Orders ({filteredOrders.length})</CardTitle>
                                {selectedOrders.length > 0 && (
                                    <Button variant="destructive" onClick={handleBulkDelete}>
                                        Delete Selected ({selectedOrders.length})
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                                                onChange={toggleSelectAll}
                                                className="rounded"
                                            />
                                        </TableHead>
                                        <TableHead>Order #</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Order Status</TableHead>
                                        <TableHead>Payment Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOrders.includes(order.id)}
                                                    onChange={() => toggleSelect(order.id)}
                                                    className="rounded"
                                                />
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <Link 
                                                    href={route('product-orders.show', order.id)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    {order.order_number}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{order.customer_name}</div>
                                                    <div className="text-sm text-gray-500">{order.customer_email}</div>
                                                    {order.customer_phone && (
                                                        <div className="text-sm text-gray-500">{order.customer_phone}</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {order.order_items.map(item => {
                                                        let displayName = item.name;
                                                        if (item.variant_id && item.attributes) {
                                                            const variantDetails = Object.entries(item.attributes)
                                                                .map(([key, value]) => `${key}: ${value}`)
                                                                .join(', ');
                                                            displayName += ` (${variantDetails})`;
                                                        }
                                                        return displayName;
                                                    }).join(', ')}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {formatCurrency(order.total_amount, currency.symbol)}
                                                </div>
                                                {order.discount_amount > 0 && (
                                                    <div className="text-xs text-green-600">
                                                        -{formatCurrency(order.discount_amount, currency.symbol)} discount
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(order.order_status)}
                                            </TableCell>
                                            <TableCell>
                                                {getPaymentStatusBadge(order.payment_status)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">
                                                    {format(new Date(order.created_at), 'MMM dd, yyyy')}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {format(new Date(order.created_at), 'HH:mm')}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <span className="h-4 w-4">⋮</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('product-orders.show', order.id)}>
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('product-orders.edit', order.id)}>
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                Edit Order
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => handleDelete(order.id)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete Order
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {filteredOrders.length === 0 && (
                                <div className="text-center py-8">
                                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                                    <p className="text-gray-500">
                                        {searchTerm || statusFilter || paymentStatusFilter 
                                            ? 'Try adjusting your filters to see more results.'
                                            : 'Get started by creating your first product order.'
                                        }
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Pagination */}
                    {safeOrders.last_page > 1 && (
                        <div className="flex justify-center mt-6">
                            <div className="flex space-x-2">
                                {Array.from({ length: safeOrders.last_page }, (_, i) => i + 1).map((page) => (
                                    <Button
                                        key={page}
                                        variant={page === safeOrders.current_page ? "default" : "outline"}
                                        onClick={() => router.get(route('product-orders.index'), { page })}
                                    >
                                        {page}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 