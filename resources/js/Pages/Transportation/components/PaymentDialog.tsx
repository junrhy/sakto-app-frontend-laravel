import React, { useState } from 'react';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { 
    CreditCard, 
    Banknote, 
    Smartphone, 
    Building2, 
    CheckCircle, 
    AlertCircle,
    Loader2
} from 'lucide-react';

interface Booking {
    id: number;
    booking_reference: string;
    customer_name: string;
    estimated_cost: number;
    payment_status: string;
    payment_method?: string;
    payment_reference?: string;
    paid_amount?: number;
    payment_date?: string;
    payment_notes?: string;
}

interface PaymentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking | null;
    onPaymentSuccess: () => void;
}

const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: Banknote, color: 'text-green-600' },
    { value: 'card', label: 'Credit/Debit Card', icon: CreditCard, color: 'text-blue-600' },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: Building2, color: 'text-purple-600' },
    { value: 'digital_wallet', label: 'Digital Wallet', icon: Smartphone, color: 'text-orange-600' },
];

export default function PaymentDialog({ isOpen, onClose, booking, onPaymentSuccess }: PaymentDialogProps) {
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentReference, setPaymentReference] = useState('');
    const [paidAmount, setPaidAmount] = useState<number>(0);
    const [paymentNotes, setPaymentNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(amount);
    };

    const getPaymentStatusBadge = (status: string) => {
        const statusConfig = {
            'pending': { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
            'paid': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            'failed': { color: 'bg-red-100 text-red-800', icon: AlertCircle },
            'refunded': { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['pending'];
        const Icon = config.icon;

        return (
            <Badge className={config.color}>
                <Icon className="w-3 h-3 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const handlePayment = async () => {
        if (!booking || !paymentMethod) {
            setError('Please select a payment method');
            return;
        }

        // Validate amount
        const amountToPay = paidAmount || booking.estimated_cost;
        if (amountToPay <= 0) {
            setError('Please enter a valid payment amount');
            return;
        }

        if (amountToPay > 999999999.99) {
            setError('Payment amount is too large. Maximum allowed is ₱999,999,999.99');
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const response = await axios.post(`/transportation/bookings/${booking.id}/payment`, {
                payment_method: paymentMethod,
                payment_reference: paymentReference || undefined,
                paid_amount: amountToPay,
                payment_notes: paymentNotes || undefined,
            });

            if (response.data.success) {
                onPaymentSuccess();
                onClose();
                // Reset form
                setPaymentMethod('');
                setPaymentReference('');
                setPaidAmount(0);
                setPaymentNotes('');
            } else {
                setError(response.data.message || 'Payment processing failed');
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            
            // Handle validation errors
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const errorMessages = Object.values(errors).flat();
                setError(`Validation error: ${errorMessages.join(', ')}`);
            } else {
                setError(error.response?.data?.message || 'An error occurred while processing payment');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        if (!isProcessing) {
            setError('');
            setPaymentMethod('');
            setPaymentReference('');
            setPaidAmount(0);
            setPaymentNotes('');
            onClose();
        }
    };

    if (!booking) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-gray-100">
                        Process Payment - {booking.booking_reference}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Booking Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Booking Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Customer</Label>
                                    <div className="font-medium">{booking.customer_name}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Current Status</Label>
                                    <div>{getPaymentStatusBadge(booking.payment_status)}</div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Estimated Cost</Label>
                                    <div className="text-lg font-semibold text-green-600">
                                        {formatCurrency(booking.estimated_cost)}
                                    </div>
                                </div>
                                {booking.paid_amount && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Paid Amount</Label>
                                        <div className="text-lg font-semibold text-blue-600">
                                            {formatCurrency(booking.paid_amount)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Form */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="payment_method">Payment Method *</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentMethods.map((method) => {
                                        const Icon = method.icon;
                                        return (
                                            <SelectItem key={method.value} value={method.value}>
                                                <div className="flex items-center gap-2">
                                                    <Icon className={`w-4 h-4 ${method.color}`} />
                                                    {method.label}
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="payment_reference">Payment Reference</Label>
                            <Input
                                id="payment_reference"
                                placeholder="Enter payment reference (optional)"
                                value={paymentReference}
                                onChange={(e) => setPaymentReference(e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="paid_amount">Amount Paid</Label>
                            <Input
                                id="paid_amount"
                                type="number"
                                step="0.01"
                                placeholder={`${formatCurrency(booking.estimated_cost)}`}
                                value={paidAmount || ''}
                                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Leave empty to use estimated cost: {formatCurrency(booking.estimated_cost)}
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="payment_notes">Payment Notes</Label>
                            <Textarea
                                id="payment_notes"
                                placeholder="Add any notes about this payment (optional)"
                                value={paymentNotes}
                                onChange={(e) => setPaymentNotes(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="flex">
                                <AlertCircle className="h-5 w-5 text-red-400" />
                                <div className="ml-3">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handlePayment}
                            disabled={isProcessing || !paymentMethod}
                            className="min-w-[120px]"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Process Payment'
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
