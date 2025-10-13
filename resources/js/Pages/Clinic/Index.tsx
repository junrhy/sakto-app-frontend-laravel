import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
    Calendar,
    CreditCard,
    Grid3X3,
    Package,
    Table,
    UserPlus,
    Users,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../Components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../Components/ui/dialog';
import { Input } from '../../Components/ui/input';
import { Label } from '../../Components/ui/label';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '../../Components/ui/tabs';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';

// Import types
import {
    Appointment,
    ClinicProps,
    NewAppointment,
    NewPatient,
    NewPatientAllergy,
    NewPatientEncounter,
    NewPatientMedicalHistory,
    NewPatientMedication,
    Patient,
    PatientAllergy,
    PatientDiagnosis,
    PatientEncounter,
    PatientMedicalHistory,
    PatientMedication,
    PatientVitalSigns,
} from './types';

// Import hooks
import {
    useAppointments,
    useBills,
    useCheckups,
    useDentalChart,
    useHistory,
    useNextVisit,
    usePatients,
    usePayments,
} from './hooks';

// Import components
import {
    AddAppointmentDialog,
    AddCheckupDialog,
    AddPatientForm,
    AppointmentCalendar,
    AppointmentTable,
    DeleteConfirmationDialog,
    DentalChartDialog,
    DoctorCheckupDialog,
    EditAppointmentDialog,
    EditPatientDialog,
    HistoryDialog,
    PatientAllergiesManager,
    PatientEncounterHistoryDialog,
    PatientMedicalHistoryManager,
    PatientMedicationsManager,
    PatientRecordDialog,
    PatientTable,
    VipManagementDialog,
} from './components';
import { ClinicPaymentAccountManager } from './components/ClinicPaymentAccountManager';
import Inventory from './Inventory';

export default function Clinic({
    auth,
    initialPatients = [],
    appCurrency = null,
    error = null,
}: ClinicProps) {
    const currency = appCurrency ? appCurrency.symbol : '$';

    // Initialize hooks
    const {
        patients,
        setPatients,
        searchTerm,
        setSearchTerm,
        nextVisitFilter,
        setNextVisitFilter,
        currentPage,
        setCurrentPage,
        filteredPatients,
        currentPatients,
        pageCount,
        patientsPerPage,
        addPatient: addPatientToAPI,
        updatePatient: updatePatientInAPI,
        deletePatient: deletePatientFromAPI,
        updatePatientInState,
    } = usePatients(initialPatients);

    const { addBill, deleteBill, fetchBillHistory } = useBills();

    const { processPayment, deletePayment, fetchPaymentHistory } =
        usePayments();

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
        resetCheckupForm,
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
        openPatientInfoDialog,
    } = useDentalChart();

    const {
        editingNextVisit,
        setEditingNextVisit,
        updateNextVisit,
        openNextVisitDialog,
        closeNextVisitDialog,
    } = useNextVisit();

    const {
        showingHistoryForPatient,
        setShowingHistoryForPatient,
        activeHistoryType,
        setActiveHistoryType,
        isLoadingHistory,
        openHistoryDialog,
        closeHistoryDialog,
        setLoading,
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
        updateAppointmentPaymentStatus,
    } = useAppointments();

    // Local state
    const [newPatient, setNewPatient] = useState<NewPatient>({
        name: '',
    });
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] =
        useState<Patient | null>(null);

    // Appointment state
    const [isAddAppointmentDialogOpen, setIsAddAppointmentDialogOpen] =
        useState(false);
    const [
        preselectedPatientForAppointment,
        setPreselectedPatientForAppointment,
    ] = useState<Patient | null>(null);
    const [editingAppointment, setEditingAppointment] =
        useState<Appointment | null>(null);
    const [deleteAppointmentConfirmation, setDeleteAppointmentConfirmation] =
        useState<Appointment | null>(null);
    const [appointmentView, setAppointmentView] = useState<
        'table' | 'calendar'
    >('table');

    // New workflow state
    const [selectedPatientForRecord, setSelectedPatientForRecord] =
        useState<Patient | null>(null);
    const [selectedPatientEncounters, setSelectedPatientEncounters] = useState<
        PatientEncounter[]
    >([]);
    const [isDoctorCheckupDialogOpen, setIsDoctorCheckupDialogOpen] =
        useState(false);
    const [checkupPatientForDoctor, setCheckupPatientForDoctor] =
        useState<Patient | null>(null);
    const [isEncounterHistoryDialogOpen, setIsEncounterHistoryDialogOpen] =
        useState(false);
    const [encounterHistoryPatient, setEncounterHistoryPatient] =
        useState<Patient | null>(null);
    const [encounterHistoryData, setEncounterHistoryData] = useState<
        PatientEncounter[]
    >([]);

    // Universal Medical Record System State
    const [isAllergiesManagerOpen, setIsAllergiesManagerOpen] = useState(false);
    const [isMedicationsManagerOpen, setIsMedicationsManagerOpen] =
        useState(false);
    const [isMedicalHistoryManagerOpen, setIsMedicalHistoryManagerOpen] =
        useState(false);
    const [
        selectedPatientForMedicalRecord,
        setSelectedPatientForMedicalRecord,
    ] = useState<Patient | null>(null);

    // Medical record data state
    const [patientEncounters, setPatientEncounters] = useState<
        PatientEncounter[]
    >([]);
    const [patientVitalSigns, setPatientVitalSigns] = useState<
        PatientVitalSigns[]
    >([]);
    const [patientDiagnoses, setPatientDiagnoses] = useState<
        PatientDiagnosis[]
    >([]);
    const [patientAllergies, setPatientAllergies] = useState<PatientAllergy[]>(
        [],
    );
    const [patientMedications, setPatientMedications] = useState<
        PatientMedication[]
    >([]);
    const [patientMedicalHistory, setPatientMedicalHistory] = useState<
        PatientMedicalHistory[]
    >([]);

    // VIP Management State
    const [isVipManagementDialogOpen, setIsVipManagementDialogOpen] =
        useState(false);
    const [selectedPatientForVip, setSelectedPatientForVip] =
        useState<Patient | null>(null);

    // VIP Management Functions
    const handleManageVip = (patient: Patient) => {
        setSelectedPatientForVip(patient);
        setIsVipManagementDialogOpen(true);
    };

    const handleUpdateVipStatus = async (patientId: string, vipData: any) => {
        try {
            const response = await axios.put(
                `/clinic/patients/${patientId}/vip-status`,
                vipData,
            );

            if (response.data.success) {
                // Update the patient in the state
                if (response.data.patient) {
                    updatePatientInState(response.data.patient);
                }
                toast.success(`VIP status updated successfully`);
            } else {
                throw new Error(
                    response.data.error || 'Failed to update VIP status',
                );
            }
        } catch (error) {
            console.error('Error updating VIP status:', error);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Unknown error occurred';
            toast.error(`Failed to update VIP status: ${errorMessage}`);
        }
    };

    // Permission checks
    const canDelete = useMemo(() => {
        if (auth.selectedTeamMember) {
            // Team member selected - only admin or manager can delete
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager')
            );
        }
        // No team member selected (main account) - allow all users
        return true;
    }, [auth.selectedTeamMember]);

    const canEdit = useMemo(() => {
        if (auth.selectedTeamMember) {
            // Team member selected - check their roles
            return (
                auth.selectedTeamMember.roles.includes('admin') ||
                auth.selectedTeamMember.roles.includes('manager') ||
                auth.selectedTeamMember.roles.includes('doctor') ||
                auth.selectedTeamMember.roles.includes('nurse') ||
                auth.selectedTeamMember.roles.includes('assistant') ||
                auth.selectedTeamMember.roles.includes('user')
            );
        }
        // No team member selected (main account) - allow all users
        return true;
    }, [auth.selectedTeamMember]);

    // Determine user role for UI behavior
    const userRole = useMemo(() => {
        if (auth.selectedTeamMember) {
            if (auth.selectedTeamMember.roles.includes('doctor'))
                return 'doctor';
            if (auth.selectedTeamMember.roles.includes('nurse')) return 'nurse';
            if (auth.selectedTeamMember.roles.includes('assistant'))
                return 'assistant';
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
            setNewPatient({ name: '' });
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

        const result = await addCheckup(
            checkupPatient,
            newCheckupResult,
            checkupDateTime,
        );
        if (result.success) {
            // Update the patients state with the new checkup data
            setPatients((prevPatients) =>
                prevPatients.map((patient) =>
                    patient.id === checkupPatient.id
                        ? {
                              ...patient,
                              checkups: [
                                  ...(patient.checkups || []),
                                  result.data,
                              ],
                          }
                        : patient,
                ),
            );

            resetCheckupForm();
        }
    };

    const handleDeleteCheckup = async (
        patientId: string,
        checkupId: number,
    ) => {
        const result = await deleteCheckup(patientId, checkupId);
        if (result.success) {
            // Update patients state
            setPatients(
                patients.map((patient) => {
                    if (patient.id === patientId) {
                        const updatedCheckups = patient.checkups.filter(
                            (checkup) => checkup.id !== checkupId,
                        );

                        // Also update the showing history patient if it's the same patient
                        if (showingHistoryForPatient?.id === patientId) {
                            setShowingHistoryForPatient({
                                ...showingHistoryForPatient,
                                checkups: updatedCheckups,
                            });
                        }

                        return {
                            ...patient,
                            checkups: updatedCheckups,
                        };
                    }
                    return patient;
                }),
            );
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
            setPatients((prevPatients) =>
                prevPatients.map((p) =>
                    p.id === selectedPatient?.id
                        ? { ...p, dental_chart: result.data!.dental_chart }
                        : p,
                ),
            );
        }
    };

    const handleNextVisitUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingNextVisit) {
            const result = await updateNextVisit(
                editingNextVisit.patientId,
                editingNextVisit.date,
            );
            if (result.success && result.data) {
                setPatients(
                    patients.map((patient) => {
                        if (patient.id === editingNextVisit.patientId) {
                            return {
                                ...patient,
                                next_visit_date: result.data!.next_visit_date,
                                next_visit_time:
                                    result.data!.next_visit_time ||
                                    patient.next_visit_time,
                            };
                        }
                        return patient;
                    }),
                );

                // Close the dialog
                const dialogTrigger = document.querySelector(
                    '[data-state="open"]',
                ) as HTMLElement;
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
    const handleOpenPatientRecord = async (patient: Patient) => {
        setSelectedPatientForRecord(patient);

        try {
            // Load encounter data for this patient
            const response = await fetch(
                `/clinic/patient-encounters?patient_id=${patient.id}`,
            );
            const result = await response.json();

            if (result.status === 'success') {
                // Sort encounters by date (most recent first)
                const sortedEncounters = (result.data?.data || []).sort(
                    (a: PatientEncounter, b: PatientEncounter) =>
                        new Date(b.encounter_datetime).getTime() -
                        new Date(a.encounter_datetime).getTime(),
                );
                setSelectedPatientEncounters(sortedEncounters);
            } else {
                setSelectedPatientEncounters([]);
            }
        } catch (error) {
            console.error('Error loading encounters:', error);
            setSelectedPatientEncounters([]);
        }
    };

    const handleStartCheckup = async (patient: Patient) => {
        setCheckupPatientForDoctor(patient);

        try {
            // Load encounter data for context in the doctor checkup dialog
            const response = await fetch(
                `/clinic/patient-encounters?patient_id=${patient.id}`,
            );
            const result = await response.json();

            if (result.status === 'success') {
                // Sort encounters by date (most recent first)
                const sortedEncounters = (result.data?.data || []).sort(
                    (a: PatientEncounter, b: PatientEncounter) =>
                        new Date(b.encounter_datetime).getTime() -
                        new Date(a.encounter_datetime).getTime(),
                );
                setPatientEncounters(sortedEncounters);
            } else {
                setPatientEncounters([]);
            }
        } catch (error) {
            console.error('Error loading encounters for context:', error);
            setPatientEncounters([]);
        }

        setIsDoctorCheckupDialogOpen(true);
        // Close patient record dialog if open
        setSelectedPatientForRecord(null);
    };

    const handleDoctorCheckupSubmit = async (
        encounterData: NewPatientEncounter,
    ) => {
        if (!checkupPatientForDoctor) return;

        try {
            // Get CSRF token more reliably
            const csrfToken = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content');

            if (!csrfToken) {
                console.error('CSRF token not found');
                toast.error(
                    'Security token not found. Please refresh the page.',
                );
                return;
            }

            console.log('Submitting encounter data:', encounterData);
            console.log('CSRF Token:', csrfToken);

            // Submit the comprehensive encounter via frontend controller
            const response = await fetch('/clinic/patient-encounters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'application/json',
                },
                body: JSON.stringify(encounterData),
            });

            console.log('Response status:', response.status);
            console.log(
                'Response headers:',
                Object.fromEntries(response.headers.entries()),
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('HTTP Error:', response.status, errorText);

                let errorMessage = `HTTP ${response.status}`;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage =
                        errorJson.message || errorJson.error || errorMessage;
                } catch {
                    errorMessage = errorText || errorMessage;
                }

                toast.error(`Failed to save encounter: ${errorMessage}`);
                return;
            }

            const result = await response.json();
            console.log('Response result:', result);

            if (result.status === 'success') {
                // Update the patient encounters state
                setPatientEncounters((prev) => [result.data, ...prev]);

                // Also update the legacy checkups for backward compatibility
                const legacyCheckup = {
                    id: result.data.id,
                    checkup_date: result.data.encounter_datetime,
                    diagnosis:
                        result.data.clinical_impression ||
                        result.data.chief_complaint ||
                        'Clinical encounter completed',
                    treatment:
                        result.data.treatment_plan || 'See encounter notes',
                    notes:
                        result.data.additional_notes ||
                        'Comprehensive encounter documented',
                };

                setPatients((prevPatients) =>
                    prevPatients.map((patient) =>
                        patient.id === checkupPatientForDoctor.id
                            ? {
                                  ...patient,
                                  checkups: [
                                      ...(patient.checkups || []),
                                      legacyCheckup,
                                  ],
                                  last_visit_date:
                                      result.data.encounter_datetime,
                              }
                            : patient,
                    ),
                );

                setIsDoctorCheckupDialogOpen(false);
                setCheckupPatientForDoctor(null);

                // Show success message
                toast.success('Clinical encounter saved successfully');
            } else {
                console.error('Failed to save encounter:', result.message);
                toast.error('Failed to save encounter: ' + result.message);
            }
        } catch (error) {
            console.error('Error saving encounter:', error);
            toast.error('Error saving encounter');
        }
    };

    // Medical Record Management Functions
    const openPatientMedicalRecord = async (patient: Patient) => {
        setSelectedPatientForMedicalRecord(patient);

        try {
            // Load comprehensive medical record data via frontend controller
            const [
                encountersRes,
                vitalSignsRes,
                diagnosesRes,
                allergiesRes,
                medicationsRes,
                historyRes,
            ] = await Promise.all([
                fetch(`/clinic/patient-encounters?patient_id=${patient.id}`),
                fetch(`/clinic/patient-vital-signs?patient_id=${patient.id}`),
                fetch(`/clinic/patient-diagnoses?patient_id=${patient.id}`),
                fetch(`/clinic/patient-allergies?patient_id=${patient.id}`),
                fetch(`/clinic/patient-medications?patient_id=${patient.id}`),
                fetch(
                    `/clinic/patient-medical-history?patient_id=${patient.id}`,
                ),
            ]);

            const [
                encounters,
                vitalSigns,
                diagnoses,
                allergies,
                medications,
                history,
            ] = await Promise.all([
                encountersRes.json(),
                vitalSignsRes.json(),
                diagnosesRes.json(),
                allergiesRes.json(),
                medicationsRes.json(),
                historyRes.json(),
            ]);

            setPatientEncounters(encounters.data?.data || []);
            setPatientVitalSigns(vitalSigns.data?.data || []);
            setPatientDiagnoses(diagnoses.data?.data || []);
            setPatientAllergies(allergies.data?.data || []);
            setPatientMedications(medications.data?.data || []);
            setPatientMedicalHistory(history.data?.data || []);

            // Open the complete medical record dialog instead
            setCheckupPatientForDoctor(patient);
            setIsDoctorCheckupDialogOpen(true);
        } catch (error) {
            console.error('Error loading medical record data:', error);
            toast.error('Error loading medical record data');
        }
    };

    const handleManageAllergies = () => {
        setIsDoctorCheckupDialogOpen(false);
        setIsAllergiesManagerOpen(true);
    };

    const handleManageMedications = () => {
        setIsDoctorCheckupDialogOpen(false);
        setIsMedicationsManagerOpen(true);
    };

    const handleManageMedicalHistory = () => {
        setIsDoctorCheckupDialogOpen(false);
        setIsMedicalHistoryManagerOpen(true);
    };

    const handleAddAllergy = async (allergyData: NewPatientAllergy) => {
        try {
            const response = await fetch('/clinic/patient-allergies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify(allergyData),
            });

            const result = await response.json();
            if (result.status === 'success') {
                setPatientAllergies((prev) => [result.data, ...prev]);
            }
        } catch (error) {
            console.error('Error adding allergy:', error);
        }
    };

    const handleUpdateAllergy = async (
        id: number,
        allergyData: Partial<PatientAllergy>,
    ) => {
        try {
            const response = await fetch(`/clinic/patient-allergies/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify(allergyData),
            });

            const result = await response.json();
            if (result.status === 'success') {
                setPatientAllergies((prev) =>
                    prev.map((allergy) =>
                        allergy.id === id ? result.data : allergy,
                    ),
                );
            }
        } catch (error) {
            console.error('Error updating allergy:', error);
        }
    };

    const handleDeleteAllergy = async (id: number) => {
        try {
            const response = await fetch(`/clinic/patient-allergies/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            });

            const result = await response.json();
            if (result.status === 'success') {
                setPatientAllergies((prev) =>
                    prev.filter((allergy) => allergy.id !== id),
                );
            }
        } catch (error) {
            console.error('Error deleting allergy:', error);
        }
    };

    const handleAddMedication = async (
        medicationData: NewPatientMedication,
    ) => {
        try {
            const response = await fetch('/clinic/patient-medications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify(medicationData),
            });

            const result = await response.json();
            if (result.status === 'success') {
                setPatientMedications((prev) => [result.data, ...prev]);
            }
        } catch (error) {
            console.error('Error adding medication:', error);
        }
    };

    const handleUpdateMedication = async (
        id: number,
        medicationData: Partial<PatientMedication>,
    ) => {
        try {
            const response = await fetch(`/clinic/patient-medications/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify(medicationData),
            });

            const result = await response.json();
            if (result.status === 'success') {
                setPatientMedications((prev) =>
                    prev.map((medication) =>
                        medication.id === id ? result.data : medication,
                    ),
                );
            }
        } catch (error) {
            console.error('Error updating medication:', error);
        }
    };

    const handleDeleteMedication = async (id: number) => {
        try {
            const response = await fetch(`/clinic/patient-medications/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            });

            const result = await response.json();
            if (result.status === 'success') {
                setPatientMedications((prev) =>
                    prev.filter((medication) => medication.id !== id),
                );
            }
        } catch (error) {
            console.error('Error deleting medication:', error);
        }
    };

    const handleAddMedicalHistory = async (
        historyData: NewPatientMedicalHistory,
    ) => {
        try {
            const response = await fetch('/clinic/patient-medical-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify(historyData),
            });

            const result = await response.json();
            if (result.status === 'success') {
                setPatientMedicalHistory((prev) => [result.data, ...prev]);
            }
        } catch (error) {
            console.error('Error adding medical history:', error);
        }
    };

    const handleUpdateMedicalHistory = async (
        id: number,
        historyData: Partial<PatientMedicalHistory>,
    ) => {
        try {
            const response = await fetch(
                `/clinic/patient-medical-history/${id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify(historyData),
                },
            );

            const result = await response.json();
            if (result.status === 'success') {
                setPatientMedicalHistory((prev) =>
                    prev.map((history) =>
                        history.id === id ? result.data : history,
                    ),
                );
            }
        } catch (error) {
            console.error('Error updating medical history:', error);
        }
    };

    const handleDeleteMedicalHistory = async (id: number) => {
        try {
            const response = await fetch(
                `/clinic/patient-medical-history/${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                },
            );

            const result = await response.json();
            if (result.status === 'success') {
                setPatientMedicalHistory((prev) =>
                    prev.filter((history) => history.id !== id),
                );
            }
        } catch (error) {
            console.error('Error deleting medical history:', error);
        }
    };

    const handleScheduleAppointment = (patient: Patient) => {
        // Close patient record dialog and open appointment dialog with preselected patient
        setSelectedPatientForRecord(null);
        setSelectedPatientEncounters([]);
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

    const handleUpdateAppointment = async (
        id: number,
        appointment: Partial<NewAppointment>,
    ) => {
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

    const handleUpdateAppointmentStatus = async (
        appointment: Appointment,
        status: string,
    ) => {
        const result = await updateAppointmentStatus(appointment.id, {
            status: status as any,
        });
        if (result.success) {
            // Status updated successfully
        }
    };

    const handleUpdateAppointmentPaymentStatus = async (
        appointment: Appointment,
        paymentStatus: string,
    ) => {
        const result = await updateAppointmentPaymentStatus(
            appointment.id,
            paymentStatus,
        );
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

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <Tabs defaultValue="patients" className="space-y-6">
                    <div className="border-b border-gray-200 dark:border-gray-700">
                        <TabsList className="h-auto rounded-none border-0 bg-transparent p-0">
                            <TabsTrigger
                                value="patients"
                                className="relative rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium text-gray-600 transition-all duration-200 hover:border-gray-300 hover:text-gray-900 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-white dark:data-[state=active]:text-blue-400"
                            >
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>Patients</span>
                                    <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                        {filteredPatients.length}
                                    </span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="appointments"
                                className="relative rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium text-gray-600 transition-all duration-200 hover:border-gray-300 hover:text-gray-900 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-white dark:data-[state=active]:text-blue-400"
                            >
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Appointments</span>
                                    <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                        {appointments.length}
                                    </span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="inventory"
                                className="relative rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium text-gray-600 transition-all duration-200 hover:border-gray-300 hover:text-gray-900 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-white dark:data-[state=active]:text-blue-400"
                            >
                                <div className="flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    <span>Inventory</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="payment-accounts"
                                className="relative rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium text-gray-600 transition-all duration-200 hover:border-gray-300 hover:text-gray-900 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-white dark:data-[state=active]:text-blue-400"
                            >
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    <span>Payment Accounts</span>
                                </div>
                            </TabsTrigger>
                            <TabsTrigger
                                value="add-patient"
                                className="relative rounded-none border-b-2 border-transparent px-6 py-3 text-sm font-medium text-gray-600 transition-all duration-200 hover:border-gray-300 hover:text-gray-900 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-white dark:data-[state=active]:text-blue-400"
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
                            nextVisitFilter={nextVisitFilter}
                            setNextVisitFilter={setNextVisitFilter}
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
                            onOpenMedicalRecord={openPatientMedicalRecord}
                            onScheduleAppointment={handleScheduleAppointment}
                            onEditNextVisit={handleEditNextVisit}
                            onManageVip={canEdit ? handleManageVip : undefined}
                        />
                    </TabsContent>

                    <TabsContent value="appointments">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">
                                    Appointments
                                </h3>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-700">
                                        <Button
                                            variant={
                                                appointmentView === 'table'
                                                    ? 'default'
                                                    : 'ghost'
                                            }
                                            size="sm"
                                            onClick={() =>
                                                setAppointmentView('table')
                                            }
                                            className="rounded-r-none"
                                        >
                                            <Table className="mr-2 h-4 w-4" />
                                            Table
                                        </Button>
                                        <Button
                                            variant={
                                                appointmentView === 'calendar'
                                                    ? 'default'
                                                    : 'ghost'
                                            }
                                            size="sm"
                                            onClick={() =>
                                                setAppointmentView('calendar')
                                            }
                                            className="rounded-l-none"
                                        >
                                            <Grid3X3 className="mr-2 h-4 w-4" />
                                            Calendar
                                        </Button>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            setPreselectedPatientForAppointment(
                                                null,
                                            ); // Clear any preselected patient
                                            setIsAddAppointmentDialogOpen(true);
                                        }}
                                    >
                                        <Calendar className="mr-2 h-4 w-4" />
                                        Schedule Appointment
                                    </Button>
                                </div>
                            </div>

                            {appointmentView === 'table' ? (
                                <AppointmentTable
                                    appointments={appointments}
                                    onEditAppointment={handleEditAppointment}
                                    onDeleteAppointment={
                                        handleDeleteAppointment
                                    }
                                    onUpdateStatus={
                                        handleUpdateAppointmentStatus
                                    }
                                    onUpdatePaymentStatus={
                                        handleUpdateAppointmentPaymentStatus
                                    }
                                    currency={currency}
                                />
                            ) : (
                                <AppointmentCalendar
                                    appointments={appointments}
                                    onEditAppointment={handleEditAppointment}
                                    onDeleteAppointment={
                                        handleDeleteAppointment
                                    }
                                    onUpdateStatus={
                                        handleUpdateAppointmentStatus
                                    }
                                    onUpdatePaymentStatus={
                                        handleUpdateAppointmentPaymentStatus
                                    }
                                    currency={currency}
                                />
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="inventory">
                        <Inventory auth={auth} appCurrency={appCurrency} />
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
                            onAddBill={async (
                                patientId: string,
                                amount: number,
                                details: string,
                                billDate?: string,
                            ) => {
                                const result = await addBill(
                                    patientId,
                                    amount,
                                    details,
                                    billDate,
                                );
                                if (result.success) {
                                    // Update patients state
                                    const updatedPatient = patients.find(
                                        (p) => p.id === patientId,
                                    );
                                    if (updatedPatient) {
                                        const newBill = result.data;
                                        const updatedPatients = patients.map(
                                            (patient) => {
                                                if (patient.id === patientId) {
                                                    return {
                                                        ...patient,
                                                        bills: [
                                                            ...patient.bills,
                                                            newBill,
                                                        ],
                                                        total_bills:
                                                            patient.total_bills +
                                                            amount,
                                                        balance:
                                                            patient.balance +
                                                            amount,
                                                    };
                                                }
                                                return patient;
                                            },
                                        );
                                        setPatients(updatedPatients);
                                    }
                                }
                                return {
                                    success: result.success,
                                    data: result.data,
                                    error:
                                        typeof result.error === 'string'
                                            ? result.error
                                            : result.error?.toString(),
                                };
                            }}
                            onDeleteBill={async (
                                patientId: string,
                                billId: number,
                            ) => {
                                const result = await deleteBill(
                                    patientId,
                                    billId,
                                );
                                if (result.success) {
                                    // Update patients state
                                    setPatients(
                                        patients.map((patient) => {
                                            if (patient.id === patientId) {
                                                const billAmount = parseFloat(
                                                    patient.bills.find(
                                                        (b) => b.id === billId,
                                                    )?.bill_amount || '0',
                                                );
                                                const updatedBills =
                                                    patient.bills.filter(
                                                        (bill) =>
                                                            bill.id !== billId,
                                                    );
                                                return {
                                                    ...patient,
                                                    bills: updatedBills,
                                                    total_bills:
                                                        patient.total_bills -
                                                        billAmount,
                                                    balance:
                                                        patient.balance -
                                                        billAmount,
                                                };
                                            }
                                            return patient;
                                        }),
                                    );
                                }
                                return result;
                            }}
                            onShowBillHistory={fetchBillHistory}
                            onAddPayment={async (
                                patientId: string,
                                amount: number,
                                paymentDate?: string,
                            ) => {
                                const result = await processPayment(
                                    patientId,
                                    amount,
                                    paymentDate,
                                );
                                if (result.success) {
                                    // Update patients state
                                    setPatients((prevPatients) =>
                                        prevPatients.map((patient) => {
                                            if (patient.id === patientId) {
                                                const newPayment = result.data;
                                                const updatedPayments = [
                                                    ...patient.payments,
                                                    newPayment,
                                                ];
                                                const newTotalPayments =
                                                    parseFloat(
                                                        patient.total_payments.toString(),
                                                    ) + amount;

                                                return {
                                                    ...patient,
                                                    payments: updatedPayments,
                                                    total_payments:
                                                        newTotalPayments,
                                                    balance:
                                                        patient.total_bills -
                                                        newTotalPayments,
                                                };
                                            }
                                            return patient;
                                        }),
                                    );
                                }
                                return {
                                    success: result.success,
                                    data: result.data,
                                    error:
                                        typeof result.error === 'string'
                                            ? result.error
                                            : result.error?.toString(),
                                };
                            }}
                            onDeletePayment={async (
                                patientId: string,
                                paymentId: number,
                            ) => {
                                const result = await deletePayment(
                                    patientId,
                                    paymentId,
                                );
                                if (result.success) {
                                    // Update patients state
                                    setPatients(
                                        patients.map((patient) => {
                                            if (patient.id === patientId) {
                                                const paymentAmount =
                                                    parseFloat(
                                                        patient.payments.find(
                                                            (p) =>
                                                                p.id ===
                                                                paymentId,
                                                        )?.payment_amount ||
                                                            '0',
                                                    );
                                                const updatedPayments =
                                                    patient.payments.filter(
                                                        (payment) =>
                                                            payment.id !==
                                                            paymentId,
                                                    );
                                                return {
                                                    ...patient,
                                                    payments: updatedPayments,
                                                    total_payments:
                                                        patient.total_payments -
                                                        paymentAmount,
                                                    balance:
                                                        patient.balance +
                                                        paymentAmount,
                                                };
                                            }
                                            return patient;
                                        }),
                                    );
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
                            setPatients(
                                patients.map((patient) => {
                                    if (patient.id === patientId) {
                                        const billAmount = parseFloat(
                                            patient.bills.find(
                                                (b) => b.id === billId,
                                            )?.bill_amount || '0',
                                        );
                                        const updatedBills =
                                            patient.bills.filter(
                                                (bill) => bill.id !== billId,
                                            );

                                        // Also update the showing history patient if it's the same patient
                                        if (
                                            showingHistoryForPatient?.id ===
                                            patientId
                                        ) {
                                            setShowingHistoryForPatient({
                                                ...showingHistoryForPatient,
                                                bills: updatedBills,
                                            });
                                        }

                                        return {
                                            ...patient,
                                            bills: updatedBills,
                                            total_bills:
                                                patient.total_bills -
                                                billAmount,
                                            balance:
                                                patient.balance - billAmount,
                                        };
                                    }
                                    return patient;
                                }),
                            );
                        }
                    }}
                    onDeletePayment={async (
                        patientId: string,
                        paymentId: number,
                    ) => {
                        const result = await deletePayment(
                            patientId,
                            paymentId,
                        );
                        if (result.success) {
                            // Update patients state
                            setPatients(
                                patients.map((patient) => {
                                    if (patient.id === patientId) {
                                        const paymentAmount = parseFloat(
                                            patient.payments.find(
                                                (p) => p.id === paymentId,
                                            )?.payment_amount || '0',
                                        );
                                        const updatedPayments =
                                            patient.payments.filter(
                                                (payment) =>
                                                    payment.id !== paymentId,
                                            );

                                        // Also update the showing history patient if it's the same patient
                                        if (
                                            showingHistoryForPatient?.id ===
                                            patientId
                                        ) {
                                            setShowingHistoryForPatient({
                                                ...showingHistoryForPatient,
                                                payments: updatedPayments,
                                            });
                                        }

                                        return {
                                            ...patient,
                                            payments: updatedPayments,
                                            total_payments:
                                                patient.total_payments -
                                                paymentAmount,
                                            balance:
                                                patient.balance + paymentAmount,
                                        };
                                    }
                                    return patient;
                                }),
                            );
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
                <Dialog
                    open={!!editingNextVisit}
                    onOpenChange={(open) => !open && closeNextVisitDialog()}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Next Visit</DialogTitle>
                        </DialogHeader>
                        <form
                            onSubmit={handleNextVisitUpdate}
                            className="space-y-4"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        id="noNextVisit"
                                        type="checkbox"
                                        className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                                        checked={
                                            editingNextVisit?.date === 'NA'
                                        }
                                        onChange={(e) =>
                                            setEditingNextVisit((prev) =>
                                                prev
                                                    ? {
                                                          ...prev,
                                                          date: e.target.checked
                                                              ? 'NA'
                                                              : '',
                                                      }
                                                    : null,
                                            )
                                        }
                                    />
                                    <Label
                                        htmlFor="noNextVisit"
                                        className="text-gray-900 dark:text-white"
                                    >
                                        No next visit scheduled
                                    </Label>
                                </div>
                                {editingNextVisit?.date !== 'NA' && (
                                    <div>
                                        <Label
                                            htmlFor="nextVisitDate"
                                            className="text-gray-900 dark:text-white"
                                        >
                                            Next Visit Date & Time
                                        </Label>
                                        <Input
                                            id="nextVisitDate"
                                            type="datetime-local"
                                            value={editingNextVisit?.date || ''}
                                            onChange={(e) =>
                                                setEditingNextVisit((prev) =>
                                                    prev
                                                        ? {
                                                              ...prev,
                                                              date:
                                                                  e.target
                                                                      .value ||
                                                                  'NA',
                                                          }
                                                        : null,
                                                )
                                            }
                                            required={
                                                editingNextVisit?.date !== 'NA'
                                            }
                                            className="border-gray-200 bg-white text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:dark:invert [&::-webkit-calendar-picker-indicator]:dark:filter"
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
                <Dialog
                    open={!!deleteAppointmentConfirmation}
                    onOpenChange={(open) =>
                        !open && setDeleteAppointmentConfirmation(null)
                    }
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Appointment</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Are you sure you want to delete this appointment?
                            This action cannot be undone.
                        </p>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setDeleteAppointmentConfirmation(null)
                                }
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() =>
                                    deleteAppointmentConfirmation &&
                                    handleConfirmDeleteAppointment(
                                        deleteAppointmentConfirmation.id,
                                    )
                                }
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Patient Record Dialog */}
                <PatientRecordDialog
                    isOpen={!!selectedPatientForRecord}
                    onClose={() => {
                        setSelectedPatientForRecord(null);
                        setSelectedPatientEncounters([]);
                    }}
                    patient={selectedPatientForRecord}
                    currency={currency}
                    userRole={userRole}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    encounters={selectedPatientEncounters}
                    onStartCheckup={handleStartCheckup}
                    onViewCompleteRecord={(patient) => {
                        // Close patient record dialog and open encounter history
                        setSelectedPatientForRecord(null);
                        setEncounterHistoryPatient(patient);
                        setEncounterHistoryData(selectedPatientEncounters);
                        setSelectedPatientEncounters([]);
                        setIsEncounterHistoryDialogOpen(true);
                    }}
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
                    encounters={patientEncounters}
                    onSubmit={handleDoctorCheckupSubmit}
                    onViewDentalChart={openDentalChartDialog}
                    onViewFullHistory={(patient) => {
                        // Close doctor checkup dialog and open encounter history dialog
                        setIsDoctorCheckupDialogOpen(false);
                        setEncounterHistoryPatient(patient);
                        setEncounterHistoryData(patientEncounters);
                        setIsEncounterHistoryDialogOpen(true);
                    }}
                />

                {/* Universal Medical Record System Components */}

                {/* Patient Encounter History Dialog */}
                <PatientEncounterHistoryDialog
                    isOpen={isEncounterHistoryDialogOpen}
                    onClose={() => {
                        setIsEncounterHistoryDialogOpen(false);
                        setEncounterHistoryPatient(null);
                        setEncounterHistoryData([]);
                    }}
                    patient={encounterHistoryPatient}
                    encounters={encounterHistoryData}
                    onStartNewEncounter={(patient) => {
                        // Close history dialog and open new encounter dialog
                        setIsEncounterHistoryDialogOpen(false);
                        setEncounterHistoryPatient(null);
                        setEncounterHistoryData([]);
                        setCheckupPatientForDoctor(patient);
                        setIsDoctorCheckupDialogOpen(true);
                    }}
                />

                {/* Patient Allergies Manager */}
                <PatientAllergiesManager
                    isOpen={isAllergiesManagerOpen}
                    onClose={() => {
                        setIsAllergiesManagerOpen(false);
                        setIsDoctorCheckupDialogOpen(true);
                    }}
                    patient={selectedPatientForMedicalRecord}
                    allergies={patientAllergies}
                    onAddAllergy={handleAddAllergy}
                    onUpdateAllergy={handleUpdateAllergy}
                    onDeleteAllergy={handleDeleteAllergy}
                />

                {/* Patient Medications Manager */}
                <PatientMedicationsManager
                    isOpen={isMedicationsManagerOpen}
                    onClose={() => {
                        setIsMedicationsManagerOpen(false);
                        setIsDoctorCheckupDialogOpen(true);
                    }}
                    patient={selectedPatientForMedicalRecord}
                    medications={patientMedications}
                    onAddMedication={handleAddMedication}
                    onUpdateMedication={handleUpdateMedication}
                    onDeleteMedication={handleDeleteMedication}
                />

                {/* Patient Medical History Manager */}
                <PatientMedicalHistoryManager
                    isOpen={isMedicalHistoryManagerOpen}
                    onClose={() => {
                        setIsMedicalHistoryManagerOpen(false);
                        setIsDoctorCheckupDialogOpen(true);
                    }}
                    patient={selectedPatientForMedicalRecord}
                    medicalHistory={patientMedicalHistory}
                    onAddHistory={handleAddMedicalHistory}
                    onUpdateHistory={handleUpdateMedicalHistory}
                    onDeleteHistory={handleDeleteMedicalHistory}
                />

                {/* VIP Management Dialog */}
                <VipManagementDialog
                    isOpen={isVipManagementDialogOpen}
                    onClose={() => {
                        setIsVipManagementDialogOpen(false);
                        setSelectedPatientForVip(null);
                    }}
                    patient={selectedPatientForVip}
                    onUpdateVipStatus={handleUpdateVipStatus}
                />
            </div>
        </AuthenticatedLayout>
    );
}
