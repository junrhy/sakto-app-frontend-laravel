import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardFooter } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { SparklesIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { toast } from 'sonner';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { format } from "date-fns";
import { Dialog, DialogContent } from "@/Components/ui/dialog";

interface Package {
    id: number;
    name: string;
    credits: number;
    price: number;
    popular: boolean;
    savings?: string;
}

interface PaymentMethod {
    id: string;
    name: string;
    accountName: string;
    accountNumber: string;
    bankName?: string;
}

interface PaymentHistory {
    id: number;
    credit_id: number;
    client_identifier: string;
    package_name: string;
    package_credit: number;
    package_amount: number;
    payment_method: string;
    payment_method_details: string | null;
    transaction_id: string;
    proof_of_payment: string | null;
    status: 'approved' | 'pending' | 'rejected' | 'declined';
    approved_date: string | null;
    approved_by: string | null;
    created_at: string;
    updated_at: string;
}

interface Props {
    auth: {
        user: {
            name: string;
        };
    };
    packages: Package[];
    paymentMethods: PaymentMethod[];
    paymentHistory: PaymentHistory[];
}

export default function Buy({ auth, packages, paymentMethods, paymentHistory: initialPaymentHistory }: Props) {
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<string>('');
    const [transactionId, setTransactionId] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>(initialPaymentHistory);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const recordsPerPage = 10;

    // Calculate pagination values
    const totalPages = Math.ceil(paymentHistory.length / recordsPerPage);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const currentRecords = paymentHistory.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePackageSelect = (pkg: Package) => {
        setSelectedPackage(pkg);
        setPaymentMethod('');
        setTransactionId('');
        setProofFile(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProofFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!selectedPackage || !paymentMethod || !transactionId || !proofFile) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);

        const selectedPaymentMethod = paymentMethods.find(m => m.id === paymentMethod);
        if (!selectedPaymentMethod) {
            toast.error('Selected payment method not found');
            setIsSubmitting(false);
            return;
        }

        // Construct payment method details
        const paymentMethodDetails = {
            accountName: selectedPaymentMethod.accountName,
            accountNumber: selectedPaymentMethod.accountNumber,
            ...(selectedPaymentMethod.bankName && { bankName: selectedPaymentMethod.bankName })
        };

        const formData = new FormData();
        formData.append('package_name', selectedPackage.name.toString());
        formData.append('package_credit', selectedPackage.credits.toString());
        formData.append('package_amount', selectedPackage.price.toString());
        formData.append('payment_method', selectedPaymentMethod.name);
        formData.append('payment_method_details', JSON.stringify(paymentMethodDetails));
        formData.append('amount_sent', selectedPackage.price.toString());
        formData.append('transaction_id', transactionId);
        if (proofFile) {
            formData.append('proof_of_payment', proofFile);
        }

        try {
            const response = await fetch('request', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: formData,
            });

            const data = await response.json();

            if (data.message) {
                toast.success(data.message);
                // Reset form
                setPaymentMethod('');
                setTransactionId('');
                setProofFile(null);
                setSelectedPackage(null);

                // Update payment history with the new entry
                if (data.credit_history) {
                    const formattedHistory = {
                        ...data.credit_history,
                        package_amount: Number(data.credit_history.package_amount),
                        package_credit: Number(data.credit_history.package_credit)
                    };
                    setPaymentHistory(prev => [formattedHistory, ...prev]);
                }
            } else {
                toast.error('Failed to process purchase');
            }
        } catch (error) {
            toast.error('An error occurred while processing your purchase');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Buy Credits</h2>}
        >
            <Head title="Buy Credits" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Purchase Section */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-col lg:flex-row gap-8">
                            {/* Left side - Packages */}
                            <div className="w-full lg:w-1/4 space-y-4">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Select Package
                                </h2>
                                {packages.map((pkg) => (
                                    <div 
                                        key={pkg.id}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all
                                            ${selectedPackage?.id === pkg.id 
                                                ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                                            }`}
                                        onClick={() => handlePackageSelect(pkg)}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xl font-bold">{pkg.credits.toLocaleString()} Credits</span>
                                            {pkg.popular && (
                                                <Badge className="bg-blue-500">Popular</Badge>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-baseline mb-2">
                                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                ₱{pkg.price.toFixed(2)}
                                            </span>
                                            {pkg.savings && (
                                                <Badge variant="secondary">Save {pkg.savings}</Badge>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            No expiration • Use across all services
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Middle - Payment Methods */}
                            <div className="w-full lg:w-2/5">
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                            Payment Methods
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Send your payment to any of these accounts
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {paymentMethods.map((method) => (
                                            <div 
                                                key={method.id}
                                                className={`p-4 rounded-lg border cursor-pointer transition-all
                                                    ${paymentMethod === method.id
                                                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                                                    }`}
                                                onClick={() => setPaymentMethod(method.id)}
                                            >
                                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                                    {method.name}
                                                </h3>
                                                <div className="space-y-1 text-sm">
                                                    <p>Account Name: <span className="font-medium">{method.accountName}</span></p>
                                                    <p>Account Number: <span className="font-medium">{method.accountNumber}</span></p>
                                                    {method.bankName && (
                                                        <p>Bank: <span className="font-medium">{method.bankName}</span></p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right side - Complete Purchase */}
                            <div className="w-full lg:w-1/3">
                                {selectedPackage ? (
                                    <div className="sticky top-4 space-y-6 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                                        <div>
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                                Complete Your Purchase
                                            </h2>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Amount to Send: <span className="font-semibold">₱{selectedPackage.price.toFixed(2)}</span>
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Payment Method Used</Label>
                                            <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                                {paymentMethod ? (
                                                    <div className="space-y-1">
                                                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                                                            {paymentMethods.find(m => m.id === paymentMethod)?.name}
                                                        </p>
                                                        {(() => {
                                                            const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);
                                                            return selectedMethod ? (
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    <p>Account Name: <span className="font-medium">{selectedMethod.accountName}</span></p>
                                                                    <p>Account Number: <span className="font-medium">{selectedMethod.accountNumber}</span></p>
                                                                    {selectedMethod.bankName && (
                                                                        <p>Bank: <span className="font-medium">{selectedMethod.bankName}</span></p>
                                                                    )}
                                                                </div>
                                                            ) : null;
                                                        })()}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">Select a payment method</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="transactionId">Transaction ID</Label>
                                            <Input
                                                id="transactionId"
                                                value={transactionId}
                                                onChange={(e) => setTransactionId(e.target.value)}
                                                placeholder="Enter your payment transaction ID"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="proofFile">Proof of Payment</Label>
                                            <Input
                                                id="proofFile"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Upload a screenshot of your payment (max 5MB)
                                            </p>
                                        </div>

                                        <Button
                                            onClick={handleSubmit}
                                            disabled={!paymentMethod || !transactionId || !proofFile || isSubmitting}
                                            className="w-full flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? 'Processing...' : 'Submit Payment'}
                                            <ArrowRightIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                        <p>Select a package to continue</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Payment History Section */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Payment History
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Your recent credit purchase transactions
                                </p>
                            </div>

                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Credits</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Payment Method</TableHead>
                                            <TableHead>Account Details</TableHead>
                                            <TableHead>Transaction ID</TableHead>
                                            <TableHead>Proof of Payment</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paymentHistory.length > 0 ? (
                                            currentRecords.map((payment) => (
                                                <TableRow key={payment.id}>
                                                    <TableCell>
                                                        {format(new Date(payment.created_at), 'MMM d, yyyy h:mm a')}
                                                    </TableCell>
                                                    <TableCell>{payment.package_credit.toLocaleString()} Credits</TableCell>
                                                    <TableCell>₱{payment.package_amount.toFixed(2)}</TableCell>
                                                    <TableCell>{payment.payment_method}</TableCell>
                                                    <TableCell>
                                                        {payment.payment_method_details && (
                                                            <div className="text-sm space-y-0.5">
                                                                {(() => {
                                                                    try {
                                                                        const details = JSON.parse(payment.payment_method_details);
                                                                        return (
                                                                            <>
                                                                                <p>Name: {details.accountName}</p>
                                                                                <p>Number: {details.accountNumber}</p>
                                                                                {details.bankName && (
                                                                                    <p>Bank: {details.bankName}</p>
                                                                                )}
                                                                            </>
                                                                        );
                                                                    } catch {
                                                                        return <p className="text-gray-500">No details available</p>;
                                                                    }
                                                                })()}
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-mono">{payment.transaction_id}</TableCell>
                                                    <TableCell>
                                                        {payment.proof_of_payment && (
                                                            <img 
                                                                src={payment.proof_of_payment} 
                                                                alt="Proof of Payment" 
                                                                className="w-20 h-20 object-cover cursor-pointer hover:opacity-80 transition-opacity rounded-md"
                                                                onClick={() => setSelectedImage(payment.proof_of_payment)}
                                                            />
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={payment.status === 'approved' ? 'default' : 'secondary'}
                                                            className={
                                                                payment.status === 'approved' 
                                                                    ? 'bg-green-500 hover:bg-green-600'
                                                                    : payment.status === 'pending'
                                                                    ? 'bg-yellow-500 hover:bg-yellow-600'
                                                                    : payment.status === 'declined'
                                                                    ? 'bg-red-500 hover:bg-red-600'
                                                                    : 'bg-gray-500 hover:bg-gray-600'
                                                            }
                                                        >
                                                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center text-gray-500 dark:text-gray-400">
                                                    No payment history found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination Controls */}
                            {paymentHistory.length > 0 && (
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Showing {startIndex + 1} to {Math.min(endIndex, paymentHistory.length)} of {paymentHistory.length} records
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeftIcon className="h-4 w-4" />
                                        </Button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <Button
                                                key={page}
                                                variant={currentPage === page ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePageChange(page)}
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRightIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Image Preview Dialog */}
                    <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                        <DialogContent className="max-w-2xl p-6">
                            {selectedImage && (
                                <div className="flex items-center justify-center">
                                    <img 
                                        src={selectedImage} 
                                        alt="Proof of Payment Preview" 
                                        className="max-h-[70vh] w-auto object-contain rounded-lg"
                                    />
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
