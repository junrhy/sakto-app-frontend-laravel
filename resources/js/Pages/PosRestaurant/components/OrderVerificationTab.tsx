import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
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
import { Textarea } from '@/Components/ui/textarea';
import {
    CheckCircle,
    Clock,
    DollarSign,
    Eye,
    MapPin,
    ShoppingBag,
    XCircle,
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';

interface OnlineOrder {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    delivery_address: string;
    items: Array<{
        id: number;
        name: string;
        quantity: number;
        price: number;
    }>;
    subtotal: number;
    delivery_fee: number;
    tax_amount: number;
    total_amount: number;
    status: string;
    verification_status: string;
    verification_notes?: string;
    payment_negotiation_enabled: boolean;
    negotiated_amount?: number;
    payment_notes?: string;
    payment_status: string;
    payment_method?: string;
    verified_at?: string;
    created_at: string;
    online_store: {
        id: number;
        name: string;
        domain: string;
    };
}

interface OrderVerificationTabProps {
    orders: OnlineOrder[];
    currency_symbol: string;
    onVerifyOrder?: (
        id: number,
        status: 'verified' | 'rejected',
        notes?: string,
    ) => void;
    onNegotiatePayment?: (id: number, amount: number, notes?: string) => void;
    onUpdateStatus?: (id: number, status: string) => void;
    onUpdatePaymentStatus?: (
        id: number,
        paymentStatus: string,
        paymentMethod?: string,
        paymentNotes?: string,
    ) => void;
}

export const OrderVerificationTab: React.FC<OrderVerificationTabProps> = ({
    orders,
    currency_symbol,
    onVerifyOrder,
    onNegotiatePayment,
    onUpdateStatus,
    onUpdatePaymentStatus,
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [verificationFilter, setVerificationFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
    const [isNegotiateDialogOpen, setIsNegotiateDialogOpen] = useState(false);
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [isPaymentStatusDialogOpen, setIsPaymentStatusDialogOpen] =
        useState(false);
    const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(
        null,
    );
    const [verifyStatus, setVerifyStatus] = useState<'verified' | 'rejected'>(
        'verified',
    );
    const [verifyNotes, setVerifyNotes] = useState('');
    const [negotiatedAmount, setNegotiatedAmount] = useState('');
    const [paymentNotes, setPaymentNotes] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [newPaymentStatus, setNewPaymentStatus] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentStatusNotes, setPaymentStatusNotes] = useState('');
    const [isOrderItemsDialogOpen, setIsOrderItemsDialogOpen] = useState(false);
    const [selectedOrderForItems, setSelectedOrderForItems] =
        useState<OnlineOrder | null>(null);
    const itemsPerPage = 10;

    const filteredOrders = useMemo(() => {
        let filtered = orders;

        // Search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (order) =>
                    order.order_number.toLowerCase().includes(searchLower) ||
                    order.customer_name.toLowerCase().includes(searchLower) ||
                    order.customer_email.toLowerCase().includes(searchLower) ||
                    order.online_store.name.toLowerCase().includes(searchLower),
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(
                (order) => order.status === statusFilter,
            );
        }

        // Verification filter
        if (verificationFilter !== 'all') {
            filtered = filtered.filter(
                (order) => order.verification_status === verificationFilter,
            );
        }

        return filtered;
    }, [orders, searchTerm, statusFilter, verificationFilter]);

    const paginatedOrders = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredOrders, currentPage]);

    const pageCount = useMemo(
        () => Math.ceil(filteredOrders.length / itemsPerPage),
        [filteredOrders.length, itemsPerPage],
    );

    const handleVerifyOrder = useCallback((order: OnlineOrder) => {
        setSelectedOrder(order);
        setVerifyStatus('verified');
        setVerifyNotes('');
        setIsVerifyDialogOpen(true);
    }, []);

    const handleRejectOrder = useCallback((order: OnlineOrder) => {
        setSelectedOrder(order);
        setVerifyStatus('rejected');
        setVerifyNotes('');
        setIsVerifyDialogOpen(true);
    }, []);

    const handleNegotiatePayment = useCallback((order: OnlineOrder) => {
        setSelectedOrder(order);
        setNegotiatedAmount(Number(order.total_amount).toString());
        setPaymentNotes('');
        setIsNegotiateDialogOpen(true);
    }, []);

    const handleUpdateStatus = useCallback((order: OnlineOrder) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setIsStatusDialogOpen(true);
    }, []);

    const handleUpdatePaymentStatus = useCallback((order: OnlineOrder) => {
        setSelectedOrder(order);
        setNewPaymentStatus(order.payment_status);
        setPaymentMethod(order.payment_method || '');
        setPaymentStatusNotes('');
        setIsPaymentStatusDialogOpen(true);
    }, []);

    const confirmVerify = useCallback(() => {
        if (selectedOrder && onVerifyOrder) {
            onVerifyOrder(selectedOrder.id, verifyStatus, verifyNotes);
        }
        setIsVerifyDialogOpen(false);
        setSelectedOrder(null);
    }, [selectedOrder, verifyStatus, verifyNotes, onVerifyOrder]);

    const confirmNegotiate = useCallback(() => {
        if (selectedOrder && onNegotiatePayment) {
            onNegotiatePayment(
                selectedOrder.id,
                parseFloat(negotiatedAmount),
                paymentNotes,
            );
        }
        setIsNegotiateDialogOpen(false);
        setSelectedOrder(null);
    }, [selectedOrder, negotiatedAmount, paymentNotes, onNegotiatePayment]);

    const confirmStatusUpdate = useCallback(() => {
        if (selectedOrder && onUpdateStatus) {
            onUpdateStatus(selectedOrder.id, newStatus);
        }
        setIsStatusDialogOpen(false);
        setSelectedOrder(null);
    }, [selectedOrder, newStatus, onUpdateStatus]);

    const confirmPaymentStatusUpdate = useCallback(() => {
        if (selectedOrder && onUpdatePaymentStatus) {
            onUpdatePaymentStatus(
                selectedOrder.id,
                newPaymentStatus,
                paymentMethod,
                paymentStatusNotes,
            );
        }
        setIsPaymentStatusDialogOpen(false);
        setSelectedOrder(null);
    }, [
        selectedOrder,
        newPaymentStatus,
        paymentMethod,
        paymentStatusNotes,
        onUpdatePaymentStatus,
    ]);

    const handleViewOrderItems = useCallback((order: OnlineOrder) => {
        setSelectedOrderForItems(order);
        setIsOrderItemsDialogOpen(true);
    }, []);

    const getStatusColor = useCallback((status: string) => {
        const colors = {
            pending:
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            verified:
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            preparing:
                'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
            ready: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            delivered:
                'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
            cancelled:
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
        return (
            colors[status as keyof typeof colors] ||
            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        );
    }, []);

    const getVerificationStatusColor = useCallback((status: string) => {
        const colors = {
            pending:
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            verified:
                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            rejected:
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
        return (
            colors[status as keyof typeof colors] ||
            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        );
    }, []);

    const getPaymentStatusColor = useCallback((status: string) => {
        const colors = {
            pending:
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            negotiated:
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        };
        return (
            colors[status as keyof typeof colors] ||
            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        );
    }, []);

    return (
        <div className="space-y-6">
            <Card className="overflow-hidden rounded-xl border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 dark:border-gray-600 dark:from-gray-700 dark:to-gray-600">
                    <CardTitle className="flex items-center text-base font-semibold text-gray-900 dark:text-white">
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        Orders & Payment Management
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="mb-4 flex flex-col gap-4 sm:flex-row">
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="relative w-full sm:w-64">
                                <Input
                                    placeholder="Search orders..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm transition-all focus:border-blue-500 focus:shadow-md dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                                />
                            </div>
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="preparing">
                                        Preparing
                                    </SelectItem>
                                    <SelectItem value="ready">Ready</SelectItem>
                                    <SelectItem value="delivered">
                                        Delivered
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                        Cancelled
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={verificationFilter}
                                onValueChange={setVerificationFilter}
                            >
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="Filter by verification" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Verification
                                    </SelectItem>
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="verified">
                                        Verified
                                    </SelectItem>
                                    <SelectItem value="rejected">
                                        Rejected
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-700">
                                <TableHead className="text-gray-900 dark:text-white">
                                    Order
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Customer
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Store
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Amount
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Status
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Verification
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Payment
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedOrders.map((order) => (
                                <TableRow
                                    key={order.id}
                                    className="border-gray-200 dark:border-gray-600"
                                >
                                    <TableCell className="font-medium text-gray-900 dark:text-white">
                                        <div>
                                            <div className="font-semibold">
                                                {order.order_number}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {new Date(
                                                    order.created_at,
                                                ).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        <div>
                                            <div className="font-medium">
                                                {order.customer_name}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {order.customer_email}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {order.customer_phone}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        <div>
                                            <div className="font-medium">
                                                {order.online_store.name}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {order.online_store.domain}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        <div>
                                            <div className="font-semibold">
                                                {currency_symbol}
                                                {Number(
                                                    order.total_amount,
                                                ).toFixed(2)}
                                            </div>
                                            {order.negotiated_amount && (
                                                <div className="text-sm text-blue-600 dark:text-blue-400">
                                                    Negotiated:{' '}
                                                    {currency_symbol}
                                                    {Number(
                                                        order.negotiated_amount,
                                                    ).toFixed(2)}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={`rounded-full px-2 py-1 text-xs ${getStatusColor(order.status)}`}
                                        >
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={`rounded-full px-2 py-1 text-xs ${getVerificationStatusColor(order.verification_status)}`}
                                        >
                                            {order.verification_status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={`rounded-full px-2 py-1 text-xs ${getPaymentStatusColor(order.payment_status)}`}
                                        >
                                            {order.payment_status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            {order.verification_status ===
                                                'pending' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleVerifyOrder(
                                                                order,
                                                            )
                                                        }
                                                        className="text-green-600 hover:text-green-700"
                                                        title="Verify Order"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleRejectOrder(
                                                                order,
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-700"
                                                        title="Reject Order"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                            {order.payment_negotiation_enabled &&
                                                order.payment_status ===
                                                    'pending' && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            handleNegotiatePayment(
                                                                order,
                                                            )
                                                        }
                                                        className="text-blue-600 hover:text-blue-700"
                                                        title="Negotiate Payment"
                                                    >
                                                        <DollarSign className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    handleUpdateStatus(order)
                                                }
                                                className="text-gray-600 hover:text-gray-700"
                                                title="Update Status"
                                            >
                                                <Clock className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    handleUpdatePaymentStatus(
                                                        order,
                                                    )
                                                }
                                                className="text-purple-600 hover:text-purple-700"
                                                title="Update Payment Status"
                                            >
                                                <DollarSign className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    handleViewOrderItems(order)
                                                }
                                                className="text-blue-600 hover:text-blue-700"
                                                title="View Order Items"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {paginatedOrders.length === 0 && (
                        <div className="py-8 text-center">
                            <p className="text-gray-500 dark:text-gray-400">
                                {searchTerm ||
                                statusFilter !== 'all' ||
                                verificationFilter !== 'all'
                                    ? 'No orders found matching your filters.'
                                    : 'No orders found.'}
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {pageCount > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <div>
                                Showing {(currentPage - 1) * itemsPerPage + 1}{' '}
                                to{' '}
                                {Math.min(
                                    currentPage * itemsPerPage,
                                    filteredOrders.length,
                                )}{' '}
                                of {filteredOrders.length} orders
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.max(prev - 1, 1),
                                        )
                                    }
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </Button>
                                <span className="flex items-center px-3 py-1 text-sm">
                                    Page {currentPage} of {pageCount}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setCurrentPage((prev) =>
                                            Math.min(prev + 1, pageCount),
                                        )
                                    }
                                    disabled={currentPage === pageCount}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Verify Order Dialog */}
            <Dialog
                open={isVerifyDialogOpen}
                onOpenChange={setIsVerifyDialogOpen}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {verifyStatus === 'verified'
                                ? 'Verify Order'
                                : 'Reject Order'}
                        </DialogTitle>
                        <DialogDescription>
                            {verifyStatus === 'verified'
                                ? 'Confirm that this order is valid and can proceed.'
                                : 'Reject this order and provide a reason.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {selectedOrder && (
                            <div className="space-y-2">
                                <div className="font-medium">
                                    Order: {selectedOrder.order_number}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Customer: {selectedOrder.customer_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Amount: {currency_symbol}
                                    {Number(selectedOrder.total_amount).toFixed(
                                        2,
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="verify-notes">
                                Notes (Optional)
                            </Label>
                            <Textarea
                                id="verify-notes"
                                value={verifyNotes}
                                onChange={(e) => setVerifyNotes(e.target.value)}
                                placeholder="Add any notes about this verification..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsVerifyDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={confirmVerify}
                            className={
                                verifyStatus === 'verified'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-red-600 hover:bg-red-700'
                            }
                        >
                            {verifyStatus === 'verified'
                                ? 'Verify Order'
                                : 'Reject Order'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Negotiate Payment Dialog */}
            <Dialog
                open={isNegotiateDialogOpen}
                onOpenChange={setIsNegotiateDialogOpen}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Negotiate Payment</DialogTitle>
                        <DialogDescription>
                            Set a negotiated amount for this order's payment.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {selectedOrder && (
                            <div className="space-y-2">
                                <div className="font-medium">
                                    Order: {selectedOrder.order_number}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Original Amount: {currency_symbol}
                                    {Number(selectedOrder.total_amount).toFixed(
                                        2,
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="negotiated-amount">
                                Negotiated Amount
                            </Label>
                            <Input
                                id="negotiated-amount"
                                type="number"
                                step="0.01"
                                min="0"
                                max={
                                    selectedOrder
                                        ? Number(selectedOrder.total_amount)
                                        : undefined
                                }
                                value={negotiatedAmount}
                                onChange={(e) =>
                                    setNegotiatedAmount(e.target.value)
                                }
                                placeholder="Enter negotiated amount"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="payment-notes">
                                Payment Notes (Optional)
                            </Label>
                            <Textarea
                                id="payment-notes"
                                value={paymentNotes}
                                onChange={(e) =>
                                    setPaymentNotes(e.target.value)
                                }
                                placeholder="Add any notes about the payment negotiation..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsNegotiateDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="button" onClick={confirmNegotiate}>
                            Negotiate Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Update Status Dialog */}
            <Dialog
                open={isStatusDialogOpen}
                onOpenChange={setIsStatusDialogOpen}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Update Order Status</DialogTitle>
                        <DialogDescription>
                            Change the status of this order.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {selectedOrder && (
                            <div className="space-y-2">
                                <div className="font-medium">
                                    Order: {selectedOrder.order_number}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Current Status: {selectedOrder.status}
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="new-status">New Status</Label>
                            <Select
                                value={newStatus}
                                onValueChange={setNewStatus}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select new status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="verified">
                                        Verified
                                    </SelectItem>
                                    <SelectItem value="preparing">
                                        Preparing
                                    </SelectItem>
                                    <SelectItem value="ready">Ready</SelectItem>
                                    <SelectItem value="delivered">
                                        Delivered
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                        Cancelled
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsStatusDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="button" onClick={confirmStatusUpdate}>
                            Update Status
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Update Payment Status Dialog */}
            <Dialog
                open={isPaymentStatusDialogOpen}
                onOpenChange={setIsPaymentStatusDialogOpen}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Update Payment Status</DialogTitle>
                        <DialogDescription>
                            Change the payment status of this order.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {selectedOrder && (
                            <div className="space-y-2">
                                <div className="font-medium">
                                    Order: {selectedOrder.order_number}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Current Payment Status:{' '}
                                    {selectedOrder.payment_status}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Amount: {currency_symbol}
                                    {Number(selectedOrder.total_amount).toFixed(
                                        2,
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="new-payment-status">
                                Payment Status
                            </Label>
                            <Select
                                value={newPaymentStatus}
                                onValueChange={setNewPaymentStatus}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select payment status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">
                                        Pending
                                    </SelectItem>
                                    <SelectItem value="negotiated">
                                        Negotiated
                                    </SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="failed">
                                        Failed
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="payment-method">
                                Payment Method (Optional)
                            </Label>
                            <Input
                                id="payment-method"
                                value={paymentMethod}
                                onChange={(e) =>
                                    setPaymentMethod(e.target.value)
                                }
                                placeholder="e.g., Cash, Card, Bank Transfer"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="payment-status-notes">
                                Payment Notes (Optional)
                            </Label>
                            <Textarea
                                id="payment-status-notes"
                                value={paymentStatusNotes}
                                onChange={(e) =>
                                    setPaymentStatusNotes(e.target.value)
                                }
                                placeholder="Add any notes about the payment..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsPaymentStatusDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={confirmPaymentStatusUpdate}
                        >
                            Update Payment Status
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Order Items Dialog */}
            <Dialog
                open={isOrderItemsDialogOpen}
                onOpenChange={setIsOrderItemsDialogOpen}
            >
                <DialogContent className="max-h-[90vh] w-[95vw] max-w-4xl sm:w-full">
                    <DialogHeader className="flex-shrink-0">
                        <DialogTitle>Order Items</DialogTitle>
                        <DialogDescription>
                            View the items in this order.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 space-y-4 overflow-y-auto px-1">
                        {selectedOrderForItems && (
                            <div className="space-y-4">
                                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                                    <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                                        <div>
                                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                                Order Number:
                                            </span>
                                            <p className="break-words text-gray-900 dark:text-white">
                                                {
                                                    selectedOrderForItems.order_number
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                                Customer:
                                            </span>
                                            <p className="break-words text-gray-900 dark:text-white">
                                                {
                                                    selectedOrderForItems.customer_name
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                                Phone:
                                            </span>
                                            <p className="break-words text-gray-900 dark:text-white">
                                                {
                                                    selectedOrderForItems.customer_phone
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                                Total Amount:
                                            </span>
                                            <p className="text-gray-900 dark:text-white">
                                                {currency_symbol}
                                                {Number(
                                                    selectedOrderForItems.total_amount,
                                                ).toFixed(2)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                                Status:
                                            </span>
                                            <p className="text-gray-900 dark:text-white">
                                                {selectedOrderForItems.status}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        Order Items
                                    </h4>
                                    <div className="max-h-96 space-y-2 overflow-y-auto">
                                        {selectedOrderForItems.items &&
                                        selectedOrderForItems.items.length >
                                            0 ? (
                                            selectedOrderForItems.items.map(
                                                (item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-600 sm:flex-row sm:items-center sm:justify-between"
                                                    >
                                                        <div className="min-w-0 flex-1">
                                                            <p className="break-words font-medium text-gray-900 dark:text-white">
                                                                {item.name}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                Quantity:{' '}
                                                                {item.quantity}
                                                            </p>
                                                        </div>
                                                        <div className="flex-shrink-0 text-right">
                                                            <p className="font-medium text-gray-900 dark:text-white">
                                                                {
                                                                    currency_symbol
                                                                }
                                                                {Number(
                                                                    item.price,
                                                                ).toFixed(2)}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                Total:{' '}
                                                                {
                                                                    currency_symbol
                                                                }
                                                                {Number(
                                                                    item.price *
                                                                        item.quantity,
                                                                ).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ),
                                            )
                                        ) : (
                                            <div className="rounded-lg border border-gray-200 p-4 text-center dark:border-gray-600">
                                                <ShoppingBag className="mx-auto h-8 w-8 text-gray-400" />
                                                <p className="mt-2 text-gray-500 dark:text-gray-400">
                                                    No items found
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedOrderForItems.delivery_address && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-gray-900 dark:text-white">
                                            Delivery Address
                                        </h4>
                                        <div className="rounded-lg border border-gray-200 p-3 dark:border-gray-600">
                                            <div className="flex items-start gap-2">
                                                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                                                <p className="break-words text-sm text-gray-700 dark:text-gray-300">
                                                    {
                                                        selectedOrderForItems.delivery_address
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <DialogFooter className="flex-shrink-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOrderItemsDialogOpen(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
