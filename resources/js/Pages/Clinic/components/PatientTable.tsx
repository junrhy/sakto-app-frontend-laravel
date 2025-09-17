import React from 'react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Pencil, PlusCircle, History, Edit, Trash2, Plus } from 'lucide-react';
import { Search } from 'lucide-react';
import { Patient, AppCurrency } from '../types';
import { formatDateTime, formatCurrency } from '../utils';

interface PatientTableProps {
    patients: Patient[];
    currentPatients: Patient[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    pageCount: number;
    patientsPerPage: number;
    currency: string;
    canEdit: boolean;
    canDelete: boolean;
    onEditPatient: (patient: Patient) => void;
    onDeletePatient: (patient: Patient) => void;
    onAddBill: (patient: Patient) => void;
    onShowBillHistory: (patient: Patient) => void;
    onAddPayment: (patient: Patient) => void;
    onShowPaymentHistory: (patient: Patient) => void;
    onAddCheckup: (patient: Patient) => void;
    onShowCheckupHistory: (patient: Patient) => void;
    onOpenDentalChart: (patient: Patient) => void;
    onOpenPatientInfo: (patient: Patient) => void;
    onEditNextVisit: (patient: Patient) => void;
}

export const PatientTable: React.FC<PatientTableProps> = ({
    patients,
    currentPatients,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pageCount,
    patientsPerPage,
    currency,
    canEdit,
    canDelete,
    onEditPatient,
    onDeletePatient,
    onAddBill,
    onShowBillHistory,
    onAddPayment,
    onShowPaymentHistory,
    onAddCheckup,
    onShowCheckupHistory,
    onOpenDentalChart,
    onOpenPatientInfo,
    onEditNextVisit
}) => {
    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-2">
                    {/* Add any additional controls here */}
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 w-full bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-700">
                        <TableHead className="text-gray-900 dark:text-white">ARN</TableHead>
                        <TableHead className="text-gray-900 dark:text-white">Name</TableHead>
                        <TableHead className="text-gray-900 dark:text-white">Next Visit</TableHead>
                        <TableHead className="text-gray-900 dark:text-white">Total Bills ({currency})</TableHead>
                        <TableHead className="text-gray-900 dark:text-white">Balance ({currency})</TableHead>
                        <TableHead className="text-right text-gray-900 dark:text-white">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentPatients.map((patient) => (
                        <TableRow key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <TableCell 
                                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white" 
                                onClick={() => onOpenPatientInfo(patient)}
                            >
                                {patient.arn || 'Not Set'}
                            </TableCell>
                            <TableCell className="text-gray-900 dark:text-white">{patient.name}</TableCell>
                            <TableCell className="text-gray-900 dark:text-white">
                                <div className="flex items-center space-x-2">
                                    <span>{formatDateTime(patient.next_visit_date)}</span>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => onEditNextVisit(patient)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                            <TableCell className="text-gray-900 dark:text-white">
                                <div className="flex items-center space-x-2">
                                    <span>{formatCurrency(patient.total_bills, currency)}</span>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => onAddBill(patient)}
                                    >
                                        <PlusCircle className="h-4 w-4" /> Add Bill
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => onShowBillHistory(patient)}>
                                        <History className="h-4 w-4" /> Bill History
                                    </Button>
                                </div>
                            </TableCell>
                            <TableCell className="text-gray-900 dark:text-white">
                                <div className="flex items-center space-x-2">
                                    <span>{formatCurrency(patient.balance, currency)}</span>
                                    <Button variant="outline" size="sm" onClick={() => onAddPayment(patient)}>
                                        <PlusCircle className="h-4 w-4" /> Add Payment
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => onShowPaymentHistory(patient)}>
                                        <History className="h-4 w-4" /> Payment History
                                    </Button>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex justify-end gap-2">
                                    {canEdit && (
                                        <Button variant="outline" size="sm" onClick={() => onEditPatient(patient)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {canDelete && (
                                        <Button 
                                            variant="destructive" 
                                            size="sm"
                                            onClick={() => onDeletePatient(patient)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => onAddCheckup(patient)}
                                    >
                                        <Plus className="h-4 w-4" /> Add Checkup
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => onShowCheckupHistory(patient)}>
                                        <History className="h-4 w-4" /> Checkup History
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => onOpenDentalChart(patient)}>
                                        Dental Chart
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="flex justify-between items-center mt-4">
                <div className="text-gray-600 dark:text-gray-400">
                    Showing {((currentPage - 1) * patientsPerPage) + 1} to {Math.min(currentPage * patientsPerPage, patients.length)} of {patients.length} patients
                </div>
                <div className="flex space-x-2">
                    <Button
                        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
                        <Button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            variant={currentPage === page ? "default" : "outline"}
                        >
                            {page}
                        </Button>
                    ))}
                    <Button
                        onClick={() => setCurrentPage(Math.min(currentPage + 1, pageCount))}
                        disabled={currentPage === pageCount}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </>
    );
};
