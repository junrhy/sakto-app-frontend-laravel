import React, { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import {
  Calendar,
  Package,
  Receipt,
  User,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  ShoppingBag,
  AlertCircle,
  FileText,
  CreditCard,
  Download,
  FileSpreadsheet,
  X,
  Filter,
  ChevronDown,
  ChevronUp
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
  const [allOrders, setAllOrders] = useState<ProductOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [exporting, setExporting] = useState(false);
  
  // Filter states
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  
  // Expanded cards state
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

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

  // Get filtered orders for export
  const getFilteredOrdersForExport = () => {
    let filteredOrders = [...allOrders];

    // Apply order status filter
    if (orderStatusFilter !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.order_status === orderStatusFilter);
    }

    // Apply payment status filter
    if (paymentStatusFilter !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.payment_status === paymentStatusFilter);
    }

    return filteredOrders;
  };

  // Export to CSV
  const exportToCSV = async () => {
    setExporting(true);
    try {
      const allOrdersData = getFilteredOrdersForExport();
      console.log('Orders data for CSV export:', allOrdersData);
      
      if (allOrdersData.length === 0) {
        setError('No orders to export');
        return;
      }

      const currencySymbol = appCurrency?.symbol || '$';
      
      // CSV Headers
      const headers = [
        'Order Number',
        'Order Date',
        'Customer Name',
        'Customer Email',
        'Customer Phone',
        'Shipping Address',
        'Billing Address',
        'Order Status',
        'Payment Status',
        'Payment Method',
        'Payment Reference',
        'Product Quantity',
        'Product Price',
        'Product Revenue',
        'Order Subtotal',
        'Tax Amount',
        'Shipping Fee',
        'Discount Amount',
        'Order Total',
        'Paid At',
        'Shipped At',
        'Delivered At',
        'Notes'
      ];

      // Helper function to safely format numbers
      const safeNumberFormat = (value: number | null | undefined): string => {
        if (value === null || value === undefined || isNaN(value)) {
          return `${currencySymbol}0.00`;
        }
        return `${currencySymbol}${Number(value).toFixed(2)}`;
      };

      // Helper function to escape CSV values
      const escapeCSVValue = (value: any): string => {
        if (value === null || value === undefined) {
          return '';
        }
        const stringValue = String(value);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const escaped = stringValue.replace(/"/g, '""');
        if (escaped.includes(',') || escaped.includes('"') || escaped.includes('\n') || escaped.includes('\r')) {
          return `"${escaped}"`;
        }
        return escaped;
      };

      // CSV Data
      const csvData = allOrdersData.map((order: ProductOrder) => {
        try {
          const targetItems = getTargetProductItems(order);
          const targetQuantity = targetItems.reduce((sum, item) => sum + item.quantity, 0);
          const targetRevenue = targetItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
          const targetPrice = targetItems[0]?.price || 0;

          const row = [
            escapeCSVValue(order.order_number),
            escapeCSVValue(formatDate(order.created_at)),
            escapeCSVValue(order.customer_name),
            escapeCSVValue(order.customer_email),
            escapeCSVValue(order.customer_phone || ''),
            escapeCSVValue(order.shipping_address || ''),
            escapeCSVValue(order.billing_address || ''),
            escapeCSVValue(getStatusInfo(order.order_status).label),
            escapeCSVValue(getPaymentStatusInfo(order.payment_status).label),
            escapeCSVValue(order.payment_method || ''),
            escapeCSVValue(order.payment_reference || ''),
            escapeCSVValue(targetQuantity),
            escapeCSVValue(safeNumberFormat(targetPrice)),
            escapeCSVValue(safeNumberFormat(targetRevenue)),
            escapeCSVValue(safeNumberFormat(order.subtotal)),
            escapeCSVValue(safeNumberFormat(order.tax_amount)),
            escapeCSVValue(safeNumberFormat(order.shipping_fee)),
            escapeCSVValue(safeNumberFormat(order.discount_amount)),
            escapeCSVValue(safeNumberFormat(order.total_amount)),
            escapeCSVValue(order.paid_at ? formatDate(order.paid_at) : ''),
            escapeCSVValue(order.shipped_at ? formatDate(order.shipped_at) : ''),
            escapeCSVValue(order.delivered_at ? formatDate(order.delivered_at) : ''),
            escapeCSVValue(order.notes || '')
          ];
          
          console.log('CSV row for order', order.order_number, ':', row);
          return row;
        } catch (rowError) {
          console.error('Error processing order for CSV:', order.order_number, rowError);
          throw rowError;
        }
      });

      // Create CSV content
      const csvContent = [
        headers.join(','),
        ...csvData.map((row: any[]) => row.join(','))
      ].join('\n');

      // Add BOM for proper UTF-8 encoding in Excel
      const BOM = '\uFEFF';
      const csvWithBOM = BOM + csvContent;

      // Download file
      const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `product-orders-${productId}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      const filterText = (orderStatusFilter !== 'all' || paymentStatusFilter !== 'all') ? ' (filtered)' : '';
      setSuccessMessage(`Successfully exported ${allOrdersData.length} orders to CSV${filterText}`);
    } catch (err) {
      console.error('CSV Export Error:', err);
      setError(`Failed to export orders to CSV: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setExporting(false);
    }
  };

  // Export to Excel (XLSX)
  const exportToExcel = async () => {
    setExporting(true);
    try {
      const allOrdersData = getFilteredOrdersForExport();
      if (allOrdersData.length === 0) {
        setError('No orders to export');
        return;
      }

      // Check if xlsx library is available
      try {
        const XLSX = await import('xlsx');
        const currencySymbol = appCurrency?.symbol || '$';
        
        // Prepare data for Excel
        const excelData = allOrdersData.map((order: ProductOrder) => {
          const targetItems = getTargetProductItems(order);
          const targetQuantity = targetItems.reduce((sum, item) => sum + item.quantity, 0);
          const targetRevenue = targetItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
          const targetPrice = targetItems[0]?.price || 0;

          return {
            'Order Number': order.order_number,
            'Order Date': formatDate(order.created_at),
            'Customer Name': order.customer_name,
            'Customer Email': order.customer_email,
            'Customer Phone': order.customer_phone || '',
            'Shipping Address': order.shipping_address || '',
            'Billing Address': order.billing_address || '',
            'Order Status': getStatusInfo(order.order_status).label,
            'Payment Status': getPaymentStatusInfo(order.payment_status).label,
            'Payment Method': order.payment_method || '',
            'Payment Reference': order.payment_reference || '',
            'Product Quantity': targetQuantity,
            'Product Price': targetPrice,
            'Product Revenue': targetRevenue,
            'Order Subtotal': order.subtotal,
            'Tax Amount': order.tax_amount,
            'Shipping Fee': order.shipping_fee,
            'Discount Amount': order.discount_amount,
            'Order Total': order.total_amount,
            'Paid At': order.paid_at ? formatDate(order.paid_at) : '',
            'Shipped At': order.shipped_at ? formatDate(order.shipped_at) : '',
            'Delivered At': order.delivered_at ? formatDate(order.delivered_at) : '',
            'Notes': order.notes || ''
          };
        });

        // Create workbook and worksheet
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

        // Generate and download file
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
                 link.setAttribute('download', `product-orders-${productId}-${new Date().toISOString().split('T')[0]}.xlsx`);
         link.style.visibility = 'hidden';
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         
         const filterText = (orderStatusFilter !== 'all' || paymentStatusFilter !== 'all') ? ' (filtered)' : '';
         setSuccessMessage(`Successfully exported ${allOrdersData.length} orders to Excel${filterText}`);
       } catch (importError) {
         setError('Excel export requires the xlsx package. Please install it: npm install xlsx');
       }
     } catch (err) {
       setError('Failed to export orders to Excel');
     } finally {
       setExporting(false);
     }
  };

  // Fetch all orders
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
        per_page: '1000' // Get all orders for client-side filtering
      });

      const response = await fetch(`/m/${member.identifier || member.id}/products/${productId}/orders?${params}`);
      if (response.ok) {
        const data = await response.json();
        const fetchedOrders = data.data || [];
        setAllOrders(fetchedOrders);
        setTotalOrders(fetchedOrders.length);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      setError('An error occurred while fetching orders');
    } finally {
      setLoading(false);
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [orderStatusFilter, paymentStatusFilter]);

  // Clear all filters
  const clearFilters = () => {
    setOrderStatusFilter('all');
    setPaymentStatusFilter('all');
  };

  // Toggle card expansion
  const toggleCardExpansion = (orderId: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  // Check if card is expanded
  const isCardExpanded = (orderId: number) => expandedCards.has(orderId);

  // Filter and paginate orders on the frontend
  const getFilteredAndPaginatedOrders = () => {
    let filteredOrders = [...allOrders];

    // Apply order status filter
    if (orderStatusFilter !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.order_status === orderStatusFilter);
    }

    // Apply payment status filter
    if (paymentStatusFilter !== 'all') {
      filteredOrders = filteredOrders.filter(order => order.payment_status === paymentStatusFilter);
    }

    // Update total count
    setTotalOrders(filteredOrders.length);

    // Calculate pagination
    const itemsPerPage = 15;
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    setTotalPages(totalPages);

    // Ensure current page is within bounds
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }

    // Get paginated results
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [orderStatusFilter, paymentStatusFilter]);

  // Fetch orders on component mount and when dependencies change
  useEffect(() => {
    fetchOrders();
  }, [contactId, member.identifier, member.id, productId]);

  // Update filtered orders when filters or page changes
  useEffect(() => {
    if (allOrders.length > 0) {
      const filteredOrders = getFilteredAndPaginatedOrders();
      setOrders(filteredOrders);
    }
  }, [allOrders, orderStatusFilter, paymentStatusFilter, currentPage]);

  // Auto-dismiss success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000); // Auto-dismiss after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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
      {/* Success Message */}
      {successMessage && (
        <div className="relative p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 rounded-lg">
          <p className="text-sm pr-8">{successMessage}</p>
          <button
            onClick={() => setSuccessMessage(null)}
            className="absolute top-2 right-2 text-green-400 hover:text-green-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="relative p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
          <p className="text-sm pr-8">{error}</p>
          <button
            onClick={() => setError(null)}
            className="absolute top-2 right-2 text-destructive hover:text-destructive/80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Simple Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <span className="font-medium">Orders ({totalOrders})</span>
          {(orderStatusFilter !== 'all' || paymentStatusFilter !== 'all') && (
            <Badge variant="secondary" className="text-xs">
              Filtered
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {totalOrders > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                disabled={exporting}
                title="Export to CSV"
              >
                {exporting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span className="ml-2">CSV</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToExcel}
                disabled={exporting}
                title="Export to Excel"
              >
                {exporting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                ) : (
                  <FileSpreadsheet className="w-4 h-4" />
                )}
                <span className="ml-2">Excel</span>
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-muted/30 rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Filters</span>
          </div>
          {(orderStatusFilter !== 'all' || paymentStatusFilter !== 'all') && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">Active:</span>
              {orderStatusFilter !== 'all' && (
                <Badge variant="outline" className="text-xs">
                  Order: {getStatusInfo(orderStatusFilter).label}
                </Badge>
              )}
              {paymentStatusFilter !== 'all' && (
                <Badge variant="outline" className="text-xs">
                  Payment: {getPaymentStatusInfo(paymentStatusFilter).label}
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Order Status</label>
            <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All order statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Order Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Payment Status</label>
            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All payment statuses" />
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
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
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
            const isExpanded = isCardExpanded(order.id);

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
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(order.created_at)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCardExpansion(order.id)}
                        className="h-8 w-8 p-0"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <CardContent className="p-0">
                  {/* Condensed View (Always Visible) */}
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Customer Info */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">{order.customer_name}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{order.customer_email}</span>
                        </div>
                      </div>
                      
                      {/* Product Summary */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">Product: {targetQuantity} × {formatPrice(targetItems[0]?.price || 0)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Revenue: <span className="font-semibold text-primary">{formatPrice(targetRevenue)}</span>
                        </div>
                      </div>
                      
                      {/* Order Total */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Receipt className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">Total: {formatPrice(order.total_amount)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Items: {order.order_items.length}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded View (Conditional) */}
                  {isExpanded && (
                    <>
                      <Separator />
                      
                      {/* Detailed Customer Information */}
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

                      {/* Detailed Product Information */}
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

                      {/* Detailed Order Summary */}
                      <div className="p-4 bg-muted/10">
                        <div className="flex items-center space-x-2 mb-3">
                          <Receipt className="w-4 h-4 text-primary" />
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