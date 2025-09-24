import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import axios from 'axios';
import { format } from 'date-fns';
import {
    Building2,
    CreditCard,
    DollarSign,
    Edit2,
    Mail,
    MapPin,
    Phone,
    Users,
    X,
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { AppCurrency, ClinicPaymentAccount } from '../types';

interface AccountDetailsModalProps {
    account: ClinicPaymentAccount;
    isOpen: boolean;
    onClose: () => void;
    appCurrency: AppCurrency | null;
    onAccountUpdated: (account: ClinicPaymentAccount) => void;
}

export function AccountDetailsModal({
    account,
    isOpen,
    onClose,
    appCurrency,
    onAccountUpdated,
}: AccountDetailsModalProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [editingBillId, setEditingBillId] = useState<number | null>(null);
    const [updatingBillId, setUpdatingBillId] = useState<number | null>(null);

    // Debug logging
    React.useEffect(() => {
        if (account && isOpen) {
            console.log('AccountDetailsModal - Account data:', account);
            console.log('AccountDetailsModal - Bills:', account.bills);
            console.log('AccountDetailsModal - Payments:', account.payments);
        }
    }, [account, isOpen]);

    const formatCurrency = (amount: number) => {
        if (!appCurrency) return `$${amount.toFixed(2)}`;
        return `${appCurrency.symbol}${amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'active':
                return 'default';
            case 'inactive':
                return 'secondary';
            case 'suspended':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch {
            return dateString;
        }
    };

    const handleBillStatusUpdate = async (
        billId: number,
        newStatus: string,
    ) => {
        setUpdatingBillId(billId);
        try {
            const response = await axios.put(
                `/clinic/patient-bills/${billId}/status`,
                {
                    bill_status: newStatus,
                },
            );

            if (response.data.success) {
                toast.success(`Bill status updated to ${newStatus}`);
                setEditingBillId(null);

                // Update the account data to reflect the change
                const updatedAccount = {
                    ...account,
                    bills: account.bills?.map((bill) =>
                        bill.id === billId
                            ? { ...bill, bill_status: newStatus }
                            : bill,
                    ),
                };
                onAccountUpdated(updatedAccount);
            }
        } catch (error: any) {
            console.error('Failed to update bill status:', error);
            toast.error(
                error.response?.data?.message || 'Failed to update bill status',
            );
        } finally {
            setUpdatingBillId(null);
        }
    };

    const getBillStatusOptions = () => [
        { value: 'pending', label: 'Pending' },
        { value: 'paid', label: 'Paid' },
        { value: 'partial', label: 'Partial' },
        { value: 'overdue', label: 'Overdue' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            {account.account_type === 'company' ? (
                                <Building2 className="h-6 w-6" />
                            ) : (
                                <Users className="h-6 w-6" />
                            )}
                            <div>
                                <DialogTitle className="text-xl">
                                    {account.account_name}
                                </DialogTitle>
                                <DialogDescription className="font-mono">
                                    {account.account_code}
                                </DialogDescription>
                            </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(account.status)}>
                            {account.status}
                        </Badge>
                    </div>
                </DialogHeader>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="patients">Patients</TabsTrigger>
                        <TabsTrigger value="bills">Bills</TabsTrigger>
                        <TabsTrigger value="payments">Payments</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Account Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Account Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Type
                                        </p>
                                        <p className="font-medium capitalize">
                                            {account.account_type}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Status
                                        </p>
                                        <Badge
                                            variant={getStatusBadgeVariant(
                                                account.status,
                                            )}
                                        >
                                            {account.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Created
                                        </p>
                                        <p className="font-medium">
                                            {formatDate(account.created_at)}
                                        </p>
                                    </div>
                                    {account.description && (
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Description
                                            </p>
                                            <p className="font-medium">
                                                {account.description}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Contact Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        Contact Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {account.contact_person && (
                                        <div className="flex items-center space-x-3">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Contact Person
                                                </p>
                                                <p className="font-medium">
                                                    {account.contact_person}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {account.contact_email && (
                                        <div className="flex items-center space-x-3">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Email
                                                </p>
                                                <p className="font-medium">
                                                    {account.contact_email}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {account.contact_phone && (
                                        <div className="flex items-center space-x-3">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Phone
                                                </p>
                                                <p className="font-medium">
                                                    {account.contact_phone}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {account.address && (
                                        <div className="flex items-start space-x-3">
                                            <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    Address
                                                </p>
                                                <p className="font-medium">
                                                    {account.address}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Financial Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg">
                                    <DollarSign className="mr-2 h-5 w-5" />
                                    Financial Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-4">
                                    <div className="rounded-lg border p-4 text-center">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {formatCurrency(
                                                account.bills?.reduce(
                                                    (sum: number, bill: any) =>
                                                        sum +
                                                        (parseFloat(
                                                            bill.bill_amount,
                                                        ) || 0),
                                                    0,
                                                ) ||
                                                    account.total_bills ||
                                                    0,
                                            )}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Total Bills
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-4 text-center">
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatCurrency(
                                                account.payments?.reduce(
                                                    (
                                                        sum: number,
                                                        payment: any,
                                                    ) =>
                                                        sum +
                                                        (parseFloat(
                                                            payment.payment_amount,
                                                        ) || 0),
                                                    0,
                                                ) ||
                                                    account.total_payments ||
                                                    0,
                                            )}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Total Payments
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-4 text-center">
                                        <p className="text-2xl font-bold text-red-600">
                                            {formatCurrency(
                                                (() => {
                                                    const totalBills =
                                                        account.bills?.reduce(
                                                            (
                                                                sum: number,
                                                                bill: any,
                                                            ) =>
                                                                sum +
                                                                (parseFloat(
                                                                    bill.bill_amount,
                                                                ) || 0),
                                                            0,
                                                        ) ||
                                                        account.total_bills ||
                                                        0;
                                                    const totalPayments =
                                                        account.payments?.reduce(
                                                            (
                                                                sum: number,
                                                                payment: any,
                                                            ) =>
                                                                sum +
                                                                (parseFloat(
                                                                    payment.payment_amount,
                                                                ) || 0),
                                                            0,
                                                        ) ||
                                                        account.total_payments ||
                                                        0;
                                                    return Math.max(
                                                        0,
                                                        totalBills -
                                                            totalPayments,
                                                    );
                                                })(),
                                            )}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Outstanding
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-4 text-center">
                                        <p className="text-2xl font-bold text-purple-600">
                                            {formatCurrency(
                                                account.credit_limit || 0,
                                            )}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Credit Limit
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="patients" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Associated Patients</CardTitle>
                                <CardDescription>
                                    Patients linked to this payment account
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {account.patients &&
                                account.patients.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>ARN</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Phone</TableHead>
                                                <TableHead>
                                                    Billing Type
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {account.patients.map((patient) => (
                                                <TableRow key={patient.id}>
                                                    <TableCell className="font-medium">
                                                        {patient.name}
                                                    </TableCell>
                                                    <TableCell className="font-mono">
                                                        {patient.arn}
                                                    </TableCell>
                                                    <TableCell>
                                                        {patient.email}
                                                    </TableCell>
                                                    <TableCell>
                                                        {patient.phone}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                patient.billing_type ===
                                                                'account'
                                                                    ? 'default'
                                                                    : 'secondary'
                                                            }
                                                        >
                                                            {
                                                                patient.billing_type
                                                            }
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="py-8 text-center">
                                        <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                        <h3 className="mb-2 text-lg font-semibold">
                                            No patients assigned
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Assign patients to this account to
                                            start group billing
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="bills" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Bills</CardTitle>
                                <CardDescription>
                                    Bills associated with this payment account
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {account.bills && account.bills.length > 0 ? (
                                    <div className="space-y-4">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>
                                                        Bill Reference
                                                    </TableHead>
                                                    <TableHead>
                                                        Patient
                                                    </TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>
                                                        Amount
                                                    </TableHead>
                                                    <TableHead>
                                                        Status
                                                    </TableHead>
                                                    <TableHead>
                                                        Actions
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {account.bills.map(
                                                    (bill: any) => (
                                                        <TableRow key={bill.id}>
                                                            <TableCell className="font-mono">
                                                                {bill.account_bill_reference ||
                                                                    bill.bill_number ||
                                                                    `BILL-${bill.id}`}
                                                            </TableCell>
                                                            <TableCell>
                                                                {bill.patient
                                                                    ?.name ||
                                                                    'Unknown Patient'}
                                                            </TableCell>
                                                            <TableCell>
                                                                {formatDate(
                                                                    bill.bill_date,
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="font-medium">
                                                                {formatCurrency(
                                                                    parseFloat(
                                                                        bill.bill_amount,
                                                                    ) || 0,
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {editingBillId ===
                                                                bill.id ? (
                                                                    <div className="flex items-center space-x-2">
                                                                        <Select
                                                                            value={
                                                                                bill.bill_status ||
                                                                                'pending'
                                                                            }
                                                                            onValueChange={(
                                                                                newStatus,
                                                                            ) =>
                                                                                handleBillStatusUpdate(
                                                                                    bill.id,
                                                                                    newStatus,
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                updatingBillId ===
                                                                                bill.id
                                                                            }
                                                                        >
                                                                            <SelectTrigger className="w-32">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {getBillStatusOptions().map(
                                                                                    (
                                                                                        option,
                                                                                    ) => (
                                                                                        <SelectItem
                                                                                            key={
                                                                                                option.value
                                                                                            }
                                                                                            value={
                                                                                                option.value
                                                                                            }
                                                                                        >
                                                                                            {
                                                                                                option.label
                                                                                            }
                                                                                        </SelectItem>
                                                                                    ),
                                                                                )}
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={() =>
                                                                                setEditingBillId(
                                                                                    null,
                                                                                )
                                                                            }
                                                                            disabled={
                                                                                updatingBillId ===
                                                                                bill.id
                                                                            }
                                                                        >
                                                                            <X className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    <Badge
                                                                        variant={
                                                                            bill.bill_status ===
                                                                            'paid'
                                                                                ? 'default'
                                                                                : bill.bill_status ===
                                                                                    'overdue'
                                                                                  ? 'destructive'
                                                                                  : bill.bill_status ===
                                                                                      'partial'
                                                                                    ? 'secondary'
                                                                                    : 'secondary'
                                                                        }
                                                                    >
                                                                        {bill.bill_status ||
                                                                            'pending'}
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {editingBillId ===
                                                                bill.id ? (
                                                                    <span className="text-xs text-muted-foreground">
                                                                        Select
                                                                        status
                                                                        above
                                                                    </span>
                                                                ) : (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() =>
                                                                            setEditingBillId(
                                                                                bill.id,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            updatingBillId ===
                                                                            bill.id
                                                                        }
                                                                    >
                                                                        <Edit2 className="h-3 w-3" />
                                                                    </Button>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )}
                                            </TableBody>
                                        </Table>
                                        <div className="border-t pt-4">
                                            <div className="flex justify-between text-sm">
                                                <span>Total Bills:</span>
                                                <span className="font-medium">
                                                    {formatCurrency(
                                                        account.bills.reduce(
                                                            (
                                                                sum: number,
                                                                bill: any,
                                                            ) =>
                                                                sum +
                                                                (parseFloat(
                                                                    bill.bill_amount,
                                                                ) || 0),
                                                            0,
                                                        ),
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <CreditCard className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                        <h3 className="mb-2 text-lg font-semibold">
                                            No bills found
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Create bills for this account to see
                                            them here
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="payments" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Payments</CardTitle>
                                <CardDescription>
                                    Payments made for this account
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {account.payments &&
                                account.payments.length > 0 ? (
                                    <div className="space-y-4">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>
                                                        Payment Reference
                                                    </TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>
                                                        Amount
                                                    </TableHead>
                                                    <TableHead>
                                                        Method
                                                    </TableHead>
                                                    <TableHead>
                                                        Patients Covered
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {account.payments.map(
                                                    (payment: any) => (
                                                        <TableRow
                                                            key={payment.id}
                                                        >
                                                            <TableCell className="font-mono">
                                                                {payment.account_payment_reference ||
                                                                    `PAY-${payment.id}`}
                                                            </TableCell>
                                                            <TableCell>
                                                                {formatDate(
                                                                    payment.payment_date,
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="font-medium text-green-600">
                                                                {formatCurrency(
                                                                    parseFloat(
                                                                        payment.payment_amount,
                                                                    ) || 0,
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="capitalize">
                                                                {payment.payment_method?.replace(
                                                                    '_',
                                                                    ' ',
                                                                ) || 'cash'}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline">
                                                                    {payment
                                                                        .covered_patients
                                                                        ?.length ||
                                                                        1}{' '}
                                                                    patient(s)
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )}
                                            </TableBody>
                                        </Table>
                                        <div className="border-t pt-4">
                                            <div className="flex justify-between text-sm">
                                                <span>Total Payments:</span>
                                                <span className="font-medium text-green-600">
                                                    {formatCurrency(
                                                        account.payments.reduce(
                                                            (
                                                                sum: number,
                                                                payment: any,
                                                            ) =>
                                                                sum +
                                                                (parseFloat(
                                                                    payment.payment_amount,
                                                                ) || 0),
                                                            0,
                                                        ),
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <DollarSign className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                        <h3 className="mb-2 text-lg font-semibold">
                                            No payments found
                                        </h3>
                                        <p className="text-muted-foreground">
                                            Record payments for this account to
                                            see them here
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-4 pt-4">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
