import React, { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { Plus, Users, Building2, CreditCard, Eye, Edit, Trash2 } from 'lucide-react';
import { ClinicPaymentAccount, Patient, AppCurrency } from '../types';
import { CreateAccountForm } from './CreateAccountForm';
import { AccountDetailsModal } from './AccountDetailsModal';
import { AssignPatientsModal } from './AssignPatientsModal';
import { AccountBillingModal } from './AccountBillingModal';
import { AccountPaymentModal } from './AccountPaymentModal';
import axios from 'axios';
import { toast } from 'sonner';

interface ClinicPaymentAccountManagerProps {
    patients: Patient[];
    appCurrency: AppCurrency | null;
    onAccountCreated?: (account: ClinicPaymentAccount) => void;
    onAccountUpdated?: (account: ClinicPaymentAccount) => void;
    onAccountDeleted?: (accountId: number) => void;
}

export function ClinicPaymentAccountManager({
    patients,
    appCurrency,
    onAccountCreated,
    onAccountUpdated,
    onAccountDeleted
}: ClinicPaymentAccountManagerProps) {
    const [accounts, setAccounts] = useState<ClinicPaymentAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAccount, setSelectedAccount] = useState<ClinicPaymentAccount | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('all');

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
        if (activeTab === 'all') return true;
        if (activeTab === 'group') return account.account_type === 'group';
        if (activeTab === 'company') return account.account_type === 'company';
        return true;
    });

    const formatCurrency = (amount: number) => {
        if (!appCurrency) return `$${amount.toFixed(2)}`;
        return `${appCurrency.symbol}${amount.toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        })}`;
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Payment Accounts</h2>
                    <p className="text-muted-foreground">
                        Manage group and company payment accounts
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
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All Accounts</TabsTrigger>
                    <TabsTrigger value="group">Groups</TabsTrigger>
                    <TabsTrigger value="company">Companies</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4">
                    {filteredAccounts.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No payment accounts found</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    Create your first payment account to manage group or company billing
                                </p>
                                <Button onClick={() => setIsCreateModalOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Account
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {filteredAccounts.map((account) => (
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
                                                    {formatCurrency(account.total_outstanding || 0)}
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

            {/* Modals */}
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
