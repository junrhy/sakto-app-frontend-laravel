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
import { Textarea } from '@/Components/ui/textarea';
import axios from 'axios';
import {
    AlertCircle,
    Banknote,
    Building2,
    CheckCircle,
    CreditCard,
    DollarSign,
    Loader2,
    Receipt,
    Smartphone,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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
    {
        value: 'card',
        label: 'Credit/Debit Card',
        icon: CreditCard,
        color: 'text-blue-600',
    },
    {
        value: 'bank_transfer',
        label: 'Bank Transfer',
        icon: Building2,
        color: 'text-purple-600',
    },
    {
        value: 'digital_wallet',
        label: 'Digital Wallet',
        icon: Smartphone,
        color: 'text-orange-600',
    },
];

export default function PaymentDialog({
    isOpen,
    onClose,
    booking,
    onPaymentSuccess,
}: PaymentDialogProps) {
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentReference, setPaymentReference] = useState('');
    const [paidAmount, setPaidAmount] = useState<number>(0);
    const [paymentNotes, setPaymentNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    // Set default amount to estimated cost when booking changes
    useEffect(() => {
        if (booking && isOpen) {
            setPaidAmount(booking.estimated_cost);
        }
    }, [booking, isOpen]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
        }).format(amount);
    };

    const getPaymentStatusBadge = (status: string) => {
        const statusConfig = {
            pending: {
                color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
                icon: AlertCircle,
            },
            paid: {
                color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
                icon: CheckCircle,
            },
            failed: {
                color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
                icon: AlertCircle,
            },
            refunded: {
                color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
                icon: AlertCircle,
            },
        };

        const config =
            statusConfig[status as keyof typeof statusConfig] ||
            statusConfig['pending'];
        const Icon = config.icon;

        return (
            <Badge className={`${config.color} border-0`}>
                <Icon className="mr-1 h-3 w-3" />
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
            setError(
                'Payment amount is too large. Maximum allowed is ₱999,999,999.99',
            );
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const response = await axios.post(
                `/transportation/bookings/${booking.id}/payment`,
                {
                    payment_method: paymentMethod,
                    payment_reference: paymentReference || undefined,
                    paid_amount: amountToPay,
                    payment_notes: paymentNotes || undefined,
                },
            );

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
                setError(
                    error.response?.data?.message ||
                        'An error occurred while processing payment',
                );
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
            <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                        <DollarSign className="h-5 w-5 text-emerald-600" />
                        Process Payment
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                        Complete payment for booking {booking.booking_reference}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                    {/* Booking Summary */}
                    <Card className="border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                <Receipt className="h-5 w-5 text-blue-600" />
                                Booking Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Customer
                                    </Label>
                                    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-gray-800">
                                        <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {booking.customer_name}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Payment Status
                                    </Label>
                                    <div className="flex items-center rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-gray-800">
                                        {getPaymentStatusBadge(
                                            booking.payment_status,
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Estimated Cost
                                    </Label>
                                    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                                        <div className="flex items-center gap-3">
                                            <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                            <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                                                {formatCurrency(
                                                    booking.estimated_cost,
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {booking.paid_amount && (
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Paid Amount
                                        </Label>
                                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                                    {formatCurrency(
                                                        booking.paid_amount,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Form */}
                    <Card className="border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
                                <CreditCard className="h-5 w-5 text-purple-600" />
                                Payment Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="payment_method"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Payment Method *
                                </Label>
                                <Select
                                    value={paymentMethod}
                                    onValueChange={setPaymentMethod}
                                >
                                    <SelectTrigger className="border-gray-300 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100">
                                        <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent className="border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                                        {paymentMethods.map((method) => {
                                            const Icon = method.icon;
                                            return (
                                                <SelectItem
                                                    key={method.value}
                                                    value={method.value}
                                                    className="text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Icon
                                                            className={`h-4 w-4 ${method.color}`}
                                                        />
                                                        {method.label}
                                                    </div>
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="payment_reference"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Payment Reference
                                </Label>
                                <Input
                                    id="payment_reference"
                                    placeholder="Enter payment reference (optional)"
                                    value={paymentReference}
                                    onChange={(e) =>
                                        setPaymentReference(e.target.value)
                                    }
                                    className="border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="paid_amount"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Amount Paid
                                </Label>
                                <Input
                                    id="paid_amount"
                                    type="number"
                                    step="0.01"
                                    placeholder={`${formatCurrency(booking.estimated_cost)}`}
                                    value={paidAmount || ''}
                                    onChange={(e) =>
                                        setPaidAmount(
                                            parseFloat(e.target.value) || 0,
                                        )
                                    }
                                    className="border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Amount is pre-filled with estimated cost.
                                    Modify as needed.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="payment_notes"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Payment Notes
                                </Label>
                                <Textarea
                                    id="payment_notes"
                                    placeholder="Add any notes about this payment (optional)"
                                    value={paymentNotes}
                                    onChange={(e) =>
                                        setPaymentNotes(e.target.value)
                                    }
                                    rows={3}
                                    className="resize-none border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-transparent focus:ring-2 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-400"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Error Message */}
                    {error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                                <div>
                                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                        Payment Error
                                    </p>
                                    <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                                        {error}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <DialogFooter className="flex-shrink-0 gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={isProcessing}
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handlePayment}
                        disabled={isProcessing || !paymentMethod}
                        className="min-w-[140px] bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-400 disabled:hover:bg-gray-400"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <DollarSign className="mr-2 h-4 w-4" />
                                Process Payment
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
