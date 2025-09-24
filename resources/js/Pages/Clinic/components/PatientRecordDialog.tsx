import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { usePage } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    CreditCard,
    Edit,
    FileText,
    FolderOpen,
    History,
    Phone,
    Plus,
    Printer,
    Stethoscope,
} from 'lucide-react';
import React, { useState } from 'react';
import { usePDF } from 'react-to-pdf';
import { Patient, PatientEncounter } from '../types';
import { formatCurrency, formatDate } from '../utils';
import PatientRecordPDF from '../utils/pdfExport';
import DentalChart from './DentalChart';

interface PatientRecordDialogProps {
    isOpen: boolean;
    onClose: () => void;
    patient: Patient | null;
    currency: string;
    userRole?: 'assistant' | 'doctor' | 'nurse' | 'admin';
    canEdit: boolean;
    canDelete: boolean;
    encounters?: PatientEncounter[];
    onStartCheckup: (patient: Patient) => void;
    onViewCompleteRecord: (patient: Patient) => void;
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
    encounters = [],
    onStartCheckup,
    onViewCompleteRecord,
    onViewDentalChart,
    onScheduleAppointment,
    onEditPatient,
    onEditNextVisit,
    onDeleteCheckup,
}) => {
    const { auth } = usePage<any>().props;
    const [activeTab, setActiveTab] = useState('overview');
    const [showClinicDetailsDialog, setShowClinicDetailsDialog] =
        useState(false);
    const [clinicDetails, setClinicDetails] = useState({
        name: auth.user?.name ? `${auth.user.name}` : '',
        address: '',
        phone: auth.user?.contact_number || '',
        doctorName: auth.user?.name || '',
    });

    const { toPDF, targetRef } = usePDF({
        filename: `patient-record-${patient?.name || 'unknown'}.pdf`,
        page: {
            margin: 0,
            format: 'a4',
            orientation: 'portrait',
        },
        canvas: {
            mimeType: 'image/png',
            qualityRatio: 1,
        },
    });

    if (!patient) return null;

    const calculateAge = (birthdate: string) => {
        if (!birthdate) return 'N/A';
        const today = new Date();
        const birth = new Date(birthdate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birth.getDate())
        ) {
            age--;
        }
        return age;
    };

    const handlePrintRecord = () => {
        // Reset clinic details with user data
        setClinicDetails({
            name: auth.user?.name ? `${auth.user.name} Clinic` : '',
            address: '',
            phone: auth.user?.contact_number || '',
            doctorName: auth.user?.name || '',
        });
        setShowClinicDetailsDialog(true);
    };

    const handleConfirmExport = () => {
        setShowClinicDetailsDialog(false);
        toPDF();
    };

    const getStatusColor = (status?: string) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'default';
            case 'inactive':
                return 'secondary';
            case 'pending':
                return 'outline';
            default:
                return 'default';
        }
    };

    const renderOverviewTab = () => (
        <div className="grid grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <History className="h-5 w-5" />
                        Patient Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Total Encounters
                            </p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {encounters.length}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Last Encounter
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {encounters.length > 0
                                    ? formatDate(
                                          encounters[0].encounter_datetime,
                                      )
                                    : 'No encounters yet'}
                            </p>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-3 dark:border-gray-600">
                        <Button
                            onClick={() => onViewCompleteRecord(patient)}
                            variant="outline"
                            className="w-full"
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            View Complete Medical Record
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Role-based Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {userRole === 'doctor' || userRole === 'nurse' ? (
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                className="justify-start"
                                onClick={() => onStartCheckup(patient)}
                            >
                                <Stethoscope className="mr-2 h-4 w-4" />
                                New Clinical Visit
                            </Button>
                            <Button
                                variant="outline"
                                className="justify-start"
                                onClick={() => onScheduleAppointment(patient)}
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                Schedule Follow-up
                            </Button>
                            <Button
                                variant="outline"
                                className="justify-start"
                                onClick={() => setActiveTab('billing')}
                            >
                                <CreditCard className="mr-2 h-4 w-4" />
                                View Billing
                            </Button>
                            {canEdit && (
                                <>
                                    <Button
                                        variant="outline"
                                        className="justify-start"
                                        onClick={() => onEditPatient(patient)}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Patient Info
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="justify-start"
                                        onClick={() => onEditNextVisit(patient)}
                                    >
                                        <Clock className="mr-2 h-4 w-4" />
                                        Set Next Visit
                                    </Button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                className="justify-start"
                                onClick={() => onScheduleAppointment(patient)}
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                Schedule Appointment
                            </Button>
                            <Button
                                variant="outline"
                                className="justify-start"
                                onClick={() => setActiveTab('billing')}
                            >
                                <CreditCard className="mr-2 h-4 w-4" />
                                View Billing
                            </Button>
                            {canEdit && (
                                <>
                                    <Button
                                        variant="outline"
                                        className="justify-start"
                                        onClick={() => onEditPatient(patient)}
                                    >
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Patient Info
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="justify-start"
                                        onClick={() => onEditNextVisit(patient)}
                                    >
                                        <Clock className="mr-2 h-4 w-4" />
                                        Set Next Visit
                                    </Button>
                                </>
                            )}
                            <Button
                                variant="outline"
                                className="justify-start"
                                onClick={handlePrintRecord}
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Export PDF
                            </Button>
                            <Button
                                variant="outline"
                                className="justify-start"
                                onClick={() =>
                                    window.open(`tel:${patient.phone}`, '_self')
                                }
                            >
                                <Phone className="mr-2 h-4 w-4" />
                                Call Patient
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    const renderMedicalRecordsTab = () => (
        <div className="space-y-6">
            {/* Medical Records Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="h-5 w-5" />
                        Complete Medical Records
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Access comprehensive medical documentation including
                        encounters, vital signs, diagnoses, allergies,
                        medications, and medical history.
                    </p>

                    <div className="flex gap-3">
                        <Button
                            onClick={() => onViewCompleteRecord(patient)}
                            className="flex-1"
                        >
                            <Stethoscope className="mr-2 h-4 w-4" />
                            View Complete Medical Record
                        </Button>

                        {(userRole === 'doctor' || userRole === 'nurse') && (
                            <Button
                                onClick={() => onStartCheckup(patient)}
                                variant="outline"
                                className="flex-1"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                New Clinical Encounter
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Medical Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">
                        Recent Medical Activity Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Clinical Encounters
                            </p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {encounters.length}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Comprehensive records
                            </p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Last Encounter
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                {encounters.length > 0
                                    ? formatDate(
                                          encounters[0].encounter_datetime,
                                      )
                                    : 'No encounters yet'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Most recent
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderDentalTab = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                    Dental Chart (View Only)
                </h3>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-600 dark:bg-gray-800">
                {patient.dental_chart && patient.dental_chart.length > 0 ? (
                    <DentalChart
                        teethData={patient.dental_chart}
                        onToothClick={() => {}} // Disabled - view only
                    />
                ) : (
                    <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <div className="text-center">
                            <FileText className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                                No Dental Chart Available
                            </p>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                                Dental chart can be created and edited via
                                Doctor Checkup Dialog
                            </p>
                        </div>
                    </div>
                )}
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
                        <CardTitle className="text-sm">
                            Total Payments
                        </CardTitle>
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
                        <p
                            className={`text-2xl font-bold ${patient.balance > 0 ? 'text-red-600' : 'text-green-600'}`}
                        >
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
                        {patient.bills?.slice(-3).map((bill) => (
                            <div
                                key={bill.id}
                                className="mb-3 rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {bill.bill_number}
                                        </p>
                                        <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {formatDate(bill.bill_date)}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {bill.bill_details}
                                        </p>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {formatCurrency(
                                            parseFloat(bill.bill_amount),
                                            currency,
                                        )}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {!patient.bills?.length && (
                            <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                                No bills found
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Recent Payments
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {patient.payments?.slice(-3).map((payment) => (
                            <div
                                key={payment.id}
                                className="mb-3 rounded border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {formatDate(payment.payment_date)}
                                        </p>
                                        <p className="text-xs capitalize text-gray-600 dark:text-gray-400">
                                            {payment.payment_method}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {payment.payment_notes}
                                        </p>
                                    </div>
                                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                        {formatCurrency(
                                            parseFloat(payment.payment_amount),
                                            currency,
                                        )}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {!patient.payments?.length && (
                            <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                                No payments found
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-6xl overflow-hidden">
                <DialogHeader>
                    <div className="flex items-center justify-between pr-8">
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <FolderOpen className="h-6 w-6" />
                            Patient Management - {patient.name}
                        </DialogTitle>
                        <div className="flex items-center gap-2">
                            <Badge variant={getStatusColor('active')}>
                                Active
                            </Badge>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handlePrintRecord}
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Export PDF
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                {/* Patient Summary Card */}
                <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                    <div className="grid grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                ARN: {patient.arn || 'Not Set'}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Age: {calculateAge(patient.birthdate)} years
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Contact: {patient.phone}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Email: {patient.email}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Next Visit:{' '}
                                {formatDate(patient.next_visit_date)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Checkups: {patient.checkups?.length || 0}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Balance:{' '}
                                {formatCurrency(patient.balance, currency)}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Status:{' '}
                                {patient.balance > 0 ? 'Outstanding' : 'Paid'}
                            </p>
                        </div>
                    </div>
                </div>

                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="flex-1 overflow-hidden"
                >
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="medical">
                            Medical Records
                        </TabsTrigger>
                        <TabsTrigger value="dental">Dental Chart</TabsTrigger>
                        <TabsTrigger value="billing">
                            Billing & Admin
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-4 max-h-[calc(90vh-300px)] overflow-y-auto">
                        <TabsContent value="overview" className="mt-0">
                            {renderOverviewTab()}
                        </TabsContent>

                        <TabsContent value="medical" className="mt-0">
                            {renderMedicalRecordsTab()}
                        </TabsContent>

                        <TabsContent value="dental" className="mt-0">
                            {renderDentalTab()}
                        </TabsContent>

                        <TabsContent value="billing" className="mt-0">
                            {renderBillingTab()}
                        </TabsContent>
                    </div>
                </Tabs>

                {/* Hidden PDF Content */}
                <div
                    style={{
                        position: 'absolute',
                        left: '-9999px',
                        top: '-9999px',
                    }}
                >
                    <div ref={targetRef}>
                        <PatientRecordPDF
                            patient={patient}
                            encounters={encounters}
                            currency={currency}
                            clinicName={clinicDetails.name || 'Medical Clinic'}
                            clinicAddress={clinicDetails.address}
                            clinicPhone={clinicDetails.phone}
                            doctorName={clinicDetails.doctorName}
                        />
                    </div>
                </div>
            </DialogContent>

            {/* Clinic Details Dialog */}
            <Dialog
                open={showClinicDetailsDialog}
                onOpenChange={setShowClinicDetailsDialog}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Printer className="h-5 w-5" />
                            Clinic Details for PDF Export
                        </DialogTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Information has been prefilled from your account.
                            Please review and update as needed.
                        </p>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="clinicName">Clinic Name *</Label>
                            <Input
                                id="clinicName"
                                placeholder="Enter clinic name"
                                value={clinicDetails.name}
                                onChange={(e) =>
                                    setClinicDetails((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="clinicAddress">
                                Clinic Address
                            </Label>
                            <Input
                                id="clinicAddress"
                                placeholder="e.g., 123 Medical Center Drive, City, State 12345"
                                value={clinicDetails.address}
                                onChange={(e) =>
                                    setClinicDetails((prev) => ({
                                        ...prev,
                                        address: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="clinicPhone">Clinic Phone</Label>
                            <Input
                                id="clinicPhone"
                                placeholder="e.g., (555) 123-4567"
                                value={clinicDetails.phone}
                                onChange={(e) =>
                                    setClinicDetails((prev) => ({
                                        ...prev,
                                        phone: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="doctorName">Attending Doctor</Label>
                            <Input
                                id="doctorName"
                                placeholder="e.g., Dr. John Smith, MD"
                                value={clinicDetails.doctorName}
                                onChange={(e) =>
                                    setClinicDetails((prev) => ({
                                        ...prev,
                                        doctorName: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowClinicDetailsDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirmExport}
                            disabled={!clinicDetails.name.trim()}
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Export PDF
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
};
