import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Calendar, Clock, History, Users } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { EmployeesTab } from './components/EmployeesTab';
import { PayrollDialog } from './components/PayrollDialog';
import { PayrollOverview } from './components/PayrollOverview';
import { PayrollPeriodsTab } from './components/PayrollPeriodsTab';
import { PayrollPeriodDialog } from './components/PayrollPeriodDialog';
import { SalaryHistoryTab } from './components/SalaryHistoryTab';
import { SalaryHistoryDialog } from './components/SalaryHistoryDialog';
import { TimeTrackingTab } from './components/TimeTrackingTab';
import { TimeTrackingDialog } from './components/TimeTrackingDialog';
import { usePayrollData } from './hooks/usePayrollData';
import { PayrollProps } from './types';

function PayrollContent({ currency_symbol = '$', auth }: PayrollProps) {
    const {
        payrolls,
        salaryHistory,
        payrollPeriods,
        timeTracking,
        loading,
        loadPayrolls,
    } = usePayrollData();

    // Debug logging
    console.log('Payroll data:', { payrolls, salaryHistory, payrollPeriods, timeTracking, loading });

    // Dialog states
    const [isPayrollDialogOpen, setIsPayrollDialogOpen] = useState(false);
    const [isSalaryHistoryDialogOpen, setIsSalaryHistoryDialogOpen] =
        useState(false);
    const [isPayrollPeriodDialogOpen, setIsPayrollPeriodDialogOpen] =
        useState(false);
    const [isTimeTrackingDialogOpen, setIsTimeTrackingDialogOpen] =
        useState(false);

    // Current items for editing
    const [currentPayroll, setCurrentPayroll] = useState<any>(null);
    const [currentSalaryHistory, setCurrentSalaryHistory] = useState<any>(null);
    const [currentPayrollPeriod, setCurrentPayrollPeriod] = useState<any>(null);
    const [currentTimeTracking, setCurrentTimeTracking] = useState<any>(null);

    // Selection and pagination
    const [selectedPayrolls, setSelectedPayrolls] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Permission checks
    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    const canDelete = useMemo(() => {
        if (auth.selectedTeamMember) {
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager')
            );
        }
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    // Event handlers
    const handleAddPayroll = () => {
        setCurrentPayroll(null);
        setIsPayrollDialogOpen(true);
    };

    const handleEditPayroll = (payroll: any) => {
        setCurrentPayroll(payroll);
        setIsPayrollDialogOpen(true);
    };

    const handleDeletePayroll = async (id: number) => {
        try {
            await axios.delete(`/payroll/${id}`);
            loadPayrolls();
        } catch (error) {
            console.error('Error deleting payroll:', error);
        }
    };

    const handleDeleteSelectedPayrolls = async () => {
        try {
            await axios.delete('/payroll/bulk', {
                data: { ids: selectedPayrolls },
            });
            loadPayrolls();
            setSelectedPayrolls([]);
        } catch (error) {
            console.error('Error deleting selected payrolls:', error);
        }
    };

    const handleSavePayroll = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentPayroll) {
                if (currentPayroll.id) {
                    await axios.put(
                        `/payroll/${currentPayroll.id}`,
                        currentPayroll,
                    );
                } else {
                    await axios.post('/payroll', currentPayroll);
                }
                loadPayrolls();
                setIsPayrollDialogOpen(false);
                setCurrentPayroll(null);
            }
        } catch (error) {
            console.error('Error saving payroll:', error);
        }
    };

    const togglePayrollSelection = (id: number) => {
        setSelectedPayrolls((prev) =>
            prev.includes(id)
                ? prev.filter((payrollId) => payrollId !== id)
                : [...prev, id],
        );
    };

    const handleSelectAllPayrolls = (payrolls: any[], selected: boolean) => {
        if (selected) {
            setSelectedPayrolls(payrolls.map((payroll) => payroll.id));
        } else {
            setSelectedPayrolls([]);
        }
    };

    const handleAddSalaryHistory = () => {
        setCurrentSalaryHistory(null);
        setIsSalaryHistoryDialogOpen(true);
    };

    const handleAddPayrollPeriod = () => {
        setCurrentPayrollPeriod(null);
        setIsPayrollPeriodDialogOpen(true);
    };

    const handleAddTimeTracking = () => {
        setCurrentTimeTracking(null);
        setIsTimeTrackingDialogOpen(true);
    };

    const handleSaveSalaryHistory = async (data: any) => {
        try {
            await axios.post('/payroll/salary-history', data);
            // Refresh data
            setIsSalaryHistoryDialogOpen(false);
            setCurrentSalaryHistory(null);
        } catch (error) {
            console.error('Error saving salary history:', error);
        }
    };

    const handleSavePayrollPeriod = async (data: any) => {
        try {
            await axios.post('/payroll/periods', data);
            // Refresh data
            setIsPayrollPeriodDialogOpen(false);
            setCurrentPayrollPeriod(null);
        } catch (error) {
            console.error('Error saving payroll period:', error);
        }
    };

    const handleSaveTimeTracking = async (data: any) => {
        try {
            await axios.post('/payroll/time-tracking', data);
            // Refresh data
            setIsTimeTrackingDialogOpen(false);
            setCurrentTimeTracking(null);
        } catch (error) {
            console.error('Error saving time tracking:', error);
        }
    };

    return (
        <AuthenticatedLayout
            auth={{
                user: auth.user,
                project: auth.project,
                modules: auth.modules,
            }}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Payroll
                </h2>
            }
        >
            <Head title="Payroll" />

            <div className="space-y-6">
                <PayrollOverview
                    payrolls={payrolls}
                    currency_symbol={currency_symbol}
                />

                <Tabs defaultValue="employees" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                        <TabsTrigger
                            value="employees"
                            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:text-gray-300 dark:hover:text-white"
                        >
                            <Users className="h-4 w-4" />
                            Employees
                        </TabsTrigger>
                        <TabsTrigger
                            value="salary-history"
                            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 data-[state=active]:bg-green-600 data-[state=active]:text-white dark:text-gray-300 dark:hover:text-white"
                        >
                            <History className="h-4 w-4" />
                            Salary History
                        </TabsTrigger>
                        <TabsTrigger
                            value="periods"
                            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:text-gray-300 dark:hover:text-white"
                        >
                            <Calendar className="h-4 w-4" />
                            Payroll Periods
                        </TabsTrigger>
                        <TabsTrigger
                            value="time-tracking"
                            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 data-[state=active]:bg-orange-600 data-[state=active]:text-white dark:text-gray-300 dark:hover:text-white"
                        >
                            <Clock className="h-4 w-4" />
                            Time Tracking
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="employees" className="mt-4">
                        <EmployeesTab
                            payrolls={payrolls}
                            selectedPayrolls={selectedPayrolls}
                            searchTerm={searchTerm}
                            currentPage={currentPage}
                            itemsPerPage={itemsPerPage}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            currency_symbol={currency_symbol}
                            onAddPayroll={handleAddPayroll}
                            onEditPayroll={handleEditPayroll}
                            onDeletePayroll={handleDeletePayroll}
                            onDeleteSelectedPayrolls={
                                handleDeleteSelectedPayrolls
                            }
                            onTogglePayrollSelection={togglePayrollSelection}
                            onSelectAllPayrolls={handleSelectAllPayrolls}
                            onSearchChange={setSearchTerm}
                            onPageChange={setCurrentPage}
                        />
                    </TabsContent>

                    <TabsContent value="salary-history" className="mt-4">
                        <SalaryHistoryTab
                            salaryHistory={salaryHistory}
                            canEdit={canEdit}
                            currency_symbol={currency_symbol}
                            onAddSalaryHistory={handleAddSalaryHistory}
                        />
                    </TabsContent>

                    <TabsContent value="periods" className="mt-4">
                        <PayrollPeriodsTab
                            payrollPeriods={payrollPeriods}
                            canEdit={canEdit}
                            currency_symbol={currency_symbol}
                            onAddPayrollPeriod={handleAddPayrollPeriod}
                        />
                    </TabsContent>

                    <TabsContent value="time-tracking" className="mt-4">
                        <TimeTrackingTab
                            timeTracking={timeTracking}
                            canEdit={canEdit}
                            onAddTimeTracking={handleAddTimeTracking}
                        />
                    </TabsContent>
                </Tabs>

                <PayrollDialog
                    isOpen={isPayrollDialogOpen}
                    onClose={() => setIsPayrollDialogOpen(false)}
                    currentPayroll={currentPayroll}
                    onSave={handleSavePayroll}
                    onPayrollChange={setCurrentPayroll}
                />

                <SalaryHistoryDialog
                    isOpen={isSalaryHistoryDialogOpen}
                    onClose={() => setIsSalaryHistoryDialogOpen(false)}
                    onSave={handleSaveSalaryHistory}
                    currentSalaryHistory={currentSalaryHistory}
                    employees={Array.isArray(payrolls) ? payrolls : []}
                />

                <PayrollPeriodDialog
                    isOpen={isPayrollPeriodDialogOpen}
                    onClose={() => setIsPayrollPeriodDialogOpen(false)}
                    onSave={handleSavePayrollPeriod}
                    currentPayrollPeriod={currentPayrollPeriod}
                />

                <TimeTrackingDialog
                    isOpen={isTimeTrackingDialogOpen}
                    onClose={() => setIsTimeTrackingDialogOpen(false)}
                    onSave={handleSaveTimeTracking}
                    currentTimeTracking={currentTimeTracking}
                    employees={Array.isArray(payrolls) ? payrolls : []}
                />
            </div>
        </AuthenticatedLayout>
    );
}

export default function Payroll(props: PayrollProps) {
    return <PayrollContent {...props} />;
}
