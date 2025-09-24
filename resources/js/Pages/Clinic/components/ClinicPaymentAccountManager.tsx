import React, { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Plus, Users, Building2, CreditCard, Eye, Edit, Trash2, PlusCircle, History, Search } from 'lucide-react';
import { ClinicPaymentAccount, Patient, AppCurrency } from '../types';
import { CreateAccountForm } from './CreateAccountForm';
import { AccountDetailsModal } from './AccountDetailsModal';
import { AssignPatientsModal } from './AssignPatientsModal';
import { AccountBillingModal } from './AccountBillingModal';
import { AccountPaymentModal } from './AccountPaymentModal';
import { HistoryDialog } from './HistoryDialog';
import axios from 'axios';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { formatDateTime, formatCurrency } from '../utils';

interface ClinicPaymentAccountManagerProps {
    patients: Patient[];
    appCurrency: AppCurrency | null;
    onAccountCreated?: (account: ClinicPaymentAccount) => void;
    onAccountUpdated?: (account: ClinicPaymentAccount) => void;
    onAccountDeleted?: (accountId: number) => void;
    // Patient billing and payment handlers
    onAddBill?: (patientId: string, amount: number, details: string, billDate?: string) => Promise<{ success: boolean; data?: any; error?: string }>;
    onDeleteBill?: (patientId: string, billId: number) => Promise<{ success: boolean }>;
    onShowBillHistory?: (patient: Patient) => Promise<{ success: boolean; data?: Patient }>;
    onAddPayment?: (patientId: string, amount: number, paymentDate?: string) => Promise<{ success: boolean; data?: any; error?: string }>;
    onDeletePayment?: (patientId: string, paymentId: number) => Promise<{ success: boolean }>;
    onShowPaymentHistory?: (patient: Patient) => Promise<{ success: boolean; data?: Patient }>;
    onPatientsUpdate?: (patients: Patient[]) => void;
}

export function ClinicPaymentAccountManager({
    patients,
    appCurrency,
    onAccountCreated,
    onAccountUpdated,
    onAccountDeleted,
    onAddBill,
    onDeleteBill,
    onShowBillHistory,
    onAddPayment,
    onDeletePayment,
    onShowPaymentHistory,
    onPatientsUpdate
}: ClinicPaymentAccountManagerProps) {
    const [accounts, setAccounts] = useState<ClinicPaymentAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAccount, setSelectedAccount] = useState<ClinicPaymentAccount | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('patient-billing');
    
    // Patient billing state
    const [patientSearchTerm, setPatientSearchTerm] = useState('');
    const [selectedPatientForBilling, setSelectedPatientForBilling] = useState<Patient | null>(null);
    const [selectedPatientForPayment, setSelectedPatientForPayment] = useState<Patient | null>(null);
    const [showingHistoryForPatient, setShowingHistoryForPatient] = useState<Patient | null>(null);
    const [activeHistoryType, setActiveHistoryType] = useState<'bill' | 'payment'>('bill');
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    
    // Bill form state
    const [billAmount, setBillAmount] = useState('');
    const [billDetails, setBillDetails] = useState('');
    const [billDate, setBillDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [isBillDialogOpen, setIsBillDialogOpen] = useState(false);
    
    // Payment form state
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/clinic/payment-accounts');
            if (response.data.success) {
                setAccounts(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch payment accounts:', error);
            toast.error('Failed to load payment accounts');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAccount = async (accountData: any) => {
        console.log('Creating account with data:', accountData);
        try {
            const response = await axios.post('/clinic/payment-accounts', accountData);
            console.log('Account creation response:', response.data);
            if (response.data.success) {
                const newAccount = response.data.data;
                setAccounts(prev => [newAccount, ...prev]);
                setIsCreateModalOpen(false);
                toast.success('Payment account created successfully');
                onAccountCreated?.(newAccount);
            }
        } catch (error: any) {
            console.error('Failed to create payment account:', error);
            toast.error(error.response?.data?.message || 'Failed to create payment account');
            throw error;
        }
    };

    const handleDeleteAccount = async (accountId: number) => {
        const account = accounts.find(acc => acc.id === accountId);
        const hasData = account && (
            (account.patients_count && account.patients_count > 0) ||
            (account.total_bills && account.total_bills > 0) ||
            (account.total_payments && account.total_payments > 0)
        );

        const confirmMessage = hasData 
            ? `This account has ${account?.patients_count || 0} patients and financial data. You must remove all patients and clear all bills/payments before deleting. Continue anyway?`
            : 'Are you sure you want to delete this payment account?';

        if (!confirm(confirmMessage)) {
            return;
        }

        try {
            const response = await axios.delete(`/clinic/payment-accounts/${accountId}`);
            if (response.data.success) {
                setAccounts(prev => prev.filter(account => account.id !== accountId));
                toast.success('Payment account deleted successfully');
                onAccountDeleted?.(accountId);
            } else {
                // Handle API error response
                toast.error(response.data.message || 'Failed to delete payment account');
            }
        } catch (error: any) {
            console.error('Failed to delete payment account:', error);
            
            // Handle different HTTP status codes
            if (error.response?.status === 400) {
                toast.error(error.response.data.message || 'Cannot delete account with associated data');
            } else if (error.response?.status === 404) {
                toast.error('Account not found');
            } else {
                toast.error(error.response?.data?.message || 'Failed to delete payment account');
            }
        }
    };

    const handleViewDetails = async (account: ClinicPaymentAccount) => {
        console.log('Viewing details for account:', account.id);
        try {
            const response = await axios.get(`/clinic/payment-accounts/${account.id}`);
            console.log('Account details response:', response.data);
            if (response.data.success) {
                setSelectedAccount(response.data.data);
                setIsDetailsModalOpen(true);
            }
        } catch (error) {
            console.error('Failed to fetch account details:', error);
            toast.error('Failed to load account details');
        }
    };

    // Patient billing handlers
    const handleShowBillHistory = async (patient: Patient) => {
        if (onShowBillHistory) {
            setIsLoadingHistory(true);
            const result = await onShowBillHistory(patient);
            if (result.success && result.data) {
                setShowingHistoryForPatient(result.data);
                setActiveHistoryType('bill');
            }
            setIsLoadingHistory(false);
        }
    };

    const handleShowPaymentHistory = async (patient: Patient) => {
        if (onShowPaymentHistory) {
            setIsLoadingHistory(true);
            const result = await onShowPaymentHistory(patient);
            if (result.success && result.data) {
                setShowingHistoryForPatient(result.data);
                setActiveHistoryType('payment');
            }
            setIsLoadingHistory(false);
        }
    };

    const handleAddBill = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatientForBilling || !onAddBill) return;
        
        const amount = parseFloat(billAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid bill amount.');
            return;
        }
        
        const result = await onAddBill(selectedPatientForBilling.id, amount, billDetails, billDate);
        if (result.success) {
            setBillAmount('');
            setBillDetails('');
            setBillDate(format(new Date(), 'yyyy-MM-dd'));
            setIsBillDialogOpen(false);
            setSelectedPatientForBilling(null);
            toast.success('Bill added successfully');
        } else {
            toast.error(result.error || 'Failed to add bill');
        }
    };

    const handleAddPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatientForPayment || !onAddPayment) return;
        
        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Please enter a valid payment amount.');
            return;
        }
        
        const result = await onAddPayment(selectedPatientForPayment.id, amount, paymentDate);
        if (result.success) {
            setPaymentAmount('');
            setPaymentDate(format(new Date(), 'yyyy-MM-dd'));
            setIsPaymentDialogOpen(false);
            setSelectedPatientForPayment(null);
            toast.success('Payment recorded successfully');
        } else {
            toast.error(result.error || 'Failed to record payment');
        }
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'active': return 'default';
            case 'inactive': return 'secondary';
            case 'suspended': return 'destructive';
            default: return 'outline';
        }
    };

    const getAccountTypeIcon = (type: string) => {
        return type === 'company' ? <Building2 className="h-4 w-4" /> : <Users className="h-4 w-4" />;
    };

    const filteredAccounts = accounts.filter(account => {
        if (activeTab === 'group') return account.account_type === 'group';
        if (activeTab === 'company') return account.account_type === 'company';
        return true;
    });

    const formatCurrencyAmount = (amount: number) => {
        if (!appCurrency) return `$${amount.toFixed(2)}`;
        return `${appCurrency.symbol}${amount.toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        })}`;
    };

    // Calculate account counts for badges
    const groupCount = accounts.filter(acc => acc.account_type === 'group').length;
    const companyCount = accounts.filter(acc => acc.account_type === 'company').length;
    const patientCount = patients.length;

    // Loading skeleton component for tab content
    const LoadingSkeleton = () => (
        <div className="space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Payment Accounts</h2>
                    <p className="text-muted-foreground">
                        Manage individual patient billing and group/company payment accounts
                    </p>
                </div>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Account
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create Payment Account</DialogTitle>
                            <DialogDescription>
                                Create a new group or company payment account
                            </DialogDescription>
                        </DialogHeader>
                        <CreateAccountForm 
                            onSubmit={handleCreateAccount}
                            onCancel={() => setIsCreateModalOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
                    <TabsTrigger 
                        value="patient-billing"
                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400"
                    >
                        <CreditCard className="h-4 w-4" />
                        <span>Individual</span>
                        <Badge variant="secondary" className="ml-1 px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                            {patientCount}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger 
                        value="group"
                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400"
                    >
                        <Users className="h-4 w-4" />
                        <span>Groups</span>
                        <Badge variant="secondary" className="ml-1 px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                            {groupCount}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger 
                        value="company"
                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-blue-400"
                    >
                        <Building2 className="h-4 w-4" />
                        <span>Companies</span>
                        <Badge variant="secondary" className="ml-1 px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                            {companyCount}
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="patient-billing" className="space-y-6 mt-0">
                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Individual Patient Billing</h3>
                            <p className="text-muted-foreground mt-1">Manage bills and payments for individual patients</p>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <Input
                                placeholder="Search patients..."
                                value={patientSearchTerm}
                                onChange={(e) => setPatientSearchTerm(e.target.value)}
                                className="pl-8 w-full bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 dark:bg-gray-700">
                                        <TableHead className="text-gray-900 dark:text-white">ARN</TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">Name</TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">Total Bills</TableHead>
                                        <TableHead className="text-gray-900 dark:text-white">Balance</TableHead>
                                        <TableHead className="text-right text-gray-900 dark:text-white">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {patients
                                        .filter(patient => 
                                            patient.name.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
                                            (patient.arn && patient.arn.toLowerCase().includes(patientSearchTerm.toLowerCase()))
                                        )
                                        .map((patient) => (
                                        <TableRow key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {patient.arn || 'Not Set'}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">{patient.name}</TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {formatCurrency(patient.total_bills, appCurrency?.symbol || '$')}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                {formatCurrency(patient.balance, appCurrency?.symbol || '$')}
                                            </TableCell>
                                            <TableCell className="text-gray-900 dark:text-white">
                                                <div className="flex justify-end gap-2 flex-wrap">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        onClick={() => {
                                                            setSelectedPatientForBilling(patient);
                                                            setIsBillDialogOpen(true);
                                                        }}
                                                    >
                                                        <PlusCircle className="h-4 w-4 mr-1" /> Add Bill
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        onClick={() => handleShowBillHistory(patient)}
                                                    >
                                                        <History className="h-4 w-4 mr-1" /> Bill History
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        onClick={() => {
                                                            setSelectedPatientForPayment(patient);
                                                            setIsPaymentDialogOpen(true);
                                                        }}
                                                    >
                                                        <PlusCircle className="h-4 w-4 mr-1" /> Add Payment
                                                    </Button>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm" 
                                                        onClick={() => handleShowPaymentHistory(patient)}
                                                    >
                                                        <History className="h-4 w-4 mr-1" /> Payment History
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="group" className="space-y-6 mt-0">
                    {loading ? (
                        <LoadingSkeleton />
                    ) : filteredAccounts.filter(acc => acc.account_type === 'group').length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No group accounts found</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    Create your first group payment account
                                </p>
                                <Button onClick={() => setIsCreateModalOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Group Account
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredAccounts.filter(acc => acc.account_type === 'group').map((account) => (
                                <Card key={account.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-2">
                                                {getAccountTypeIcon(account.account_type)}
                                                <div>
                                                    <CardTitle className="text-lg">{account.account_name}</CardTitle>
                                                    <CardDescription className="font-mono text-xs">
                                                        {account.account_code}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <Badge variant={getStatusBadgeVariant(account.status)}>
                                                {account.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Type</p>
                                                <p className="font-medium capitalize">{account.account_type}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Patients</p>
                                                <p className="font-medium">{account.patients_count || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Outstanding</p>
                                                <p className="font-medium text-red-600">
                                                    {formatCurrencyAmount(account.total_outstanding || 0)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Contact</p>
                                                <p className="font-medium truncate">
                                                    {account.contact_person || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex space-x-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => handleViewDetails(account)}
                                                className="flex-1"
                                            >
                                                <Eye className="mr-1 h-3 w-3" />
                                                View
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedAccount(account);
                                                    setIsAssignModalOpen(true);
                                                }}
                                            >
                                                <Users className="mr-1 h-3 w-3" />
                                                Assign
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleDeleteAccount(account.id)}
                                            >
                                                <Trash2 className="mr-1 h-3 w-3" />
                                            </Button>
                                        </div>

                                        <div className="flex space-x-2">
                                            <Button 
                                                size="sm" 
                                                className="flex-1"
                                                onClick={() => {
                                                    setSelectedAccount(account);
                                                    setIsBillingModalOpen(true);
                                                }}
                                            >
                                                Create Bill
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="secondary"
                                                className="flex-1"
                                                onClick={() => {
                                                    setSelectedAccount(account);
                                                    setIsPaymentModalOpen(true);
                                                }}
                                            >
                                                Record Payment
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="company" className="space-y-6 mt-0">
                    {loading ? (
                        <LoadingSkeleton />
                    ) : filteredAccounts.filter(acc => acc.account_type === 'company').length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No company accounts found</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    Create your first company payment account
                                </p>
                                <Button onClick={() => setIsCreateModalOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Company Account
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredAccounts.filter(acc => acc.account_type === 'company').map((account) => (
                                <Card key={account.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center space-x-2">
                                                {getAccountTypeIcon(account.account_type)}
                                                <div>
                                                    <CardTitle className="text-lg">{account.account_name}</CardTitle>
                                                    <CardDescription className="font-mono text-xs">
                                                        {account.account_code}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <Badge variant={getStatusBadgeVariant(account.status)}>
                                                {account.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Type</p>
                                                <p className="font-medium capitalize">{account.account_type}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Patients</p>
                                                <p className="font-medium">{account.patients_count || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Outstanding</p>
                                                <p className="font-medium text-red-600">
                                                    {formatCurrencyAmount(account.total_outstanding || 0)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Contact</p>
                                                <p className="font-medium truncate">
                                                    {account.contact_person || 'N/A'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex space-x-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => handleViewDetails(account)}
                                                className="flex-1"
                                            >
                                                <Eye className="mr-1 h-3 w-3" />
                                                View
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedAccount(account);
                                                    setIsAssignModalOpen(true);
                                                }}
                                            >
                                                <Users className="mr-1 h-3 w-3" />
                                                Assign
                                            </Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleDeleteAccount(account.id)}
                                            >
                                                <Trash2 className="mr-1 h-3 w-3" />
                                            </Button>
                                        </div>

                                        <div className="flex space-x-2">
                                            <Button 
                                                size="sm" 
                                                className="flex-1"
                                                onClick={() => {
                                                    setSelectedAccount(account);
                                                    setIsBillingModalOpen(true);
                                                }}
                                            >
                                                Create Bill
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="secondary"
                                                className="flex-1"
                                                onClick={() => {
                                                    setSelectedAccount(account);
                                                    setIsPaymentModalOpen(true);
                                                }}
                                            >
                                                Record Payment
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Patient Bill Dialog */}
            <Dialog open={isBillDialogOpen} onOpenChange={(open) => {
                setIsBillDialogOpen(open);
                if (!open) {
                    setSelectedPatientForBilling(null);
                    setBillAmount('');
                    setBillDetails('');
                    setBillDate(format(new Date(), 'yyyy-MM-dd'));
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Add Bill {selectedPatientForBilling && `for ${selectedPatientForBilling.name}`}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddBill} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="billDate">Bill Date *</Label>
                                <Input
                                    id="billDate"
                                    type="date"
                                    value={billDate}
                                    onChange={(e) => setBillDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="billAmount">Bill Amount ({appCurrency?.symbol || '$'}) *</Label>
                                <Input
                                    id="billAmount"
                                    type="number"
                                    step="0.01"
                                    value={billAmount}
                                    onChange={(e) => setBillAmount(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="billDetails">Bill Details *</Label>
                            <Textarea
                                id="billDetails"
                                value={billDetails}
                                onChange={(e) => setBillDetails(e.target.value)}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsBillDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Add Bill</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Patient Payment Dialog */}
            <Dialog open={isPaymentDialogOpen} onOpenChange={(open) => {
                setIsPaymentDialogOpen(open);
                if (!open) {
                    setSelectedPatientForPayment(null);
                    setPaymentAmount('');
                    setPaymentDate(format(new Date(), 'yyyy-MM-dd'));
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Record Payment {selectedPatientForPayment && `for ${selectedPatientForPayment.name}`}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddPayment} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="paymentDate">Payment Date *</Label>
                                <Input
                                    id="paymentDate"
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="paymentAmount">Payment Amount ({appCurrency?.symbol || '$'}) *</Label>
                                <Input
                                    id="paymentAmount"
                                    type="number"
                                    step="0.01"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Record Payment</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* History Dialog */}
            <HistoryDialog
                isOpen={!!showingHistoryForPatient}
                onClose={() => setShowingHistoryForPatient(null)}
                patient={showingHistoryForPatient}
                historyType={activeHistoryType}
                isLoading={isLoadingHistory}
                currency={appCurrency?.symbol || '$'}
                canDelete={true}
                onDeleteBill={onDeleteBill ? (patientId: string, billId: number) => {
                    onDeleteBill(patientId, billId).then((result) => {
                        if (result.success) {
                            toast.success('Bill deleted successfully');
                            // Refresh history
                            if (showingHistoryForPatient && onShowBillHistory) {
                                onShowBillHistory(showingHistoryForPatient).then((refreshResult) => {
                                    if (refreshResult.success && refreshResult.data) {
                                        setShowingHistoryForPatient(refreshResult.data);
                                    }
                                });
                            }
                        }
                    });
                } : () => {}}
                onDeletePayment={onDeletePayment ? (patientId: string, paymentId: number) => {
                    onDeletePayment(patientId, paymentId).then((result) => {
                        if (result.success) {
                            toast.success('Payment deleted successfully');
                            // Refresh history
                            if (showingHistoryForPatient && onShowPaymentHistory) {
                                onShowPaymentHistory(showingHistoryForPatient).then((refreshResult) => {
                                    if (refreshResult.success && refreshResult.data) {
                                        setShowingHistoryForPatient(refreshResult.data);
                                    }
                                });
                            }
                        }
                    });
                } : () => {}}
                onDeleteCheckup={() => {}}
            />

            {/* Account Management Modals */}
            {selectedAccount && (
                <>
                    <AccountDetailsModal
                        account={selectedAccount}
                        isOpen={isDetailsModalOpen}
                        onClose={() => {
                            setIsDetailsModalOpen(false);
                            setSelectedAccount(null);
                        }}
                        appCurrency={appCurrency}
                        onAccountUpdated={(updatedAccount) => {
                            setAccounts(prev => prev.map(acc => 
                                acc.id === updatedAccount.id ? updatedAccount : acc
                            ));
                            onAccountUpdated?.(updatedAccount);
                        }}
                    />

                    <AssignPatientsModal
                        account={selectedAccount}
                        patients={patients}
                        isOpen={isAssignModalOpen}
                        onClose={() => {
                            setIsAssignModalOpen(false);
                            setSelectedAccount(null);
                        }}
                        onPatientsAssigned={() => {
                            fetchAccounts();
                        }}
                    />

                    <AccountBillingModal
                        account={selectedAccount}
                        patients={patients.filter(p => p.clinic_payment_account_id === selectedAccount.id)}
                        isOpen={isBillingModalOpen}
                        onClose={() => {
                            setIsBillingModalOpen(false);
                            setSelectedAccount(null);
                        }}
                        appCurrency={appCurrency}
                        onBillCreated={() => {
                            fetchAccounts();
                        }}
                    />

                    <AccountPaymentModal
                        account={selectedAccount}
                        patients={patients.filter(p => p.clinic_payment_account_id === selectedAccount.id)}
                        isOpen={isPaymentModalOpen}
                        onClose={() => {
                            setIsPaymentModalOpen(false);
                            setSelectedAccount(null);
                        }}
                        appCurrency={appCurrency}
                        onPaymentRecorded={() => {
                            fetchAccounts();
                        }}
                    />
                </>
            )}
        </div>
    );
}
