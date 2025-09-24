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
import { Switch } from '@/Components/ui/switch';
import { Textarea } from '@/Components/ui/textarea';
import axios from 'axios';
import { format } from 'date-fns';
import { Calculator, Loader2, Receipt, Users } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { AppCurrency, ClinicPaymentAccount, Patient } from '../types';

interface AccountBillingModalProps {
    account: ClinicPaymentAccount;
    patients: Patient[];
    isOpen: boolean;
    onClose: () => void;
    appCurrency: AppCurrency | null;
    onBillCreated: () => void;
}

export function AccountBillingModal({
    account,
    patients,
    isOpen,
    onClose,
    appCurrency,
    onBillCreated,
}: AccountBillingModalProps) {
    const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
    const [billData, setBillData] = useState({
        bill_date: format(new Date(), 'yyyy-MM-dd'),
        bill_amount: '',
        bill_details: '',
        distribute_amount: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const formatCurrency = (amount: number) => {
        if (!appCurrency) return `$${amount.toFixed(2)}`;
        return `${appCurrency.symbol}${amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const handlePatientToggle = (patientId: string) => {
        setSelectedPatients((prev) =>
            prev.includes(patientId)
                ? prev.filter((id) => id !== patientId)
                : [...prev, patientId],
        );
    };

    const handleSelectAll = () => {
        setSelectedPatients(patients.map((p) => p.id));
    };

    const handleDeselectAll = () => {
        setSelectedPatients([]);
    };

    const handleInputChange = (field: string, value: any) => {
        setBillData((prev) => ({
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

        if (!billData.bill_amount || parseFloat(billData.bill_amount) <= 0) {
            newErrors.bill_amount = 'Please enter a valid bill amount';
        }

        if (!billData.bill_details.trim()) {
            newErrors.bill_details = 'Please enter bill details';
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
                bill_date: billData.bill_date,
                bill_amount: parseFloat(billData.bill_amount),
                bill_details: billData.bill_details,
                distribute_amount: billData.distribute_amount,
            };

            const response = await axios.post(
                '/clinic/patient-bills/account-bill',
                payload,
            );

            if (response.data.success) {
                const billsCreated = response.data.data.length;
                const totalAmount = response.data.total_amount;
                const amountPerPatient = response.data.amount_per_patient;

                toast.success(
                    `${billsCreated} bill(s) created successfully. ` +
                        `Total: ${formatCurrency(totalAmount)}` +
                        (billData.distribute_amount
                            ? ` (${formatCurrency(amountPerPatient)} per patient)`
                            : ''),
                );

                // Reset form
                setSelectedPatients([]);
                setBillData({
                    bill_date: format(new Date(), 'yyyy-MM-dd'),
                    bill_amount: '',
                    bill_details: '',
                    distribute_amount: false,
                });

                onBillCreated();
                onClose();
            }
        } catch (error: any) {
            console.error('Failed to create account bill:', error);
            toast.error(
                error.response?.data?.message || 'Failed to create bill',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculateTotalAmount = () => {
        const amount = parseFloat(billData.bill_amount) || 0;
        if (billData.distribute_amount) {
            return amount;
        } else {
            return amount * selectedPatients.length;
        }
    };

    const calculateAmountPerPatient = () => {
        const amount = parseFloat(billData.bill_amount) || 0;
        if (billData.distribute_amount) {
            return selectedPatients.length > 0
                ? amount / selectedPatients.length
                : 0;
        } else {
            return amount;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <Receipt className="mr-2 h-5 w-5" />
                        Create Account Bill
                    </DialogTitle>
                    <DialogDescription>
                        Create a bill for multiple patients under{' '}
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
                                Choose which patients this bill applies to
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
                                        before creating bills
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

                    {/* Bill Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Bill Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {/* Bill Date */}
                                <div className="space-y-2">
                                    <Label htmlFor="bill_date">
                                        Bill Date *
                                    </Label>
                                    <Input
                                        id="bill_date"
                                        type="date"
                                        value={billData.bill_date}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'bill_date',
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                </div>

                                {/* Bill Amount */}
                                <div className="space-y-2">
                                    <Label htmlFor="bill_amount">
                                        Bill Amount *
                                    </Label>
                                    <Input
                                        id="bill_amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={billData.bill_amount}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'bill_amount',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="0.00"
                                        required
                                    />
                                    {errors.bill_amount && (
                                        <p className="text-sm text-red-600">
                                            {errors.bill_amount}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Amount Distribution */}
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="distribute_amount"
                                    checked={billData.distribute_amount}
                                    onCheckedChange={(checked) =>
                                        handleInputChange(
                                            'distribute_amount',
                                            checked,
                                        )
                                    }
                                />
                                <Label
                                    htmlFor="distribute_amount"
                                    className="text-sm"
                                >
                                    Distribute amount among selected patients
                                </Label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {billData.distribute_amount
                                    ? 'The total amount will be divided equally among selected patients'
                                    : 'Each selected patient will be billed the full amount'}
                            </p>

                            {/* Bill Details */}
                            <div className="space-y-2">
                                <Label htmlFor="bill_details">
                                    Bill Details *
                                </Label>
                                <Textarea
                                    id="bill_details"
                                    value={billData.bill_details}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'bill_details',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Enter bill description or details..."
                                    rows={3}
                                    required
                                />
                                {errors.bill_details && (
                                    <p className="text-sm text-red-600">
                                        {errors.bill_details}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bill Summary */}
                    {selectedPatients.length > 0 && billData.bill_amount && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg">
                                    <Calculator className="mr-2 h-5 w-5" />
                                    Bill Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-3">
                                    <div className="rounded-lg border p-4">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {selectedPatients.length}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Selected Patients
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatCurrency(
                                                calculateAmountPerPatient(),
                                            )}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Amount per Patient
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <p className="text-2xl font-bold text-purple-600">
                                            {formatCurrency(
                                                calculateTotalAmount(),
                                            )}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Total Bill Amount
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
                            Create Bill
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
