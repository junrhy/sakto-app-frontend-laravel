import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { format } from 'date-fns';
import { Calculator, CreditCard, Loader2, Users } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { AppCurrency, ClinicPaymentAccount, Patient } from '../types';

interface AccountPaymentModalProps {
    account: ClinicPaymentAccount;
    patients: Patient[];
    isOpen: boolean;
    onClose: () => void;
    appCurrency: AppCurrency | null;
    onPaymentRecorded: () => void;
}

export function AccountPaymentModal({
    account,
    patients,
    isOpen,
    onClose,
    appCurrency,
    onPaymentRecorded,
}: AccountPaymentModalProps) {
    const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
    const [paymentData, setPaymentData] = useState({
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        payment_amount: '',
        payment_method: 'cash',
        payment_notes: '',
        primary_patient_id: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const paymentMethods = [
        { value: 'cash', label: 'Cash' },
        { value: 'credit_card', label: 'Credit Card' },
        { value: 'debit_card', label: 'Debit Card' },
        { value: 'bank_transfer', label: 'Bank Transfer' },
        { value: 'check', label: 'Check' },
        { value: 'digital_wallet', label: 'Digital Wallet' },
        { value: 'insurance', label: 'Insurance' },
        { value: 'other', label: 'Other' },
    ];

    const formatCurrency = (amount: number) => {
        if (!appCurrency) return `$${amount.toFixed(2)}`;
        return `${appCurrency.symbol}${amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const handlePatientToggle = (patientId: string) => {
        setSelectedPatients((prev) => {
            const newSelection = prev.includes(patientId)
                ? prev.filter((id) => id !== patientId)
                : [...prev, patientId];

            // Auto-select first patient as primary if none selected
            if (newSelection.length > 0 && !paymentData.primary_patient_id) {
                setPaymentData((prevData) => ({
                    ...prevData,
                    primary_patient_id: newSelection[0],
                }));
            }

            return newSelection;
        });
    };

    const handleSelectAll = () => {
        const allIds = patients.map((p) => p.id);
        setSelectedPatients(allIds);
        if (!paymentData.primary_patient_id && allIds.length > 0) {
            setPaymentData((prev) => ({
                ...prev,
                primary_patient_id: allIds[0],
            }));
        }
    };

    const handleDeselectAll = () => {
        setSelectedPatients([]);
        setPaymentData((prev) => ({
            ...prev,
            primary_patient_id: '',
        }));
    };

    const handleInputChange = (field: string, value: any) => {
        setPaymentData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: '',
            }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (selectedPatients.length === 0) {
            newErrors.patients = 'Please select at least one patient';
        }

        if (
            !paymentData.payment_amount ||
            parseFloat(paymentData.payment_amount) <= 0
        ) {
            newErrors.payment_amount = 'Please enter a valid payment amount';
        }

        if (!paymentData.payment_method) {
            newErrors.payment_method = 'Please select a payment method';
        }

        if (!paymentData.primary_patient_id) {
            newErrors.primary_patient_id = 'Please select a primary patient';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                clinic_payment_account_id: account.id,
                patient_ids: selectedPatients.map((id) => parseInt(id)),
                payment_date: paymentData.payment_date,
                payment_amount: parseFloat(paymentData.payment_amount),
                payment_method: paymentData.payment_method,
                payment_notes: paymentData.payment_notes,
                primary_patient_id: parseInt(paymentData.primary_patient_id),
            };

            const response = await axios.post(
                '/clinic/patient-payments/account-payment',
                payload,
            );

            if (response.data.success) {
                const paymentAmount = response.data.data.payment_amount;
                const coveredCount = response.data.covered_patients_count;

                toast.success(
                    `Payment of ${formatCurrency(paymentAmount)} recorded successfully for ${coveredCount} patient(s)`,
                );

                // Reset form
                setSelectedPatients([]);
                setPaymentData({
                    payment_date: format(new Date(), 'yyyy-MM-dd'),
                    payment_amount: '',
                    payment_method: 'cash',
                    payment_notes: '',
                    primary_patient_id: '',
                });

                onPaymentRecorded();
                onClose();
            }
        } catch (error: any) {
            console.error('Failed to record account payment:', error);
            toast.error(
                error.response?.data?.message || 'Failed to record payment',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <CreditCard className="mr-2 h-5 w-5" />
                        Record Account Payment
                    </DialogTitle>
                    <DialogDescription>
                        Record a payment for multiple patients under{' '}
                        {account.account_name}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Patient Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg">
                                <Users className="mr-2 h-5 w-5" />
                                Select Patients
                            </CardTitle>
                            <CardDescription>
                                Choose which patients this payment covers
                            </CardDescription>
                            {patients.length > 0 && (
                                <div className="flex space-x-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSelectAll}
                                    >
                                        Select All
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDeselectAll}
                                    >
                                        Deselect All
                                    </Button>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent>
                            {patients.length === 0 ? (
                                <div className="py-8 text-center">
                                    <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                    <h3 className="mb-2 text-lg font-semibold">
                                        No patients assigned
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Assign patients to this account first
                                        before recording payments
                                    </p>
                                </div>
                            ) : (
                                <div className="max-h-60 space-y-2 overflow-y-auto">
                                    {patients.map((patient) => (
                                        <div
                                            key={patient.id}
                                            className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-gray-50"
                                        >
                                            <Checkbox
                                                checked={selectedPatients.includes(
                                                    patient.id,
                                                )}
                                                onCheckedChange={() =>
                                                    handlePatientToggle(
                                                        patient.id,
                                                    )
                                                }
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium">
                                                    {patient.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {patient.arn} •{' '}
                                                    {patient.email}
                                                </p>
                                            </div>
                                            {selectedPatients.includes(
                                                patient.id,
                                            ) &&
                                                paymentData.primary_patient_id ===
                                                    patient.id && (
                                                    <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                                        Primary
                                                    </span>
                                                )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {errors.patients && (
                                <p className="mt-2 text-sm text-red-600">
                                    {errors.patients}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Primary Patient Selection */}
                    {selectedPatients.length > 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Primary Patient
                                </CardTitle>
                                <CardDescription>
                                    Select the primary patient to associate this
                                    payment with
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Select
                                    value={paymentData.primary_patient_id}
                                    onValueChange={(value) =>
                                        handleInputChange(
                                            'primary_patient_id',
                                            value,
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select primary patient" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectedPatients.map((patientId) => {
                                            const patient = patients.find(
                                                (p) => p.id === patientId,
                                            );
                                            return patient ? (
                                                <SelectItem
                                                    key={patient.id}
                                                    value={patient.id}
                                                >
                                                    {patient.name} (
                                                    {patient.arn})
                                                </SelectItem>
                                            ) : null;
                                        })}
                                    </SelectContent>
                                </Select>
                                {errors.primary_patient_id && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.primary_patient_id}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Payment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {/* Payment Date */}
                                <div className="space-y-2">
                                    <Label htmlFor="payment_date">
                                        Payment Date *
                                    </Label>
                                    <Input
                                        id="payment_date"
                                        type="date"
                                        value={paymentData.payment_date}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'payment_date',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                </div>

                                {/* Payment Amount */}
                                <div className="space-y-2">
                                    <Label htmlFor="payment_amount">
                                        Payment Amount *
                                    </Label>
                                    <Input
                                        id="payment_amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={paymentData.payment_amount}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'payment_amount',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="0.00"
                                        required
                                    />
                                    {errors.payment_amount && (
                                        <p className="text-sm text-red-600">
                                            {errors.payment_amount}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="space-y-2">
                                <Label htmlFor="payment_method">
                                    Payment Method *
                                </Label>
                                <Select
                                    value={paymentData.payment_method}
                                    onValueChange={(value) =>
                                        handleInputChange(
                                            'payment_method',
                                            value,
                                        )
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {paymentMethods.map((method) => (
                                            <SelectItem
                                                key={method.value}
                                                value={method.value}
                                            >
                                                {method.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.payment_method && (
                                    <p className="text-sm text-red-600">
                                        {errors.payment_method}
                                    </p>
                                )}
                            </div>

                            {/* Payment Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="payment_notes">
                                    Payment Notes
                                </Label>
                                <Textarea
                                    id="payment_notes"
                                    value={paymentData.payment_notes}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'payment_notes',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Optional notes about this payment..."
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Summary */}
                    {selectedPatients.length > 0 &&
                        paymentData.payment_amount && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-lg">
                                        <Calculator className="mr-2 h-5 w-5" />
                                        Payment Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-3">
                                        <div className="rounded-lg border p-4">
                                            <p className="text-2xl font-bold text-blue-600">
                                                {selectedPatients.length}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Patients Covered
                                            </p>
                                        </div>
                                        <div className="rounded-lg border p-4">
                                            <p className="text-2xl font-bold text-green-600">
                                                {formatCurrency(
                                                    parseFloat(
                                                        paymentData.payment_amount,
                                                    ) || 0,
                                                )}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Payment Amount
                                            </p>
                                        </div>
                                        <div className="rounded-lg border p-4">
                                            <p className="text-2xl font-bold capitalize text-purple-600">
                                                {paymentData.payment_method.replace(
                                                    '_',
                                                    ' ',
                                                )}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Payment Method
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || patients.length === 0}
                        >
                            {isSubmitting && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Record Payment
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
