import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { 
    Printer, 
    Stethoscope, 
    FileText, 
    Calendar, 
    Edit, 
    FolderOpen,
    Plus,
    Trash2,
    History
} from 'lucide-react';
import { Patient } from '../types';
import { formatDateTime, formatDate, formatCurrency } from '../utils';

interface PatientRecordDialogProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
    currency: string;
    userRole?: 'assistant' | 'doctor' | 'admin';
    canEdit: boolean;
    canDelete: boolean;
    onStartCheckup: (patient: Patient) => void;
    onViewDentalChart: (patient: Patient) => void;
    onScheduleAppointment: (patient: Patient) => void;
    onEditPatient: (patient: Patient) => void;
    onEditNextVisit: (patient: Patient) => void;
    onDeleteCheckup: (patientId: string, checkupId: number) => void;
}

export const PatientRecordDialog: React.FC<PatientRecordDialogProps> = ({
    isOpen,
    onClose,
    patient,
    currency,
    userRole = 'assistant',
    canEdit,
    canDelete,
    onStartCheckup,
    onViewDentalChart,
    onScheduleAppointment,
    onEditPatient,
    onEditNextVisit,
    onDeleteCheckup
}) => {
    const [activeTab, setActiveTab] = useState('overview');

    if (!patient) return null;

    const calculateAge = (birthdate: string) => {
        if (!birthdate) return 'N/A';
        const today = new Date();
        const birth = new Date(birthdate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'default';
            case 'inactive': return 'secondary';
            case 'pending': return 'outline';
            default: return 'default';
        }
    };

    const renderOverviewTab = () => (
        <div className="grid grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Recent Medical Activity
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {patient.checkups?.length > 0 ? (
                        patient.checkups.slice(-3).reverse().map(checkup => (
                            <div key={checkup.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(checkup.checkup_date)}</p>
                                    {canDelete && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDeleteCheckup(patient.id, checkup.id)}
                                            className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                                    <strong className="text-gray-900 dark:text-white">Diagnosis:</strong> {checkup.diagnosis}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    <strong className="text-gray-900 dark:text-white">Treatment:</strong> {checkup.treatment}
                                </p>
                                {checkup.notes && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {checkup.notes}
                                    </p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                            No checkup history available
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Role-based Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        {userRole === 'doctor' ? 'Doctor Actions' : 'Quick Actions'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {userRole === 'doctor' ? (
                        <>
                            <Button 
                                className="w-full justify-start" 
                                onClick={() => onStartCheckup(patient)}
                            >
                                <Stethoscope className="h-4 w-4 mr-3" />
                                Start New Checkup
                            </Button>
                            <Button 
                                variant="outline" 
                                className="w-full justify-start" 
                                onClick={() => onViewDentalChart(patient)}
                            >
                                <FileText className="h-4 w-4 mr-3" />
                                View Dental Chart
                            </Button>
                            <Button 
                                variant="outline" 
                                className="w-full justify-start" 
                                onClick={() => setActiveTab('checkups')}
                            >
                                <History className="h-4 w-4 mr-3" />
                                Full Medical History
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button 
                                className="w-full justify-start" 
                                onClick={() => onScheduleAppointment(patient)}
                            >
                                <Calendar className="h-4 w-4 mr-3" />
                                Schedule Appointment
                            </Button>
                            {canEdit && (
                                <Button 
                                    variant="outline" 
                                    className="w-full justify-start" 
                                    onClick={() => onEditPatient(patient)}
                                >
                                    <Edit className="h-4 w-4 mr-3" />
                                    Update Patient Info
                                </Button>
                            )}
                            <Button 
                                variant="outline" 
                                className="w-full justify-start" 
                                onClick={() => onEditNextVisit(patient)}
                            >
                                <Calendar className="h-4 w-4 mr-3" />
                                Edit Next Visit
                            </Button>
                            <Button 
                                variant="outline" 
                                className="w-full justify-start" 
                                onClick={() => setActiveTab('billing')}
                            >
                                <FileText className="h-4 w-4 mr-3" />
                                View Billing
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    const renderCheckupsTab = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Medical History</h3>
                {userRole === 'doctor' && (
                    <Button onClick={() => onStartCheckup(patient)}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Checkup
                    </Button>
                )}
            </div>
            
            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-700">
                        <TableHead className="text-gray-900 dark:text-white">Date</TableHead>
                        <TableHead className="text-gray-900 dark:text-white">Diagnosis</TableHead>
                        <TableHead className="text-gray-900 dark:text-white">Treatment</TableHead>
                        <TableHead className="text-gray-900 dark:text-white">Notes</TableHead>
                        {canDelete && (
                            <TableHead className="text-right text-gray-900 dark:text-white">Actions</TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {patient.checkups?.length > 0 ? (
                        patient.checkups.map((checkup) => (
                            <TableRow key={checkup.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <TableCell className="text-gray-900 dark:text-white">
                                    {formatDateTime(checkup.checkup_date)}
                                </TableCell>
                                <TableCell className="text-gray-900 dark:text-white">
                                    {checkup.diagnosis}
                                </TableCell>
                                <TableCell className="text-gray-900 dark:text-white">
                                    {checkup.treatment}
                                </TableCell>
                                <TableCell className="text-gray-900 dark:text-white">
                                    {checkup.notes}
                                </TableCell>
                                {canDelete && (
                                    <TableCell className="text-right">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => onDeleteCheckup(patient.id, checkup.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell 
                                colSpan={canDelete ? 5 : 4} 
                                className="text-center text-gray-600 dark:text-gray-400 py-8"
                            >
                                No checkup history available
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );

    const renderDentalTab = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Dental Chart</h3>
                <Button onClick={() => onViewDentalChart(patient)}>
                    <FileText className="h-4 w-4 mr-2" />
                    {userRole === 'doctor' ? 'Edit Chart' : 'View Chart'}
                </Button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center border border-gray-200 dark:border-gray-600">
                <p className="text-gray-600 dark:text-gray-400">
                    Click "View Chart" to open the interactive dental chart
                </p>
            </div>
        </div>
    );

    const renderBillingTab = () => (
        <div className="space-y-6">
            {/* Financial Summary */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Bills</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(patient.total_bills, currency)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(patient.total_payments, currency)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className={`text-2xl font-bold ${patient.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(patient.balance, currency)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Bills and Payments */}
            <div className="grid grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Bills</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {patient.bills?.slice(-3).map(bill => (
                            <div key={bill.id} className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{bill.bill_number}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">{formatDate(bill.bill_date)}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{bill.bill_details}</p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {formatCurrency(parseFloat(bill.bill_amount), currency)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {!patient.bills?.length && (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No bills found</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Payments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {patient.payments?.slice(-3).map(payment => (
                            <div key={payment.id} className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(payment.payment_date)}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{payment.payment_method}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{payment.payment_notes}</p>
                                    </div>
                                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                        {formatCurrency(parseFloat(payment.payment_amount), currency)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {!patient.payments?.length && (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No payments found</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl flex items-center gap-2">
                            <FolderOpen className="h-6 w-6" />
                            Patient Record - {patient.name}
                        </DialogTitle>
                        <div className="flex items-center gap-2">
                            <Badge variant={getStatusColor('active')}>
                                Active
                            </Badge>
                            <Button size="sm" variant="outline">
                                <Printer className="h-4 w-4 mr-2" />
                                Print Record
                            </Button>
                        </div>
                    </div>
                </DialogHeader>
                
                {/* Patient Summary Card */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4 border border-gray-200 dark:border-gray-600">
                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">ARN: {patient.arn || 'Not Set'}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Age: {calculateAge(patient.birthdate)} years
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Contact: {patient.phone}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Email: {patient.email}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Next Visit: {formatDate(patient.next_visit_date)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Checkups: {patient.checkups?.length || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Balance: {formatCurrency(patient.balance, currency)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Status: {patient.balance > 0 ? 'Outstanding' : 'Paid'}
                            </p>
                        </div>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="checkups">
                            Medical History ({patient.checkups?.length || 0})
                        </TabsTrigger>
                        <TabsTrigger value="dental">Dental Chart</TabsTrigger>
                        <TabsTrigger value="billing">Billing</TabsTrigger>
                    </TabsList>

                    <div className="mt-4 overflow-y-auto max-h-[calc(90vh-300px)]">
                        <TabsContent value="overview" className="mt-0">
                            {renderOverviewTab()}
                        </TabsContent>

                        <TabsContent value="checkups" className="mt-0">
                            {renderCheckupsTab()}
                        </TabsContent>

                        <TabsContent value="dental" className="mt-0">
                            {renderDentalTab()}
                        </TabsContent>

                        <TabsContent value="billing" className="mt-0">
                            {renderBillingTab()}
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};
