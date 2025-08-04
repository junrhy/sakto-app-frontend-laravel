import React, { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import {
  Calendar,
  Package,
  DollarSign,
  User,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  ShoppingBag,
  AlertCircle,
  FileText,
  CreditCard
} from 'lucide-react';

interface OrderItem {
  product_id: number;
  variant_id?: number;
  attributes?: any;
  name: string;
  quantity: number;
  price: number;
  is_target_product: boolean;
}

interface ProductOrder {
  id: number;
  order_number: string;
  client_identifier: string;
  contact_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  billing_address: string;
  order_items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  shipping_fee: number;
  discount_amount: number;
  total_amount: number;
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  payment_method: string;
  payment_reference: string;
  notes: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ProductOrdersProps {
  member: {
    id: number;
    identifier?: string;
  };
  appCurrency?: { code: string; symbol: string } | null;
  contactId?: number;
  productId: number;
}

export default function ProductOrders({ member, appCurrency, contactId, productId }: ProductOrdersProps) {
  const [orders, setOrders] = useState<ProductOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Format price with currency
  const formatPrice = (price: number | string | null | undefined): string => {
    if (price === null || price === undefined) {
      const symbol = appCurrency?.symbol || '$';
      return `${symbol}0.00`;
    }
    const numericPrice = typeof price === 'string' ? parseFloat(price) || 0 : price;
    const symbol = appCurrency?.symbol || '$';
    return `${symbol}${numericPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Get status color and label
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
          label: 'Pending',
          icon: '⏳'
        };
      case 'confirmed':
        return {
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          label: 'Confirmed',
          icon: '✅'
        };
      case 'processing':
        return {
          color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          label: 'Processing',
          icon: '⚙️'
        };
      case 'shipped':
        return {
          color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
          label: 'Shipped',
          icon: '📦'
        };
      case 'delivered':
        return {
          color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
          label: 'Delivered',
          icon: '🎉'
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
          label: 'Cancelled',
          icon: '❌'
        };
      case 'refunded':
        return {
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
          label: 'Refunded',
          icon: '💰'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
          label: status,
          icon: '❓'
        };
    }
  };

  // Get payment status color and label
  const getPaymentStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
          label: 'Pending',
          icon: '💳'
        };
      case 'paid':
        return {
          color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
          label: 'Paid',
          icon: '✅'
        };
      case 'failed':
        return {
          color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
          label: 'Failed',
          icon: '❌'
        };
      case 'refunded':
        return {
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
          label: 'Refunded',
          icon: '💰'
        };
      case 'partially_refunded':
        return {
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
          label: 'Partial Refund',
          icon: '💰'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700',
          label: status,
          icon: '❓'
        };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get target product items from order
  const getTargetProductItems = (order: ProductOrder) => {
    return order.order_items.filter(item => item.is_target_product);
  };

  // Fetch orders
  const fetchOrders = async () => {
    if (!contactId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        client_identifier: member.identifier || member.id.toString(),
        contact_id: contactId.toString(),
        page: currentPage.toString(),
        per_page: '15'
      });

      const response = await fetch(`/m/${member.identifier || member.id}/products/${productId}/orders?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
        setTotalPages(data.last_page || 1);
        setTotalOrders(data.total || 0);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      setError('An error occurred while fetching orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders on component mount and when dependencies change
  useEffect(() => {
    fetchOrders();
  }, [contactId, member.identifier, member.id, productId, currentPage]);

  if (!contactId) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">Please log in to view orders</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground mt-2">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-destructive py-8">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">{error}</p>
        <Button onClick={fetchOrders} className="mt-2" size="sm">
          <RefreshCw className="w-4 h-4 mr-1" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Simple Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <span className="font-medium">Orders ({totalOrders})</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          <Package className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const targetItems = getTargetProductItems(order);
            const targetQuantity = targetItems.reduce((sum, item) => sum + item.quantity, 0);
            const targetRevenue = targetItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);

            return (
              <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-muted/30 to-transparent p-4 border-b">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-lg">#{order.order_number}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusInfo(order.order_status).color} variant="outline">
                          Order: {getStatusInfo(order.order_status).label}
                        </Badge>
                        <Badge className={getPaymentStatusInfo(order.payment_status).color} variant="outline">
                          Payment: {getPaymentStatusInfo(order.payment_status).label}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(order.created_at)}
                    </div>
                  </div>
                </div>

                <CardContent className="p-0">
                  {/* Customer Information */}
                  <div className="p-4 bg-muted/20">
                    <div className="flex items-center space-x-2 mb-3">
                      <User className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">Customer Information</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{order.customer_name}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span>{order.customer_email}</span>
                        </div>
                        {order.customer_phone && (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            <span>{order.customer_phone}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        {order.shipping_address && (
                          <div className="flex items-start space-x-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <span className="font-medium">Shipping:</span>
                              <p className="text-muted-foreground">{order.shipping_address}</p>
                            </div>
                          </div>
                        )}
                        {order.billing_address && (
                          <div className="flex items-start space-x-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <span className="font-medium">Billing:</span>
                              <p className="text-muted-foreground">{order.billing_address}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Product Details */}
                  <div className="p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <Package className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">This Product in Order</span>
                    </div>
                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">Product Details</p>
                            <p className="text-sm text-muted-foreground">
                              Quantity: {targetQuantity} | Price: {formatPrice(targetItems[0]?.price || 0)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Revenue</p>
                          <p className="font-semibold text-lg text-primary">{formatPrice(targetRevenue)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Order Summary */}
                  <div className="p-4 bg-muted/10">
                    <div className="flex items-center space-x-2 mb-3">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">Order Summary</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">This product items:</span>
                          <span className="font-medium">{targetQuantity}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total order items:</span>
                          <span className="font-medium">{order.order_items.length}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Product revenue:</span>
                          <span className="font-semibold text-primary">{formatPrice(targetRevenue)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Order total:</span>
                          <span className="font-semibold">{formatPrice(order.total_amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  {order.payment_method && (
                    <>
                      <Separator />
                      <div className="p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <CreditCard className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">Payment Information</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Method:</span>
                            <span className="font-medium">{order.payment_method}</span>
                          </div>
                          {order.payment_reference && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Reference:</span>
                              <span className="font-medium">{order.payment_reference}</span>
                            </div>
                          )}
                          {order.paid_at && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Paid:</span>
                              <span className="font-medium">{formatDate(order.paid_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Notes */}
                  {order.notes && (
                    <>
                      <Separator />
                      <div className="p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">Notes</span>
                        </div>
                        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                          {order.notes}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Simple Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
} 