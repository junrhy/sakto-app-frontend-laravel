import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Input } from '@/Components/ui/input';
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
import {
    Calendar,
    Crown,
    Edit,
    FileText,
    FolderOpen,
    MoreHorizontal,
    Pencil,
    Search,
    Trash2,
} from 'lucide-react';
import React from 'react';
import { Patient } from '../types';
import { formatCurrency, formatDate, formatDateTime } from '../utils';
import VipBadge from './VipBadge';

interface PatientTableProps {
    patients: Patient[];
    currentPatients: Patient[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    nextVisitFilter: 'all' | 'today' | 'tomorrow';
    setNextVisitFilter: (filter: 'all' | 'today' | 'tomorrow') => void;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    pageCount: number;
    patientsPerPage: number;
    currency: string;
    canEdit: boolean;
    canDelete: boolean;
    onEditPatient: (patient: Patient) => void;
    onDeletePatient: (patient: Patient) => void;
    onOpenPatientRecord: (patient: Patient) => void;
    onScheduleAppointment: (patient: Patient) => void;
    onEditNextVisit: (patient: Patient) => void;
    onOpenMedicalRecord?: (patient: Patient) => void;
    onManageVip?: (patient: Patient) => void;
}

export const PatientTable: React.FC<PatientTableProps> = ({
    patients,
    currentPatients,
    searchTerm,
    setSearchTerm,
    nextVisitFilter,
    setNextVisitFilter,
    currentPage,
    setCurrentPage,
    pageCount,
    patientsPerPage,
    currency,
    canEdit,
    canDelete,
    onEditPatient,
    onDeletePatient,
    onOpenPatientRecord,
    onScheduleAppointment,
    onEditNextVisit,
    onOpenMedicalRecord,
    onManageVip,
}) => {
    return (
        <>
            <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row">
                <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="w-full sm:w-48">
                        <Select
                            value={nextVisitFilter}
                            onValueChange={(
                                value: 'all' | 'today' | 'tomorrow',
                            ) => setNextVisitFilter(value)}
                        >
                            <SelectTrigger className="w-full border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                                <SelectValue placeholder="Filter by next visit" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    All Patients
                                </SelectItem>
                                <SelectItem value="today">
                                    Today's Visits
                                </SelectItem>
                                <SelectItem value="tomorrow">
                                    Tomorrow's Visits
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500 dark:text-gray-400" />
                    <Input
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border-gray-200 bg-white pl-8 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 dark:bg-gray-700">
                                <TableHead className="text-gray-900 dark:text-white">
                                    ARN
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Name
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Last Checkup
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Next Visit
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Total Bills ({currency})
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Total Payments ({currency})
                                </TableHead>
                                <TableHead className="text-gray-900 dark:text-white">
                                    Balance ({currency})
                                </TableHead>
                                <TableHead className="text-right text-gray-900 dark:text-white">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentPatients.map((patient) => (
                                <TableRow
                                    key={patient.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <TableCell
                                        className="cursor-pointer text-gray-900 dark:text-white"
                                        onClick={() =>
                                            onOpenPatientRecord(patient)
                                        }
                                    >
                                        {patient.arn || 'Not Set'}
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        <div className="flex items-center space-x-2">
                                            <span>{patient.name}</span>
                                            <VipBadge
                                                patient={patient}
                                                size="sm"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        {patient.checkups?.length > 0 ? (
                                            <div>
                                                <div className="text-sm font-medium">
                                                    {formatDate(
                                                        patient.checkups[
                                                            patient.checkups
                                                                .length - 1
                                                        ]?.checkup_date,
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {patient.checkups[
                                                        patient.checkups
                                                            .length - 1
                                                    ]?.diagnosis?.substring(
                                                        0,
                                                        30,
                                                    )}
                                                    {patient.checkups[
                                                        patient.checkups
                                                            .length - 1
                                                    ]?.diagnosis?.length > 30
                                                        ? '...'
                                                        : ''}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">
                                                No checkups
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        <div className="flex items-center space-x-2">
                                            <span>
                                                {formatDateTime(
                                                    patient.next_visit_date,
                                                )}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    onEditNextVisit(patient)
                                                }
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        {formatCurrency(
                                            patient.total_bills,
                                            currency,
                                        )}
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        {formatCurrency(
                                            patient.total_payments,
                                            currency,
                                        )}
                                    </TableCell>
                                    <TableCell className="text-gray-900 dark:text-white">
                                        {formatCurrency(
                                            patient.balance,
                                            currency,
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() =>
                                                    onOpenPatientRecord(patient)
                                                }
                                                className="bg-slate-600 text-white hover:bg-slate-700 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-700"
                                            >
                                                <FolderOpen className="mr-2 h-4 w-4" />
                                                Open Record
                                            </Button>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {canEdit && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                onEditPatient(
                                                                    patient,
                                                                )
                                                            }
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit Patient
                                                        </DropdownMenuItem>
                                                    )}
                                                    {onOpenMedicalRecord && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                onOpenMedicalRecord(
                                                                    patient,
                                                                )
                                                            }
                                                        >
                                                            <FileText className="mr-2 h-4 w-4" />
                                                            Complete Medical
                                                            Record
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            onScheduleAppointment(
                                                                patient,
                                                            )
                                                        }
                                                    >
                                                        <Calendar className="mr-2 h-4 w-4" />
                                                        Schedule Appointment
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            onEditNextVisit(
                                                                patient,
                                                            )
                                                        }
                                                    >
                                                        <Calendar className="mr-2 h-4 w-4" />
                                                        Edit Next Visit
                                                    </DropdownMenuItem>
                                                    {onManageVip && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                onManageVip(
                                                                    patient,
                                                                )
                                                            }
                                                        >
                                                            <Crown className="mr-2 h-4 w-4" />
                                                            Manage VIP Status
                                                        </DropdownMenuItem>
                                                    )}
                                                    {canDelete && (
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                onDeletePatient(
                                                                    patient,
                                                                )
                                                            }
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete Patient
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="mt-4 flex items-center justify-between">
                <div className="text-gray-600 dark:text-gray-400">
                    Showing {(currentPage - 1) * patientsPerPage + 1} to{' '}
                    {Math.min(currentPage * patientsPerPage, patients.length)}{' '}
                    of {patients.length} patients
                </div>
                <div className="flex space-x-2">
                    <Button
                        onClick={() =>
                            setCurrentPage(Math.max(currentPage - 1, 1))
                        }
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                        (page) => (
                            <Button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                variant={
                                    currentPage === page ? 'default' : 'outline'
                                }
                            >
                                {page}
                            </Button>
                        ),
                    )}
                    <Button
                        onClick={() =>
                            setCurrentPage(Math.min(currentPage + 1, pageCount))
                        }
                        disabled={currentPage === pageCount}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </>
    );
};
