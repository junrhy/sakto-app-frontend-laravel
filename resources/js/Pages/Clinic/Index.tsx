import React, { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Button } from "../../Components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../Components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../../Components/ui/dialog";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { Textarea } from "../../Components/ui/textarea";
import { Users, UserPlus, Calendar, Table, Grid3X3, Package, CreditCard } from 'lucide-react';

// Import types
import { 
    ClinicProps, 
    NewPatient, 
    Patient, 
    AppCurrency,
    EditingNextVisit,
    Appointment,
    NewAppointment
} from './types';

// Import hooks
import {
    usePatients,
    useBills,
    usePayments,
    useCheckups,
    useDentalChart,
    useNextVisit,
    useHistory,
    useAppointments
} from './hooks';

// Import components
import {
    PatientTable,
    AddPatientForm,
    HistoryDialog,
    DentalChartDialog,
    EditPatientDialog,
    DeleteConfirmationDialog,
    AddCheckupDialog,
    PatientRecordDialog,
    DoctorCheckupDialog,
    AppointmentTable,
    AppointmentCalendar,
    AddAppointmentDialog,
    EditAppointmentDialog
} from './components';
import { ClinicPaymentAccountManager } from './components/ClinicPaymentAccountManager';
import Inventory from './Inventory';

export default function Clinic({ auth, initialPatients = [], appCurrency = null, error = null }: ClinicProps) {
    const currency = appCurrency ? appCurrency.symbol : '$';

    // Initialize hooks
    const {
        patients,
        setPatients,
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        filteredPatients,
        currentPatients,
        pageCount,
        patientsPerPage,
        addPatient: addPatientToAPI,
        updatePatient: updatePatientInAPI,
        deletePatient: deletePatientFromAPI,
        updatePatientInState
    } = usePatients(initialPatients);

    const {
        addBill,
        deleteBill,
        fetchBillHistory,
    } = useBills();

    const {
        processPayment,
        deletePayment,
        fetchPaymentHistory
    } = usePayments();

    const {
        newCheckupResult,
        setNewCheckupResult,
        checkupPatient,
        setCheckupPatient,
        isCheckupDialogOpen,
        setIsCheckupDialogOpen,
        checkupDateTime,
        setCheckupDateTime,
        addCheckup,
        deleteCheckup,
        fetchCheckupHistory,
        resetCheckupForm
    } = useCheckups();

    const {
        editingDentalChart,
        setEditingDentalChart,
        isDentalChartDialogOpen,
        setIsDentalChartDialogOpen,
        selectedPatient,
        setSelectedPatient,
        openDentalChartDialog,
        handleToothClick,
        saveDentalChartChanges,
        openPatientInfoDialog
    } = useDentalChart();

    const {
        editingNextVisit,
        setEditingNextVisit,
        updateNextVisit,
        openNextVisitDialog,
        closeNextVisitDialog
    } = useNextVisit();

    const {
        showingHistoryForPatient,
        setShowingHistoryForPatient,
        activeHistoryType,
        setActiveHistoryType,
        isLoadingHistory,
        openHistoryDialog,
        closeHistoryDialog,
        setLoading
    } = useHistory();

    const {
        appointments,
        setAppointments,
        isLoading: isLoadingAppointments,
        fetchAppointments,
        createAppointment,
        updateAppointment,
        deleteAppointment,
        updateAppointmentStatus,
        updateAppointmentPaymentStatus
    } = useAppointments();

    // Local state
    const [newPatient, setNewPatient] = useState<NewPatient>({ 
        arn: '',
        name: '', 
        dateOfBirth: '', 
        contactNumber: '', 
        email: '', 
    });
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<Patient | null>(null);
    
    // Appointment state
    const [isAddAppointmentDialogOpen, setIsAddAppointmentDialogOpen] = useState(false);
    const [preselectedPatientForAppointment, setPreselectedPatientForAppointment] = useState<Patient | null>(null);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [deleteAppointmentConfirmation, setDeleteAppointmentConfirmation] = useState<Appointment | null>(null);
    const [appointmentView, setAppointmentView] = useState<'table' | 'calendar'>('table');

    // New workflow state
    const [selectedPatientForRecord, setSelectedPatientForRecord] = useState<Patient | null>(null);
    const [isDoctorCheckupDialogOpen, setIsDoctorCheckupDialogOpen] = useState(false);
    const [checkupPatientForDoctor, setCheckupPatientForDoctor] = useState<Patient | null>(null);

    // Permission checks
    const canDelete = useMemo(() => {
        if (auth.selectedTeamMember) {
            return auth.selectedTeamMember.roles.includes('admin') || auth.selectedTeamMember.roles.includes('manager');
        }
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            return auth.selectedTeamMember.roles.includes('admin') || 
                   auth.selectedTeamMember.roles.includes('manager') || 
                   auth.selectedTeamMember.roles.includes('doctor') ||
                   auth.selectedTeamMember.roles.includes('nurse') ||
                   auth.selectedTeamMember.roles.includes('assistant') ||
                   auth.selectedTeamMember.roles.includes('user');
        }
        return auth.user.is_admin;
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    // Determine user role for UI behavior
    const userRole = useMemo(() => {
        if (auth.selectedTeamMember) {
            if (auth.selectedTeamMember.roles.includes('doctor')) return 'doctor';
            if (auth.selectedTeamMember.roles.includes('nurse')) return 'nurse';
            if (auth.selectedTeamMember.roles.includes('assistant')) return 'assistant';
            if (auth.selectedTeamMember.roles.includes('admin')) return 'admin';
            return 'assistant'; // fallback for other roles (user, supervisor, viewer)
        }
        return auth.user.is_admin ? 'admin' : 'assistant';
    }, [auth.selectedTeamMember, auth.user.is_admin]);

    // Event handlers
    const handleAddPatient = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await addPatientToAPI(newPatient);
        if (result.success) {
            setNewPatient({ arn: '', name: '', dateOfBirth: '', contactNumber: '', email: '' });
        }
    };

    const handleUpdatePatient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPatient) {
            const result = await updatePatientInAPI(editingPatient);
            if (result.success) {
                setEditingPatient(null);
            }
        }
    };

    const handleDeletePatient = (patient: Patient) => {
        setDeleteConfirmation(patient);
    };

    const handleConfirmDelete = async (patientId: string) => {
        const result = await deletePatientFromAPI(patientId);
        if (result.success) {
            setDeleteConfirmation(null);
        }
    };


    const handleAddCheckup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!checkupPatient || !checkupDateTime.date) return;

        const result = await addCheckup(checkupPatient, newCheckupResult, checkupDateTime);
        if (result.success) {
            // Update the patients state with the new checkup data
            setPatients(prevPatients => 
                prevPatients.map(patient => 
                    patient.id === checkupPatient.id 
                    ? {
                        ...patient,
                        checkups: [...(patient.checkups || []), result.data]
                    }
                    : patient
                )
            );

            resetCheckupForm();
        }
    };

    const handleDeleteCheckup = async (patientId: string, checkupId: number) => {
        const result = await deleteCheckup(patientId, checkupId);
        if (result.success) {
            // Update patients state
            setPatients(patients.map(patient => {
                if (patient.id === patientId) {
                    const updatedCheckups = patient.checkups.filter(checkup => checkup.id !== checkupId);
                    
                    // Also update the showing history patient if it's the same patient
                    if (showingHistoryForPatient?.id === patientId) {
                        setShowingHistoryForPatient({
                            ...showingHistoryForPatient,
                            checkups: updatedCheckups
                        });
                    }
                    
                    return {
                        ...patient,
                        checkups: updatedCheckups
                    };
                }
                return patient;
            }));
        }
    };

    const handleShowCheckupHistory = async (patient: Patient) => {
        setLoading(true);
        const result = await fetchCheckupHistory(patient);
        if (result.success && result.data) {
            updatePatientInState(result.data);
            openHistoryDialog(result.data, 'checkup');
        }
        setLoading(false);
    };

    const handleSaveDentalChart = async () => {
        const result = await saveDentalChartChanges();
        if (result.success && result.data) {
            setPatients(prevPatients =>
                prevPatients.map(p =>
                    p.id === selectedPatient?.id ? { ...p, dental_chart: result.data!.dental_chart } : p
                )
            );
        }
    };

    const handleNextVisitUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingNextVisit) {
            const result = await updateNextVisit(editingNextVisit.patientId, editingNextVisit.date);
            if (result.success && result.data) {
                setPatients(patients.map(patient => {
                    if (patient.id === editingNextVisit.patientId) {
                        return {
                            ...patient,
                            next_visit_date: result.data!.next_visit_date,
                            next_visit_time: result.data!.next_visit_time || patient.next_visit_time
                        };
                    }
                    return patient;
                }));
                
                // Close the dialog
                const dialogTrigger = document.querySelector('[data-state="open"]') as HTMLElement;
                if (dialogTrigger) {
                    dialogTrigger.click();
                }
                
                closeNextVisitDialog();
            }
        }
    };

    const handleEditNextVisit = (patient: Patient) => {
        openNextVisitDialog(patient.id, patient.next_visit_date);
    };

    // New workflow event handlers
    const handleOpenPatientRecord = (patient: Patient) => {
        setSelectedPatientForRecord(patient);
    };

    const handleStartCheckup = (patient: Patient) => {
        setCheckupPatientForDoctor(patient);
        setIsDoctorCheckupDialogOpen(true);
        // Close patient record dialog if open
        setSelectedPatientForRecord(null);
    };

    const handleDoctorCheckupSubmit = async (checkupData: any) => {
        if (!checkupPatientForDoctor) return;
        
        const result = await addCheckup(checkupPatientForDoctor, checkupData, { date: new Date(checkupData.date) });
        if (result.success) {
            // Update the patients state with the new checkup data
            setPatients(prevPatients => 
                prevPatients.map(patient => 
                    patient.id === checkupPatientForDoctor.id 
                    ? {
                        ...patient,
                        checkups: [...(patient.checkups || []), result.data]
                    }
                    : patient
                )
            );
            setIsDoctorCheckupDialogOpen(false);
            setCheckupPatientForDoctor(null);
        }
    };

    const handleScheduleAppointment = (patient: Patient) => {
        // Close patient record dialog and open appointment dialog with preselected patient
        setSelectedPatientForRecord(null);
        setPreselectedPatientForAppointment(patient);
        setIsAddAppointmentDialogOpen(true);
    };

    // Appointment event handlers
    const handleAddAppointment = async (appointment: NewAppointment) => {
        const result = await createAppointment(appointment);
        if (result.success) {
            setIsAddAppointmentDialogOpen(false);
            setPreselectedPatientForAppointment(null); // Clear preselected patient
        }
    };

    const handleEditAppointment = (appointment: Appointment) => {
        setEditingAppointment(appointment);
    };

    const handleUpdateAppointment = async (id: number, appointment: Partial<NewAppointment>) => {
        const result = await updateAppointment(id, appointment);
        if (result.success) {
            setEditingAppointment(null);
        }
    };

    const handleDeleteAppointment = (appointment: Appointment) => {
        setDeleteAppointmentConfirmation(appointment);
    };

    const handleConfirmDeleteAppointment = async (appointmentId: number) => {
        const result = await deleteAppointment(appointmentId);
        if (result.success) {
            setDeleteAppointmentConfirmation(null);
        }
    };

    const handleUpdateAppointmentStatus = async (appointment: Appointment, status: string) => {
        const result = await updateAppointmentStatus(appointment.id, { status: status as any });
        if (result.success) {
            // Status updated successfully
        }
    };

    const handleUpdateAppointmentPaymentStatus = async (appointment: Appointment, paymentStatus: string) => {
        const result = await updateAppointmentPaymentStatus(appointment.id, paymentStatus);
        if (result.success) {
            // Payment status updated successfully
        }
    };

    // Fetch appointments on component mount
    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Clinic
                </h2>
            }
        >
            <Head title="Clinic" />

            <div className="p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <Tabs defaultValue="patients" className="space-y-6">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <TabsList className="h-auto p-0 bg-transparent border-0 rounded-none">
                            <TabsTrigger 
                                value="patients" 
                                className="relative px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-transparent rounded-none transition-all duration-200"
                            >
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>Patients</span>
                                    <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                        {filteredPatients.length}
                                    </span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="appointments" 
                                className="relative px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-transparent rounded-none transition-all duration-200"
                            >
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Appointments</span>
                                    <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                        {appointments.length}
                                    </span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="inventory" 
                                className="relative px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-transparent rounded-none transition-all duration-200"
                            >
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    <span>Inventory</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="payment-accounts" 
                                className="relative px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-transparent rounded-none transition-all duration-200"
                            >
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    <span>Payment Accounts</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger 
                                value="add-patient" 
                                className="relative px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:bg-transparent rounded-none transition-all duration-200"
                            >
                                <div className="flex items-center gap-2">
                                    <UserPlus className="h-4 w-4" />
                                    <span>Add Patient</span>
                                </div>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="patients">
                        <PatientTable
                            patients={filteredPatients}
                            currentPatients={currentPatients}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            pageCount={pageCount}
                            patientsPerPage={patientsPerPage}
                            currency={currency}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            onEditPatient={setEditingPatient}
                            onDeletePatient={handleDeletePatient}
                            onOpenPatientRecord={handleOpenPatientRecord}
                            onScheduleAppointment={handleScheduleAppointment}
                            onEditNextVisit={handleEditNextVisit}
                        />
                    </TabsContent>

                    <TabsContent value="appointments">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Appointments</h3>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <Button
                                            variant={appointmentView === 'table' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setAppointmentView('table')}
                                            className="rounded-r-none"
                                        >
                                            <Table className="h-4 w-4 mr-2" />
                                            Table
                                        </Button>
                                        <Button
                                            variant={appointmentView === 'calendar' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setAppointmentView('calendar')}
                                            className="rounded-l-none"
                                        >
                                            <Grid3X3 className="h-4 w-4 mr-2" />
                                            Calendar
                                        </Button>
                                    </div>
                                    <Button onClick={() => {
                                        setPreselectedPatientForAppointment(null); // Clear any preselected patient
                                        setIsAddAppointmentDialogOpen(true);
                                    }}>
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Schedule Appointment
                                    </Button>
                                </div>
                            </div>
                            
                            {appointmentView === 'table' ? (
                                <AppointmentTable
                                    appointments={appointments}
                                    onEditAppointment={handleEditAppointment}
                                    onDeleteAppointment={handleDeleteAppointment}
                                    onUpdateStatus={handleUpdateAppointmentStatus}
                                    onUpdatePaymentStatus={handleUpdateAppointmentPaymentStatus}
                                    currency={currency}
                                />
                            ) : (
                                <AppointmentCalendar
                                    appointments={appointments}
                                    onEditAppointment={handleEditAppointment}
                                    onDeleteAppointment={handleDeleteAppointment}
                                    onUpdateStatus={handleUpdateAppointmentStatus}
                                    onUpdatePaymentStatus={handleUpdateAppointmentPaymentStatus}
                                    currency={currency}
                                />
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="inventory">
                        <Inventory 
                            auth={auth} 
                            appCurrency={appCurrency} 
                        />
                    </TabsContent>

                    <TabsContent value="payment-accounts">
                        <ClinicPaymentAccountManager
                            patients={patients}
                            appCurrency={appCurrency}
                            onAccountCreated={() => {
                                // Optionally refresh patient data to show account assignments
                                console.log('Account created');
                            }}
                            onAccountUpdated={() => {
                                // Optionally refresh patient data
                                console.log('Account updated');
                            }}
                            onAccountDeleted={() => {
                                // Optionally refresh patient data
                                console.log('Account deleted');
                            }}
                            onAddBill={async (patientId: string, amount: number, details: string) => {
                                const result = await addBill(patientId, amount, details);
                                if (result.success) {
                                    // Update patients state
                                    const updatedPatient = patients.find(p => p.id === patientId);
                                    if (updatedPatient) {
                                        const newBill = result.data;
                                        const updatedPatients = patients.map(patient => {
                                            if (patient.id === patientId) {
                                                return {
                                                    ...patient,
                                                    bills: [...patient.bills, newBill],
                                                    total_bills: patient.total_bills + amount,
                                                    balance: patient.balance + amount
                                                };
                                            }
                                            return patient;
                                        });
                                        setPatients(updatedPatients);
                                    }
                                }
                                return {
                                    success: result.success,
                                    data: result.data,
                                    error: typeof result.error === 'string' ? result.error : result.error?.toString()
                                };
                            }}
                            onDeleteBill={async (patientId: string, billId: number) => {
                                const result = await deleteBill(patientId, billId);
                                if (result.success) {
                                    // Update patients state
                                    setPatients(patients.map(patient => {
                                        if (patient.id === patientId) {
                                            const billAmount = parseFloat(patient.bills.find(b => b.id === billId)?.bill_amount || '0');
                                            const updatedBills = patient.bills.filter(bill => bill.id !== billId);
                                            return {
                                                ...patient,
                                                bills: updatedBills,
                                                total_bills: patient.total_bills - billAmount,
                                                balance: patient.balance - billAmount
                                            };
                                        }
                                        return patient;
                                    }));
                                }
                                return result;
                            }}
                            onShowBillHistory={fetchBillHistory}
                            onAddPayment={async (patientId: string, amount: number) => {
                                const result = await processPayment(patientId, amount);
                                if (result.success) {
                                    // Update patients state
                                    setPatients(prevPatients => 
                                        prevPatients.map(patient => {
                                            if (patient.id === patientId) {
                                                const newPayment = result.data;
                                                const updatedPayments = [...patient.payments, newPayment];
                                                const newTotalPayments = parseFloat(patient.total_payments.toString()) + amount;
                                                
                                                return {
                                                    ...patient,
                                                    payments: updatedPayments,
                                                    total_payments: newTotalPayments,
                                                    balance: patient.total_bills - newTotalPayments
                                                };
                                            }
                                            return patient;
                                        })
                                    );
                                }
                                return {
                                    success: result.success,
                                    data: result.data,
                                    error: typeof result.error === 'string' ? result.error : result.error?.toString()
                                };
                            }}
                            onDeletePayment={async (patientId: string, paymentId: number) => {
                                const result = await deletePayment(patientId, paymentId);
                                if (result.success) {
                                    // Update patients state
                                    setPatients(patients.map(patient => {
                                        if (patient.id === patientId) {
                                            const paymentAmount = parseFloat(patient.payments.find(p => p.id === paymentId)?.payment_amount || '0');
                                            const updatedPayments = patient.payments.filter(payment => payment.id !== paymentId);
                                            return {
                                                ...patient,
                                                payments: updatedPayments,
                                                total_payments: patient.total_payments - paymentAmount,
                                                balance: patient.balance + paymentAmount
                                            };
                                        }
                                        return patient;
                                    }));
                                }
                                return result;
                            }}
                            onShowPaymentHistory={fetchPaymentHistory}
                            onPatientsUpdate={setPatients}
                        />
                    </TabsContent>

                    <TabsContent value="add-patient">
                        <AddPatientForm
                            newPatient={newPatient}
                            setNewPatient={setNewPatient}
                            onSubmit={handleAddPatient}
                        />
                    </TabsContent>
                </Tabs>

                {/* History Dialog */}
                <HistoryDialog
                    isOpen={!!showingHistoryForPatient}
                    onClose={closeHistoryDialog}
                    patient={showingHistoryForPatient}
                    historyType={activeHistoryType}
                    isLoading={isLoadingHistory}
                    currency={currency}
                    canDelete={canDelete}
                    onDeleteBill={async (patientId: string, billId: number) => {
                        const result = await deleteBill(patientId, billId);
                        if (result.success) {
                            // Update patients state
                            setPatients(patients.map(patient => {
                                if (patient.id === patientId) {
                                    const billAmount = parseFloat(patient.bills.find(b => b.id === billId)?.bill_amount || '0');
                                    const updatedBills = patient.bills.filter(bill => bill.id !== billId);
                                    
                                    // Also update the showing history patient if it's the same patient
                                    if (showingHistoryForPatient?.id === patientId) {
                                        setShowingHistoryForPatient({
                                            ...showingHistoryForPatient,
                                            bills: updatedBills
                                        });
                                    }
                                    
                                    return {
                                        ...patient,
                                        bills: updatedBills,
                                        total_bills: patient.total_bills - billAmount,
                                        balance: patient.balance - billAmount
                                    };
                                }
                                return patient;
                            }));
                        }
                    }}
                    onDeletePayment={async (patientId: string, paymentId: number) => {
                        const result = await deletePayment(patientId, paymentId);
                        if (result.success) {
                            // Update patients state
                            setPatients(patients.map(patient => {
                                if (patient.id === patientId) {
                                    const paymentAmount = parseFloat(patient.payments.find(p => p.id === paymentId)?.payment_amount || '0');
                                    const updatedPayments = patient.payments.filter(payment => payment.id !== paymentId);
                                    
                                    // Also update the showing history patient if it's the same patient
                                    if (showingHistoryForPatient?.id === patientId) {
                                        setShowingHistoryForPatient({
                                            ...showingHistoryForPatient,
                                            payments: updatedPayments
                                        });
                                    }
                                    
                                    return {
                                        ...patient,
                                        payments: updatedPayments,
                                        total_payments: patient.total_payments - paymentAmount,
                                        balance: patient.balance + paymentAmount
                                    };
                                }
                                return patient;
                            }));
                        }
                    }}
                    onDeleteCheckup={handleDeleteCheckup}
                />

                {/* Dental Chart Dialog */}
                <DentalChartDialog
                    isOpen={isDentalChartDialogOpen}
                    onClose={() => setIsDentalChartDialogOpen(false)}
                    patient={selectedPatient}
                    editingDentalChart={editingDentalChart}
                    onToothClick={handleToothClick}
                    onSave={handleSaveDentalChart}
                />

                {/* Edit Patient Dialog */}
                <EditPatientDialog
                    isOpen={!!editingPatient}
                    onClose={() => setEditingPatient(null)}
                    patient={editingPatient}
                    onUpdate={async (patient) => {
                        setEditingPatient(patient);
                        const result = await updatePatientInAPI(patient);
                        if (result.success) {
                            setEditingPatient(null);
                        }
                    }}
                />

                {/* Delete Confirmation Dialog */}
                <DeleteConfirmationDialog
                    isOpen={!!deleteConfirmation}
                    onClose={() => setDeleteConfirmation(null)}
                    patient={deleteConfirmation}
                    onConfirm={handleConfirmDelete}
                />

                {/* Add Checkup Dialog */}
                <AddCheckupDialog
                    isOpen={isCheckupDialogOpen}
                    onClose={() => setIsCheckupDialogOpen(false)}
                    patient={checkupPatient}
                    checkupData={newCheckupResult}
                    setCheckupData={setNewCheckupResult}
                    checkupDateTime={checkupDateTime}
                    setCheckupDateTime={setCheckupDateTime}
                    onSubmit={handleAddCheckup}
                />


                {/* Edit Next Visit Dialog */}
                <Dialog open={!!editingNextVisit} onOpenChange={(open) => !open && closeNextVisitDialog()}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Next Visit</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleNextVisitUpdate} className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        id="noNextVisit"
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                        checked={editingNextVisit?.date === 'NA'}
                                        onChange={(e) => setEditingNextVisit(prev => 
                                            prev ? { ...prev, date: e.target.checked ? 'NA' : '' } : null
                                        )}
                                    />
                                    <Label htmlFor="noNextVisit" className="text-gray-900 dark:text-white">No next visit scheduled</Label>
                                </div>
                                {editingNextVisit?.date !== 'NA' && (
                                    <div>
                                        <Label htmlFor="nextVisitDate" className="text-gray-900 dark:text-white">Next Visit Date & Time</Label>
                                        <Input
                                            id="nextVisitDate"
                                            type="datetime-local"
                                            value={editingNextVisit?.date || ''}
                                            onChange={(e) => setEditingNextVisit(prev => 
                                                prev ? { ...prev, date: e.target.value || 'NA' } : null
                                            )}
                                            required={editingNextVisit?.date !== 'NA'}
                                            className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white [&::-webkit-calendar-picker-indicator]:dark:filter [&::-webkit-calendar-picker-indicator]:dark:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                        />
                                    </div>
                                )}
                            </div>
                            <Button type="submit">Update Next Visit</Button>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Add Appointment Dialog */}
                <AddAppointmentDialog
                    isOpen={isAddAppointmentDialogOpen}
                    onClose={() => {
                        setIsAddAppointmentDialogOpen(false);
                        setPreselectedPatientForAppointment(null); // Clear preselected patient on close
                    }}
                    onSubmit={handleAddAppointment}
                    patients={filteredPatients}
                    currency={currency}
                    preselectedPatient={preselectedPatientForAppointment}
                />

                {/* Edit Appointment Dialog */}
                <EditAppointmentDialog
                    isOpen={!!editingAppointment}
                    onClose={() => setEditingAppointment(null)}
                    appointment={editingAppointment}
                    onUpdate={handleUpdateAppointment}
                    patients={filteredPatients}
                    currency={currency}
                />

                {/* Delete Appointment Confirmation Dialog */}
                <Dialog open={!!deleteAppointmentConfirmation} onOpenChange={(open) => !open && setDeleteAppointmentConfirmation(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Appointment</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Are you sure you want to delete this appointment? This action cannot be undone.
                        </p>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteAppointmentConfirmation(null)}>
                                Cancel
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={() => deleteAppointmentConfirmation && handleConfirmDeleteAppointment(deleteAppointmentConfirmation.id)}
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Patient Record Dialog */}
                <PatientRecordDialog
                    isOpen={!!selectedPatientForRecord}
                    onClose={() => setSelectedPatientForRecord(null)}
                    patient={selectedPatientForRecord}
                    currency={currency}
                    userRole={userRole}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    onStartCheckup={handleStartCheckup}
                    onViewDentalChart={openDentalChartDialog}
                    onScheduleAppointment={handleScheduleAppointment}
                    onEditPatient={setEditingPatient}
                    onEditNextVisit={handleEditNextVisit}
                    onDeleteCheckup={handleDeleteCheckup}
                />

                {/* Doctor Checkup Dialog */}
                <DoctorCheckupDialog
                    isOpen={isDoctorCheckupDialogOpen}
                    onClose={() => {
                        setIsDoctorCheckupDialogOpen(false);
                        setCheckupPatientForDoctor(null);
                    }}
                    patient={checkupPatientForDoctor}
                    onSubmit={handleDoctorCheckupSubmit}
                    onViewDentalChart={openDentalChartDialog}
                    onViewFullHistory={(patient) => {
                        handleShowCheckupHistory(patient);
                        setIsDoctorCheckupDialogOpen(false);
                    }}
                />
            </div>
        </AuthenticatedLayout>
    );
}
