import { useState, useEffect } from 'react';

interface OrderItem {
  product_id: number;
  variant_id: number | null;
  attributes: Record<string, string> | null;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  contact_id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: string;
  billing_address: string;
  order_items: OrderItem[];
  subtotal: string;
  tax_amount: string;
  shipping_fee: string;
  discount_amount: string;
  total_amount: string;
  order_status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  payment_method: string;
  payment_reference: string | null;
  notes: string | null;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ProductOrderHistoryProps {
  contactId: number;
  appCurrency?: { code: string; symbol: string } | null;
  member: {
    id: number;
    identifier?: string;
  };
  orderHistory: any[];
}

export default function ProductOrderHistory({ contactId, appCurrency, member, orderHistory }: ProductOrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Filter orders by contact_id when component mounts or contactId changes
  useEffect(() => {
    if (contactId && orderHistory && Array.isArray(orderHistory)) {
      const filteredOrders = orderHistory.filter((order: any) => 
        order && order.contact_id === contactId
      );
      setOrders(filteredOrders);
    } else {
      setOrders([]);
    }
  }, [contactId, orderHistory]);

  const formatPrice = (price: number | string | null | undefined): string => {
    const symbol = appCurrency?.symbol || '$';
    
    // Handle null, undefined, or empty values
    if (price === null || price === undefined || price === '') {
      return `${symbol}0.00`;
    }
    
    // Convert to number and handle NaN
    const numericPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
    
    if (isNaN(numericPrice)) {
      return `${symbol}0.00`;
    }
    
    return `${symbol}${numericPrice.toFixed(2)}`;
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status: string): string => {
    if (!status) return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200';
      case 'processing':
        return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200';
      case 'shipped':
        return 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200';
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200';
      case 'refunded':
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  const getStatusLabel = (status: string): string => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const closeOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 p-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Order History</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading orders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 p-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Order History</h2>
        <div className="text-center text-red-600 dark:text-red-400 py-12">
          <svg className="w-12 h-12 mx-auto text-red-300 dark:text-red-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-lg font-medium">Error loading orders</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 p-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Order History</h2>
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="text-lg font-medium">No orders found</p>
          <p className="text-sm">You haven't placed any orders yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/50 p-8">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Order History</h2>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            onClick={() => handleOrderClick(order)}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm dark:hover:shadow-gray-900/50 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">#{order.order_number || 'N/A'}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.order_status)}`}>
                  {getStatusLabel(order.order_status)}
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{formatPrice(order.total_amount || 0)}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.created_at || '')}</div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div>
                <span className="font-medium">{order.order_items?.length || 0}</span> item{(order.order_items?.length || 0) !== 1 ? 's' : ''}
              </div>
              <div className="flex items-center space-x-4">
                <span>Payment: {order.payment_method || 'N/A'}</span>
                <span>Shipping: {formatPrice(order.shipping_fee || 0)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Order #{selectedOrder.order_number}
                </h3>
                <button
                  onClick={closeOrderDetails}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                  <div className="flex items-center mt-1">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedOrder.order_status)}`}>
                      {getStatusLabel(selectedOrder.order_status)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Order Date</span>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(selectedOrder.created_at || '')}</div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Shipping Address</h4>
                <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div>{selectedOrder.shipping_address || 'N/A'}</div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item: any, index: number) => (
                    <div key={`${item.product_id}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{item.name || 'N/A'}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Qty: {item.quantity || 0} × {formatPrice(item.price || 0)}
                        </div>
                        {item.attributes && Object.keys(item.attributes).length > 0 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {Object.entries(item.attributes).map(([key, value]) => (
                              <span key={key} className="mr-2">
                                {key}: {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{formatPrice((item.price || 0) * (item.quantity || 0))}</div>
                      </div>
                    </div>
                  )) || <div className="text-gray-500 dark:text-gray-400 text-sm">No items found</div>}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-gray-100">{formatPrice(selectedOrder.subtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="text-gray-900 dark:text-gray-100">{formatPrice(selectedOrder.shipping_fee || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tax</span>
                    <span className="text-gray-900 dark:text-gray-100">{formatPrice(selectedOrder.tax_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold border-t border-gray-200 dark:border-gray-700 pt-2">
                    <span>Total</span>
                    <span>{formatPrice(selectedOrder.total_amount || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 