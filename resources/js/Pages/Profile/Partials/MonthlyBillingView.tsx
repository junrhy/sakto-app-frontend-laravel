import { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { CreditCard, Receipt, ChevronDown, ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { toast } from 'sonner';

interface BillingItem {
    id: number | string;
    invoice_number: string;
    type: string;
    total_amount: number;
    status: string;
    payment_method: string;
    created_at: string;
    paid_at: string | null;
    due_date?: string;
    billing_cycle?: string;
    plan_name?: string;
    app_name?: string;
    subscription_id?: number;
    subscription_identifier?: string;
    user_app_id?: number;
    items: Array<{
        description: string;
        quantity: number;
        unit_price: number;
        total_price: number;
    }>;
}

export default function MonthlyBillingView() {
    const [billingHistory, setBillingHistory] = useState<BillingItem[]>([]);
    const [upcomingInvoices, setUpcomingInvoices] = useState<BillingItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchBillingHistory();
    }, []);

    const toggleMonthExpansion = (monthKey: string) => {
        setExpandedMonths(prev => {
            const newSet = new Set(prev);
            if (newSet.has(monthKey)) {
                newSet.delete(monthKey);
            } else {
                newSet.add(monthKey);
            }
            return newSet;
        });
    };

    const fetchBillingHistory = async () => {
        try {
            const response = await fetch('/api/apps/billing-history');
            if (response.ok) {
                const data = await response.json();
                setBillingHistory(data.billing_history || []);
                setUpcomingInvoices(data.upcoming_invoices || []);
            }
        } catch (error) {
            console.error('Failed to fetch billing history:', error);
            toast.error('Failed to load billing history');
        } finally {
            setIsLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const downloadInvoicePDF = async (invoiceId: number) => {
        try {
            const response = await fetch(`/api/apps/invoice/${invoiceId}/pdf`, {
                method: 'GET',
                credentials: 'same-origin',
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice_${invoiceId}.pdf`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success('Invoice PDF downloaded successfully');
        } catch (error) {
            console.error('Failed to download invoice PDF:', error);
            toast.error('Failed to download invoice PDF');
        }
    };

    const downloadMonthlyPDF = async (monthKey: string) => {
        try {
            const response = await fetch(`/api/apps/billing-history/monthly/${monthKey}/download`, {
                method: 'GET',
                credentials: 'same-origin',
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `billing_${monthKey}.pdf`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success('Monthly billing downloaded successfully');
        } catch (error) {
            console.error('Failed to download monthly billing:', error);
            toast.error('Failed to download monthly billing');
        }
    };

    const downloadUpcomingInvoicesPDF = async () => {
        try {
            const response = await fetch('/api/apps/upcoming-invoices/pdf', {
                method: 'GET',
                credentials: 'same-origin',
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `upcoming_invoices_${new Date().toISOString().split('T')[0]}.pdf`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            toast.success('Upcoming invoices PDF downloaded successfully');
        } catch (error) {
            console.error('Failed to download upcoming invoices PDF:', error);
            toast.error('Failed to download upcoming invoices PDF');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            paid: { variant: 'default' as const, className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
            pending: { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
            failed: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
            cancelled: { variant: 'outline' as const, className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' },
            refunded: { variant: 'outline' as const, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
            upcoming: { variant: 'outline' as const, className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        
        return (
            <Badge variant={config.variant} className={config.className}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const getTypeLabel = (type: string) => {
        const typeLabels = {
            subscription: 'Subscription Plan',
            app_purchase: 'App Purchase',
            app_subscription: 'App Subscription',
        };
        return typeLabels[type as keyof typeof typeLabels] || type;
    };

    const getBillingCycleLabel = (cycle: string) => {
        const cycleLabels = {
            monthly: 'Monthly',
            yearly: 'Yearly',
            quarterly: 'Quarterly',
            weekly: 'Weekly',
        };
        return cycleLabels[cycle as keyof typeof cycleLabels] || cycle;
    };

    // Group billing history by month
    const groupBillingByMonth = (invoices: BillingItem[]) => {
        const grouped = invoices.reduce((acc, invoice) => {
            const date = new Date(invoice.created_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = date.toLocaleDateString('en-PH', { 
                year: 'numeric', 
                month: 'long' 
            });
            
            if (!acc[monthKey]) {
                acc[monthKey] = {
                    label: monthLabel,
                    invoices: [],
                    totalAmount: 0
                };
            }
            
            acc[monthKey].invoices.push(invoice);
            // Ensure total_amount is a number
            const amount = typeof invoice.total_amount === 'number' ? invoice.total_amount : parseFloat(invoice.total_amount) || 0;
            acc[monthKey].totalAmount += amount;
            
            return acc;
        }, {} as Record<string, { label: string; invoices: BillingItem[]; totalAmount: number }>);
        
        return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    const monthlyBilling = groupBillingByMonth(billingHistory);

    if (billingHistory.length === 0 && upcomingInvoices.length === 0) {
        return (
            <div className="text-center py-8">
                <Receipt className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No billing history
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    You haven't made any app purchases yet. Start by exploring our apps!
                </p>
                <Link
                    href={route('apps')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                    Browse Apps
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Upcoming Invoices Section */}
            {upcomingInvoices.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                            <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                            Upcoming Invoices
                        </h3>
                        <Button
                            onClick={downloadUpcomingInvoicesPDF}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                        >
                            <Receipt className="h-3 w-3 mr-1" />
                            Download All PDF
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {upcomingInvoices.map((item) => (
                            <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            {getTypeLabel(item.type)}
                                            {item.plan_name && (
                                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                                    - {item.plan_name}
                                                </span>
                                            )}
                                            {item.app_name && (
                                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                                    - {item.app_name}
                                                </span>
                                            )}
                                        </h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Invoice #{item.invoice_number}
                                            {item.billing_cycle && (
                                                <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                    {getBillingCycleLabel(item.billing_cycle)}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                            {formatPrice(item.total_amount)}
                                        </div>
                                        {getStatusBadge(item.status)}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    <p>Due: {formatDate(item.due_date || item.created_at)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Monthly Billing History Section */}
            {monthlyBilling.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Receipt className="h-5 w-5 mr-2 text-orange-600" />
                        Billing History by Month
                    </h3>
                    <div className="space-y-6">
                        {monthlyBilling.map(([monthKey, monthData]) => (
                            <div key={monthKey} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                {/* Month Header */}
                                <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => toggleMonthExpansion(monthKey)}
                                                className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md p-1 transition-colors"
                                            >
                                                {expandedMonths.has(monthKey) ? (
                                                    <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                )}
                                                <div className="text-left">
                                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                        {monthData.label}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {monthData.invoices.length} invoice{monthData.invoices.length !== 1 ? 's' : ''}
                                                    </p>
                                                </div>
                                            </button>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                                    {formatPrice(monthData.totalAmount)}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    Total for month
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => downloadMonthlyPDF(monthKey)}
                                                variant="outline"
                                                size="sm"
                                                className="text-xs"
                                            >
                                                <Receipt className="h-3 w-3 mr-1" />
                                                Download PDF
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Invoices for the month - Only show when expanded */}
                                {expandedMonths.has(monthKey) && (
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {monthData.invoices.map((invoice) => (
                                            <div key={invoice.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div>
                                                        <h5 className="font-medium text-gray-900 dark:text-white">
                                                            {getTypeLabel(invoice.type)}
                                                            {invoice.plan_name && (
                                                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                                                    - {invoice.plan_name}
                                                                </span>
                                                            )}
                                                            {invoice.app_name && (
                                                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                                                    - {invoice.app_name}
                                                                </span>
                                                            )}
                                                        </h5>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Invoice #{invoice.invoice_number}
                                                            {invoice.billing_cycle && (
                                                                <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                                    {getBillingCycleLabel(invoice.billing_cycle)}
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                                            {formatPrice(invoice.total_amount)}
                                                        </div>
                                                        {getStatusBadge(invoice.status)}
                                                    </div>
                                                </div>
                                                
                                                {/* Invoice Items */}
                                                {invoice.items.map((item, index) => (
                                                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {item.description}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                Qty: {item.quantity} × {formatPrice(item.unit_price)}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {formatPrice(item.total_price)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Payment Details */}
                                                <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        <p>Payment Method: {invoice.payment_method || 'N/A'}</p>
                                                        <p>Date: {formatDate(invoice.created_at)}</p>
                                                        {invoice.paid_at && (
                                                            <p>Paid: {formatDate(invoice.paid_at)}</p>
                                                        )}
                                                    </div>
                                                    {typeof invoice.id === 'number' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => downloadInvoicePDF(invoice.id as number)}
                                                            className="text-xs"
                                                        >
                                                            <Receipt className="h-3 w-3 mr-1" />
                                                            Download PDF
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
